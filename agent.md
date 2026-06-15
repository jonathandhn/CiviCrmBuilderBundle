# CiviCrmBuilderBundle Agent Notes

## Overview

`CiviCrmBuilderBundle` is a Mautic plugin that connects the GrapesJS email builder to CiviCRM workflows.

Main responsibilities:

- add custom GrapesJS blocks and editor behavior
- expose actions to push emails to CiviCRM drafts and message templates
- provide token support for CiviCRM data inside the email builder
- ship a neutral prototype theme structure for custom MJML themes

## Compatibility

This bundle is designed for current Mautic versions, including Mautic 7, and has been tested with CiviCRM 6.15.

When making changes, prefer compatibility-safe choices for:

- Mautic plugin loading and service registration
- Twig rendering in Mautic themes
- GrapesJS integration points used by the Mautic builder
- CiviCRM API4 endpoints used by the plugin

## Project Structure

Key folders and files:

- `Config/config.php`
  Mautic plugin definition, routes, services, integrations, and permissions.

- `Controller/CiviCrmController.php`
  Main controller for token loading, CiviCRM push actions, template linking, and theme block loading/saving.

- `EventSubscriber/`
  Runtime integration with Mautic events:
  - `AssetsSubscriber.php`: injects the compiled frontend bundle
  - `ButtonSubscriber.php`: adds UI actions on email pages
  - `CiviCrmTokenSubscriber.php`: registers CiviCRM tokens in the builder
  - `EmailProtectionSubscriber.php`: prevents unsafe edits/deletes on linked emails

- `Form/Type/CiviCrmAuthType.php`
  Plugin configuration form for CiviCRM URL and API key.

- `Security/Permissions/CiviCrmPermissions.php`
  Custom Mautic permissions for draft push, template push, linking, and custom block saving.

- `Assets/src/`
  TypeScript source for GrapesJS behavior and block registration.

- `Assets/dist/`
  Compiled frontend assets loaded by Mautic.

- `Resources/views/`
  Twig templates used by the plugin UI.

- `Resources/translations/`
  Translation files for plugin labels, buttons, modal text, and configuration strings.

- `Resources/theme-prototype/proto_mjml/`
  Neutral starter theme bundled with the plugin.

## Frontend Notes

Main frontend entrypoint:

- `Assets/src/index.ts`

Supporting frontend modules:

- `blockRegistry.ts`
- `customBlockLoader.ts`
- `themeResolver.ts`
- `ckeditorThemeConfig.ts`
- `smartyBlock.ts`

If you change files in `Assets/src/`, rebuild the frontend bundle before considering the work complete.

## Prototype Theme

The bundled starter theme lives in:

- `Resources/theme-prototype/proto_mjml/`

It is meant to be copied into a Mautic `themes/` directory and used as a neutral starting point for custom MJML themes.

Important theme parts:

- `config.json`
- `theme_variables.json`
- `html/email.mjml.twig`
- `blocks/*.json`
- `css/proto.css`

## Build and Development

Install dependencies:

```bash
npm install
```

Build the frontend bundle:

```bash
npm run build
```

Run the dev server:

```bash
npm run start
```

## Mautic Runtime Notes

After plugin or theme changes, Mautic may require:

- cache clear
- plugin reload
- plugin republish/re-enable in the UI

Common commands:

```bash
php bin/console cache:clear
php bin/console mautic:plugins:reload
```

If `mautic:plugins:reload` is not available on the target instance, reload plugins from the Mautic UI instead.

## CiviCRM Configuration

The plugin expects these settings in Mautic:

- `CiviCRM URL`
- `API key (Bearer token)`

The API key is sent through:

- `X-Civi-Auth: Bearer ...`

Main API usage in the codebase targets CiviCRM API4 endpoints such as:

- `Contact/getFields`
- `Mailing/get`
- `Mailing/create`
- `Mailing/update`
- `MessageTemplate/get`
- `MessageTemplate/create`
- `MessageTemplate/update`

## Editing Conventions

- Keep user-facing text clear and consistent.
- Avoid emojis in user-facing messages.
- Prefer small, low-risk changes over broad refactors unless the task explicitly calls for a larger cleanup.
- Preserve existing Mautic plugin conventions where possible.
- When touching translations, keep English README/docs aligned with the actual plugin behavior.
