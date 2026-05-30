import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('@pages/home').then(m => m.HomeComponent)
    },
    {
        path: 'downloader',
        loadComponent: () => import('@pages/downloader').then(m => m.DownloaderComponent)
    }
];
