<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\Integration;

use Mautic\IntegrationsBundle\Integration\BasicIntegration;
use Mautic\IntegrationsBundle\Integration\ConfigurationTrait;
use Mautic\IntegrationsBundle\Integration\Interfaces\BasicInterface;

class CiviCrmBuilderIntegration extends BasicIntegration implements BasicInterface
{
    use ConfigurationTrait;

    public const NAME         = 'civicrmbuilder';
    public const DISPLAY_NAME = 'CiviCRM Builder';

    public function getName(): string
    {
        return self::NAME;
    }

    public function getDisplayName(): string
    {
        return self::DISPLAY_NAME;
    }

    public function getIcon(): string
    {
        return 'plugins/CiviCrmBuilderBundle/Assets/img/icon.png';
    }
}
