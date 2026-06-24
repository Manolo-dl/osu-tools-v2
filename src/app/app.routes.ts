import { Routes } from "@angular/router";
import { collectionResolver } from "@entities/collection";
import { osuDbResolver } from "@entities/osu-db/osu-db-resolver";
import { logResolver } from "@entities/log";
import { osuPathGuard } from "@shared/guards";
import { databaseResolver } from "@entities/database";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@pages/home').then(m => m.HomeComponent)
    },
    {
        path: 'user',
        canActivate: [osuPathGuard],
        children: [
            {
                path: 'downloader',
                loadComponent: () => import('@pages/downloader').then(m => m.DownloaderComponent)
            },
            {
                path: 'export-collections',
                loadComponent: () => import('@pages/export-collections').then(m => m.ExportCollectionsComponent),
                resolve: { osuDb: osuDbResolver, collections: collectionResolver }
            },
            {
                path: 'export-song-folder',
                loadComponent: () => import('@pages/export-song-folder').then(m => m.ExportSongFolderComponent),
                resolve: { osuDb: osuDbResolver }
            },
            {
                path: 'create-packs',
                loadComponent: () => import('@pages/create-packs').then(m => m.CreatePacksComponent),
                resolve: { osuDb: osuDbResolver }
            }
        ]
    },
    {
        path: 'dev',
        children: [
            {
                path: 'logs',
                loadComponent: () => import('@pages/logs').then(m => m.LogsComponent),
                resolve: { logs: logResolver }
            },
            {
                path: 'database',
                loadComponent: () => import('@pages/database').then(m => m.DatabaseComponent),
                resolve: { tables: databaseResolver }
            }
        ]
    },
    {
        path: '**',
        redirectTo: '',
    }
];
