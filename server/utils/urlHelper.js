export const normalizeRepoUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    let clean = url.trim();
    // Strip trailing slashes and .git extension
    clean = clean.replace(/\/+$/, '');
    clean = clean.replace(/\.git$/i, '');
    
    // Convert SSH or git@ format if any, to standard https://
    if (clean.startsWith('git@github.com:')) {
        clean = clean.replace('git@github.com:', 'https://github.com/');
    }
    
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
    }
    
    // Normalize domain case if needed
    return clean;
};
