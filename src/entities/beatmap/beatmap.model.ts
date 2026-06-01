export interface Beatmap {
    id: number;
    title: string;
    artist: string;
    creator: string;
    coverUrl: string;
    status: 'ranked' | 'loved' | 'pending' | 'graveyard' | 'qualified';
}

export interface DownloadItem {
    beatmapSetId: number;
    title: string;
    artist: string;
    status: DownloadStatus;
    progress: number;
}

export type DownloadStatus = 'pending' | 'downloading' | 'done' | 'failed';