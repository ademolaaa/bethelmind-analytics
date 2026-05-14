<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';

function bm_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $cfg = bm_config();
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($cfg['db']['dsn'], $cfg['db']['user'], $cfg['db']['pass'], $options);
    return $pdo;
}

function bm_json(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function bm_raw_json(string $json, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo $json;
    exit;
}

function bm_request_json(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false) return [];
    $data = json_decode($raw, true);
    if (!is_array($data)) bm_json(['success' => false, 'error' => 'Invalid JSON'], 400);
    return $data;
}

function bm_setting_get(string $key): ?string
{
    $pdo = bm_pdo();
    $stmt = $pdo->prepare('SELECT setting_value FROM app_settings WHERE setting_key = :k LIMIT 1');
    $stmt->execute([':k' => $key]);
    $row = $stmt->fetch();
    if (!$row) return null;
    $val = $row['setting_value'];
    return is_string($val) ? $val : null;
}

function bm_setting_set(string $key, string $json): void
{
    $pdo = bm_pdo();
    $stmt = $pdo->prepare('INSERT INTO app_settings (setting_key, setting_value) VALUES (:k, :v) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
    $stmt->execute([':k' => $key, ':v' => $json]);
}

