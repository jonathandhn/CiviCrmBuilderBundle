<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\EventSubscriber;

use Mautic\CoreBundle\CoreEvents;
use Mautic\CoreBundle\Event\CustomAssetsEvent;
use Mautic\InstallBundle\Install\InstallService;
use MauticPlugin\CiviCrmBuilderBundle\Integration\Config;
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
            $jsPath = __DIR__ . '/../Assets/dist/index.js';
            $version = file_exists($jsPath) ? filemtime($jsPath) : '1.0.0';
            $assetsEvent->addScript('plugins/CiviCrmBuilderBundle/Assets/dist/index.js?v=' . $version);
        }
    }
}
