import { NavItem } from './nav-item.model';

export const USER_ITEMS: NavItem[] = [
    { label: 'Home', route: '/', icon: 'phosphorHouse' },
    { label: 'Downloader', route: '/user/downloader', icon: 'phosphorDownloadSimple' },
    { label: 'Export Collections', route: '/user/export-collections', icon: 'phosphorFolder' },
    { label: 'Import Collections', route: '/user/import-collections', icon: 'phosphorFolder' },
    { label: 'Export Song Folder', route: '/user/export-song-folder', icon: 'phosphorMusicNote' },
    { label: 'Create Packs', route: '/user/create-packs', icon: 'phosphorFolder' }
];

export const DEV_ITEMS: NavItem[] = [
    { label: 'logs', route: '/dev/logs', icon: 'phosphorFolder' },
    { label: 'database', route: '/dev/database', icon: 'phosphorFolder' }
];
    
