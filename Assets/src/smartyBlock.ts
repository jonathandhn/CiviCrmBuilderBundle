const t = (key: string, fallback: string): string => {
    const translated = (window as any).Mautic?.translate?.(key);
    return translated && translated !== key ? translated : fallback;
};

export function registerSmartyBlock(editor: any, catCiviElementsId: string) {
    const blockManager = editor.BlockManager;
    const domComponents = editor.DomComponents;
    const commands = editor.Commands;

    // Définition du composant GrapesJS personnalisé (sans polluer le template avec du JSON)
    domComponents.addType('smarty-code', {
        isComponent: (el: any) => {
            const className = el.getAttribute ? el.getAttribute('class') || '' : '';
            if (el.tagName === 'SMARTY-CODE' || className.includes('smarty-code-wrapper')) {
                return {
                    type: 'smarty-code',
                    smartyContent: el.innerHTML
                };
            }
        },
        model: {
            defaults: {
                tagName: 'mj-text',
                attributes: { class: 'smarty-code-wrapper' },
                components: '',
                smartyContent: '{if $contact.first_name}Bonjour {$contact.first_name},{else}Bonjour,{/if}',
                traits: [
                    {
                        type: 'text',
                        name: 'smartyContent',
                        label: t('civicrmbuilder.smarty.code_label', 'Smarty code'),
                    }
                ]
            },
            init() {
                // Style uniquement visible dans l'éditeur (pas exporté)
                const doc = editor.Canvas.getDocument();
                if (doc && !doc.getElementById('smarty-editor-style')) {
                    const style = doc.createElement('style');
                    style.id = 'smarty-editor-style';
                    style.innerHTML = `
                        .smarty-code-wrapper {
                            background-color: #ffe6f3 !important;
                            padding: 20px !important;
                            color: #ea148c !important;
                            font-family: monospace !important;
                            font-weight: bold !important;
                            border: 1px dashed #ea148c !important;
                        }
                    `;
                    doc.head.appendChild(style);
                }

                // Met à jour la vue interne GrapesJS lors de la modification du trait
                (this as any).on('change:smartyContent', (this as any).handleSmartyChange);
                (this as any).handleSmartyChange();
            },
            handleSmartyChange() {
                const content = (this as any).get('smartyContent') || '';
                // On stocke le code smarty dans le MJML interne de l'éditeur
                (this as any).components(content);
            }
        },
        view: {
            onRender() {
                // Bouton d'édition rapide (optionnel)
                const btn = document.createElement('button');
                btn.innerHTML = t('civicrmbuilder.smarty.edit_button', 'Edit Smarty');
                btn.style.position = 'absolute';
                btn.style.top = '0';
                btn.style.right = '0';
                btn.style.background = '#ea148c';
                btn.style.color = '#fff';
                btn.style.border = 'none';
                btn.style.padding = '2px 5px';
                btn.style.fontSize = '10px';
                btn.style.cursor = 'pointer';
                btn.style.zIndex = '10';

                btn.onclick = () => {
                    editor.runCommand('edit-smarty-code', { target: (this as any).model });
                };

                (this as any).el.style.position = 'relative';
                (this as any).el.appendChild(btn);
            }
        }
    });

    // Commande pour éditer le code Smarty via une modale
    commands.add('edit-smarty-code', {
        run(editor: any, sender: any, options: any) {
            const target = options.target;
            const currentContent = target.get('smartyContent') || '';

            const modalContent = document.createElement('div');
            const textarea = document.createElement('textarea');
            textarea.style.width = '100%';
            textarea.style.height = '200px';
            textarea.style.padding = '15px';
            textarea.style.color = '#333333';
            textarea.style.backgroundColor = '#ffffff';
            textarea.style.fontFamily = 'monospace';
            textarea.style.fontSize = '14px';
            textarea.style.border = '1px solid #cccccc';
            textarea.style.borderRadius = '4px';
            textarea.style.boxSizing = 'border-box';
            textarea.value = currentContent;

            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = t('civicrmbuilder.smarty.save_code', 'Save code');
            saveBtn.style.marginTop = '15px';
            saveBtn.style.backgroundColor = '#ea148c';
            saveBtn.style.color = '#ffffff';
            saveBtn.style.border = 'none';
            saveBtn.style.padding = '10px 20px';
            saveBtn.style.borderRadius = '4px';
            saveBtn.style.cursor = 'pointer';
            saveBtn.style.fontWeight = 'bold';
            saveBtn.style.fontSize = '14px';
            saveBtn.style.float = 'right';
            saveBtn.onclick = () => {
                target.set('smartyContent', textarea.value);
                editor.Modal.close();
            };

            modalContent.appendChild(textarea);
            modalContent.appendChild(saveBtn);

            editor.Modal.setTitle(t('civicrmbuilder.smarty.modal_title', 'Edit Smarty code'))
                .setContent(modalContent)
                .open();
        }
    });

    // Ajout du bloc dans le gestionnaire de blocs, catégorie CiviCRM - Logique
    blockManager.add('smarty-code-block', {
        label: t('civicrmbuilder.smarty.block_label', 'Smarty code'),
        category: catCiviElementsId,
        attributes: { class: 'fa fa-code' },
        content: { type: 'smarty-code' }
    });
}
