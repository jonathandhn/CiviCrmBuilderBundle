function getTheme() {
    let theme = null;
    try {
        theme = document.querySelector('#emailform_template')?.value 
             || document.querySelector('#campaignevent_template')?.value 
             || document.querySelector('#page_template')?.value;
        if (!theme && window.parent && window.parent.document) {
             theme = window.parent.document.querySelector('#emailform_template')?.value 
                  || window.parent.document.querySelector('#campaignevent_template')?.value 
                  || window.parent.document.querySelector('#page_template')?.value;
        }
    } catch(e) {}
    return theme;
}
