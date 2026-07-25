export const normalizeRepoUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim();
    clean = clean.replace(/\/+$/, '');
    clean = clean.replace(/\.git$/i, '');
    
    if (clean.startsWith('git@github.com:')) {
        clean = clean.replace('git@github.com:', 'https://github.com/');
    }
    
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
    }
    
    return clean.toLowerCase();
};

