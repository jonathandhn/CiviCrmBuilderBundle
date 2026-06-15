<?php

declare(strict_types=1);

namespace MauticPlugin\CiviCrmBuilderBundle\EventSubscriber;

use Mautic\CoreBundle\CoreEvents;
use Mautic\CoreBundle\Event\CustomButtonEvent;
use Mautic\CoreBundle\Security\Permissions\CorePermissions;
use Mautic\CoreBundle\Twig\Helper\ButtonHelper;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ButtonSubscriber implements EventSubscriberInterface
{
    private RouterInterface $router;
    private CorePermissions $security;
    private TranslatorInterface $translator;

    public function __construct(RouterInterface $router, CorePermissions $security, TranslatorInterface $translator)
    {
        $this->router = $router;
        $this->security = $security;
        $this->translator = $translator;
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
                        'title'       => $this->translator->trans('civicrmbuilder.button.push_draft.title'),
                    ],
                    'btnText'   => $this->translator->trans('civicrmbuilder.button.push_draft.text'),
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
                        'title'       => $this->translator->trans('civicrmbuilder.button.push_template.title'),
                    ],
                    'btnText'   => $this->translator->trans('civicrmbuilder.button.push_template.text'),
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
                        'data-header' => $this->translator->trans('civicrmbuilder.button.link_template.header'),
                        'title'       => $this->translator->trans('civicrmbuilder.button.link_template.title'),
                    ],
                    'btnText'   => $this->translator->trans('civicrmbuilder.button.link_template.text'),
                    'iconClass' => 'ri-links-line',
                ],
                ButtonHelper::LOCATION_PAGE_ACTIONS
            );
        }
    }
}
