/**
 * Injects a JSON-LD structured data script into the head of the document.
 * @param {Object} data - The JSON-LD data object.
 * @param {string} scriptId - A base ID for the script tag.
 * @param {string} pageName - The page context for uniqueness.
 */
export const injectJsonLdScript = (data, scriptId, pageName) => {
    const id = `${scriptId}-${pageName}`;
    removeJsonLdScript(scriptId, pageName);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.innerHTML = JSON.stringify(data);
    document.head.appendChild(script);
};

/**
 * Removes a previously injected JSON-LD script from the head.
 * @param {string} scriptId - The base ID used for the script tag.
 * @param {string} pageName - The page context.
 */
export const removeJsonLdScript = (scriptId, pageName) => {
    const id = `${scriptId}-${pageName}`;
    const existingScript = document.getElementById(id);
    if (existingScript) {
        document.head.removeChild(existingScript);
    }
};
