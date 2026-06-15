<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\Integration\Support;

use Mautic\IntegrationsBundle\Integration\DefaultConfigFormTrait;
use Mautic\IntegrationsBundle\Integration\Interfaces\ConfigFormFeatureSettingsInterface;
use Mautic\IntegrationsBundle\Integration\Interfaces\ConfigFormInterface;
use MauticPlugin\CiviCrmBuilderBundle\Form\Type\CiviCrmAuthType;
use MauticPlugin\CiviCrmBuilderBundle\Integration\CiviCrmBuilderIntegration;

class ConfigSupport extends CiviCrmBuilderIntegration implements ConfigFormInterface, ConfigFormFeatureSettingsInterface
{
    use DefaultConfigFormTrait;

    public function getFeatureSettingsConfigFormName(): string
    {
        return CiviCrmAuthType::class;
    }
}
