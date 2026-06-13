
const fs = require('fs');
let blocks = [];
const catMauticElements = { id: 'Mautic Elements' };
const catCiviCrmElements = { id: 'CiviCRM' };
const blockManager = {
  add: function(id, data) {
    blocks.push({id: id, ...data});
  }
};
// ==========================================
    // MAUTIC BLOCKS
    // ==========================================

    
fs.mkdirSync('/home/maut/public_html/themes/sos_mjml/blocks', { recursive: true });
blocks.forEach(b => {
    let contentStr = typeof b.content === 'string' ? b.content : (b.content.content || '');
    contentStr = contentStr.replace(/#ea148c/gi, '{color_primary}');
    b.content = contentStr;
    
    fs.writeFileSync('/home/maut/public_html/themes/sos_mjml/blocks/' + b.id + '.json', JSON.stringify(b, null, 2));
    console.log('Saved ' + b.id);
});
