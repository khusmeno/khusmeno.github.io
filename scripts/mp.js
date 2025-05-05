import * as Functions from './functions.js';

const mainContent = document.getElementById('mpDetails');
const loading = document.getElementById('loading');

const params = new URLSearchParams(window.location.search);
const file = params.get('file');
const mpVersion = params.get('version');

if (!file || !mpVersion) {
    loading.textContent = "Missing parameters.";
} else {
    Functions.loadMP(file, mpVersion)
        .then(xmlDoc => {
            displayMP(xmlDoc, file);
        })
        .catch(err => {
            loading.textContent = err.message;
        });
}

async function displayMP(xmlDoc, filename) {
    loading.style.display = 'none';
    mainContent.style.display = 'block';

    const manifest = xmlDoc.querySelector('Manifest Identity') || {};
    const version = manifest.querySelector("Version").textContent || 'Unknown';

    const displayName = xmlDoc.evaluate(`/ManagementPack/LanguagePacks/LanguagePack[@ID='ENU']/DisplayStrings/DisplayString[@ElementID='${filename}']/Name`, xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.innerHTML
        || xmlDoc.evaluate(`/ManagementPack/Manifest/Name`, xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.innerHTML
        || filename;

    const description = xmlDoc.evaluate(`/ManagementPack/LanguagePacks/LanguagePack[@ID='ENU']/DisplayStrings/DisplayString[@ElementID='${filename}']/Description`, xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.innerHTML;

    const sections = [];

    sections.push(`<a href="../_data/${filename}/${mpVersion}/MP.xml" target="_blank">Show MP XML</a>`);

    sections.push(`<h1>${filename}</h1>`);
    sections.push(`<h2>${displayName}</h2>`);

    if (description) {
        sections.push(`<p>${description}</p>`);
    }

    // Fetch available versions and populate the <select> element
    const versionsXml = await Functions.getAvailableMPVersions(filename);
    const versions = Array.from(versionsXml.getElementsByTagName('MPVersion'))
        .map(versionNode => versionNode.getAttribute('Version'));

    const versionSelect = `
        <label for="versionSelect">Version:</label>
        <select id="versionSelect">
            ${versions.map(version => `<option value="${version}" ${version === mpVersion ? 'selected' : ''}>${version}</option>`).join('')}
        </select>
    `;
    sections.push(versionSelect);


    /*
    //*[@ID]   ==> returns the "parent" node of the ID attribute
    //@ID      ==> returns "just" the ID attribute of the node
    */
    //const countOfIDs = xmlDoc.evaluate("//*[@ID]", xmlDoc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null).snapshotLength;  
    //sections.push(`<h3>ID attrs count: ${countOfIDs}</h3>`);

    sections.push(parseSection(xmlDoc, 'ClassTypes ClassType', 'Class Types', 'ClassType'));
    sections.push(parseSection(xmlDoc, 'RelationshipType', 'Relationship Types', 'RelationshipType'));
    sections.push(parseSection(xmlDoc, 'Rule', 'Rules', 'Rule'));
    sections.push(parseSection(xmlDoc, 'Monitor', 'Monitors', 'Monitor'));
    sections.push(parseSection(xmlDoc, 'Discovery', 'Discoveries', 'Discovery'));
    sections.push(parseSection(xmlDoc, 'View', 'Views', 'View'));
    sections.push(parseSection(xmlDoc, 'Override', 'Overrides', 'Override'));
    sections.push(parseSection(xmlDoc, 'SchemaTypes SchemaType', 'Schema Types', 'SchemaType'));
    sections.push(parseSection(xmlDoc, 'DataSourceModuleType', 'DataSource Module Types', 'DataSourceModuleType'));


    mainContent.innerHTML = sections.join('');

    // Add event listener for version change
    const versionSelectElement = document.getElementById('versionSelect');
    versionSelectElement.addEventListener('change', (event) => {
        const selectedVersion = event.target.value;

        // Update the URL with the new version parameter
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('version', selectedVersion);

        // Refresh the page with the updated URL
        window.location.search = urlParams.toString();
    });

}

function parseSection(xmlDoc, tagName, title, type) {
    const nodes = xmlDoc.querySelectorAll(tagName);
    if (nodes.length === 0) return '';

    let html = `<h2>${title} (${nodes.length})</h2>`;
    html += `<table style="width: auto"><thead><tr><th>ID</th><th>Description</th></tr></thead><tbody>`;

    nodes.forEach(node => {
        const id = node.getAttribute('ID') || '';
        const name = node.getAttribute('DisplayName') || id;
        const description = node.getAttribute('Description') || '';
        html += `<tr><td><a href="element.html?file=${file}&version=${mpVersion}&type=${type}&id=${name}">${name}</a></td><td>${description}</td></tr>`;
    });

    html += '</tbody></table>';
    return html;
}

Functions.setupHeaderFooterStyleTitleSearch(mainContent);