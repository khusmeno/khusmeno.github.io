
// Function to process XML and inject into HTML
async function populateContent() {
    const xmlData = await fetchXML(`${BASE_PATH}/data/Categories/_index.xml`); // Example XML file
    const contentDiv = document.getElementById("content_Categories");

    // Check if XML file was not found or failed to load
    if (!xmlData) {
        const noDataTemplate = document.createElement("div");
        noDataTemplate.className = "no-data";
        noDataTemplate.textContent = "No data found!";
        contentDiv.appendChild(noDataTemplate);
        return;
    }

    const template = await fetchTemplate("/MPBuddy/templates/Categories.html"); // Example template

    // Extract data from XML
    const items = Array.from(xmlData.querySelectorAll("Category")); // Assuming XML has <Category> elements

    // Check if there are no items in the XML file
    if (items.length === 0) {
        // Inject "No data found" message into the template
        const noDataTemplate = document.createElement("div");
        noDataTemplate.className = "no-data";
        noDataTemplate.textContent = "No data found!";
        contentDiv.appendChild(noDataTemplate);
        return;
    }

    items.forEach(item => { //each item is a Category element
        const title = item.querySelector("FileName")?.textContent || "Untitled";
        const description = item.querySelector("DisplayName")?.textContent || "No DisplayName available";

        // Clone the template for each item
        const clone = template.cloneNode(true);

        // Update the content in the cloned template
//        clone.querySelector(".title").textContent = title;
//		clone.querySelector(".description").setAttribute("href", "data/Categories/" + title);
        clone.querySelector(".description").textContent = description;

        // Append the updated template to the content div
        contentDiv.appendChild(clone);
    });
}

// Trigger content population
populateContent();