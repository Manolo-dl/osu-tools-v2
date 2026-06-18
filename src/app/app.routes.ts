import { Routes } from "@angular/router";
import { collectionResolver } from "@entities/collection";
import { osuDbResolver } from "@entities/osu-db/osu-db-resolver";
import { osuPathGuard } from "./guards/osu-path.guard";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@pages/home').then(m => m.HomeComponent)
    },
    {
        path: 'downloader',
        canActivate: [osuPathGuard],
        loadComponent: () => import('@pages/downloader').then(m => m.DownloaderComponent)
    },
    {
        path: 'export-collections',
        canActivate: [osuPathGuard],
        loadComponent: () => import('@pages/export-collections').then(m => m.ExportCollectionsComponent),
        resolve: { osuDb: osuDbResolver, collections: collectionResolver }
    },
    {
        path: 'export-song-folder',
        canActivate: [osuPathGuard],
        loadComponent: () => import('@pages/export-song-folder').then(m => m.ExportSongFolderComponent),
        resolve: { osuDb: osuDbResolver }
    },
    {
        path: '**',
        redirectTo: '',
    }
];
