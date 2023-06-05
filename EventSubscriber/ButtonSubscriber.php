<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\EventSubscriber;

use Mautic\CoreBundle\CoreEvents;
use Mautic\CoreBundle\Event\CustomButtonEvent;
use Mautic\CoreBundle\Twig\Helper\ButtonHelper;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\RouterInterface;
use Mautic\CoreBundle\Security\Permissions\CorePermissions;

class ButtonSubscriber implements EventSubscriberInterface
{
    private RouterInterface $router;
    private CorePermissions $security;

    public function __construct(RouterInterface $router, CorePermissions $security)
    {
        $this->router = $router;
        $this->security = $security;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            CoreEvents::VIEW_INJECT_CUSTOM_BUTTONS => ['injectViewButtons', 0],
        ];
    }

    public function injectViewButtons(CustomButtonEvent $event): void
    {
        if ($event->getRoute() !== 'mautic_email_action') {
            return;
        }

        $email = $event->getItem();
        if (!$email || !method_exists($email, 'getId') || !$email->getId()) {
            return;
        }

        $pushRoute = $this->router->generate('civicrm_builder_civicrm_push', ['objectId' => $email->getId()]);
        $pushTemplateRoute = $this->router->generate('civicrm_builder_civicrm_push_template', ['objectId' => $email->getId()]);

        if ($this->security->isGranted('civicrmbuilder:civicrm:push_draft')) {
            $event->addButton(
                [
                    'attr'      => [
                        'href'        => $pushRoute,
                        'data-toggle' => 'tooltip',
                        'title'       => 'Créer/MAJ un brouillon dans CiviCRM',
                    ],
                    'btnText'   => 'Pousser (Brouillon CiviCRM)',
                    'iconClass' => 'ri-cloud-upload-line',
                ],
                ButtonHelper::LOCATION_PAGE_ACTIONS
            );
        }

        if ($this->security->isGranted('civicrmbuilder:civicrm:push_template')) {
            $event->addButton(
                [
                    'attr'      => [
                        'href'        => $pushTemplateRoute,
                        'data-toggle' => 'tooltip',
                        'title'       => 'Créer/MAJ un Modèle de Message dans CiviCRM',
                    ],
                    'btnText'   => 'Pousser (Modèle CiviCRM)',
                    'iconClass' => 'ri-cloud-upload-line',
                ],
                ButtonHelper::LOCATION_PAGE_ACTIONS
            );
        }

        if ($this->security->isGranted('civicrmbuilder:civicrm:link_template')) {
            $linkRoute = $this->router->generate('civicrm_builder_civicrm_link_modal', ['objectId' => $email->getId()]);
            
            $event->addButton(
                [
                    'attr'      => [
                        'href'        => $linkRoute,
                        'data-toggle' => 'ajaxmodal',
                        'data-target' => '#MauticSharedModal',
                        'data-header' => 'Lier un modèle CiviCRM',
                        'title'       => 'Lier à un Modèle de Message CiviCRM',
                    ],
                    'btnText'   => 'Lier (Modèle CiviCRM)',
                    'iconClass' => 'ri-links-line',
                ],
                ButtonHelper::LOCATION_PAGE_ACTIONS
            );
        }
    }
}
