import { getStaticBlocks } from './civicrmBlocks';
import { registerSmartyBlock } from './smartyBlock';
import { CustomBlock } from './customBlockLoader';

export function registerBlocks(editor: any, customBlocks: CustomBlock[]) {
    const blockManager = editor.BlockManager;

    // Définition des catégories
    const categories = {
        catMauticElements: blockManager.getCategories().add({ id: 'sos-mautic-elements', label: 'Thème Mautic - Éléments', open: false }),
        catMauticStructures: blockManager.getCategories().add({ id: 'sos-mautic-structures', label: 'Thème Mautic - Structures', open: false }),
        catCiviElements: blockManager.getCategories().add({ id: 'sos-civicrm-elements', label: 'CiviCRM - Éléments', open: true }),
        catCiviStructures: blockManager.getCategories().add({ id: 'sos-civicrm-structures', label: 'CiviCRM - Structures', open: false }),
        categoryElements: blockManager.getCategories().add({ id: 'sos-elements', label: 'Éléments SOS', open: false }),
        categoryStructures: blockManager.getCategories().add({ id: 'sos-structures', label: 'Structures SOS', open: false }),
    };

    // 1. Enregistrement du composant GrapesJS Smarty
    registerSmartyBlock(editor, categories.catCiviElements.id);

    // 2. Chargement des blocs statiques CiviCRM/Mautic
    const staticBlocks = getStaticBlocks(categories);
    staticBlocks.forEach(block => {
        blockManager.add(block.id, block);
    });

    // 3. Chargement des blocs custom JSON
    customBlocks.forEach(block => {
        // Résolution de la catégorie si le JSON référence un ID de catégorie connu (ex: "sos-civicrm-elements")
        // ou utilisation directe du string fourni.
        let targetCategory = block.category;
        for (const [key, catObj] of Object.entries(categories)) {
            if (catObj.id === block.category || catObj.get('label') === block.category) {
                targetCategory = catObj.id;
                break;
            }
        }

        // Déterminer l'icône automatiquement
        let iconClass = 'fa fa-cube';
        const searchId = block.id.toLowerCase();
        if (searchId.includes('header')) iconClass = 'fa fa-header';
        else if (searchId.includes('footer')) iconClass = 'fa fa-shoe-prints';
        else if (searchId.includes('title')) iconClass = 'fa fa-h-square';
        else if (searchId.includes('text')) iconClass = 'fa fa-font';
        else if (searchId.includes('button')) iconClass = 'fa fa-link';
        else if (searchId.includes('divider')) iconClass = 'fa fa-minus';
        else if (searchId.includes('spacer')) iconClass = 'fa fa-arrows-v';
        else if (searchId.includes('section') || searchId.includes('col')) iconClass = 'fa fa-columns';
        else if (searchId.includes('unsubscribe')) iconClass = 'fa fa-ban';

        blockManager.add(block.id, {
            label: block.label || block.id,
            category: targetCategory,
            attributes: block.attributes || { class: iconClass },
            content: block.content
        });
    });

    console.info(`[GrapesJsCustomPlugin] Registered ${staticBlocks.length} static blocks and ${customBlocks.length} custom blocks.`);
}
