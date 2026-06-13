export function resolveTheme(explicitTheme?: string): string {
  let themeName = explicitTheme || '';

  console.info('[CiviCrmBuilder] Resolving theme...');

  if (!themeName) {
    try {
      const input = document.querySelector('#emailform_template') || document.querySelector('#campaignevent_template') || document.querySelector('#page_template');
      if (input) {
        themeName = (input as HTMLInputElement).value;
        if (themeName) console.info('[CiviCrmBuilder] Theme resolved from local DOM:', themeName);
      }

      if (!themeName && window.parent && window.parent.document) {
        const pInput = window.parent.document.querySelector('#emailform_template') || window.parent.document.querySelector('#campaignevent_template') || window.parent.document.querySelector('#page_template');
        if (pInput) {
          themeName = (pInput as HTMLInputElement).value;
          if (themeName) console.info('[CiviCrmBuilder] Theme resolved from window.parent DOM:', themeName);
        }
      }
    } catch (e) {
      console.warn('[CiviCrmBuilder] Error while checking DOM for theme:', e);
    }
  } else {
    console.info('[CiviCrmBuilder] Theme resolved from explicit config:', themeName);
  }

  // Fallback
  if (!themeName) {
    themeName = 'blank';
    console.warn('[CiviCrmBuilder] Theme not found in DOM, using fallback theme:', themeName);
  }

  return themeName;
}
