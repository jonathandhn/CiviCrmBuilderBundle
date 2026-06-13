export function applyCkeditorThemeConfig() {
  // Patch global : intercepter la configuration CKEditor de Mautic AVANT le chargement de GrapesJS
  if (window.Mautic && window.Mautic.GetCkEditorConfigOptions && !window._ckeditorPatched) {
    const originalGetCk = window.Mautic.GetCkEditorConfigOptions;
    window.Mautic.GetCkEditorConfigOptions = function () {
      const config = originalGetCk.apply(this, arguments);

      // Couleurs de la charte officielle SOS Homophobie
      const customColors = [
        { color: '#ea148c', label: 'Magenta SOS' },
        { color: '#00577b', label: 'Bleu Cobalt' },
        { color: '#ffcf1a', label: 'Jaune' },
        { color: '#2e78cc', label: 'Bleu Azur' },
        { color: '#ffffff', label: 'Blanc', hasBorder: true },
        { color: '#000000', label: 'Noir' }
      ];

      config.fontColor = config.fontColor || {};
      config.fontColor.colors = customColors;

      config.fontBackgroundColor = config.fontBackgroundColor || {};
      config.fontBackgroundColor.colors = customColors;

      // Forcer la police Roboto dans CKEditor (et exemples pour en ajouter)
      config.fontFamily = config.fontFamily || {};
      config.fontFamily.options = [
        'Par défaut',
        'Roboto, Arial, sans-serif'
        // 'Montserrat, Arial, sans-serif',
        // 'Open Sans, Arial, sans-serif'
      ];
      config.fontFamily.supportAllValues = true;

      // Force l'ajout de removeFormat dans la barre d'outils
      if (config.toolbar) {
        if (Array.isArray(config.toolbar)) {
          if (!config.toolbar.includes('removeFormat')) config.toolbar.push('removeFormat');
        } else if (config.toolbar.items && Array.isArray(config.toolbar.items)) {
          if (!config.toolbar.items.includes('removeFormat')) config.toolbar.items.push('removeFormat');
        }
      }

      return config;
    };
    window._ckeditorPatched = true;
    console.info('[GrapesJsCustomPlugin] CKEditor config patched with custom fonts/colors.');
  }
}

export function configureGrapesJsColorPicker(editor: any) {
  // Configurer le Color Picker natif de GrapesJS (barre de droite)
  if (editor.Config) {
    editor.Config.colorPicker = {
      ...(editor.Config.colorPicker || {}),
      palette: [
        ['#ea148c', '#00577b', '#ffcf1a', '#2e78cc', '#ffffff', '#000000']
      ]
    };
  }
}

export function configureGrapesJsTypography(editor: any) {
  // Forcer la police Roboto dans le panneau Typographie de GrapesJS
  const styleManager = editor.StyleManager;
  const fontProperty = styleManager.getProperty('typography', 'font-family');
  if (fontProperty) {
    fontProperty.set('options', [
      { value: 'Roboto, Arial, sans-serif', name: 'Roboto' }
    ]);
    // Par défaut, sélectionner Roboto
    fontProperty.set('value', 'Roboto, Arial, sans-serif');
  }
}
