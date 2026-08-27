import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
    ogImage?: string;
    ogUrl?: string;
}

export const useSEO = ({ title, description, ogImage, ogUrl }: SEOProps) => {
    useEffect(() => {
        // Update document title
        document.title = title;

        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', description);

        // Update Open Graph Title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
        }
        ogTitle.setAttribute('content', title);

        // Update Open Graph Description
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
            ogDesc = document.createElement('meta');
            ogDesc.setAttribute('property', 'og:description');
            document.head.appendChild(ogDesc);
        }
        ogDesc.setAttribute('content', description);

        // Update Open Graph Image
        if (ogImage) {
            let ogImg = document.querySelector('meta[property="og:image"]');
            if (!ogImg) {
                ogImg = document.createElement('meta');
                ogImg.setAttribute('property', 'og:image');
                document.head.appendChild(ogImg);
            }
            ogImg.setAttribute('content', ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`);
        }

        // Update Open Graph URL
        const currentUrl = ogUrl || window.location.href;
        let ogUrlEl = document.querySelector('meta[property="og:url"]');
        if (!ogUrlEl) {
            ogUrlEl = document.createElement('meta');
            ogUrlEl.setAttribute('property', 'og:url');
            document.head.appendChild(ogUrlEl);
        }
        ogUrlEl.setAttribute('content', currentUrl);

    }, [title, description, ogImage, ogUrl]);
};
