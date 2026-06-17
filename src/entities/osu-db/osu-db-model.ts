export interface OsuDiff {
    md5: string;
    diffName: string;
    mode: number;
    bpm: number;
    length: number;
    stars: number;
    lastPlayed: boolean;
}

export interface OsuBeatmapSet {
    beatmapsetId: number;
    title: string;
    artist: string;
    status: string;
    diffs: OsuDiff[];
}