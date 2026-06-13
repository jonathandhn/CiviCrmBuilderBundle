export function resolveTheme(explicitTheme?: string): string {
  let themeName = explicitTheme || '';

  console.info('[GrapesJsCustomPlugin] Resolving theme...');

  if (!themeName) {
    try {
      const input = document.querySelector('#emailform_template') || document.querySelector('#campaignevent_template') || document.querySelector('#page_template');
      if (input) {
        themeName = (input as HTMLInputElement).value;
        if (themeName) console.info('[GrapesJsCustomPlugin] Theme resolved from local DOM:', themeName);
      }

      if (!themeName && window.parent && window.parent.document) {
        const pInput = window.parent.document.querySelector('#emailform_template') || window.parent.document.querySelector('#campaignevent_template') || window.parent.document.querySelector('#page_template');
        if (pInput) {
          themeName = (pInput as HTMLInputElement).value;
          if (themeName) console.info('[GrapesJsCustomPlugin] Theme resolved from window.parent DOM:', themeName);
        }
      }
    } catch (e) {
      console.warn('[GrapesJsCustomPlugin] Error while checking DOM for theme:', e);
    }
  } else {
    console.info('[GrapesJsCustomPlugin] Theme resolved from explicit config:', themeName);
  }

  // Fallback for SOS Homophobie
  if (!themeName) {
    themeName = 'sos_mjml';
    console.warn('[GrapesJsCustomPlugin] Theme not found in DOM, using fallback theme:', themeName);
  }

  return themeName;
}
