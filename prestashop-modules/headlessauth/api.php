<?php
/**
 * Headless Auth API Endpoint
 * POST /modules/headlessauth/api.php
 *
 * Accepts JSON: { "email": "...", "password": "..." }
 * Returns JSON: { "success": true, "customer": {...} } or { "success": false, "error": "..." }
 */

// Load PrestaShop configuration
$configPath = dirname(__FILE__) . '/../../config/config.inc.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    die(json_encode(['success' => false, 'error' => 'PrestaShop config not found']));
}

require_once($configPath);

// Set JSON response header
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'error' => 'Method not allowed']));
}

// Verify API key from Authorization header (Basic auth)
$authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
if (empty($authHeader)) {
    // Try Apache workaround
    $authHeader = isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : '';
}

if (empty($authHeader) || strpos($authHeader, 'Basic ') !== 0) {
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Authorization required']));
}

// Decode Basic auth and verify API key
$encodedKey = substr($authHeader, 6);
$decodedKey = base64_decode($encodedKey);
$apiKey = explode(':', $decodedKey)[0];

// Verify API key exists in PrestaShop webservice keys
$wsKey = Db::getInstance()->getRow(
    'SELECT * FROM ' . _DB_PREFIX_ . 'webservice_account WHERE `key` = "' . pSQL($apiKey) . '" AND active = 1'
);

if (!$wsKey) {
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Invalid API key']));
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Email and password required']));
}

$email = trim($data['email']);
$password = $data['password'];

// Validate email format
if (!Validate::isEmail($email)) {
    http_response_code(400);
    die(json_encode(['success' => false, 'error' => 'Invalid email format']));
}

// Find customer by email
$customer = new Customer();
$customer->getByEmail($email);

if (!Validate::isLoadedObject($customer)) {
    // Don't reveal if email exists or not (security)
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Invalid email or password']));
}

// Check if customer is active
if (!$customer->active) {
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Account is not active']));
}

// Verify password using PrestaShop's built-in method
// PrestaShop 1.7+ uses password_verify() internally
$isValidPassword = password_verify($password, $customer->passwd);

// Fallback for older PrestaShop versions or different hash formats
if (!$isValidPassword) {
    // Try with PrestaShop's legacy method (MD5 + cookie key)
    $legacyHash = md5(_COOKIE_KEY_ . $password);
    $isValidPassword = ($legacyHash === $customer->passwd);
}

if (!$isValidPassword) {
    http_response_code(401);
    die(json_encode(['success' => false, 'error' => 'Invalid email or password']));
}

// Success - return customer data
http_response_code(200);
echo json_encode([
    'success' => true,
    'customer' => [
        'id' => (int)$customer->id,
        'email' => $customer->email,
        'firstname' => $customer->firstname,
        'lastname' => $customer->lastname,
        'id_gender' => (int)$customer->id_gender,
        'birthday' => $customer->birthday,
        'newsletter' => (bool)$customer->newsletter,
        'date_add' => $customer->date_add,
    ]
]);
