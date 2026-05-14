<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';
require_once __DIR__ . '/../api/bootstrap.php';

$cfg = bm_config();

$sessionName = (string)($cfg['security']['session_name'] ?? 'bm_cms');
session_name($sessionName);
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

function cms_h(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function cms_redirect(string $path): void
{
    header('Location: ' . $path, true, 302);
    exit;
}

function cms_csrf_token(): string
{
    if (!isset($_SESSION['csrf']) || !is_string($_SESSION['csrf']) || strlen($_SESSION['csrf']) < 20) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return (string)$_SESSION['csrf'];
}

function cms_verify_csrf(): void
{
    $sent = (string)($_POST['csrf'] ?? '');
    $real = (string)($_SESSION['csrf'] ?? '');
    if ($sent === '' || $real === '' || !hash_equals($real, $sent)) {
        http_response_code(403);
        echo 'Invalid CSRF token';
        exit;
    }
}

function cms_current_user(): ?array
{
    $id = $_SESSION['user_id'] ?? null;
    if (!is_int($id) && !ctype_digit((string)$id)) return null;
    $pdo = bm_pdo();
    $stmt = $pdo->prepare('SELECT id, email, role, is_active FROM cms_users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => (int)$id]);
    $u = $stmt->fetch();
    if (!$u || (int)$u['is_active'] !== 1) return null;
    return $u;
}

function cms_require_login(): array
{
    $u = cms_current_user();
    if (!$u) cms_redirect('/cms/login.php');
    return $u;
}

function cms_require_role(array $user, array $allowed): void
{
    $role = (string)($user['role'] ?? '');
    if (!in_array($role, $allowed, true)) {
        http_response_code(403);
        echo 'Forbidden';
        exit;
    }
}

function cms_flash_set(string $key, string $value): void
{
    $_SESSION['flash'][$key] = $value;
}

function cms_flash_get(string $key): ?string
{
    $val = $_SESSION['flash'][$key] ?? null;
    if (isset($_SESSION['flash'][$key])) unset($_SESSION['flash'][$key]);
    return is_string($val) ? $val : null;
}

