<?php
/**
 * Headless Auth Module for PrestaShop
 * Provides /api/auth/login endpoint for headless frontend authentication
 *
 * @author Home Screen Distribution sp. z o.o.
 * @version 1.0.0
 */

if (!defined('_PS_VERSION_')) {
    exit;
}

class HeadlessAuth extends Module
{
    public function __construct()
    {
        $this->name = 'headlessauth';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'Home Screen Distribution sp. z o.o.';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = [
            'min' => '1.7.0.0',
            'max' => '8.99.99',
        ];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Headless Authentication');
        $this->description = $this->l('Provides secure authentication API endpoint for headless frontend.');
        $this->confirmUninstall = $this->l('Are you sure you want to uninstall?');
    }

    public function install()
    {
        return parent::install();
    }

    public function uninstall()
    {
        return parent::uninstall();
    }
}
