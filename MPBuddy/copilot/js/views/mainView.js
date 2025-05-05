// View: Manages DOM updates

const appViewModel = new AppViewModel(); // Initialize ViewModel

async function renderContent() {
    //const xmlFilePath = `${BASE_PATH}/data/folder1/file1.xml`; // XML file path
	const xmlFilePath = `${BASE_PATH}/data/Microsoft.Windows.Library.7.5.8501.0.xml`;
	//const xmlFilePath = `https://raw.githubusercontent.com/khusmeno/MPBuddyData_CSS_SystemCenter/refs/heads/master/Microsoft.Windows.InternetInformationServices.2016/10.1.0.1/ManagementPack.xml`; // XML file path
    const templateFilePath = `${BASE_PATH}/templates/template1.html`; // Template file path

    const { items, template, error } = await appViewModel.loadContent(xmlFilePath, templateFilePath);
    const contentDiv = document.getElementById("content");

    if (error) {
        contentDiv.innerHTML = `<div class="no-data">${error}</div>`;
        return;
    }

	contentDiv.innerHTML = '<div class="header"><h1> Class Types </h1></div>';
	
    items.forEach(item => {
        const clone = template.cloneNode(true);
        clone.querySelector(".title").textContent = item.title;
        clone.querySelector(".description").textContent = item.description;
        contentDiv.appendChild(clone);
    });
}

// Trigger rendering
renderContent();