use tauri_plugin_opener::OpenerExt;

#[tauri::command]
pub async fn start_oauth(app: tauri::AppHandle) -> Result<serde_json::Value, String> {
    use tiny_http::{Response, Server};

    let client_id = env!("OSU_CLIENT_ID");
    let client_secret = env!("OSU_CLIENT_SECRET");
    let redirect_uri = "http://localhost:7878/callback";

    let auth_url = format!(
        "https://osu.ppy.sh/oauth/authorize?client_id={}&redirect_uri={}&response_type=code&scope=public+identify",
        client_id,
        urlencoding::encode(redirect_uri)
    );

    log::info!("Opening OAuth URL: {}", auth_url);
    app.opener()
        .open_url(&auth_url, None::<&str>)
        .map_err(|e| e.to_string())?;

    let server = Server::http("127.0.0.1:7878").map_err(|e| e.to_string())?;
    log::info!("Waiting for OAuth callback on port 7878...");

    let code = tokio::task::spawn_blocking(move || {
        for request in server.incoming_requests() {
            let url = request.url().to_string();
            log::info!("Received callback: {}", url);

            let response = Response::from_string(
                "<html><body><h2>Login successful! You can close this tab.</h2></body></html>",
            )
            .with_header(
                "Content-Type: text/html"
                    .parse::<tiny_http::Header>()
                    .unwrap(),
            );
            let _ = request.respond(response);

            if let Some(query) = url.split('?').nth(1) {
                for param in query.split('&') {
                    if let Some(code) = param.strip_prefix("code=") {
                        return Ok(code.to_string());
                    }
                }
            }
        }
        Err("No callback received".to_string())
    })
    .await
    .map_err(|e| e.to_string())??;

    log::info!("Got OAuth code, exchanging for token...");

    let client = reqwest::Client::new();
    let token_response = client
        .post("https://osu.ppy.sh/oauth/token")
        .json(&serde_json::json!({
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
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
        .ok_or("No access token")?
        .to_string();

    let refresh_token = token_response["refresh_token"]
        .as_str()
        .ok_or("No refresh token")?
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

    log::info!(
        "Got user profile: {}",
        user["username"].as_str().unwrap_or("unknown")
    );

    Ok(serde_json::json!({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": expires_at,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "avatar_url": user["avatar_url"],
        }
    }))
}