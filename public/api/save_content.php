<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/../cms/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') bm_json(['success' => false, 'error' => 'Method not allowed'], 405);

$user = cms_current_user();
if (!$user) bm_json(['success' => false, 'error' => 'Unauthorized'], 401);
cms_require_role($user, ['admin', 'editor']);

$csrfHeader = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
if ($csrfHeader === '' || !hash_equals((string)($_SESSION['csrf'] ?? ''), $csrfHeader)) {
    bm_json(['success' => false, 'error' => 'Invalid CSRF token'], 403);
}

$raw = file_get_contents('php://input');
if (!is_string($raw) || trim($raw) === '') bm_json(['success' => false, 'error' => 'Empty body'], 400);

$decoded = json_decode($raw, true);
if (!is_array($decoded)) bm_json(['success' => false, 'error' => 'Invalid JSON'], 400);

try {
    $json = json_encode($decoded, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($json)) throw new RuntimeException('Failed to encode JSON');
    bm_setting_set('site_content', $json);
    bm_json(['success' => true]);
} catch (Throwable $e) {
    bm_json(['success' => false, 'error' => $e->getMessage()], 500);
}
