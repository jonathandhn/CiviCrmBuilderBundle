<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\EventSubscriber;

use Mautic\EmailBundle\EmailEvents;
use Mautic\EmailBundle\Event\EmailBuilderEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CiviCrmTokenSubscriber implements EventSubscriberInterface
{
    /** @var \Doctrine\DBAL\Connection */
    private $db;

    public function __construct(\Doctrine\DBAL\Connection $db)
    {
        $this->db = $db;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            EmailEvents::EMAIL_ON_BUILD => ['onEmailBuild', 0],
        ];
    }

    public function onEmailBuild(EmailBuilderEvent $event): void
    {
        if (!$event->tokensRequested()) {
            return;
        }

        $filterData = $event->getTokenFilter();
        $filterText = $filterData['filter'] ?? '';
        $target     = $filterData['target'] ?? 'token';

        $fetchContact = false;
        $fetchStandard = false;

        if ($target === 'token' && $filterText !== '') {
            if (str_starts_with('contact.', $filterText) || str_starts_with($filterText, 'contact.')) {
                $fetchContact = true;
                $fetchStandard = true; // contact.checksum is here
            }
            foreach (['action.', 'mailing.', 'domain.'] as $prefix) {
                if (str_starts_with($prefix, $filterText) || str_starts_with($filterText, $prefix)) {
                    $fetchStandard = true;
                }
            }
        } else {
            $fetchContact = true;
            $fetchStandard = true;
        }

        if (!$fetchContact && !$fetchStandard) {
            return;
        }

        $tokens = [];

        if ($fetchStandard) {
            $tokens = array_merge($tokens, $this->getStandardTokens());
        }

        if ($fetchContact) {
            $contactTokens = $this->fetchContactTokens();
            if ($contactTokens) {
                $tokens = array_merge($tokens, $contactTokens);
            }
        }

        $event->addTokens(
            $event->filterTokens($tokens)
        );
    }

    /**
     * @return array<string, string>
     */
    private function getStandardTokens(): array
    {
        return [
            '{action.unsubscribeUrl}' => 'CiviCRM: Lien de désinscription',
            '{action.optOutUrl}'      => 'CiviCRM: Désabonnement global',
            '{mailing.viewUrl}'       => 'CiviCRM: Lien version en ligne (Navigateur)',
            '{contact.checksum}'      => 'CiviCRM: Jeton de sécurité (Checksum)',
            '{domain.name}'           => "CiviCRM: Nom de l'association",
            '{domain.address}'        => "CiviCRM: Adresse de l'association",
            '{domain.email}'          => "CiviCRM: Email de l'association",
        ];
    }

    /**
     * @return array<string, string>
     */
    private function fetchContactTokens(): array
    {
        $settingsStr = $this->db->fetchOne("SELECT feature_settings FROM plugin_integration_settings WHERE name = 'CiviCrmBuilder'");
        $settings = is_string($settingsStr) && $settingsStr !== ''
            ? unserialize($settingsStr, ['allowed_classes' => false])
            : [];
        if (!is_array($settings)) {
            $settings = [];
        }

        $apiKey = $settings['integration']['api_key'] ?? $settings['api_key'] ?? '';
        $civicrmUrl = $settings['integration']['civicrm_url'] ?? $settings['civicrm_url'] ?? '';

        if (empty($apiKey) || empty($civicrmUrl)) {
            return [];
        }

        $apiUrl = rtrim($civicrmUrl, '/') . '/civicrm/ajax/api4/Contact/getFields';

        $payload = [
            'select' => ['name', 'title'],
            'limit' => 500,
        ];

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-Civi-Auth: Bearer '.$apiKey,
            'Content-Type: application/x-www-form-urlencoded',
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'params='.urlencode((string) json_encode($payload)));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode < 200 || $httpCode >= 300 || !is_string($response)) {
            return [];
        }

        $data = json_decode($response, true);
        if (!isset($data['values']) || !is_array($data['values'])) {
            return [];
        }

        $tokens = [];
        foreach ($data['values'] as $field) {
            if (!isset($field['name']) || !is_string($field['name'])) {
                continue;
            }

            $label = $field['title'] ?? $field['name'];
            $tokens['{contact.'.$field['name'].'}'] = 'CiviCRM: '.$label;
        }

        return $tokens;
    }
}
