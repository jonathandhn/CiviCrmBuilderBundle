<?php

return [
    'name' => 'GrapesJS Custom Plugin',
    'description' => 'Test bundle to add a custom GrapesJS plugin to the Mautic Builder',
    'version' => '1.0.7',
    'author' => 'Leuchtfeuer',
    'routes' => [
        'main' => [
            'grapesjs_custom_civicrm_tokens' => [
                'path'       => '/grapesjs-custom/civicrm/tokens',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::tokensAction',
            ],
            'grapesjs_custom_civicrm_push' => [
                'path'       => '/grapesjs-custom/civicrm/push/{objectId}',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::pushAction',
            ],
            'grapesjs_custom_civicrm_push_template' => [
                'path'       => '/grapesjs-custom/civicrm/push-template/{objectId}',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::pushTemplateAction',
            ],
            'grapesjs_custom_civicrm_link_modal' => [
                'path'       => '/grapesjs-custom/civicrm/link-modal/{objectId}',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::linkModalAction',
            ],
            'grapesjs_custom_civicrm_search_template' => [
                'path'       => '/grapesjs-custom/civicrm/search-template',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::searchTemplateAction',
            ],
            'grapesjs_custom_civicrm_link_template' => [
                'path'       => '/grapesjs-custom/link-template/{objectId}',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::linkTemplateAction',
            ],
            'grapesjs_custom_theme_blocks' => [
                'path'       => '/grapesjs-custom/theme-blocks/{theme}',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::getThemeBlocksAction',
            ],
            'grapesjs_custom_theme_blocks_save' => [
                'path'       => '/grapesjs-custom/theme-blocks/{theme}/save',
                'controller' => \MauticPlugin\GrapesJsCustomPluginBundle\Controller\CiviCrmController::class . '::saveThemeBlockAction',
            ],
        ],
    ],
    'services' => [
        'other' => [],
        'events' => [
            'mautic.grapesjscustomplugin.subscriber.civicrm_tokens' => [
                'class' => \MauticPlugin\GrapesJsCustomPluginBundle\EventSubscriber\CiviCrmTokenSubscriber::class,
            ],
            'mautic.grapesjscustomplugin.subscriber.button' => [
                'class' => \MauticPlugin\GrapesJsCustomPluginBundle\EventSubscriber\ButtonSubscriber::class,
                'arguments' => [
                    'router',
                    'mautic.security',
                ],
            ],
            'mautic.grapesjscustomplugin.subscriber.email_protection' => [
                'class' => \MauticPlugin\GrapesJsCustomPluginBundle\EventSubscriber\EmailProtectionSubscriber::class,
                'arguments' => [
                    'mautic.security',
                    'database_connection',
                ],
            ],
        ],
        'forms' => [
            'mautic.grapesjscustomplugin.form.type.civicrm_auth' => [
                'class' => \MauticPlugin\GrapesJsCustomPluginBundle\Form\Type\CiviCrmAuthType::class,
            ],
        ],
        'models' => [],
        'fixtures' => [],
        'integrations' => [
            'mautic.integration.grapesjscustomplugin' => [
                'class' => \MauticPlugin\GrapesJsCustomPluginBundle\Integration\GrapesJsCustomPluginIntegration::class,
                'tags' => [
                    'mautic.integration',
                    'mautic.basic_integration',
                ],
            ],
            'grapesjscustomplugin.integration.configuration' => [
                'class' => \MauticPlugin\GrapesJsCustomPluginBundle\Integration\Support\ConfigSupport::class,
                'tags' => [
                    'mautic.config_integration',
                ],
            ],
        ],
        'permissions' => [
            'mautic.grapesjscustomplugin.permissions' => [
                'class'     => \MauticPlugin\GrapesJsCustomPluginBundle\Security\Permissions\CiviCrmPermissions::class,
                'arguments' => [
                    'mautic.helper.core_parameters',
                ],
            ],
        ],
    ],
];