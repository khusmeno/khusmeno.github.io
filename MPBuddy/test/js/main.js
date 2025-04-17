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

// Function to process XML and inject into HTML
async function populateContent() {
    const xmlData = await fetchXML("data/folder1/file1.xml"); // Example XML file
    const contentDiv = document.getElementById("content");

    // Check if XML file was not found or failed to load
    if (!xmlData) {
        const noDataTemplate = document.createElement("div");
        noDataTemplate.className = "no-data";
        noDataTemplate.textContent = "No data found!";
        contentDiv.appendChild(noDataTemplate);
        return;
    }

    const template = await fetchTemplate("templates/template1.html"); // Example template

    // Extract data from XML
    const items = Array.from(xmlData.querySelectorAll("item")); // Assuming XML has <item> elements

    // Check if there are no items in the XML file
    if (items.length === 0) {
        // Inject "No data found" message into the template
        const noDataTemplate = document.createElement("div");
        noDataTemplate.className = "no-data";
        noDataTemplate.textContent = "No data found!";
        contentDiv.appendChild(noDataTemplate);
        return;
    }

    items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "Untitled";
        const description = item.querySelector("description")?.textContent || "No description available";

        // Clone the template for each item
        const clone = template.cloneNode(true);

        // Update the content in the cloned template
        clone.querySelector(".title").textContent = title;
        clone.querySelector(".description").textContent = description;

        // Append the updated template to the content div
        contentDiv.appendChild(clone);
    });
}

// Trigger content population
populateContent();