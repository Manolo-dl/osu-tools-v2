export interface User {
    id: number;
    username: string;
    avatarUrl: string;
    token: string;
    refreshToken: string;
    expiresAt: number;
    osuSession?: string;
}