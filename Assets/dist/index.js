"use strict";
var GrapesJsCustomPlugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.ts
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });
  if (window.Mautic && window.Mautic.GetCkEditorConfigOptions && !window._ckeditorPatched) {
    const originalGetCk = window.Mautic.GetCkEditorConfigOptions;
    window.Mautic.GetCkEditorConfigOptions = function() {
      const config = originalGetCk.apply(this, arguments);
      const customColors = [
        { color: "#ea148c", label: "Magenta" },
        { color: "#00577b", label: "Bleu Cobalt" },
        { color: "#ffcf1a", label: "Jaune" },
        { color: "#2e78cc", label: "Bleu Azur" },
        { color: "#ffffff", label: "Blanc", hasBorder: true },
        { color: "#000000", label: "Noir" }
      ];
      config.fontColor = config.fontColor || {};
      config.fontColor.colors = customColors;
      config.fontBackgroundColor = config.fontBackgroundColor || {};
      config.fontBackgroundColor.colors = customColors;
      config.fontFamily = config.fontFamily || {};
      config.fontFamily.options = [
        "Roboto, Arial, sans-serif"
        // Police par défaut forcée
        // Exemple pour ajouter vos propres polices du template (décommenter et modifier) :
        // 'Montserrat, Arial, sans-serif',
        // 'Open Sans, Arial, sans-serif'
      ];
      config.fontFamily.supportAllValues = true;
      if (config.toolbar) {
        if (Array.isArray(config.toolbar)) {
          if (!config.toolbar.includes("removeFormat")) config.toolbar.push("removeFormat");
        } else if (config.toolbar.items && Array.isArray(config.toolbar.items)) {
          if (!config.toolbar.items.includes("removeFormat")) config.toolbar.items.push("removeFormat");
        }
      }
      return config;
    };
    window._ckeditorPatched = true;
  }
  var GrapesJsCustomPlugin = (editor, opts = {}) => {
    const options = { ...opts };
    console.log("Run GrapesJsCustomPlugin (SOS Homophobie - Modular Edition)...", options);
    editor.on("load", () => {
      if (editor.Config) {
        editor.Config.colorPicker = {
          ...editor.Config.colorPicker || {},
          palette: [
            ["#ea148c", "#00577b", "#ffcf1a", "#2e78cc", "#ffffff", "#000000"]
          ]
        };
      }
      const styleManager = editor.StyleManager;
      const fontProperty = styleManager.getProperty("typography", "font-family");
      if (fontProperty) {
        fontProperty.set("options", [
          { value: "Roboto, Arial, sans-serif", name: "Roboto" }
          // Exemple pour ajouter d'autres polices dans la barre latérale GrapesJS :
          // { value: 'Montserrat, Arial, sans-serif', name: 'Montserrat' },
          // { value: 'Open Sans, Arial, sans-serif', name: 'Open Sans' }
        ]);
        fontProperty.set("value", "Roboto, Arial, sans-serif");
      }
      const blockManager = editor.BlockManager;
      const catMauticElements = { id: "sos-mautic-elements", label: "Mautic - \xC9l\xE9ments", open: true, order: 4 };
      const catMauticStructures = { id: "sos-mautic-structures", label: "Mautic - Structures", open: true, order: 3 };
      const catCiviElements = { id: "sos-civicrm-elements", label: "CiviCRM - \xC9l\xE9ments", open: false, order: 6 };
      const catCiviStructures = { id: "sos-civicrm-structures", label: "CiviCRM - Structures", open: false, order: 5 };
      const categoryElements = { id: "sos-elements", label: "G\xE9n\xE9rique - \xC9l\xE9ments", open: true, order: 2 };
      const categoryStructures = { id: "sos-structures", label: "G\xE9n\xE9rique - Structures", open: true, order: 1 };
      blockManager.getCategories().add(catMauticElements);
      blockManager.getCategories().add(catMauticStructures);
      blockManager.getCategories().add(catCiviElements);
      blockManager.getCategories().add(catCiviStructures);
      blockManager.getCategories().add(categoryElements);
      blockManager.getCategories().add(categoryStructures);
      const style = document.createElement("style");
      style.innerHTML = `
      .gjs-block {
        font-family: Roboto, Arial, sans-serif;
      }
      .gjs-block svg {
        color: #ea148c;
        margin-bottom: 6px;
      }
      .gjs-block-label {
        font-size: 12px;
        line-height: 1.25;
      }
      .civicrm-token-list {
        display: flex;
        flex-direction: column;
        gap: 5px;
        max-height: 400px;
        overflow-y: auto;
      }
      .civicrm-token-item {
        background: #f1f1f1;
        border: 1px solid #ccc;
        padding: 8px;
        cursor: pointer;
        color: #333;
        font-family: monospace;
      }
      .civicrm-token-item:hover {
        background: #ea148c;
        color: #fff;
      }
      .smarty-snippet-item {
        background: #fdfdfd;
        border: 1px solid #ddd;
        padding: 8px;
        cursor: pointer;
        color: #00577b;
        font-family: monospace;
        margin-bottom: 5px;
        border-radius: 4px;
      }
      .smarty-snippet-item:hover {
        background: #00577b;
        color: #fff;
      }
    `;
      document.head.appendChild(style);
      const iconText = `
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <path fill="currentColor" d="M4 5h16v2H4V5zm0 4h16v2H4V9zm0 4h10v2H4v-2zm0 4h16v2H4v-2z"/>
      </svg>
    `;
      const iconHeader = `
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <path fill="currentColor" d="M3 5h18v5H3V5zm2 2v1h14V7H5zm-2 6h18v6H3v-6zm2 2v2h14v-2H5z"/>
      </svg>
    `;
      const iconButton = `
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <path fill="currentColor" d="M5 8h14a4 4 0 0 1 0 8H5a4 4 0 0 1 0-8zm0 2a2 2 0 0 0 0 4h14a2 2 0 0 0 0-4H5z"/>
      </svg>
    `;
      const iconDivider = `
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <path fill="currentColor" d="M4 11h16v2H4v-2z"/>
      </svg>
    `;
      const iconSpacer = `
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <path fill="currentColor" d="M11 3h2v18h-2V3zM7 5l5-5 5 5h-3v3h-4V5H7zm10 14l-5 5-5-5h3v-3h4v3h3z"/>
      </svg>
    `;
      const iconColumns = `
      <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
        <path fill="currentColor" d="M3 5h5v14H3V5zm7 0h4v14h-4V5zm6 0h5v14h-5V5z"/>
      </svg>
    `;
      const sectionStyle = 'background-color="#ffffff" padding="0"';
      const sectionWithBorder = 'background-color="#ffffff" border-bottom="2px solid #808080" padding="0"';
      blockManager.add("sos-webview-link", {
        label: "Lien navigateur section",
        category: catMauticStructures,
        media: iconText,
        content: `
        <mj-section padding="0px" text-align="center">
          <mj-column>
            <mj-text align="right" color="#ea148c" font-size="10px" padding="0 15px">
              <p><a target="_blank" href="{webview_url}">{webview_text}</a></p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-webview-link-module", {
        label: "Lien navigateur module",
        category: catMauticElements,
        media: iconText,
        content: `
        <mj-text align="right" color="#ea148c" font-size="10px" padding="0 15px">
          <p><a target="_blank" href="{webview_url}">{webview_text}</a></p>
        </mj-text>
      `
      });
      blockManager.add("sos-header", {
        label: "Header SOS",
        category: catMauticStructures,
        media: iconHeader,
        content: `
        <mj-section background-color="#ea148c" padding="15px">
          <mj-column vertical-align="middle" width="25%">
            <mj-image padding="0" border="none" align="center" alt="SOS homophobie" href="https://www.sos-homophobie.org" src="/themes/sos_mjml/assets/img/logo_blanc.png" target="_blank" width="1077px"></mj-image>
          </mj-column>
          <mj-column vertical-align="middle" width="75%">
            <mj-text align="center" color="#ffffff" font-size="20px" padding="10px 25px">
              <h1><b>{subject}</b></h1>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-unsubscribe", {
        label: "D\xE9sinscription section",
        category: catMauticStructures,
        media: iconText,
        content: `
        <mj-section padding="0px" text-align="center">
          <mj-column>
            <mj-text align="center" color="#787878" font-size="10px" padding="0 0 20px 0">
              <p><a target="_blank" href="{unsubscribe_url}">{unsubscribe_text}</a></p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-unsubscribe-module", {
        label: "D\xE9sinscription module",
        category: catMauticElements,
        media: iconText,
        content: `
        <mj-text align="center" color="#787878" font-size="10px" padding="0 0 20px 0">
          <p><a target="_blank" href="{unsubscribe_url}">{unsubscribe_text}</a></p>
        </mj-text>
      `
      });
      blockManager.add("sos-webview-civicrm", {
        label: "Lien navigateur section",
        category: catCiviStructures,
        media: iconText,
        content: `
        <mj-section padding="0px" text-align="center">
          <mj-column>
            <mj-text align="right" color="#ea148c" font-size="10px" padding="0 15px">
              <p><a target="_blank" href="{mailing.viewUrl}">Consulter en ligne</a></p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-webview-module-civicrm", {
        label: "Lien navigateur module",
        category: catCiviElements,
        media: iconText,
        content: `
        <mj-text align="right" color="#ea148c" font-size="10px" padding="0 15px">
          <p><a target="_blank" href="{mailing.viewUrl}">Consulter en ligne</a></p>
        </mj-text>
      `
      });
      blockManager.add("sos-header-civicrm", {
        label: "Header Blanc",
        category: catCiviStructures,
        media: iconHeader,
        content: `
        <mj-section background-color="#ffffff" padding="15px">
          <mj-column vertical-align="middle" width="25%">
            <mj-image padding="0" border="none" align="center" alt="SOS homophobie" href="https://www.sos-homophobie.org" src="/themes/sos_mjml/assets/img/logo.png" target="_blank" width="1077px"></mj-image>
          </mj-column>
          <mj-column vertical-align="middle" width="75%">
            <mj-text align="center" color="#ea148c" font-size="20px" padding="10px 25px">
              <h1 style="text-transform:uppercase"><b>{mailing.name}</b></h1>
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="0"><mj-column><mj-divider border-color="#ea148c" border-width="6px" padding="0"></mj-divider></mj-column></mj-section>
      `
      });
      blockManager.add("sos-header-civicrm-rose", {
        label: "Header Presse",
        category: catCiviStructures,
        media: iconHeader,
        content: `
        <mj-section background-color="#ea148c" padding="15px">
          <mj-column vertical-align="middle" width="25%">
            <mj-image padding="0" border="none" align="center" alt="SOS homophobie" href="https://www.sos-homophobie.org" src="/themes/sos_mjml/assets/img/logo_blanc.png" target="_blank" width="1077px"></mj-image>
          </mj-column>
          <mj-column vertical-align="middle" width="75%">
            <mj-text align="center" color="#ffffff" font-size="20px" padding="10px 25px">
              <h1 style="text-transform:uppercase"><b>{mailing.name}</b></h1>
            </mj-text>
          </mj-column>
        </mj-section>
        <mj-section padding="0"><mj-column><mj-divider border-color="#f1f1f1" border-style="outset" border-width="2px" padding="0"></mj-divider></mj-column></mj-section>
      `
      });
      blockManager.add("sos-footer-civicrm", {
        label: "Footer Blanc",
        category: catCiviStructures,
        media: iconText,
        content: `
        <mj-section padding="20px 0" text-align="center">
          <mj-column>
            <mj-divider border-color="#ea148c" border-style="solid" border-width="2px" padding="10px 0px" width="80%"></mj-divider>
            <mj-text align="center" color="#787878" padding="0">
              <p>Association de lutte contre la lesbophobie, la gayphobie, la biphobie, et la transphobie<br>Association loi 1901 cr\xE9\xE9e le 11 avril 1994</p>
            </mj-text>
            <mj-text align="center" color="#787878" padding="0">
              <p><b>SOS homophobie</b><br>14 rue Abel<br>75012 Paris</p>
            </mj-text>
            <mj-image padding="0" border="none" align="center" alt="Ligne d'\xE9coute anonyme : 01 48 06 42 41" width="300px" href="https://www.sos-homophobie.org/ligne-ecoute" src="/themes/sos_mjml/assets/img/cartouche_ecoute.png" target="_blank"></mj-image>
            <mj-text align="center" color="#787878" font-size="11px" padding="10px 0 20px 0">
              <p>
                <a href="https://crm.sos-homophobie.org/civicrm/profile/edit?reset=1&id={contact.contact_id}&gid=12&{contact.checksum}" style="color:#ea148c;text-decoration:none;">Actualiser votre inscription</a> | 
                <a href="{action.optOutUrl}" style="color:#ea148c;text-decoration:none;">D\xE9sinscription</a>
              </p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-footer-civicrm-rose", {
        label: "Footer Presse",
        category: catCiviStructures,
        media: iconText,
        content: `
        <mj-section padding="20px 0" text-align="center">
          <mj-column>
            <mj-divider border-color="#ea148c" border-style="solid" border-width="2px" padding="10px 0px" width="80%"></mj-divider>
            <mj-text align="center" color="#787878" padding="0">
              <p>Association de lutte contre la lesbophobie, la gayphobie, la biphobie, et la transphobie<br>Association loi 1901 cr\xE9\xE9e le 11 avril 1994</p>
              <p>Contact presse : <a href="tel:+33-6-28-32-02-50" style="color:#ea148c;text-decoration:none;">06 28 32 02 50</a> | <a href="mailto:porte-parolat@sos-homophobie.org" style="color:#ea148c;text-decoration:none;">sos@sos-homophobie.org</a></p>
            </mj-text>
            <mj-text align="center" color="#787878" padding="0">
              <p><b>SOS homophobie</b><br>14 rue Abel<br>75012 Paris</p>
            </mj-text>
            <mj-image padding="0" border="none" align="center" alt="Ligne d'\xE9coute anonyme : 01 48 06 42 41" width="300px" href="https://www.sos-homophobie.org/ligne-ecoute" src="/themes/sos_mjml/assets/img/cartouche_ecoute.png" target="_blank"></mj-image>
            <mj-text align="center" color="#787878" font-size="11px" padding="10px 0 20px 0">
              <p>
                <a href="https://crm.sos-homophobie.org/civicrm/profile/edit?reset=1&id={contact.contact_id}&gid=12&{contact.checksum}" style="color:#ea148c;text-decoration:none;">Actualiser votre inscription</a> | 
                <a href="{action.optOutUrl}" style="color:#ea148c;text-decoration:none;">D\xE9sinscription</a>
              </p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-footer-civicrm-beta", {
        label: "Footer Newsletter",
        category: catCiviStructures,
        media: iconText,
        content: `
        <mj-section background-color="#00577b" padding="20px 0" text-align="center">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-family="Roboto, Arial, sans-serif" font-size="13px" padding="0px">
              <p style="margin: 10px 0;">Association de lutte contre la lesbophobie, la gayphobie, la biphobie et la transphobie<br>Association loi 1901 cr\xE9\xE9e le 11 avril 1994</p>
            </mj-text>
            <mj-text align="center" color="#ffffff" padding="0">
              <p><b>SOS homophobie</b><br>14 rue Abel<br>75012 Paris</p>
            </mj-text>
            <mj-image padding="0" border="none" align="center" alt="Ligne d'\xE9coute anonyme : 01 48 06 42 41" width="300px" href="https://www.sos-homophobie.org/ligne-ecoute" src="/themes/sos_mjml/assets/img/cartouche_ecoute_magenta.png" target="_blank"></mj-image>
            <mj-text align="center" color="#ffffff" font-size="11px" padding="10px 0 20px 0">
              <p>
                <a href="https://crm.sos-homophobie.org/civicrm/profile/edit?reset=1&id={contact.contact_id}&gid=12&{contact.checksum}" style="color:#ffffff;text-decoration:none;">Actualiser votre inscription</a> | 
                <a href="{action.optOutUrl}" style="color:#ffffff;text-decoration:none;">D\xE9sinscription</a>
              </p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-unsubscribe-civicrm", {
        label: "D\xE9sinscription & Profil section",
        category: catCiviStructures,
        media: iconText,
        content: `
        <mj-section padding="0px" text-align="center">
          <mj-column>
            <mj-text align="center" color="#787878" font-size="10px" padding="0 0 20px 0">
              <p>
                <a href="https://crm.sos-homophobie.org/civicrm/profile/edit?reset=1&id={contact.contact_id}&gid=12&{contact.checksum}" style="color:#ea148c;text-decoration:none;">Actualiser votre inscription</a> | 
                <a href="{action.optOutUrl}" style="color:#ea148c;text-decoration:none;">D\xE9sinscription</a>
              </p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-unsubscribe-module-civicrm", {
        label: "D\xE9sinscription & Profil module",
        category: catCiviElements,
        media: iconText,
        content: `
        <mj-text align="center" color="#787878" font-size="10px" padding="0 0 20px 0">
          <p>
            <a href="https://crm.sos-homophobie.org/civicrm/profile/edit?reset=1&id={contact.contact_id}&gid=12&{contact.checksum}" style="color:#ea148c;text-decoration:none;">Actualiser votre inscription</a> | 
            <a href="{action.optOutUrl}" style="color:#ea148c;text-decoration:none;">D\xE9sinscription</a>
          </p>
        </mj-text>
      `
      });
      blockManager.add("sos-title", {
        label: "Titre",
        category: categoryElements,
        media: iconText,
        content: `
        <mj-text align="left" color="#ea148c" font-size="18px" padding="10px 25px">
          <h2>Titre de votre section</h2>
        </mj-text>
      `
      });
      blockManager.add("sos-text", {
        label: "Texte",
        category: categoryElements,
        media: iconText,
        content: `
        <mj-text align="left" padding="10px 25px">
          <p>Votre contenu ici...</p>
        </mj-text>
      `
      });
      blockManager.add("sos-divider", {
        label: "S\xE9parateur",
        category: categoryElements,
        media: iconDivider,
        content: `
        <mj-divider border-color="#ea148c" border-style="solid" border-width="2px" padding="10px 0px" width="80%"></mj-divider>
      `
      });
      blockManager.add("sos-button", {
        label: "Bouton",
        category: categoryElements,
        media: iconButton,
        content: `
        <mj-button css-class="sos-btn" align="left" background-color="#ea148c" border-radius="0px" color="#ffffff" font-size="14px" href="#" inner-padding="10px 25px">
          <b>Bouton</b>
        </mj-button>
      `
      });
      blockManager.add("sos-spacer", {
        label: "Espaceur",
        category: categoryElements,
        media: iconSpacer,
        content: `
        <mj-spacer height="15px"></mj-spacer>
      `
      });
      blockManager.add("sos-header-beta", {
        label: "Header Newsletter",
        category: categoryStructures,
        media: iconHeader,
        content: `
        <mj-section background-url="/themes/sos_mjml/assets/img/oblique.png" background-repeat="no-repeat" background-position="left center" background-size="contain" padding="40px 0 20px 0" background-color="#ffffff">
          <mj-column>
            <mj-image src="/themes/sos_mjml/assets/img/logo.png" width="200px" padding="10px 25px"></mj-image>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-section-1-border", {
        label: "Section 1 col bordure",
        category: categoryStructures,
        media: iconColumns,
        content: `<mj-section ${sectionWithBorder}><mj-column></mj-column></mj-section>`
      });
      blockManager.add("sos-section-1", {
        label: "Section 1 col",
        category: categoryStructures,
        media: iconColumns,
        content: `<mj-section ${sectionStyle}><mj-column></mj-column></mj-section>`
      });
      blockManager.add("sos-section-2", {
        label: "Section 2 cols",
        category: categoryStructures,
        media: iconColumns,
        content: `<mj-section ${sectionStyle}><mj-column></mj-column><mj-column></mj-column></mj-section>`
      });
      blockManager.add("sos-section-3", {
        label: "Section 3 cols",
        category: categoryStructures,
        media: iconColumns,
        content: `<mj-section ${sectionStyle}><mj-column></mj-column><mj-column></mj-column><mj-column></mj-column></mj-section>`
      });
      blockManager.add("sos-section-25-75", {
        label: "Section 25-75",
        category: categoryStructures,
        media: iconColumns,
        content: `<mj-section ${sectionStyle}><mj-column width="25%"></mj-column><mj-column width="75%"></mj-column></mj-section>`
      });
      blockManager.add("sos-footer", {
        label: "Footer Mautic",
        category: catMauticStructures,
        media: iconText,
        content: `
        <mj-section padding="20px 0" text-align="center">
          <mj-column>
            <mj-divider border-color="#ea148c" border-width="2px" padding="10px 0" width="80%"></mj-divider>
            <mj-text align="center" color="#787878" padding="0">
              <p>Association de lutte contre la lesbophobie, la gayphobie, la biphobie, et la transphobie<br>Association loi 1901 cr\xE9\xE9e le 11 avril 1994</p>
            </mj-text>
            <mj-text align="center" color="#787878" padding="0">
              <p><b>SOS homophobie</b><br>14 rue Abel<br>75012 Paris</p>
            </mj-text>
            <mj-image padding="0" border="none" align="center" alt="Ligne d'\xE9coute anonyme : 01 48 06 42 41" width="300px" href="https://www.sos-homophobie.org/ligne-ecoute" src="/themes/sos_mjml/assets/img/cartouche_ecoute.png" target="_blank"></mj-image>
            <mj-text align="center" color="#787878" font-size="10px" padding="0 0 20px 0">
              <p><a target="_blank" href="{unsubscribe_url}">{unsubscribe_text}</a></p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      blockManager.add("sos-footer-beta", {
        label: "Footer Newsletter Mautic",
        category: catMauticStructures,
        media: iconText,
        content: `
        <mj-section background-color="#00577b" padding="20px 0" text-align="center">
          <mj-column>
            <mj-text align="center" color="#ffffff" font-family="Roboto, Arial, sans-serif" font-size="13px" padding="0px">
              <p style="margin: 10px 0;">Association de lutte contre la lesbophobie, la gayphobie, la biphobie et la transphobie<br>Association loi 1901 cr\xE9\xE9e le 11 avril 1994</p>
            </mj-text>
            <mj-text align="center" color="#ffffff" padding="0">
              <p><b>SOS homophobie</b><br>14 rue Abel<br>75012 Paris</p>
            </mj-text>
            <mj-image padding="0" border="none" align="center" alt="Ligne d'\xE9coute anonyme : 01 48 06 42 41" width="300px" href="https://www.sos-homophobie.org/ligne-ecoute" src="/themes/sos_mjml/assets/img/cartouche_ecoute_magenta.png" target="_blank"></mj-image>
            <mj-text align="center" color="#ffffff" font-size="11px" padding="10px 0 20px 0">
              <p>
                <a target="_blank" style="color:#ffffff;text-decoration:none;" href="{unsubscribe_url}">{unsubscribe_text}</a>
              </p>
            </mj-text>
          </mj-column>
        </mj-section>
      `
      });
      editor.Commands.add("edit-smarty-code", {
        run(editor2, sender, opts2 = {}) {
          const target = opts2.target || editor2.getSelected();
          if (!target || target.get("type") !== "smarty-code") return;
          const modal = editor2.Modal;
          modal.setTitle("\xC9diter le code Smarty");
          const content = document.createElement("div");
          content.innerHTML = `
          <textarea id="smarty-code-editor" style="width:100%; height:300px; font-family:monospace; padding:10px; border:1px solid #ccc; font-size:14px;">${target.get("smartyContent") || ""}</textarea>
          <div style="margin-top:15px; text-align:right;">
            <button id="smarty-code-save" style="padding:10px 20px; background:#ea148c; color:#fff; border:none; cursor:pointer; font-weight:bold; border-radius:4px;">Sauvegarder et Fermer</button>
          </div>
        `;
          const btn = content.querySelector("#smarty-code-save");
          const textarea = content.querySelector("#smarty-code-editor");
          btn.onclick = () => {
            target.set("smartyContent", textarea.value);
            target.components(textarea.value);
            modal.close();
          };
          modal.setContent(content);
          modal.open();
        }
      });
      editor.DomComponents.addType("smarty-code", {
        isComponent: (el) => el.tagName === "DIV" && el.classList.contains("smarty-raw-block"),
        model: {
          defaults: {
            tagName: "div",
            droppable: false,
            editable: false,
            // On désactive CKEditor
            attributes: { class: "smarty-raw-block" },
            smartyContent: "{* Code Smarty ou HTML brut *}",
            style: {
              "padding": "15px",
              "border": "2px dashed #ea148c",
              "background-color": "#f9f9f9",
              "font-family": "monospace",
              "white-space": "pre-wrap",
              "min-height": "50px"
            }
          },
          init() {
            const toolbar = this.get("toolbar") || [];
            const id = "edit-smarty";
            if (!toolbar.find((t) => t.id === id)) {
              toolbar.unshift({
                id,
                command: "edit-smarty-code",
                label: '<i class="fa fa-code"></i> \xC9diter Smarty'
              });
              this.set("toolbar", toolbar);
            }
          }
        }
      });
      blockManager.add("smarty-code-block", {
        label: "Bloc Smarty",
        content: {
          type: "smarty-code",
          content: "{* Code Smarty ou HTML brut *}",
          smartyContent: "{* Code Smarty ou HTML brut *}"
        },
        category: catMauticElements.id,
        attributes: { class: "fa fa-code" }
      });
      const updateCategories = (mode) => {
        const container = editor.getContainer();
        if (!container) return;
        const categories = container.querySelectorAll(".gjs-block-category");
        categories.forEach((cat) => {
          const titleEl = cat.querySelector(".gjs-title");
          if (!titleEl) return;
          const title = titleEl.innerText || titleEl.textContent;
          if (title.includes("CiviCRM")) {
            cat.style.display = mode === "mautic" ? "none" : "block";
          } else if (title.includes("Mautic")) {
            cat.style.display = mode === "civicrm" ? "none" : "block";
          }
        });
      };
      editor.Commands.add("set-mode-mautic", {
        run(editor2, sender) {
          if (sender) sender.set("active", true);
          const btnCivi = editor2.Panels.getButton("options", "mode-civicrm-btn");
          if (btnCivi) btnCivi.set("active", false);
          updateCategories("mautic");
        }
      });
      editor.Commands.add("set-mode-civicrm", {
        run(editor2, sender) {
          if (sender) sender.set("active", true);
          const btnMautic = editor2.Panels.getButton("options", "mode-mautic-btn");
          if (btnMautic) btnMautic.set("active", false);
          updateCategories("civicrm");
        }
      });
      editor.Panels.addButton("options", {
        id: "mode-mautic-btn",
        className: "fa fa-envelope",
        command: "set-mode-mautic",
        attributes: { title: "Mode Mautic (Blocs Mautic)" },
        active: true
      });
      editor.Panels.addButton("options", {
        id: "mode-civicrm-btn",
        className: "fa fa-address-card",
        command: "set-mode-civicrm",
        attributes: { title: "Mode CiviCRM (Blocs CiviCRM)" }
      });
      editor.Panels.addButton("options", {
        id: "smarty-snippets-btn",
        className: "fa fa-magic",
        command: "open-smarty-snippets",
        attributes: { title: "Assistant Smarty (Snippets)" }
      });
      setTimeout(() => {
        editor.runCommand("set-mode-mautic");
      }, 500);
      editor.Commands.add("open-smarty-snippets", {
        run(editor2, sender) {
          sender && sender.set("active", 0);
          const modal = editor2.Modal;
          modal.setTitle("Snippets Smarty 5");
          const snippets = [
            { label: "Condition (Si / Sinon)", code: "{if $condition}\\n    {* Code si vrai *}\\n{else}\\n    {* Code si faux *}\\n{/if}" },
            { label: "V\xE9rifier si un contact a un pr\xE9nom", code: "{if $contact.first_name}\\n    Bonjour {$contact.first_name},\\n{else}\\n    Bonjour,\\n{/if}" },
            { label: "Boucle (Foreach)", code: "{foreach $array as $item}\\n    {$item.name}\\n{/foreach}" },
            { label: "Assigner une variable", code: '{assign var="ma_variable" value="Mon Texte"}' },
            { label: "Capture de bloc", code: '{capture assign="mon_bloc"}\\n    <div>Contenu HTML captur\xE9</div>\\n{/capture}' },
            { label: "Modificateur (Par d\xE9faut)", code: '{$contact.first_name|default:"Ami"}' },
            { label: "Modificateur (Majuscule)", code: "{$contact.last_name|upper}" }
          ];
          let html = "<p>Cliquez sur un bout de code (snippet) pour le copier, puis collez-le dans votre texte.</p>";
          html += '<div class="civicrm-token-list">';
          snippets.forEach((s) => {
            const escCode = s.code.replace(/"/g, "&quot;").replace(/'/g, "\\'");
            const dispCode = s.code.replace(/\\n/g, "<br/>").replace(/ /g, "&nbsp;");
            html += `<div class="smarty-snippet-item" title="Copier" onclick="navigator.clipboard.writeText('${escCode}'); alert('Snippet copi\xE9 !');">
            <strong>${s.label}</strong><br/>
            <small style="color:#666">${dispCode}</small>
          </div>`;
          });
          html += "</div>";
          const content = document.createElement("div");
          content.innerHTML = html;
          modal.setContent(content);
          modal.open();
        }
      });
    });
  };
  var index_default = GrapesJsCustomPlugin;
  if (!window.MauticGrapesJsPlugins) window.MauticGrapesJsPlugins = [];
  window.MauticGrapesJsPlugins.push({
    name: "GrapesJsCustomPlugin",
    plugin: GrapesJsCustomPlugin,
    context: ["page", "email-mjml"],
    pluginOptions: { options: { test: true } }
  });
  return __toCommonJS(index_exports);
})();
