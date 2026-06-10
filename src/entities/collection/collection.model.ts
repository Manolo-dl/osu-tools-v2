export interface Collection {
    name: string;
    md5s: string[];
}

export interface CollectionBeatmap {
    md5: string;
    beatmapSetId?: number;
    title?: string;
    artist?: string;
}

export interface CollectionWithBeatmaps {
    name: string;
    beatmaps: CollectionBeatmap[];
}