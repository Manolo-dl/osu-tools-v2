import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@pages/home').then(m => m.HomeComponent)
    },
    {
        path: 'downloader',
        loadComponent: () => import('@pages/downloader').then(m => m.DownloaderComponent)
    },
    {
        path: 'export-collections',
        loadComponent: () => import('@pages/export-collections').then(m => m.ExportCollectionsComponent)
    },
    {
        path: 'export-song-folder',
        loadComponent: () => import('@pages/export-song-folder').then(m => m.ExportSongFolderComponent)
    },
    {
        path: '**',
        redirectTo: '',
    }
];
