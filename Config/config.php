<?php

return [
    'name' => 'CiviCRM Builder',
    'description' => 'Intégration CiviCRM Builder pour Mautic',
    'version' => '1.0.8',
    'author' => 'Leuchtfeuer',
    'routes' => [
        'main' => [
            'civicrm_builder_civicrm_tokens' => [
                'path'       => '/civicrm-builder/civicrm/tokens',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::tokensAction',
            ],
            'civicrm_builder_civicrm_push' => [
                'path'       => '/civicrm-builder/civicrm/push/{objectId}',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::pushAction',
            ],
            'civicrm_builder_civicrm_push_template' => [
                'path'       => '/civicrm-builder/civicrm/push-template/{objectId}',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::pushTemplateAction',
            ],
            'civicrm_builder_civicrm_link_modal' => [
                'path'       => '/civicrm-builder/civicrm/link-modal/{objectId}',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::linkModalAction',
            ],
            'civicrm_builder_civicrm_search_template' => [
                'path'       => '/civicrm-builder/civicrm/search-template',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::searchTemplateAction',
            ],
            'civicrm_builder_civicrm_link_template' => [
                'path'       => '/civicrm-builder/link-template/{objectId}',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::linkTemplateAction',
            ],
            'civicrm_builder_theme_blocks' => [
                'path'       => '/civicrm-builder/theme-blocks/{theme}',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::getThemeBlocksAction',
            ],
            'civicrm_builder_theme_blocks_save' => [
                'path'       => '/civicrm-builder/theme-blocks/{theme}/save',
                'controller' => \MauticPlugin\CiviCrmBuilderBundle\Controller\CiviCrmController::class . '::saveThemeBlockAction',
            ],
        ],
    ],
    'services' => [
        'other' => [],
        'events' => [
            'mautic.civicrmbuilder.subscriber.civicrm_tokens' => [
                'class' => \MauticPlugin\CiviCrmBuilderBundle\EventSubscriber\CiviCrmTokenSubscriber::class,
                'arguments' => [
                    'database_connection',
                ],
            ],
            'mautic.civicrmbuilder.subscriber.button' => [
                'class' => \MauticPlugin\CiviCrmBuilderBundle\EventSubscriber\ButtonSubscriber::class,
                'arguments' => [
                    'router',
                    'mautic.security',
                ],
            ],
            'mautic.civicrmbuilder.subscriber.email_protection' => [
                'class' => \MauticPlugin\CiviCrmBuilderBundle\EventSubscriber\EmailProtectionSubscriber::class,
                'arguments' => [
                    'mautic.security',
                    'database_connection',
                ],
            ],
        ],
        'forms' => [
            'mautic.civicrmbuilder.form.type.civicrm_auth' => [
                'class' => \MauticPlugin\CiviCrmBuilderBundle\Form\Type\CiviCrmAuthType::class,
            ],
        ],
        'models' => [],
        'fixtures' => [],
        'integrations' => [
            'mautic.integration.civicrmbuilder' => [
                'class' => \MauticPlugin\CiviCrmBuilderBundle\Integration\CiviCrmBuilderIntegration::class,
                'tags' => [
                    'mautic.integration',
                    'mautic.basic_integration',
                ],
            ],
            'civicrmbuilder.integration.configuration' => [
                'class' => \MauticPlugin\CiviCrmBuilderBundle\Integration\Support\ConfigSupport::class,
                'tags' => [
                    'mautic.config_integration',
                ],
            ],
        ],
        'permissions' => [
            'mautic.civicrmbuilder.permissions' => [
                'class'     => \MauticPlugin\CiviCrmBuilderBundle\Security\Permissions\CiviCrmPermissions::class,
                'arguments' => [
                    'mautic.helper.core_parameters',
                ],
            ],
        ],
    ],
];