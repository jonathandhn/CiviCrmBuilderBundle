<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\Integration;

use Mautic\IntegrationsBundle\Exception\IntegrationNotFoundException;
use Mautic\IntegrationsBundle\Helper\IntegrationsHelper;
use Mautic\PluginBundle\Entity\Integration;

class Config
{
    /**
     * @var IntegrationsHelper
     */
    private IntegrationsHelper $integrationsHelper;

    public function __construct(IntegrationsHelper $integrationsHelper)
    {
        $this->integrationsHelper = $integrationsHelper;
    }

    public function isPublished(): bool
    {
        try {
            $integration = $this->getIntegrationEntity();

            return (bool)$integration->getIsPublished();
        } catch (IntegrationNotFoundException $e) {
            return false;
        }
    }

    /**
     * @return array
     */
    public function getFeatureSettings(): array
    {
        try {
            $integration = $this->getIntegrationEntity();

            return $integration->getFeatureSettings() ?: [];
        } catch (IntegrationNotFoundException $e) {
            return [];
        }
    }

    /**
     * @throws IntegrationNotFoundException
     */
    public function getIntegrationEntity(): Integration
    {
        $integrationObject = $this->integrationsHelper->getIntegration(CiviCrmBuilderIntegration::NAME);

        return $integrationObject->getIntegrationConfiguration();
    }
}
