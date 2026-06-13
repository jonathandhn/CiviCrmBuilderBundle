<?php

declare(strict_types=1);

namespace MauticPlugin\GrapesJsCustomPluginBundle\Integration\Support;

use Mautic\IntegrationsBundle\Integration\DefaultConfigFormTrait;
use Mautic\IntegrationsBundle\Integration\Interfaces\ConfigFormInterface;
use Mautic\IntegrationsBundle\Integration\Interfaces\ConfigFormFeatureSettingsInterface;
use MauticPlugin\GrapesJsCustomPluginBundle\Integration\GrapesJsCustomPluginIntegration;
use MauticPlugin\GrapesJsCustomPluginBundle\Form\Type\CiviCrmAuthType;

class ConfigSupport extends GrapesJsCustomPluginIntegration implements ConfigFormInterface, ConfigFormFeatureSettingsInterface
{
    use DefaultConfigFormTrait;

    public function getFeatureSettingsConfigFormName(): string
    {
        return CiviCrmAuthType::class;
    }
}
