import React from 'react';

const SEOHelmet = ({ title, description, keywords, image, url }) => {
    return (
        <>
            <title>{title || 'Campus Learning'}</title>
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            {image && <meta property="og:image" content={image} />}
            {url && <meta property="og:url" content={url} />}
        </>
    );
};

export default SEOHelmet;
