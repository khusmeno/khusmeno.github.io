const productNameInHeader = "MP Buddy";
const confidentialityText = "For internal use only";
const productNameInTitle = "MP Buddy"; // Name of the product for the Title
const teamName = "Microsoft System Center Support team"; // Name of the team for the Footer
const teamSupportUrl = "https://microsoft.github.io/CSS-SystemCenter/"

// Function to load an XML file and return the parsed XML document
export function createHeader() {
    const header = document.createElement('header');
    header.innerHTML = `
        <div class="container">
            <a href="../index.html" style="text-decoration: none"><h1>${productNameInHeader}</h1></a>
            <input type="text" id="filterByText" placeholder="Filter ..." />
        </div>
    `;
    document.body.prepend(header); // Add the header at the top of the body
}

export function createFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <p><a href="${teamSupportUrl}">${teamName}</a></p>
    `;
    document.body.appendChild(footer); // Add the footer at the bottom of the body
}

export function createHeaderAndFooter() {
    createHeader();
    createFooter();
}

export async function loadXMLfile(relativePath) {
    const filePath = `../_data/${relativePath}`; // Prepend the "_data" folder path
    try {
        const response = await fetch(filePath);
        const xmlText = await response.text();
        const parser = new DOMParser();
        return parser.parseFromString(xmlText, "application/xml");
    } catch (err) {
        console.error('Failed to load XML file:', err);
        throw new Error("Error loading XML file.");
    }
}

// Function to load a Management Pack (MP) using loadXMLfile
export async function loadMP(filename, mpVersion) {
    const relativePath = `${filename}/${mpVersion}/MP.xml`; // Construct relative path
    return await loadXMLfile(relativePath);
}

export function setupSearchFilter(tableSelector) {
    const searchInput = document.getElementById("filterByText");
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll(`#${tableSelector.id} tbody tr`);
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName("td");
            let match = false;

            for (let j = 0; j < cells.length; j++) {
                if (cells[j].textContent.toLowerCase().includes(filter)) {
                    match = true;
                    break;
                }
            }

            rows[i].style.display = match ? "" : "none";
        }
    });
}

export function loadDynamicScript(scriptUrl, onLoad) {
    try {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.type = 'text/javascript';
        script.onload = onLoad; // Call the provided callback when the script is loaded
        script.onerror = () => {
            console.error(`Failed to load script: ${scriptUrl}`);
        };
        document.head.appendChild(script);
    } catch (err) {
        console.error('Unexpected error while loading script:', err);
    }
}

export function loadCSS(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

export function loadCommonCSS() {
    loadCSS('../styles/style.css');
}

export function setDocumentTitle() {
    document.title = productNameInTitle;
}

export function setupHeaderFooterStyleTitleSearch(mainContent) {
    createHeaderAndFooter();
    setupSearchFilter(mainContent);
    loadCommonCSS();
    setDocumentTitle();
}

export async function getAvailableMPVersions(filename) {
    try {
        const relativePath = `${filename}/List_MPVersion.xml`;
        return await loadXMLfile(relativePath);
    } catch (err) {
        console.error('Failed to load List_MPVersion.XML:', err);
        throw new Error("Error loading List_MPVersion.XML .");
    }
}