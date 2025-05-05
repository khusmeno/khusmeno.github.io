// ViewModel: Application logic, connects Model and View

class AppViewModel {
    constructor() {
        this.dataModel = DataModel; // Reference to the Model
    }

    // Load data and prepare it for the View
    async loadContent(xmlFilePath, templateFilePath) {
        const xmlData = await this.dataModel.getXMLData(xmlFilePath);
        if (!xmlData) {
            return { items: [], error: "XML file not found or empty" };
        }

        const template = await this.dataModel.getTemplate(templateFilePath);
		
/*
        const items = Array.from(xmlData.querySelectorAll("item")).map(item => ({
            title: item.querySelector("title")?.textContent || "Untitled",
            description: item.querySelector("description")?.textContent || "No description available"
        }));
*/		
//debugger;
        const items = Array.from( xmlData.querySelectorAll("ClassType") ).map(item => ({
            title: item.getAttribute("ID") || "Untitled",
            description: item.getAttribute("Base") || "No description available"
        }));

        return { items, template, error: items.length === 0 ? "No data found" : null };
    }
}