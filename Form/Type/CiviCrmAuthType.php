<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\Form\Type;

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
            'label' => 'civicrmbuilder.config.civicrm_url.label',
            'required' => true,
            'attr' => [
                'class' => 'form-control',
                'placeholder' => 'civicrmbuilder.config.civicrm_url.placeholder',
            ],
            'constraints' => [
                new NotBlank(['message' => 'civicrmbuilder.config.civicrm_url.required']),
            ],
        ]);

        $builder->add('api_key', TextType::class, [
            'label' => 'civicrmbuilder.config.api_key.label',
            'required' => true,
            'attr' => [
                'class' => 'form-control',
                'placeholder' => 'civicrmbuilder.config.api_key.placeholder',
            ],
            'constraints' => [
                new NotBlank(['message' => 'civicrmbuilder.config.api_key.required']),
            ],
        ]);

        $builder->add('clear_mappings', \Symfony\Component\Form\Extension\Core\Type\CheckboxType::class, [
            'label' => 'civicrmbuilder.config.clear_mappings.label',
            'required' => false,
            'help' => 'civicrmbuilder.config.clear_mappings.help',
        ]);

        $builder->add('clear_template_mappings', \Symfony\Component\Form\Extension\Core\Type\CheckboxType::class, [
            'label' => 'civicrmbuilder.config.clear_template_mappings.label',
            'required' => false,
            'help' => 'civicrmbuilder.config.clear_template_mappings.help',
        ]);

        $builder->addEventListener(FormEvents::SUBMIT, function (FormEvent $event) {
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
            $context->buildViolation('civicrmbuilder.config.credentials.invalid')
                ->setParameter('%http_code%', (string) $httpCode)
                ->atPath('api_key')
                ->addViolation();
        }
    }
}
