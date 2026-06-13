<?php

declare(strict_types=1);

namespace MauticPlugin\GrapesJsCustomPluginBundle\EventSubscriber;

use Mautic\CoreBundle\CoreEvents;
use Mautic\CoreBundle\Event\CustomAssetsEvent;
use Mautic\InstallBundle\Install\InstallService;
use MauticPlugin\GrapesJsCustomPluginBundle\Integration\Config;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class AssetsSubscriber implements EventSubscriberInterface
{
    /**
     * @var Config
     */
    private Config $config;

    /**
     * @var InstallService
     */
    private InstallService $installer;

    public function __construct(Config $config, InstallService $installer)
    {
        $this->config = $config;
        $this->installer = $installer;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CoreEvents::VIEW_INJECT_CUSTOM_ASSETS => ['injectAssets', 0],
        ];
    }

    public function injectAssets(CustomAssetsEvent $assetsEvent): void
    {
        if (!$this->installer->checkIfInstalled()) {
            return;
        }

        if ($this->config->isPublished()) {
            $assetsEvent->addScript('plugins/GrapesJsCustomPluginBundle/Assets/dist/index.js?v=1.1.8');
            //$assetsEvent->addStylesheet('plugins/GrapesJsCustomPluginBundle/Assets/dist/index.min.css');
        }
    }
}
