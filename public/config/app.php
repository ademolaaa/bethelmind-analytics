<?php

declare(strict_types=1);

function bm_detect_env(): string
{
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $root = $_SERVER['DOCUMENT_ROOT'] ?? '';
    $software = $_SERVER['SERVER_SOFTWARE'] ?? '';

    $isLocalHost = in_array($host, ['localhost', '127.0.0.1'], true) || str_ends_with($host, '.test');
    if ($isLocalHost) return 'local';

    $isHostingerLike = stripos($software, 'litespeed') !== false || stripos($software, 'apache') !== false;
    $isHostingerRoot = stripos($root, 'public_html') !== false || preg_match('~^/home/u\d+~', $root) === 1;

    if ($isHostingerLike && $isHostingerRoot) return 'hostinger';
    return 'production';
}

function bm_project_root(): string
{
    return dirname(__DIR__);
}

function bm_public_root(): string
{
    return __DIR__ . '/..';
}

function bm_config_path(string $file): string
{
    return __DIR__ . '/' . ltrim($file, '/');
}

function bm_load_generated_config(): array
{
    $path = bm_config_path('generated.php');
    if (!is_file($path)) return [];
    $data = require $path;
    return is_array($data) ? $data : [];
}

function bm_base_url(): string
{
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host;
}

function bm_config(): array
{
    $env = bm_detect_env();
    $generated = bm_load_generated_config();

    $db = $generated['db'] ?? [];
    $dbHost = (string)($db['host'] ?? 'localhost');
    $dbName = (string)($db['name'] ?? 'bethelmind_db');
    $dbUser = (string)($db['user'] ?? 'root');
    $dbPass = (string)($db['pass'] ?? '');
    $dbCharset = (string)($db['charset'] ?? 'utf8mb4');

    return [
        'env' => $env,
        'base_url' => (string)($generated['base_url'] ?? bm_base_url()),
        'security' => [
            'session_name' => (string)($generated['security']['session_name'] ?? 'bm_cms'),
        ],
        'ai' => [
            'provider' => (string)($generated['ai']['provider'] ?? ''),
            'gemini_api_key' => (string)($generated['ai']['gemini_api_key'] ?? ''),
            'gemini_model' => (string)($generated['ai']['gemini_model'] ?? 'gemini-2.5-flash-lite'),
        ],
        'whatsapp' => [
            'provider' => (string)($generated['whatsapp']['provider'] ?? ''),
            'access_token' => (string)($generated['whatsapp']['access_token'] ?? ''),
            'phone_number_id' => (string)($generated['whatsapp']['phone_number_id'] ?? ''),
            'verify_token' => (string)($generated['whatsapp']['verify_token'] ?? ''),
            'admin_numbers' => is_array($generated['whatsapp']['admin_numbers'] ?? null) ? $generated['whatsapp']['admin_numbers'] : [],
            'auto_reply_enabled' => (bool)($generated['whatsapp']['auto_reply_enabled'] ?? false),
            'auto_reply_text' => (string)($generated['whatsapp']['auto_reply_text'] ?? ''),
        ],
        'cron' => [
            'token' => (string)($generated['cron']['token'] ?? ''),
        ],
        'db' => [
            'host' => $dbHost,
            'name' => $dbName,
            'user' => $dbUser,
            'pass' => $dbPass,
            'charset' => $dbCharset,
            'dsn' => "mysql:host={$dbHost};dbname={$dbName};charset={$dbCharset}",
        ],
        'uploads' => [
            'dir' => (string)($generated['uploads']['dir'] ?? (bm_public_root() . '/uploads')),
            'url' => (string)($generated['uploads']['url'] ?? '/uploads'),
            'max_bytes' => (int)($generated['uploads']['max_bytes'] ?? (8 * 1024 * 1024)),
        ],
    ];
}

