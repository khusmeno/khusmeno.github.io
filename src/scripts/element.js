import * as Functions from './functions.js';

const mainContent = document.getElementById('elementDetails');
const loading = document.getElementById('loading');

const params = new URLSearchParams(window.location.search);
const file = params.get('file');
const mpVersion = params.get('version');
const elementID = params.get('id');
const elementType = params.get('type');

if (!file || !mpVersion || !elementID || !elementType) {
    loading.textContent = "Missing parameters.";
} else {
    Functions.loadMP(file, mpVersion).then((xmlDoc) => {
        loading.style.display = 'none';
        mainContent.style.display = 'block';

        const scriptUrl = `../scripts/${elementType}.js`;
        Functions.loadDynamicScript(scriptUrl, () => {
            if (typeof displayElement === 'function') {
                displayElement(xmlDoc, file, mpVersion, elementID); // Call the function from the loaded script
            } else {
                console.error('displayElement is not defined in the loaded script.');
            }
        });
    });

}

Functions.setupHeaderFooterStyleTitleSearch(mainContent);
