<?php

declare(strict_types=1);

namespace MauticPlugin\GrapesJsCustomPluginBundle\Controller;

use Mautic\CoreBundle\Controller\CommonController;
use Symfony\Component\HttpFoundation\JsonResponse;

class CiviCrmController extends CommonController
{
    public function tokensAction(): JsonResponse
    {
        $db = $this->doctrine->getConnection();
        $settingsStr = $db->fetchOne("SELECT feature_settings FROM plugin_integration_settings WHERE name = 'GrapesJsCustomPlugin'");
        $settings = $settingsStr ? unserialize($settingsStr) : [];
        if (!is_array($settings)) {
            $settings = [];
        }
        if (!isset($settings['integration']) || !is_array($settings['integration'])) {
            $settings['integration'] = [];
        }
        
        $apiKey = $settings['integration']['api_key'] ?? $settings['api_key'] ?? '';
        $civicrmUrl = $settings['integration']['civicrm_url'] ?? $settings['civicrm_url'] ?? '';

        if (empty($apiKey) || empty($civicrmUrl)) {
            return new JsonResponse(['success' => false, 'error' => 'Configuration CiviCRM absente.'], 400);
        }
        
        // 1. Appel dynamique vers CiviCRM pour récupérer tous les champs (y compris custom) du Contact
        $apiUrl = rtrim($civicrmUrl, '/') . '/civicrm/ajax/api4/Contact/getFields';
        
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-Civi-Auth: Bearer ' . $apiKey,
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'params=' . urlencode(json_encode([
            "select" => ["name", "title"],
            "limit" => 500
        ])));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErrNo = curl_errno($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!is_string($response)) {
            file_put_contents(
                '/home/maut/public_html/var/logs/civi_push_error.log',
                date('Y-m-d H:i:s') . " - Tokens curl failed - HTTP: $httpCode - cURL: $curlErrNo - Error: $curlError\n",
                FILE_APPEND
            );
            return new JsonResponse(['success' => false, 'error' => 'Erreur de connexion à CiviCRM'], 500);
        }

        $tokens = [];

        if ($httpCode >= 200 && $httpCode < 300) {
            $data = json_decode($response, true);
            if (isset($data['values'])) {
                foreach ($data['values'] as $field) {
                    $tokens[] = [
                        'name' => 'contact.' . $field['name'],
                        'label' => 'Contact : ' . $field['title']
                    ];
                }
            }
        }

        // 2. Ajout des jetons standards (Action, Domaine, Mailing) qui ne sont pas des champs de Contact
        $standardTokens = [
            ['name' => 'action.unsubscribeUrl', 'label' => 'Lien de désinscription'],
            ['name' => 'action.optOutUrl', 'label' => 'Désabonnement global'],
            ['name' => 'mailing.viewUrl', 'label' => 'Lien version en ligne (Navigateur)'],
            ['name' => 'contact.checksum', 'label' => 'Jeton de sécurité (Checksum)'],
            ['name' => 'domain.name', 'label' => "Nom de l'association"],
            ['name' => 'domain.address', 'label' => "Adresse de l'association"],
            ['name' => 'domain.email', 'label' => "Email de l'association"],
        ];

        $tokens = array_merge($tokens, $standardTokens);

        return new JsonResponse([
            'success' => true,
            'data' => ['values' => $tokens],
            'api_status' => $httpCode
        ]);
    }

    public function pushAction(int $objectId)
    {
        if (!$this->security->isGranted('grapesjscustomplugin:civicrm:push_draft')) {
            return $this->accessDenied();
        }

        /** @var \Mautic\EmailBundle\Model\EmailModel $model */
        $model = $this->getModel('email');
        
        /** @var \Mautic\EmailBundle\Entity\Email|null $email */
        $email = $model->getEntity($objectId);

        if (!$email) {
            $this->addFlashMessage('mautic.core.error.notfound', [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_index'));
        }

        $settingsStr = $this->doctrine->getConnection()->fetchOne("SELECT feature_settings FROM plugin_integration_settings WHERE name = 'GrapesJsCustomPlugin'");
        $settings = $settingsStr ? unserialize($settingsStr) : [];
        if (!is_array($settings)) {
            $settings = [];
        }
        if (!isset($settings['integration']) || !is_array($settings['integration'])) {
            $settings['integration'] = [];
        }


        $apiKey = $settings['integration']['api_key'] ?? $settings['api_key'] ?? '';
        $civicrmUrl = $settings['integration']['civicrm_url'] ?? $settings['civicrm_url'] ?? '';

        if (empty($apiKey) || empty($civicrmUrl)) {
            $this->addFlashMessage('Les identifiants CiviCRM ne sont pas configurés dans le plugin.', [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
        }

        $baseApiUrl = rtrim($civicrmUrl, '/') . '/civicrm/ajax/api4/Mailing/';
        $civiMailingId = $settings['integration']['email_mappings'][$objectId] ?? null;
        $isUpdate = false;

        // Check if existing mapping is still a draft
        if ($civiMailingId) {
            $chGet = curl_init($baseApiUrl . 'get');
            curl_setopt($chGet, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($chGet, CURLOPT_HTTPHEADER, [
                'X-Civi-Auth: Bearer ' . $apiKey,
                'Content-Type: application/x-www-form-urlencoded'
            ]);
            curl_setopt($chGet, CURLOPT_POST, true);
            curl_setopt($chGet, CURLOPT_POSTFIELDS, 'params=' . urlencode(json_encode([
                'select' => ['id', 'status'],
                'where' => [['id', '=', $civiMailingId]]
            ])));
            $responseGet = curl_exec($chGet);
            $httpCodeGet = curl_getinfo($chGet, CURLINFO_HTTP_CODE);
            $curlErrNoGet = curl_errno($chGet);
            $curlErrorGet = curl_error($chGet);
            curl_close($chGet);

            if (!is_string($responseGet)) {
                file_put_contents(
                    '/home/maut/public_html/var/logs/civi_push_error.log',
                    date('Y-m-d H:i:s') . " - Mailing GET curl failed - HTTP: $httpCodeGet - cURL: $curlErrNoGet - Error: $curlErrorGet\n",
                    FILE_APPEND
                );
            } else if ($httpCodeGet >= 200 && $httpCodeGet < 300) {
                $dataGet = json_decode($responseGet, true);
                if (!empty($dataGet['values'][0]) && $dataGet['values'][0]['status'] === 'Draft') {
                    $isUpdate = true;
                }
            }
        }

        $apiUrl = $baseApiUrl . ($isUpdate ? 'update' : 'create');

        $html = $email->getCustomHtml();
        $name = $email->getName() ?? 'Brouillon Mautic';
        $subject = $email->getSubject() ?? 'Sans objet';

        if (empty(trim($html))) {
            $this->addFlashMessage('Impossible de pousser un email vide vers CiviCRM.', [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
        }

        // Convertir les chemins relatifs en URLs absolues
        $siteUrl = rtrim($this->coreParametersHelper->get('site_url'), '/');
        $html = preg_replace('/(src|href|background)=["\']\/?(\.\/)?themes\//i', '$1="' . $siteUrl . '/themes/', $html);
        $html = preg_replace('/url\([\'"]?\/?(\.\/)?themes\//i', 'url(\'' . $siteUrl . '/themes/', $html);

        $civiParams = [
            'values' => [
                'name' => $name,
                'subject' => $subject,
                'body_html' => $html,
            ]
        ];

        if ($isUpdate) {
            $civiParams['where'] = [['id', '=', $civiMailingId]];
        } else {
            $civiParams['values']['status'] = 'Draft';
            $civiParams['values']['header_id'] = null;
            $civiParams['values']['footer_id'] = null;
            $civiParams['values']['visibility'] = 'Public Pages';
            $civiParams['values']['mailing_type'] = 'standalone';
        }

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-Civi-Auth: Bearer ' . $apiKey,
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'params=' . urlencode(json_encode($civiParams)));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErrNo = curl_errno($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!is_string($response)) {
            file_put_contents(
                '/home/maut/public_html/var/logs/civi_push_error.log',
                date('Y-m-d H:i:s') . " - Mailing curl failed - HTTP: $httpCode - cURL: $curlErrNo - Error: $curlError\n",
                FILE_APPEND
            );
            $this->addFlashMessage('Erreur cURL lors de l\'appel CiviCRM : ' . $curlError, [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
        }

        $data = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300 && !isset($data['error_message'])) {
            $returnedId = $data['values'][0]['id'] ?? null;
            if ($returnedId && $returnedId !== $civiMailingId) {
                $settings['integration']['email_mappings'][$objectId] = $returnedId;
                $db = $this->doctrine->getConnection();
                $db->update('plugin_integration_settings', ['feature_settings' => serialize($settings)], ['name' => 'GrapesJsCustomPlugin']);
            }
            $actionWord = $isUpdate ? 'mis à jour' : 'créé';
            $this->addFlashMessage('✅ Brouillon "' . $name . '" ' . $actionWord . ' avec succès dans CiviCRM !');
        } else {
            $errorMessage = $data['error_message'] ?? 'Erreur inconnue';
            $this->addFlashMessage('Erreur lors de l\'action dans CiviCRM : ' . $errorMessage, [], 'error');
            file_put_contents('/home/maut/public_html/var/logs/civi_push_error.log', date('Y-m-d H:i:s') . " - HTTP: $httpCode - Response: $response\n", FILE_APPEND);
        }

        return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
    }

    public function pushTemplateAction(int $objectId)
    {
        if (!$this->security->isGranted('grapesjscustomplugin:civicrm:push_template')) {
            return $this->accessDenied();
        }

        $email = $this->getModel('email')->getEntity($objectId);
        if (!$email) {
            $this->addFlashMessage('mautic.core.error.notfound', [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_index'));
        }

        $settingsStr = $this->doctrine->getConnection()->fetchOne("SELECT feature_settings FROM plugin_integration_settings WHERE name = 'GrapesJsCustomPlugin'");
        $settings = $settingsStr ? unserialize($settingsStr) : [];
        if (!is_array($settings)) {
            $settings = [];
        }
        if (!isset($settings['integration']) || !is_array($settings['integration'])) {
            $settings['integration'] = [];
        }


        $apiKey = $settings['integration']['api_key'] ?? $settings['api_key'] ?? '';
        $civicrmUrl = $settings['integration']['civicrm_url'] ?? $settings['civicrm_url'] ?? '';

        if (empty($apiKey) || empty($civicrmUrl)) {
            $this->addFlashMessage('Les identifiants CiviCRM ne sont pas configurés dans le plugin.', [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
        }

        $baseApiUrl = rtrim($civicrmUrl, '/') . '/civicrm/ajax/api4/MessageTemplate/';
        $civiTemplateId = $settings['integration']['template_mappings'][$objectId] ?? null;
        $isUpdate = false;

        // Check if existing template exists
        if ($civiTemplateId) {
            $chGet = curl_init($baseApiUrl . 'get');
            curl_setopt($chGet, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($chGet, CURLOPT_HTTPHEADER, [
                'X-Civi-Auth: Bearer ' . $apiKey,
                'Content-Type: application/x-www-form-urlencoded'
            ]);
            curl_setopt($chGet, CURLOPT_POST, true);
            curl_setopt($chGet, CURLOPT_POSTFIELDS, 'params=' . urlencode(json_encode([
                'select' => ['id'],
                'where' => [['id', '=', $civiTemplateId]]
            ])));
            $responseGet = curl_exec($chGet);
            $httpCodeGet = curl_getinfo($chGet, CURLINFO_HTTP_CODE);
            $curlErrNoGet = curl_errno($chGet);
            $curlErrorGet = curl_error($chGet);
            curl_close($chGet);

            if (!is_string($responseGet)) {
                file_put_contents(
                    '/home/maut/public_html/var/logs/civi_push_error.log',
                    date('Y-m-d H:i:s') . " - MessageTemplate GET curl failed - HTTP: $httpCodeGet - cURL: $curlErrNoGet - Error: $curlErrorGet\n",
                    FILE_APPEND
                );
            } else if ($httpCodeGet >= 200 && $httpCodeGet < 300) {
                $dataGet = json_decode($responseGet, true);
                if (!empty($dataGet['values'][0])) {
                    $isUpdate = true;
                }
            }
        }

        $apiUrl = $baseApiUrl . ($isUpdate ? 'update' : 'create');

        $html = $email->getCustomHtml();
        $name = $email->getName() ?? 'Modèle Mautic';
        $subject = $email->getSubject() ?? 'Sans objet';

        if (empty(trim($html))) {
            $this->addFlashMessage('Impossible de pousser un email vide vers CiviCRM.', [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
        }

        // Convertir les chemins relatifs en URLs absolues
        $siteUrl = rtrim($this->coreParametersHelper->get('site_url'), '/');
        $html = preg_replace('/(src|href|background)=["\']\/?(\.\/)?themes\//i', '$1="' . $siteUrl . '/themes/', $html);
        $html = preg_replace('/url\([\'"]?\/?(\.\/)?themes\//i', 'url(\'' . $siteUrl . '/themes/', $html);

        $civiParams = [
            'values' => [
                'msg_title' => $name,
                'msg_subject' => $subject,
                'msg_html' => $html,
            ]
        ];

        if ($isUpdate) {
            $civiParams['where'] = [['id', '=', $civiTemplateId]];
        } else {
            $civiParams['values']['is_active'] = true;
        }

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-Civi-Auth: Bearer ' . $apiKey,
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'params=' . urlencode(json_encode($civiParams)));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErrNo = curl_errno($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if (!is_string($response)) {
            file_put_contents(
                '/home/maut/public_html/var/logs/civi_push_error.log',
                date('Y-m-d H:i:s') . " - MessageTemplate curl failed - HTTP: $httpCode - cURL: $curlErrNo - Error: $curlError\n",
                FILE_APPEND
            );
            $this->addFlashMessage('Erreur cURL lors de l\'appel CiviCRM : ' . $curlError, [], 'error');
            return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
        }

        $data = json_decode($response, true);

        if ($httpCode >= 200 && $httpCode < 300 && !isset($data['error_message'])) {
            $returnedId = $data['values'][0]['id'] ?? null;
            if ($returnedId && $returnedId !== $civiTemplateId) {
                $settings['integration']['template_mappings'][$objectId] = $returnedId;
                $db = $this->doctrine->getConnection();
                $db->update('plugin_integration_settings', ['feature_settings' => serialize($settings)], ['name' => 'GrapesJsCustomPlugin']);
            }
            $actionWord = $isUpdate ? 'mis à jour' : 'créé';
            $this->addFlashMessage('Modèle de message correctement poussé vers CiviCRM.', [], 'notice');
            $this->addFlashMessage('✅ Modèle de message "' . $name . '" ' . $actionWord . ' avec succès dans CiviCRM !');
        } else {
            $errorMessage = $data['error_message'] ?? 'Erreur inconnue';
            $this->addFlashMessage('Erreur lors de l\'action sur le modèle CiviCRM : ' . $errorMessage, [], 'error');
            file_put_contents('/home/maut/public_html/var/logs/civi_push_error.log', date('Y-m-d H:i:s') . " - HTTP: $httpCode - Response: $response\n", FILE_APPEND);
        }

        return $this->redirect($this->generateUrl('mautic_email_action', ['objectAction' => 'view', 'objectId' => $objectId]));
    }

    public function linkModalAction(int $objectId)
    {
        if (!$this->security->isGranted('grapesjscustomplugin:civicrm:link_template')) {
            return $this->accessDenied();
        }

        return $this->delegateView([
            'contentTemplate' => '@GrapesJsCustomPlugin/CiviCrm/link_modal.html.twig',
            'viewParameters'  => [
                'objectId' => $objectId,
            ],
        ]);
    }

    public function searchTemplateAction(Request $request): JsonResponse
    {
        if (!$this->security->isGranted('grapesjscustomplugin:civicrm:link_template')) {
            return new JsonResponse(['error' => 'Accès refusé'], 403);
        }

        $query = trim($request->query->get('q', ''));
        if (empty($query)) {
            return new JsonResponse(['success' => true, 'data' => []]);
        }

        $settingsStr = $this->doctrine->getConnection()->fetchOne("SELECT feature_settings FROM plugin_integration_settings WHERE name = 'GrapesJsCustomPlugin'");
        $settings = $settingsStr ? unserialize($settingsStr) : [];
        $apiKey = $settings['integration']['api_key'] ?? $settings['api_key'] ?? '';
        $civicrmUrl = $settings['integration']['civicrm_url'] ?? $settings['civicrm_url'] ?? '';

        if (empty($apiKey) || empty($civicrmUrl)) {
            return new JsonResponse(['success' => false, 'error' => 'API CiviCRM non configurée.']);
        }

        $isNumeric = preg_match('/^\d+$/', $query);
        $whereClause = $isNumeric ? [['id', '=', (int)$query]] : [['msg_title', 'CONTAINS', $query]];

        $apiUrl = rtrim($civicrmUrl, '/') . '/civicrm/ajax/api4/MessageTemplate/get';

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-Civi-Auth: Bearer ' . $apiKey,
            'Content-Type: application/x-www-form-urlencoded'
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'params=' . urlencode(json_encode([
            'select' => ['id', 'msg_title'],
            'where' => $whereClause,
            'limit' => 20
        ])));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300 && is_string($response)) {
            $data = json_decode($response, true);
            if (isset($data['values'])) {
                return new JsonResponse(['success' => true, 'data' => $data['values']]);
            }
        }

        return new JsonResponse(['success' => false, 'error' => 'Erreur lors de la recherche dans CiviCRM.']);
    }

    public function linkTemplateAction(int $objectId, Request $request): JsonResponse
    {
        if (!$this->security->isGranted('grapesjscustomplugin:civicrm:link_template')) {
            return new JsonResponse(['success' => false, 'message' => 'Accès refusé'], 403);
        }

        $civiTemplateId = (int)$request->request->get('civi_template_id');

        if (!$civiTemplateId) {
            return new JsonResponse(['success' => false, 'error' => 'ID invalide.']);
        }

        $db = $this->doctrine->getConnection();
        $settingsStr = $db->fetchOne("SELECT feature_settings FROM plugin_integration_settings WHERE name = 'GrapesJsCustomPlugin'");
        $settings = $settingsStr ? unserialize($settingsStr) : [];
        if (!is_array($settings)) {
            $settings = [];
        }
        if (!isset($settings['integration']) || !is_array($settings['integration'])) {
            $settings['integration'] = [];
        }

        $settings['integration']['template_mappings'][$objectId] = $civiTemplateId;
        $db->update('plugin_integration_settings', ['feature_settings' => serialize($settings)], ['name' => 'GrapesJsCustomPlugin']);

        $this->addFlashMessage('E-mail Mautic lié avec succès au Modèle CiviCRM ID ' . $civiTemplateId, [], 'success');

        return new JsonResponse(['success' => true, 'closeModal' => true]);
    }
}
