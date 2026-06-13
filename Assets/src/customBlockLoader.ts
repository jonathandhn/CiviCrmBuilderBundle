export interface CustomBlock {
  id: string;
  label?: string;
  category?: string;
  content: string;
  attributes?: Record<string, any>;
  order?: number;
  context?: string[];
}

export async function loadCustomBlocks(themeName: string, currentContext: string = 'email-mjml'): Promise<{blocks: CustomBlock[], themeVariables: any}> {
  console.info(`⏳ [CiviCrmBuilder] Fetching custom JSON blocks for theme "${themeName}"...`);
  const fetchUrl = '/s/civicrm-builder/theme-blocks/' + themeName;

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.error(`[CiviCrmBuilder] HTTP Error ${response.status} while fetching blocks from ${fetchUrl}`);
      return {blocks: [], themeVariables: {}};
    }

    const jsonText = await response.text();
    let data: any;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      console.error('[CiviCrmBuilder] Failed to parse JSON response:', e);
      return {blocks: [], themeVariables: {}};
    }

    let blocks = Array.isArray(data) ? data : (data.blocks || []);
    let themeVariables = data.theme_variables || {};

    if (!Array.isArray(blocks)) {
      console.error('[CiviCrmBuilder] Invalid response format. Expected an array of blocks.');
      return {blocks: [], themeVariables: {}};
    }

    const validBlocks: CustomBlock[] = [];
    let invalidCount = 0;

    blocks.forEach(b => {
      // Validation minimale
      if (b && typeof b === 'object' && b.id && b.content) {

        // Filtrage par contexte si context est défini dans le JSON
        if (b.context && Array.isArray(b.context)) {
          if (!b.context.includes(currentContext)) {
            // Ignore ce bloc car il ne correspond pas au contexte actuel (ex: page vs email-mjml)
            return;
          }
        }

        validBlocks.push({
          id: b.id,
          label: b.label || b.id,
          category: b.category || 'Thème Mautic',
          content: b.content,
          attributes: b.attributes || { class: 'fa fa-cube' },
          order: b.order
        });
      } else {
        invalidCount++;
        console.warn('[CiviCrmBuilder] Ignoring invalid JSON block:', b);
      }
    });

    console.info(`[CiviCrmBuilder] Successfully loaded ${validBlocks.length} custom blocks from ${fetchUrl}. (${invalidCount} invalid ignored)`);
    return { blocks: validBlocks, themeVariables };

  } catch (err) {
    console.error(`[CiviCrmBuilder] Network error while fetching blocks from ${fetchUrl}:`, err);
    return {blocks: [], themeVariables: {}};
  }
}
