use std::sync::{Arc, Mutex};
use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use sha2::{Sha256, Digest};

fn generate_pkce() -> (String, String) {
    let bytes: [u8; 32] = rand::random();
    let code_verifier = URL_SAFE_NO_PAD.encode(bytes);

    let hash = Sha256::digest(code_verifier.as_bytes());
    let code_challenge = URL_SAFE_NO_PAD.encode(hash);

    (code_verifier, code_challenge)
}

#[tauri::command]
pub async fn start_oauth(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    let client_id = env!("OSU_CLIENT_ID");
    let client_secret = env!("OSU_CLIENT_SECRET");
    let redirect_uri = "http://localhost:7878/callback";

    let (code_verifier, code_challenge) = generate_pkce();

    let auth_url = format!(
        "https://osu.ppy.sh/oauth/authorize?client_id={}&redirect_uri={}&response_type=code&scope=public+identify&code_challenge={}&code_challenge_method=S256",
        client_id,
        urlencoding::encode(redirect_uri),
        code_challenge,
    );

    log::info!("Opening OAuth in Tauri window");

    let (code_tx, code_rx) = tokio::sync::oneshot::channel::<String>();
    let code_tx = Arc::new(Mutex::new(Some(code_tx)));
    let code_tx_nav = code_tx.clone();

    let window = tauri::WebviewWindowBuilder::new(
        &app,
        "oauth",
        tauri::WebviewUrl::External(
            auth_url.parse().map_err(|e: url::ParseError| e.to_string())?,
        ),
    )
    .title("Login with osu!")
    .inner_size(480.0, 720.0)
    .on_navigation(move |url| {
        if url.as_str().starts_with("http://localhost:7878/callback") {
            let code = url
                .query_pairs()
                .find(|(k, _)| k == "code")
                .map(|(_, v)| v.into_owned());

            if let Some(code) = code {
                if let Ok(mut guard) = code_tx_nav.lock() {
                    if let Some(tx) = guard.take() {
                        let _ = tx.send(code);
                    }
                }
            }
            false
        } else {
            true
        }
    })
    .build()
    .map_err(|e| e.to_string())?;

    let code = code_rx
        .await
        .map_err(|_| "OAuth window closed before completing login".to_string())?;

    log::info!("Got OAuth code, extracting osu_session cookie...");

    let (cookie_tx, cookie_rx) = std::sync::mpsc::channel::<Option<String>>();
    let cookie_tx_clone = cookie_tx.clone();

    let _ = window.with_webview(move |webview| {
        #[cfg(target_os = "linux")]
        {
            use webkit2gtk::{WebViewExt, WebContextExt, CookieManagerExt};

            let wkv = webview.inner();
            match wkv.web_context().and_then(|ctx| ctx.cookie_manager()) {
                Some(cm) => {
                    cm.cookies("https://osu.ppy.sh", None::<&webkit2gtk::gio::Cancellable>, move |result| {
                        let session = result.ok().and_then(|mut cookies| {
                            for c in cookies.iter_mut() {
                                if c.name().as_deref() == Some("osu_session") {
                                    return c.value().map(|v| v.to_string());
                                }
                            }
                            None
                        });
                        log::info!("osu_session found: {}", session.is_some());
                        let _ = cookie_tx_clone.send(session);
                    });
                }
                None => { let _ = cookie_tx_clone.send(None); }
            }
        }
        #[cfg(not(target_os = "linux"))]
        {
            log::warn!("Cookie extraction not implemented for this platform");
            let _ = cookie_tx_clone.send(None);
        }
    });

    let osu_session = tokio::task::spawn_blocking(move || {
        cookie_rx.recv_timeout(std::time::Duration::from_secs(3)).ok().flatten()
    })
    .await
    .unwrap_or(None);

    let _ = window.close();

    log::info!("Exchanging code for token...");

    let client = reqwest::Client::new();
    let token_response = client
        .post("https://osu.ppy.sh/oauth/token")
        .json(&serde_json::json!({
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "code_verifier": code_verifier,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        }))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;

    let access_token = token_response["access_token"]
        .as_str()
        .ok_or("No access token in response")?
        .to_string();

    let refresh_token = token_response["refresh_token"]
        .as_str()
        .ok_or("No refresh token in response")?
        .to_string();

    let expires_in = token_response["expires_in"].as_u64().unwrap_or(86400);
    let expires_at = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64
        + (expires_in * 1000);

    let user = client
        .get("https://osu.ppy.sh/api/v2/me")
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json::<serde_json::Value>()
        .await
        .map_err(|e| e.to_string())?;

    log::info!("Logged in as: {}", user["username"].as_str().unwrap_or("unknown"));

    Ok(serde_json::json!({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": expires_at,
        "osu_session": osu_session,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "avatar_url": user["avatar_url"],
        }
    }))
}
