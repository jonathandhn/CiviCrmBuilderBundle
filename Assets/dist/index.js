"use strict";
(() => {
  // Assets/src/themeResolver.ts
  function resolveTheme(explicitTheme) {
    let themeName = explicitTheme || "";
    console.info("[CiviCrmBuilder] Resolving theme...");
    if (!themeName) {
      try {
        const input = document.querySelector("#emailform_template") || document.querySelector("#campaignevent_template") || document.querySelector("#page_template");
        if (input) {
          themeName = input.value;
          if (themeName) console.info("[CiviCrmBuilder] Theme resolved from local DOM:", themeName);
        }
        if (!themeName && window.parent && window.parent.document) {
          const pInput = window.parent.document.querySelector("#emailform_template") || window.parent.document.querySelector("#campaignevent_template") || window.parent.document.querySelector("#page_template");
          if (pInput) {
            themeName = pInput.value;
            if (themeName) console.info("[CiviCrmBuilder] Theme resolved from window.parent DOM:", themeName);
          }
        }
      } catch (e) {
        console.warn("[CiviCrmBuilder] Error while checking DOM for theme:", e);
      }
    } else {
      console.info("[CiviCrmBuilder] Theme resolved from explicit config:", themeName);
    }
    if (!themeName) {
      themeName = "blank";
      console.warn("[CiviCrmBuilder] Theme not found in DOM, using fallback theme:", themeName);
    }
    return themeName;
  }

  // Assets/src/ckeditorThemeConfig.ts
  var cachedThemeVars = null;
  function applyCkeditorThemeConfig() {
    if (window.Mautic && window.Mautic.GetCkEditorConfigOptions) {
      const originalGetCk = window.Mautic.GetCkEditorConfigOptions;
      window.Mautic.GetCkEditorConfigOptions = function() {
        const config = originalGetCk.apply(this, arguments);
        if (!cachedThemeVars) {
          cachedThemeVars = {};
          const themeName = resolveTheme();
          if (themeName && themeName !== "blank") {
            try {
              const xhr = new XMLHttpRequest();
              xhr.open("GET", "/themes/" + themeName + "/theme_variables.json", false);
              xhr.send(null);
              if (xhr.status === 200) {
                cachedThemeVars = JSON.parse(xhr.responseText);
              }
            } catch (e) {
              console.error("[CiviCrmBuilder] Failed to load theme_variables.json synchronously:", e);
            }
          }
        }
        const themeVars = cachedThemeVars;
        const customColors = [];
        for (const key in themeVars) {
          if (key.startsWith("color_")) {
            const colorVal = themeVars[key];
            let label = key.replace("color_", "").replace(/_/g, " ");
            label = label.charAt(0).toUpperCase() + label.slice(1);
            customColors.push({ color: colorVal, label, hasBorder: colorVal.toLowerCase() === "#ffffff" });
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
            "Par d\xE9faut",
            themeVars.font_main
          ];
          config.fontFamily.supportAllValues = true;
        }
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
      console.info("[CiviCrmBuilder] CKEditor config patched with dynamic theme variables.");
    }
  }
  function configureGrapesJsColorPicker(editor, themeVars = {}) {
    const palette = [];
    for (const key in themeVars) {
      if (key.startsWith("color_")) {
        palette.push(themeVars[key]);
      }
    }
    if (palette.length > 0 && editor.Config) {
      editor.Config.colorPicker = {
        ...editor.Config.colorPicker || {},
        palette: [palette]
      };
    }
  }
  function configureGrapesJsTypography(editor, themeVars = {}) {
    if (themeVars.font_main) {
      const styleManager = editor.StyleManager;
      const fontProperty = styleManager.getProperty("typography", "font-family");
      if (fontProperty) {
        const fontName = themeVars.font_main.split(",")[0].trim();
        fontProperty.set("options", [
          { value: themeVars.font_main, name: fontName }
        ]);
        fontProperty.set("value", themeVars.font_main);
      }
    }
  }

  // Assets/src/customBlockLoader.ts
  async function loadCustomBlocks(themeName, currentContext = "email-mjml") {
    console.info(`\u23F3 [CiviCrmBuilder] Fetching custom JSON blocks for theme "${themeName}"...`);
    const fetchUrl = "/s/civicrm-builder/theme-blocks/" + themeName;
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        console.error(`[CiviCrmBuilder] HTTP Error ${response.status} while fetching blocks from ${fetchUrl}`);
        return { blocks: [], themeVariables: {} };
      }
      const jsonText = await response.text();
      let data;
      try {
        data = JSON.parse(jsonText);
      } catch (e) {
        console.error("[CiviCrmBuilder] Failed to parse JSON response:", e);
        return { blocks: [], themeVariables: {} };
      }
      let blocks = Array.isArray(data) ? data : data.blocks || [];
      let themeVariables = data.theme_variables || {};
      if (!Array.isArray(blocks)) {
        console.error("[CiviCrmBuilder] Invalid response format. Expected an array of blocks.");
        return { blocks: [], themeVariables: {} };
      }
      const validBlocks = [];
      let invalidCount = 0;
      blocks.forEach((b) => {
        if (b && typeof b === "object" && b.id && b.content) {
          if (b.context && Array.isArray(b.context)) {
            if (!b.context.includes(currentContext)) {
              return;
            }
          }
          validBlocks.push({
            id: b.id,
            label: b.label || b.id,
            category: b.category || "Th\xE8me Mautic",
            content: b.content,
            attributes: b.attributes || { class: "fa fa-cube" },
            order: b.order
          });
        } else {
          invalidCount++;
          console.warn("[CiviCrmBuilder] Ignoring invalid JSON block:", b);
        }
      });
      console.info(`[CiviCrmBuilder] Successfully loaded ${validBlocks.length} custom blocks from ${fetchUrl}. (${invalidCount} invalid ignored)`);
      return { blocks: validBlocks, themeVariables };
    } catch (err) {
      console.error(`[CiviCrmBuilder] Network error while fetching blocks from ${fetchUrl}:`, err);
      return { blocks: [], themeVariables: {} };
    }
  }

  // Assets/src/civicrmBlocks.ts
  function getStaticBlocks(categories) {
    return [];
  }

  // Assets/src/smartyBlock.ts
  function registerSmartyBlock(editor, catCiviElementsId) {
    const blockManager = editor.BlockManager;
    const domComponents = editor.DomComponents;
    const commands = editor.Commands;
    domComponents.addType("smarty-code", {
      isComponent: (el) => {
        const className = el.getAttribute ? el.getAttribute("class") || "" : "";
        if (el.tagName === "SMARTY-CODE" || className.includes("smarty-code-wrapper")) {
          return {
            type: "smarty-code",
            smartyContent: el.innerHTML
          };
        }
      },
      model: {
        defaults: {
          tagName: "mj-text",
          attributes: { class: "smarty-code-wrapper" },
          components: "",
          smartyContent: "{if $contact.first_name}Bonjour {$contact.first_name},{else}Bonjour,{/if}",
          traits: [
            {
              type: "text",
              name: "smartyContent",
              label: "Code Smarty"
            }
          ]
        },
        init() {
          const doc = editor.Canvas.getDocument();
          if (doc && !doc.getElementById("smarty-editor-style")) {
            const style = doc.createElement("style");
            style.id = "smarty-editor-style";
            style.innerHTML = `
                        .smarty-code-wrapper {
                            background-color: #ffe6f3 !important;
                            padding: 20px !important;
                            color: #ea148c !important;
                            font-family: monospace !important;
                            font-weight: bold !important;
                            border: 1px dashed #ea148c !important;
                        }
                    `;
            doc.head.appendChild(style);
          }
          this.on("change:smartyContent", this.handleSmartyChange);
          this.handleSmartyChange();
        },
        handleSmartyChange() {
          const content = this.get("smartyContent") || "";
          this.components(content);
        }
      },
      view: {
        onRender() {
          const btn = document.createElement("button");
          btn.innerHTML = "\xC9diter Smarty";
          btn.style.position = "absolute";
          btn.style.top = "0";
          btn.style.right = "0";
          btn.style.background = "#ea148c";
          btn.style.color = "#fff";
          btn.style.border = "none";
          btn.style.padding = "2px 5px";
          btn.style.fontSize = "10px";
          btn.style.cursor = "pointer";
          btn.style.zIndex = "10";
          btn.onclick = () => {
            editor.runCommand("edit-smarty-code", { target: this.model });
          };
          this.el.style.position = "relative";
          this.el.appendChild(btn);
        }
      }
    });
    commands.add("edit-smarty-code", {
      run(editor2, sender, options) {
        const target = options.target;
        const currentContent = target.get("smartyContent") || "";
        const modalContent = document.createElement("div");
        const textarea = document.createElement("textarea");
        textarea.style.width = "100%";
        textarea.style.height = "200px";
        textarea.style.padding = "15px";
        textarea.style.color = "#333333";
        textarea.style.backgroundColor = "#ffffff";
        textarea.style.fontFamily = "monospace";
        textarea.style.fontSize = "14px";
        textarea.style.border = "1px solid #cccccc";
        textarea.style.borderRadius = "4px";
        textarea.style.boxSizing = "border-box";
        textarea.value = currentContent;
        const saveBtn = document.createElement("button");
        saveBtn.innerHTML = "Sauvegarder le code";
        saveBtn.style.marginTop = "15px";
        saveBtn.style.backgroundColor = "#ea148c";
        saveBtn.style.color = "#ffffff";
        saveBtn.style.border = "none";
        saveBtn.style.padding = "10px 20px";
        saveBtn.style.borderRadius = "4px";
        saveBtn.style.cursor = "pointer";
        saveBtn.style.fontWeight = "bold";
        saveBtn.style.fontSize = "14px";
        saveBtn.style.float = "right";
        saveBtn.onclick = () => {
          target.set("smartyContent", textarea.value);
          editor2.Modal.close();
        };
        modalContent.appendChild(textarea);
        modalContent.appendChild(saveBtn);
        editor2.Modal.setTitle("\xC9diter le code Smarty").setContent(modalContent).open();
      }
    });
    blockManager.add("smarty-code-block", {
      label: "Smarty Code",
      category: catCiviElementsId,
      attributes: { class: "fa fa-code" },
      content: { type: "smarty-code" }
    });
  }

  // Assets/src/blockRegistry.ts
  function registerBlocks(editor, customBlocks) {
    const blockManager = editor.BlockManager;
    const categories = {
      catMauticElements: blockManager.getCategories().add({ id: "mautic-elements", label: "Th\xE8me Mautic - \xC9l\xE9ments", open: true }),
      catMauticStructures: blockManager.getCategories().add({ id: "mautic-structures", label: "Th\xE8me Mautic - Structures", open: true }),
      catCiviElements: blockManager.getCategories().add({ id: "civicrm-elements", label: "CiviCRM - \xC9l\xE9ments", open: true }),
      catCiviStructures: blockManager.getCategories().add({ id: "civicrm-structures", label: "CiviCRM - Structures", open: true }),
      categoryElements: blockManager.getCategories().add({ id: "custom-elements", label: "\xC9l\xE9ments", open: true }),
      categoryStructures: blockManager.getCategories().add({ id: "custom-structures", label: "Structures", open: true })
    };
    registerSmartyBlock(editor, categories.catCiviElements.id);
    const staticBlocks = getStaticBlocks(categories);
    staticBlocks.forEach((block) => {
      blockManager.add(block.id, block);
    });
    customBlocks.forEach((block) => {
      let targetCategory = block.category;
      for (const [key, catObj] of Object.entries(categories)) {
        if (catObj.id === block.category || catObj.get("label") === block.category) {
          targetCategory = catObj.id;
          break;
        }
      }
      if (block.id.toLowerCase().includes("civicrm")) {
        targetCategory = block.category.includes("Structures") ? categories.catCiviStructures.id : categories.catCiviElements.id;
      }
      let iconClass = "fa fa-cube";
      const searchId = block.id.toLowerCase();
      if (searchId.includes("header")) iconClass = "fa fa-header";
      else if (searchId.includes("footer")) iconClass = "fa fa-shoe-prints";
      else if (searchId.includes("title")) iconClass = "fa fa-h-square";
      else if (searchId.includes("text")) iconClass = "fa fa-font";
      else if (searchId.includes("button")) iconClass = "fa fa-link";
      else if (searchId.includes("divider")) iconClass = "fa fa-minus";
      else if (searchId.includes("spacer")) iconClass = "fa fa-arrows-v";
      else if (searchId.includes("section") || searchId.includes("col")) iconClass = "fa fa-columns";
      else if (searchId.includes("unsubscribe")) iconClass = "fa fa-ban";
      blockManager.add(block.id, {
        label: block.label || block.id,
        category: targetCategory,
        attributes: block.attributes || { class: iconClass },
        content: block.content
      });
    });
    console.info(`[CiviCrmBuilder] Registered ${staticBlocks.length} static blocks and ${customBlocks.length} custom blocks.`);
  }

  // Assets/src/index.ts
  var CiviCrmBuilder = (editor, options) => {
    console.info("[CiviCrmBuilder] Plugin is booting...");
    editor.on("load", () => {
    });
    const mauticOptions = options.options || {};
    const grapesjsBuilder = mauticOptions.grapesjsBuilder || null;
    let editorMode = "mautic";
    editor.on("load", () => {
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
          } else if (title.includes("Mautic") || title.includes("Th\xE8me")) {
            cat.style.display = mode === "civicrm" ? "none" : "block";
          }
        });
      };
      editor.Commands.add("set-mode-mautic", {
        run(e) {
          editorMode = "mautic";
          console.info("[CiviCrmBuilder] Switched to Mautic Mode");
          updateCategories("mautic");
        }
      });
      editor.Commands.add("set-mode-civicrm", {
        run(e) {
          editorMode = "civicrm";
          console.info("[CiviCrmBuilder] Switched to CiviCRM Mode");
          updateCategories("civicrm");
        }
      });
      const panels = editor.Panels;
      panels.addButton("options", {
        id: "btn-mode-mautic",
        className: "fa fa-envelope",
        command: "set-mode-mautic",
        attributes: { title: "Mode Mautic" },
        active: true
      });
      panels.addButton("options", {
        id: "btn-mode-civicrm",
        className: "fa fa-users",
        command: "set-mode-civicrm",
        attributes: { title: "Mode CiviCRM" },
        active: false
      });
      setTimeout(() => {
        const themeName = resolveTheme();
        if (themeName) {
          let currentContext = "email-mjml";
          if (window.MauticGrapesJsPlugins) {
            const pluginDef = window.MauticGrapesJsPlugins.find((p) => p.name === "CiviCrmBuilder");
            if (pluginDef && pluginDef.context && pluginDef.context.length > 0) {
              if (pluginDef.context.includes("email-mjml")) {
                currentContext = "email-mjml";
              } else if (pluginDef.context.includes("page")) {
                currentContext = "page";
              }
            }
          }
          loadCustomBlocks(themeName, currentContext).then(({ blocks: customBlocks, themeVariables }) => {
            configureGrapesJsColorPicker(editor, themeVariables);
            configureGrapesJsTypography(editor, themeVariables);
            registerBlocks(editor, customBlocks);
            const cats = editor.BlockManager.getCategories();
            cats.each((cat) => {
              const id = cat.get("id") || cat.get("label") || "";
              if (!id.toLowerCase().includes("custom") && !id.toLowerCase().includes("civicrm")) {
                cat.set("open", false);
              }
            });
            editor.runCommand("set-mode-mautic");
          });
        } else {
          registerBlocks(editor, []);
          editor.runCommand("set-mode-mautic");
        }
        editor.on("component:selected", (model) => {
          const tb = model.get("toolbar");
          const hasSave = tb.find((tbItem) => tbItem.id === "save-block");
          if (!hasSave) {
            tb.unshift({
              id: "save-block",
              attributes: { class: "fa fa-floppy-o", title: "Sauvegarder ce bloc" },
              command: "save-block-cmd"
            });
            model.set("toolbar", tb);
          }
        });
        editor.Commands.add("save-block-cmd", {
          run(editor2, sender, opts) {
            const selected = editor2.getSelected();
            if (!selected) return;
            const blockName = prompt("Nom du nouveau bloc ?", "Mon Bloc Personnalis\xE9");
            if (!blockName) return;
            const content = selected.toHTML();
            const tName = resolveTheme();
            if (!tName) {
              alert("Erreur : Aucun th\xE8me actif d\xE9tect\xE9.");
              return;
            }
            fetch("/s/civicrm-builder/theme-blocks/" + tName + "/save", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": window.mauticAjaxCsrf || ""
              },
              body: JSON.stringify({
                label: blockName,
                content
              })
            }).then((res) => res.json()).then((data) => {
              if (data.success) {
                alert("Bloc sauvegard\xE9 avec succ\xE8s dans le th\xE8me " + tName + " ! Rafra\xEEchissez la page pour le voir dans la section 'Blocs Sauvegard\xE9s'.");
              } else {
                const errMsg = data.error || (data.errors && data.errors[0] ? data.errors[0].message : JSON.stringify(data));
                alert("Erreur serveur : " + errMsg);
              }
            }).catch((err) => {
              console.error(err);
              alert("Erreur r\xE9seau lors de la sauvegarde du bloc.");
            });
          }
        });
      }, 500);
    });
  };
  var index_default = CiviCrmBuilder;
  applyCkeditorThemeConfig();
  if (!window.MauticGrapesJsPlugins) {
    window.MauticGrapesJsPlugins = [];
  }
  window.MauticGrapesJsPlugins.push({
    name: "CiviCrmBuilder",
    plugin: CiviCrmBuilder,
    context: ["page", "email-mjml"],
    pluginOptions: {
      options: {
        test: true
      }
    }
  });
})();
