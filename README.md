# CiviCrmBuilderBundle

A Mautic plugin that connects the GrapesJS editor to CiviCRM.

Designed for current Mautic versions, Mautic 7, and tested with CiviCRM 6.15.

## Prototype Theme

A neutral starter theme is bundled here:

`Resources/theme-prototype/proto_mjml`

Its goal is to provide a copy-ready base for `themes/` with:

- a clean Mautic/MJML theme structure
- a `theme_variables.json`
- a few generic GrapesJS blocks
- no business-specific branding

Example local install:

```bash
cp -R CiviCrmBuilderBundle/Resources/theme-prototype/proto_mjml /path/to/mautic/themes/proto_mjml
```

You can then rename the folder, replace the colors, extend `blocks/`, and add your own assets.

## Activation

1. Copy the plugin into Mautic's `plugins/` directory.
2. Clear the Mautic cache.
3. Reload plugins.
4. Publish and enable `CiviCrmBuilderBundle`.

Example cache flush:

```bash
php bin/console cache:clear
```

A plugin reload command commonly used depending on the Mautic version is:

```bash
php bin/console mautic:plugins:reload
```

If that command is not available on your instance, reload plugins from the Mautic UI.

If your instance uses another entrypoint or another system user, adapt the command to your hosting setup.

## Configuration CiviCRM

In Mautic:

1. Open `Settings` > `Plugins`.
2. Open `CiviCRM Builder`.
3. Fill in `CiviCRM URL`.
4. Fill in the `API key (Bearer token)`.
5. Save.

Expected values:

- `CiviCRM URL`: the root URL of your instance, for example `https://crm.example.org`
- `API key (Bearer token)`: the API key expected by the `X-Civi-Auth: Bearer ...` header

The form validates the connection to CiviCRM on save.

## Mautic Cache Flush

In practice, clear the Mautic cache:

- after adding or updating the plugin
- after adding a new theme in `themes/`
- after changing Twig templates if Mautic does not reload views correctly

Common command:

```bash
php bin/console cache:clear
```

## Template Tree

```text
proto_mjml/
├── assets/
│   ├── fonts/
│   └── img/
├── blocks/
│   ├── proto-button.json
│   ├── proto-divider.json
│   ├── proto-footer.json
│   ├── proto-header.json
│   ├── proto-section.json
│   ├── proto-text.json
│   ├── proto-title.json
│   ├── proto-unsubscribe.json
│   └── proto-webview.json
├── config.json
├── css/
│   └── proto.css
├── html/
│   ├── base.html.twig
│   ├── email.mjml.twig
│   ├── form.html.twig
│   ├── message.html.twig
│   ├── page.html.twig
│   └── MauticFormBundle/
│       └── Builder/
├── theme_variables.json
└── thumbnail.png (optional)
```

## Structure Notes

- `config.json` declares the theme and its Mautic features.
- `theme_variables.json` provides the dynamic variables replaced inside blocks.
- `html/email.mjml.twig` is the base for newsletters/emails.
- `blocks/` contains the custom blocks loaded by the bundle.
- `assets/` is free-form: images, fonts, icons, and so on.

## Build

```bash
npm install
npm run build
```

## Dev

```bash
npm run start
```
