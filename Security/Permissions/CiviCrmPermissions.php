<?php

namespace MauticPlugin\GrapesJsCustomPluginBundle\Security\Permissions;

use Mautic\CoreBundle\Helper\CoreParametersHelper;
use Mautic\CoreBundle\Security\Permissions\AbstractPermissions;
use Symfony\Component\Form\FormBuilderInterface;

class CiviCrmPermissions extends AbstractPermissions
{
    public function __construct(CoreParametersHelper $coreParametersHelper)
    {
        parent::__construct($coreParametersHelper->all());
    }

    public function definePermissions(): void
    {
        // Define custom bits for our 3 permissions
        $this->addCustomPermission('civicrm', [
            'push_draft'    => 1, // bit 1
            'push_template' => 2, // bit 2
            'link_template' => 4, // bit 4
        ]);
    }

    public function getName(): string
    {
        return 'grapesjscustomplugin';
    }

    public function buildForm(FormBuilderInterface &$builder, array $options, array $data): void
    {
        $this->addCustomFormFields('grapesjscustomplugin', 'civicrm', $builder, 'CiviCRM Intégration', [
            'Pousser un brouillon (Newsletter)'  => 'push_draft',
            'Pousser un modèle (MessageTemplate)' => 'push_template',
            'Lier à un modèle (MessageTemplate)'  => 'link_template',
        ], $data);
    }
}
