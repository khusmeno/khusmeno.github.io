function displayElement(xmlDoc, filename, mpVersion, elementID) {
    loading.style.display = 'none';
    elementDetails.style.display = 'block';

    const elementIDNode = xmlDoc.querySelector(`ClassType[ID='${elementID}']`) || {};

    const manifest = xmlDoc.querySelector('Manifest Identity') || {};
    const displayName = xmlDoc.querySelector('DisplayStrings DisplayString Name')?.textContent || filename;
    const version = manifest.querySelector("Version").textContent || 'Unknown';
    const description = xmlDoc.querySelector('Manifest Identity Description')?.textContent ||
        xmlDoc.querySelector('DisplayStrings DisplayString Description')?.textContent || '';

    const sections = [];

    sections.push(`<h1>${elementIDNode.getAttribute("ID")}</h1>`);
    sections.push(`<p><strong>Version:</strong> ${version}</p>`);
    if (description) {
        sections.push(`<p>${description}</p>`);
    }

    sections.push(parseSection(elementIDNode, 'Property', 'Properties'));
    /*
        sections.push(parseSection(xmlDoc, 'RelationshipType', 'RelationshipType')); 
        sections.push(parseSection(xmlDoc, 'Rule', 'Rules'));
        sections.push(parseSection(xmlDoc, 'Monitor', 'Monitors'));
        sections.push(parseSection(xmlDoc, 'Discovery', 'Discoveries'));
        sections.push(parseSection(xmlDoc, 'View', 'Views'));
        sections.push(parseSection(xmlDoc, 'Override', 'Overrides'));
        sections.push(parseSection(xmlDoc, 'SchemaTypes SchemaType', 'SchemaType'));
    */

    elementDetails.innerHTML = sections.join('');
}

function parseSection(xmlDoc, tagName, title) {
    const nodes = xmlDoc.querySelectorAll(tagName);
    if (nodes.length === 0) return '';

    let html = `<h2>${title} (${nodes.length})</h2>`;
    html += `<table style="width: auto"><thead><tr><th>Name</th><th>Description</th></tr></thead><tbody>`;

    nodes.forEach(node => {
        const id = node.getAttribute('ID') || '';
        const name = node.getAttribute('DisplayName') || id;
        const description = node.getAttribute('Description') || '';
        html += `<tr><td>${name}</td><td>${description}</td></tr>`;
    });

    html += '</tbody></table>';
    return html;
}
