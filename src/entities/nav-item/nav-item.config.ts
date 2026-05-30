import { NavItem } from './nav-item.model';

export const NAV_ITEMS: NavItem[] = [
    { label: 'Home', route: '/', icon: 'phosphorHouse' },
    { label: 'Downloader', route: '/downloader', icon: 'phosphorDownloadSimple' },
    { label: 'Export Collections', route: '/export-collections', icon: 'phosphorFolder' },
    { label: 'Export Song Folder', route: '/export-song-folder', icon: 'phosphorMusicNote' }
];
