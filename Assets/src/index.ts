import { applyCkeditorThemeConfig, configureGrapesJsColorPicker, configureGrapesJsTypography } from './ckeditorThemeConfig';
import { resolveTheme } from './themeResolver';
import { loadCustomBlocks } from './customBlockLoader';
import { registerBlocks } from './blockRegistry';

declare global {
  interface Window {
    MauticGrapesJsPlugins: any[];
    Mautic: any;
    _ckeditorPatched: boolean;
  }
}

const t = (key: string, fallback: string): string => {
  const translated = window.Mautic?.translate?.(key);
  return translated && translated !== key ? translated : fallback;
};

const CiviCrmBuilder = (editor: any, options: any) => {
  console.info('[CiviCrmBuilder] Plugin is booting...');

  // 1. Initialiser la configuration globale (GrapesJS)

  // Initialiser la configuration globale (GrapesJS)
  editor.on('load', () => {
    // La configuration sera injectée après le chargement des blocs
  });

  // 2. Récupérer le contexte Mautic passé dans les options
  const mauticOptions = options.options || {};
  // La vue GrapesJS dans Mautic
  const grapesjsBuilder = mauticOptions.grapesjsBuilder || null;

  // 3. Définir le mode (mautic vs civicrm) - par défaut Mautic
  let editorMode: 'mautic' | 'civicrm' = 'mautic';

  // 4. Au chargement de l'éditeur, on cache ou affiche les catégories selon le mode
  editor.on('load', () => {
    const updateCategories = (mode: 'mautic' | 'civicrm') => {
      const container = editor.getContainer();
      if (!container) return;
      const categories = container.querySelectorAll('.gjs-block-category');
      categories.forEach((cat: any) => {
        const titleEl = cat.querySelector('.gjs-title');
        if (!titleEl) return;
        const title = titleEl.innerText || titleEl.textContent;

        // Si la catégorie est spécifiquement CiviCRM
        if (title.includes('CiviCRM')) {
          cat.style.display = mode === 'mautic' ? 'none' : 'block';
        }
        // Si la catégorie est spécifiquement Mautic
        else if (title.includes('Mautic') || title.includes('Thème')) {
          cat.style.display = mode === 'civicrm' ? 'none' : 'block';
        }
        // Si c'est un custom, on affiche toujours
      });
    };

    // Commande pour basculer en mode Mautic
    editor.Commands.add('set-mode-mautic', {
      run(e: any) {
        editorMode = 'mautic';
        console.info('[CiviCrmBuilder] Switched to Mautic Mode');
        updateCategories('mautic');
      }
    });

    // Commande pour basculer en mode CiviCRM
    editor.Commands.add('set-mode-civicrm', {
      run(e: any) {
        editorMode = 'civicrm';
        console.info('[CiviCrmBuilder] Switched to CiviCRM Mode');
        updateCategories('civicrm');
      }
    });

    // Ajouter des boutons dans le panel d'options pour basculer manuellement si besoin
    const panels = editor.Panels;
    panels.addButton('options', {
      id: 'btn-mode-mautic',
      className: 'fa fa-envelope',
      command: 'set-mode-mautic',
      attributes: { title: t('civicrmbuilder.mode.mautic', 'Mautic mode') },
      active: true,
    });
    panels.addButton('options', {
      id: 'btn-mode-civicrm',
      className: 'fa fa-users',
      command: 'set-mode-civicrm',
      attributes: { title: t('civicrmbuilder.mode.civicrm', 'CiviCRM mode') },
      active: false,
    });

    // === ETAPE 5: Chargement asynchrone des blocs dynamiques ===
    setTimeout(() => {
      // Déterminer le thème via notre resolveur robuste
      const themeName = resolveTheme();

      if (themeName) {
        // Déterminer le contexte actuel (ex: page, email-mjml, etc.)
        let currentContext = 'email-mjml'; // default

        // Mautic expose souvent context dans window.MauticGrapesJsPlugins
        if (window.MauticGrapesJsPlugins) {
          const pluginDef = window.MauticGrapesJsPlugins.find((p: any) => p.name === 'CiviCrmBuilder');
          if (pluginDef && pluginDef.context && pluginDef.context.length > 0) {
            // on prend le premier contexte qui matche
            if (pluginDef.context.includes('email-mjml')) {
              currentContext = 'email-mjml';
            } else if (pluginDef.context.includes('page')) {
              currentContext = 'page';
            }
          }
        }

        // Charger et enregistrer tous les blocs
        loadCustomBlocks(themeName, currentContext).then(({ blocks: customBlocks, themeVariables }) => {
          configureGrapesJsColorPicker(editor, themeVariables);
          configureGrapesJsTypography(editor, themeVariables);
          
          registerBlocks(editor, customBlocks);

          // Fermer les catégories natives et les mettre à la fin
          const cats = editor.BlockManager.getCategories();
          cats.each((cat: any) => {
            const id = cat.get('id') || cat.get('label') || '';
            if (!id.toLowerCase().includes('custom') && !id.toLowerCase().includes('civicrm')) {
              cat.set('open', false);
            }
          });

          // Par défaut on applique le mode Mautic à la fin de l'initialisation
          editor.runCommand('set-mode-mautic');
        });
      } else {
        // S'il n'y a pas de thème (ex: formulaire, etc), on charge juste les blocs statiques
        registerBlocks(editor, []);
        editor.runCommand('set-mode-mautic');
      }

      // === ETAPE 6: Ajouter le bouton "Sauvegarder le bloc" dans la barre d'outils (Toolbar) ===
      editor.on('component:selected', (model: any) => {
        const tb = model.get('toolbar');
        const hasSave = tb.find((tbItem: any) => tbItem.id === 'save-block');
        if (!hasSave) {
          tb.unshift({
            id: 'save-block',
            attributes: { class: 'fa fa-floppy-o', title: t('civicrmbuilder.toolbar.save_block', 'Save this block') },
            command: 'save-block-cmd',
          });
          model.set('toolbar', tb);
        }
      });

      editor.Commands.add('save-block-cmd', {
        run(editor: any, sender: any, opts: any) {
          const selected = editor.getSelected();
          if (!selected) return;

          const blockName = prompt(
            t('civicrmbuilder.prompt.save_block', 'Name your new block'),
            t('civicrmbuilder.prompt.save_block.default', 'My Custom Block')
          );
          if (!blockName) return;

          // Extraire le HTML / MJML
          const content = selected.toHTML();
          const tName = resolveTheme();

          if (!tName) {
            alert(t('civicrmbuilder.alert.no_active_theme', 'Error: no active theme detected.'));
            return;
          }

          fetch('/s/civicrm-builder/theme-blocks/' + tName + '/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': (window as any).mauticAjaxCsrf || ''
            },
            body: JSON.stringify({
              label: blockName,
              content: content
            })
          }).then(res => res.json()).then(data => {
            if (data.success) {
              alert(
                t('civicrmbuilder.alert.save_block_success', 'Block saved successfully in theme %theme%! Refresh the page to see it in Saved Blocks.')
                  .replace('%theme%', tName)
              );
            } else {
              const errMsg = data.error || (data.errors && data.errors[0] ? data.errors[0].message : JSON.stringify(data));
              alert(`${t('civicrmbuilder.alert.server_error', 'Server error:')} ${errMsg}`);
            }
          }).catch(err => {
            console.error(err);
            alert(t('civicrmbuilder.alert.network_error', 'Network error while saving the block.'));
          });
        }
      });

    }, 500); // Petit délai pour laisser GrapesJS finir son DOM
  });
};

export default CiviCrmBuilder;

// 1. Initialiser la configuration globale (CKEditor) IMMEDIATEMENT !
// Mautic charge CKEditor avant que GrapesJS ne finisse de booter.
applyCkeditorThemeConfig();

// Injection dans Mautic
if (!window.MauticGrapesJsPlugins) {
  window.MauticGrapesJsPlugins = [];
}

window.MauticGrapesJsPlugins.push({
  name: 'CiviCrmBuilder',
  plugin: CiviCrmBuilder,
  context: ['page', 'email-mjml'],
  pluginOptions: {
    options: {
      test: true
    }
  }
});
