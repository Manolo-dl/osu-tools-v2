import { NavItem } from './nav-item.model';

export const NAV_ITEMS: NavItem[] = [
    { label: 'Home', route: '/', icon: 'home' },
    { label: 'Downloader', route: '/downloader', icon: 'download' },
    { label: 'Export Collections', route: '/export-collections', icon: 'folder' },
    { label: 'Export Song Folder', route: '/export-song-folder', icon: 'music' }
];
