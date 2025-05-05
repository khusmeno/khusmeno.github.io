// Utility function to fetch and parse XML
async function fetchXML(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`File not found: ${filePath}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(text, "application/xml");
    } catch (error) {
        console.error(error);
        return null; // Return null if the file doesn't exist or there's an error
    }
}

// Utility function to fetch and parse HTML templates
async function fetchTemplate(filePath) {
    const response = await fetch(filePath);
    const templateText = await response.text();
    const templateElement = document.createElement("div");
    templateElement.innerHTML = templateText.trim();
    return templateElement.firstChild; // Return the first DOM node
}

