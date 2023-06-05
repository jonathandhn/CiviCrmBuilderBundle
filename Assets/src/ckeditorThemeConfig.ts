import { resolveTheme } from './themeResolver';

let cachedThemeVars: any = null;

export function applyCkeditorThemeConfig() {
  // Patch global : intercepter la configuration CKEditor de Mautic AVANT le chargement de GrapesJS
  if (window.Mautic && window.Mautic.GetCkEditorConfigOptions) {
    const originalGetCk = window.Mautic.GetCkEditorConfigOptions;
    window.Mautic.GetCkEditorConfigOptions = function () {
      const config = originalGetCk.apply(this, arguments);

      // Charger dynamiquement (et de manière synchrone) les variables la première fois
      if (!cachedThemeVars) {
        cachedThemeVars = {};
        const themeName = resolveTheme();
        if (themeName && themeName !== 'blank') {
          try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '/themes/' + themeName + '/theme_variables.json', false); // Sync XHR
            xhr.send(null);
            if (xhr.status === 200) {
              cachedThemeVars = JSON.parse(xhr.responseText);
            }
          } catch (e) {
            console.error('[CiviCrmBuilder] Failed to load theme_variables.json synchronously:', e);
          }
        }
      }

      const themeVars = cachedThemeVars;

      const customColors: {color: string, label: string, hasBorder?: boolean}[] = [];
      for (const key in themeVars) {
        if (key.startsWith('color_')) {
          const colorVal = themeVars[key];
          let label = key.replace('color_', '').replace(/_/g, ' ');
          label = label.charAt(0).toUpperCase() + label.slice(1);
          customColors.push({ color: colorVal, label: label, hasBorder: colorVal.toLowerCase() === '#ffffff' });
        }
      }

      if (customColors.length > 0) {
        config.fontColor = config.fontColor || {};
        config.fontColor.colors = customColors;
        config.fontBackgroundColor = config.fontBackgroundColor || {};
        config.fontBackgroundColor.colors = customColors;
      }

      if (themeVars.font_main) {
        config.fontFamily = config.fontFamily || {};
        config.fontFamily.options = [
          'Par défaut',
          themeVars.font_main
        ];
        config.fontFamily.supportAllValues = true;
      }

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
    console.info('[CiviCrmBuilder] CKEditor config patched with dynamic theme variables.');
  }
}

export function configureGrapesJsColorPicker(editor: any, themeVars: any = {}) {
  const palette: string[] = [];
  for (const key in themeVars) {
    if (key.startsWith('color_')) {
      palette.push(themeVars[key]);
    }
  }

  if (palette.length > 0 && editor.Config) {
    editor.Config.colorPicker = {
      ...(editor.Config.colorPicker || {}),
      palette: [palette]
    };
  }
}

export function configureGrapesJsTypography(editor: any, themeVars: any = {}) {
  if (themeVars.font_main) {
    const styleManager = editor.StyleManager;
    const fontProperty = styleManager.getProperty('typography', 'font-family');
    if (fontProperty) {
      const fontName = themeVars.font_main.split(',')[0].trim();
      fontProperty.set('options', [
        { value: themeVars.font_main, name: fontName }
      ]);
      fontProperty.set('value', themeVars.font_main);
    }
  }
}
