export interface Collection {
    name: string;
    beatmapMd5s: string[];
}

export interface CollectionBeatmap {
    md5: string;
    beatmapSetId?: number;
    title?: string;
    artist?: string;
}

export interface CollectionExport {
    collection: Collection;
    beatmaps: CollectionBeatmap[];
}