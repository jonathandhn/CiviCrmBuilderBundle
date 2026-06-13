export interface CustomBlock {
  id: string;
  label?: string;
  category?: string;
  content: string;
  attributes?: Record<string, any>;
  order?: number;
  context?: string[];
}

export async function loadCustomBlocks(themeName: string, currentContext: string = 'email-mjml'): Promise<CustomBlock[]> {
  console.info(`⏳ [GrapesJsCustomPlugin] Fetching custom JSON blocks for theme "${themeName}"...`);
  const fetchUrl = '/s/grapesjs-custom/theme-blocks/' + themeName;

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.error(`[GrapesJsCustomPlugin] HTTP Error ${response.status} while fetching blocks from ${fetchUrl}`);
      return [];
    }

    const jsonText = await response.text();
    let blocks: any[];
    try {
      blocks = JSON.parse(jsonText);
    } catch (e) {
      console.error('[GrapesJsCustomPlugin] Failed to parse JSON response:', e);
      return [];
    }

    if (!Array.isArray(blocks)) {
      console.error('[GrapesJsCustomPlugin] Invalid response format. Expected an array of blocks.');
      return [];
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
        console.warn('[GrapesJsCustomPlugin] Ignoring invalid JSON block:', b);
      }
    });

    console.info(`[GrapesJsCustomPlugin] Successfully loaded ${validBlocks.length} custom blocks from ${fetchUrl}. (${invalidCount} invalid ignored)`);
    return validBlocks;

  } catch (err) {
    console.error(`[GrapesJsCustomPlugin] Network error while fetching blocks from ${fetchUrl}:`, err);
    return [];
  }
}
