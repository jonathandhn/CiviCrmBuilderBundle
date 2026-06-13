const fs = require('fs');
const tsCode = fs.readFileSync('Assets/src/index.ts.backup', 'utf8');

const regex = /blockManager\.add\('([^']+)',\s*\{\s*label:\s*'([^']+)',\s*content:\s*`([\s\S]*?)`,\s*category:\s*([^,]+),\s*attributes:\s*(\{.*?\})\s*\}/g;

fs.mkdirSync('/home/maut/public_html/themes/sos_mjml/blocks', { recursive: true });

let match;
while ((match = regex.exec(tsCode)) !== null) {
    const id = match[1];
    const label = match[2];
    let content = match[3];
    const categoryVar = match[4].trim();

    let category = "Mautic Elements";
    if (categoryVar.includes('catCiviCrm')) category = "CiviCRM";

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
