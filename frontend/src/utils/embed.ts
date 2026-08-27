export const isHtmlEmbed = (content: string): boolean => {
    if (!content) return false;
    const trimmed = content.trim();
    if (trimmed.includes('instagram.com/p/') || trimmed.includes('instagram.com/reel/') || trimmed.includes('instgrm.it/')) {
        return true;
    }
    return (
        trimmed.startsWith('<') ||
        trimmed.includes('<iframe') ||
        trimmed.includes('<blockquote') ||
        trimmed.includes('<div') ||
        trimmed.includes('<script') ||
        trimmed.includes('<embed')
    );
};

export const getEmbedHtml = (content: string): string => {
    if (!content) return '';
    const trimmed = content.trim();
    if (!trimmed.startsWith('<') && (trimmed.includes('instagram.com/p/') || trimmed.includes('instagram.com/reel/') || trimmed.includes('instgrm.it/'))) {
        const cleanUrl = trimmed.split('?')[0].replace(/\/$/, '');
        return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${cleanUrl}/" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:12px; margin: 1px; max-width:540px; min-width:326px; padding:0; width:100%;"><div style="padding:16px;"> <a href="${cleanUrl}/" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">Ver publicação no Instagram</a></div></blockquote><script async src="//www.instagram.com/embed.js"></script>`;
    }
    return trimmed;
};

export const loadEmbedScripts = (html: string, container?: HTMLElement | null) => {
    if (!html || typeof window === 'undefined') return;

    if (html.includes('instagram-media') || html.includes('instagram.com')) {
        const processInstagram = () => {
            if ((window as any).instgrm?.Embeds?.process) {
                if (container) {
                    (window as any).instgrm.Embeds.process(container);
                } else {
                    (window as any).instgrm.Embeds.process();
                }
            }
        };

        if ((window as any).instgrm?.Embeds?.process) {
            processInstagram();
        } else {
            const existingScript = document.getElementById('instagram-embed-script');
            if (!existingScript) {
                const script = document.createElement('script');
                script.id = 'instagram-embed-script';
                script.src = 'https://www.instagram.com/embed.js';
                script.async = true;
                script.onload = () => {
                    processInstagram();
                };
                document.body.appendChild(script);
            } else {
                existingScript.addEventListener('load', () => {
                    processInstagram();
                });
            }
        }
    }

    if (html.includes('twitter-tweet') || html.includes('x.com') || html.includes('twitter.com')) {
        if ((window as any).twttr?.widgets?.load) {
            if (container) {
                (window as any).twttr.widgets.load(container);
            } else {
                (window as any).twttr.widgets.load();
            }
        } else {
            const existingScript = document.getElementById('twitter-wjs');
            if (!existingScript) {
                const script = document.createElement('script');
                script.id = 'twitter-wjs';
                script.src = 'https://platform.twitter.com/widgets.js';
                script.async = true;
                script.onload = () => {
                    if (container) {
                        (window as any).twttr?.widgets?.load(container);
                    } else {
                        (window as any).twttr?.widgets?.load();
                    }
                };
                document.body.appendChild(script);
            }
        }
    }
};

export interface EmbedSourceInfo {
    url: string;
    type: 'instagram' | 'youtube' | 'twitter' | 'external';
    label: string;
}

export const getEmbedSourceInfo = (content: string): EmbedSourceInfo | null => {
    if (!content) return null;
    const trimmed = content.trim();

    // Check for Instagram (/p/ or /reel/)
    const instaMatch = trimmed.match(/data-instgrm-permalink="([^"]+)"/) || 
                       trimmed.match(/href="(https:\/\/(www\.)?instagram\.com\/(p|reel)\/[^"]+)"/) ||
                       trimmed.match(/(https:\/\/(www\.)?instagram\.com\/(p|reel)\/[^\s"'/]+)/);
    if (instaMatch && instaMatch[1]) {
        let cleanUrl = instaMatch[1].split('?')[0];
        if (!cleanUrl.endsWith('/')) cleanUrl += '/';
        return {
            url: cleanUrl,
            type: 'instagram',
            label: 'Ver no Instagram'
        };
    }

    // Check for YouTube
    const ytMatch = trimmed.match(/src="https:\/\/(www\.)?youtube\.com\/embed\/([^"?]+)"/) ||
                    trimmed.match(/(https:\/\/(www\.)?youtube\.com\/watch\?v=[^\s"']+)/);
    if (ytMatch && (ytMatch[2] || ytMatch[1])) {
        const url = ytMatch[2] ? `https://www.youtube.com/watch?v=${ytMatch[2]}` : ytMatch[1];
        return {
            url,
            type: 'youtube',
            label: 'Assistir no YouTube'
        };
    }

    // Check for Twitter / X
    const twtMatch = trimmed.match(/href="(https:\/\/(www\.)?(twitter|x)\.com\/[^"]+)"/);
    if (twtMatch && twtMatch[1]) {
        return {
            url: twtMatch[1],
            type: 'twitter',
            label: 'Ver no X (Twitter)'
        };
    }

    // If simple external image URL
    if (!isHtmlEmbed(trimmed) && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
        return {
            url: trimmed,
            type: 'external',
            label: 'Abrir Imagem em Nova Aba'
        };
    }

    return null;
};
