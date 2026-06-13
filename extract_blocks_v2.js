const fs = require('fs');
const tsCode = fs.readFileSync('Assets/src/index.ts.backup', 'utf8');

// Match: blockManager.add('ID', { label: 'LABEL', category: CATEGORY, media: MEDIA, content: `CONTENT` });
// Note: Some blocks might have a different order, so we'll match the whole object content and extract fields.
const regex = /blockManager\.add\('([^']+)',\s*\{([\s\S]*?)\}\);/g;

let match;
while ((match = regex.exec(tsCode)) !== null) {
    const id = match[1];
    const objBody = match[2];

    const labelMatch = objBody.match(/label:\s*'([^']+)'/);
    const catMatch = objBody.match(/category:\s*([^,]+)/);
    const contentMatch = objBody.match(/content:\s*`([\s\S]*?)`/);

    if (labelMatch && contentMatch) {
        const label = labelMatch[1];
        let content = contentMatch[1].trim();
        const categoryVar = catMatch ? catMatch[1].trim() : 'Mautic Elements';

        let category = "Mautic Elements";
        if (categoryVar.includes('catCiviCrm')) category = "CiviCRM";
        else if (categoryVar.includes('categoryStructures')) category = "Structures";
        else if (categoryVar.includes('catMauticStructures')) category = "Mautic Structures";

        // Replace hardcoded #ea148c
        content = content.replace(/#ea148c/gi, '{color_primary}');

        const block = {
            id,
            label,
            category,
            content
        };

        fs.writeFileSync('/home/maut/public_html/themes/sos_mjml/blocks/' + id + '.json', JSON.stringify(block, null, 2));
        console.log("Extracted: " + id);
    }
}
