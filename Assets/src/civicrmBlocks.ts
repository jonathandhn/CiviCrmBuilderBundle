export const iconText = `
  <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <path fill="currentColor" d="M4 5h16v2H4V5zm0 4h16v2H4V9zm0 4h10v2H4v-2zm0 4h16v2H4v-2z"/>
  </svg>
`;

export const iconHeader = `
  <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <path fill="currentColor" d="M3 5h18v5H3V5zm2 2v1h14V7H5zm-2 6h18v6H3v-6zm2 2v2h14v-2H5z"/>
  </svg>
`;

export const iconButton = `
  <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <path fill="currentColor" d="M5 8h14a4 4 0 0 1 0 8H5a4 4 0 0 1 0-8zm0 2a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4H5z"/>
  </svg>
`;

export const iconDivider = `
  <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <path fill="currentColor" d="M4 11h16v2H4v-2z"/>
  </svg>
`;

export const iconSpacer = `
  <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <path fill="currentColor" d="M11 3h2v18h-2V3zM7 5l5-5 5 5h-3v3h-4V5H7zm10 14l-5 5-5-5h3v-3h4v3h3z"/>
  </svg>
`;

export const iconColumns = `
  <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
    <path fill="currentColor" d="M3 5h5v14H3V5zm7 0h4v14h-4V5zm6 0h5v14h-5V5z"/>
  </svg>
`;

export const sectionStyle = 'background-color="#ffffff" padding="0"';
export const sectionWithBorder = 'background-color="#ffffff" border-bottom="2px solid #808080" padding="0"';

export function getStaticBlocks(categories: any): any[] {
    // Tous les blocs sont désormais gérés par le système JSON (customBlockLoader)
    // dans le répertoire /themes/sos_mjml/blocks/
    return [];
}
