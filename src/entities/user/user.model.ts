export interface User {
    id: number;
    username: string;
    avatarUrl: string;
    osuSession?: string;
    osuSessionExpiry?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: number;
}