<?php

declare(strict_types=1);

namespace MauticPlugin\GrapesJsCustomPluginBundle\EventSubscriber;

use Doctrine\DBAL\Connection;
use Mautic\CoreBundle\Security\Permissions\CorePermissions;
use Mautic\EmailBundle\EmailEvents;
use Mautic\EmailBundle\Event\EmailEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class EmailProtectionSubscriber implements EventSubscriberInterface
{
    private CorePermissions $security;
    private Connection $connection;

    public function __construct(CorePermissions $security, Connection $connection)
    {
        $this->security = $security;
        $this->connection = $connection;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            EmailEvents::EMAIL_PRE_SAVE   => ['onEmailPreSave', 0],
            EmailEvents::EMAIL_PRE_DELETE => ['onEmailPreDelete', 0],
        ];
    }

    public function onEmailPreSave(EmailEvent $event): void
    {
        $this->checkTemplateAccess($event);
    }

    public function onEmailPreDelete(EmailEvent $event): void
    {
        $this->checkTemplateAccess($event);
    }

    private function checkTemplateAccess(EmailEvent $event): void
    {
        $email = $event->getEmail();
        if (!$email || !$email->getId()) {
            return;
        }

        // Si l'utilisateur est admin ou a les droits de modification de modèles, on le laisse passer
        if ($this->security->isAdmin() || $this->security->isGranted('grapesjscustomplugin:civicrm:push_template')) {
            return;
        }

        // Sinon on vérifie si l'e-mail est utilisé comme un modèle (s'il est mappé)
        $settingsStr = $this->connection->fetchOne("SELECT feature_settings FROM plugin_integration_settings WHERE name = 'GrapesJsCustomPlugin'");
        if (!$settingsStr) {
            return;
        }

        $settings = unserialize($settingsStr);
        if (!is_array($settings) || !isset($settings['integration']['email_mappings'])) {
            return;
        }

        $mappings = $settings['integration']['email_mappings'];
        
        // Si l'ID de cet email se trouve dans les mappings
        if (isset($mappings[$email->getId()])) {
            throw new AccessDeniedException('Action bloquée : Vous n\'avez pas la permission de modifier ou de supprimer un e-mail utilisé comme modèle CiviCRM.');
        }
    }
}
