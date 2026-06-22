import { NavItem } from './nav-item.model';

export const USER_ITEMS: NavItem[] = [
    { label: 'Home', route: '/', icon: 'phosphorHouse' },
    { label: 'Downloader', route: '/downloader', icon: 'phosphorDownloadSimple' },
    { label: 'Export Collections', route: '/export-collections', icon: 'phosphorFolder' },
    { label: 'Export Song Folder', route: '/export-song-folder', icon: 'phosphorMusicNote' },
    { label: 'Create Packs', route: '/create-packs', icon: 'phosphorFolder' }
];

export const DEV_ITEMS: NavItem[] = [
    { label: 'logs', route: '/logs', icon: 'phosphorFolder' },
    { label: 'database', route: '/database', icon: 'phosphorFolder' }
];
    
