document.addEventListener('DOMContentLoaded', function() {
    // Load the XML file
    fetch('example.xml')
        .then(response => response.text())
        .then(data => {
            // Parse the XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, 'application/xml');

            // Get the items
            const items = xmlDoc.getElementsByTagName('item');
            let htmlContent = '';

            // Loop through the items and create HTML content
            for (let i = 0; i < items.length; i++) {
                const title = items[i].getElementsByTagName('title')[0].textContent;
                const description = items[i].getElementsByTagName('description')[0].textContent;

                htmlContent += `
                    <div class="item">
                        <h2>${title}</h2>
                        <p>${description}</p>
                    </div>
                `;
            }

            // Insert the HTML content into the page
            document.getElementById('content').innerHTML = htmlContent;
        })
        .catch(error => console.error('Error loading XML:', error));
});
