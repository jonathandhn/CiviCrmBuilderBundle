export function registerSmartyBlock(editor: any, catCiviElementsId: string) {
    const blockManager = editor.BlockManager;
    const domComponents = editor.DomComponents;
    const commands = editor.Commands;

    // Définition du composant GrapesJS personnalisé (sans polluer le template avec du JSON)
    domComponents.addType('smarty-code', {
        isComponent: (el: any) => el.tagName === 'SMARTY-CODE',
        model: {
            defaults: {
                tagName: 'div',
                attributes: { class: 'smarty-code-wrapper' },
                components: '',
                smartyContent: '{* Insérez votre code Smarty ici *}',
                traits: [
                    {
                        type: 'text',
                        name: 'smartyContent',
                        label: 'Code Smarty',
                    }
                ],
                style: {
                    padding: '10px',
                    border: '1px dashed #ea148c',
                    'background-color': '#f9f9f9',
                    color: '#ea148c',
                    'font-family': 'monospace',
                }
            },
            init() {
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
                btn.innerHTML = 'Éditer Smarty';
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
            textarea.value = currentContent;

            const saveBtn = document.createElement('button');
            saveBtn.innerHTML = 'Sauvegarder';
            saveBtn.style.marginTop = '10px';
            saveBtn.className = 'gjs-btn-prim';
            saveBtn.onclick = () => {
                target.set('smartyContent', textarea.value);
                editor.Modal.close();
            };

            modalContent.appendChild(textarea);
            modalContent.appendChild(saveBtn);

            editor.Modal.setTitle('Éditer le code Smarty')
                .setContent(modalContent)
                .open();
        }
    });

    // Ajout du bloc dans le gestionnaire de blocs, catégorie CiviCRM - Logique
    blockManager.add('smarty-code-block', {
        label: 'Smarty Code',
        category: catCiviElementsId,
        attributes: { class: 'fa fa-code' },
        content: { type: 'smarty-code' }
    });
}
