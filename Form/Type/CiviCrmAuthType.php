<?php

declare(strict_types=1);

namespace MauticPlugin\GrapesJsCustomPluginBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class CiviCrmAuthType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder->add('civicrm_url', UrlType::class, [
            'label' => 'URL CiviCRM',
            'required' => true,
            'attr' => [
                'class' => 'form-control',
                'placeholder' => 'ex: https://crm.exemple.org',
            ],
            'constraints' => [
                new NotBlank(['message' => 'L\'URL CiviCRM est requise']),
            ],
        ]);

        $builder->add('api_key', TextType::class, [
            'label' => 'Clé API (Bearer Token)',
            'required' => true,
            'attr' => [
                'class' => 'form-control',
                'placeholder' => 'ex: 8geCAfNp...',
            ],
            'constraints' => [
                new NotBlank(['message' => 'La clé API est requise']),
            ],
        ]);

        $builder->add('clear_mappings', \Symfony\Component\Form\Extension\Core\Type\CheckboxType::class, [
            'label' => 'Vider l\'historique des liaisons de brouillons',
            'required' => false,
            'help' => 'Cochez cette case pour forcer la recréation de tous les brouillons lors du prochain envoi.',
        ]);

        $builder->add('clear_template_mappings', \Symfony\Component\Form\Extension\Core\Type\CheckboxType::class, [
            'label' => 'Vider l\'historique des liaisons de Modèles de Message',
            'required' => false,
            'help' => 'Cochez cette case pour forcer la recréation de tous les MessageTemplates lors du prochain envoi.',
        ]);

        $builder->addEventListener(FormEvents::POST_SUBMIT, function (FormEvent $event) {
            $data = $event->getData();
            if (!empty($data['clear_mappings'])) {
                $data['email_mappings'] = [];
                $data['clear_mappings'] = false;
            }
            if (!empty($data['clear_template_mappings'])) {
                $data['template_mappings'] = [];
                $data['clear_template_mappings'] = false;
            }
            $event->setData($data);
        });
    }

    public function configureOptions(\Symfony\Component\OptionsResolver\OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'constraints' => [
                new Callback([$this, 'validateCredentials']),
            ],
        ]);
    }

    public function validateCredentials($data, ExecutionContextInterface $context): void
    {
        $url = $data['civicrm_url'] ?? '';
        $apiKey = $data['api_key'] ?? '';

        if (!$url || !$apiKey) {
            return;
        }

        // Tester la connexion à l'API CiviCRM
        $apiUrl = rtrim($url, '/') . '/civicrm/ajax/api4/Contact/getFields';

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'X-Civi-Auth: Bearer ' . $apiKey,
            'Content-Type: application/x-www-form-urlencoded',
        ]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, 'params=' . urlencode(json_encode([
            'select' => ['name'],
            'limit' => 1,
        ])));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode < 200 || $httpCode >= 300) {
            $context->buildViolation('La connexion à CiviCRM a échoué. Vérifiez l\'URL et la clé API. (Code HTTP: ' . $httpCode . ')')
                ->atPath('api_key')
                ->addViolation();
        }
    }
}
