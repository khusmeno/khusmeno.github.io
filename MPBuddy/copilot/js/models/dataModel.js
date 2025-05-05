// Model: Handles fetching data (XML and templates)

class DataModel {
    static async getXMLData(filePath) {
        return await fetchXML(filePath); // Reuse utility function
    }

    static async getTemplate(filePath) {
        return await fetchTemplate(filePath); // Reuse utility function
    }
}