<?php

namespace MauticPlugin\CiviCrmBuilderBundle\Security\Permissions;

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
        // Define custom bits for our permissions
        $this->addCustomPermission('civicrm', [
            'push_draft'    => 1, // bit 1
            'push_template' => 2, // bit 2
            'link_template' => 4, // bit 4
            'save_block'    => 8, // bit 8
        ]);
    }

    public function getName(): string
    {
        return 'civicrmbuilder';
    }

    public function buildForm(FormBuilderInterface &$builder, array $options, array $data): void
    {
        $this->addCustomFormFields('civicrmbuilder', 'civicrm', $builder, 'civicrmbuilder.permissions.section', [
            'civicrmbuilder.permissions.push_draft'    => 'push_draft',
            'civicrmbuilder.permissions.push_template' => 'push_template',
            'civicrmbuilder.permissions.link_template' => 'link_template',
            'civicrmbuilder.permissions.save_block'    => 'save_block',
        ], $data);
    }
}
