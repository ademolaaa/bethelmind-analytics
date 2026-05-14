<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function bm_api_require_cms_user(): array
{
    $cfg = bm_config();
    $sessionName = (string)($cfg['security']['session_name'] ?? 'bm_cms');
    session_name($sessionName);
    if (session_status() !== PHP_SESSION_ACTIVE) session_start();

    $id = $_SESSION['user_id'] ?? null;
    if (!is_int($id) && !ctype_digit((string)$id)) bm_json(['success' => false, 'error' => 'Unauthorized'], 401);

    $pdo = bm_pdo();
    $stmt = $pdo->prepare('SELECT id, email, role, is_active FROM cms_users WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => (int)$id]);
    $u = $stmt->fetch();
    if (!$u || (int)($u['is_active'] ?? 0) !== 1) bm_json(['success' => false, 'error' => 'Unauthorized'], 401);
    return $u;
}

function bm_wa_norm(string $n): string
{
    $n = trim($n);
    $n = preg_replace('~[^\d+]~', '', $n) ?? '';
    if ($n === '') return '';
    if ($n[0] === '+') $n = substr($n, 1);
    return $n;
}

function bm_http_post_json(string $url, array $headers, string $body, int $timeoutSeconds = 10): array
{
    $h = [];
    foreach ($headers as $k => $v) $h[] = $k . ': ' . $v;

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $h);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSeconds);
        $resp = curl_exec($ch);
        $err = curl_error($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ['ok' => $resp !== false && $code >= 200 && $code < 300, 'code' => $code, 'body' => is_string($resp) ? $resp : '', 'error' => $err];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $h),
            'content' => $body,
            'timeout' => $timeoutSeconds,
        ],
    ]);
    $resp = @file_get_contents($url, false, $context);
    $code = 0;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $line) {
            if (preg_match('~^HTTP/\S+\s+(\d{3})~', $line, $m)) {
                $code = (int)$m[1];
                break;
            }
        }
    }
    return ['ok' => is_string($resp) && $code >= 200 && $code < 300, 'code' => $code, 'body' => is_string($resp) ? $resp : '', 'error' => null];
}

function bm_wa_send_text(string $toE164orDigits, string $text): array
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return ['ok' => false, 'error' => 'WhatsApp provider not configured'];

    $token = (string)($wa['access_token'] ?? '');
    $phoneNumberId = (string)($wa['phone_number_id'] ?? '');
    if ($token === '' || $phoneNumberId === '') return ['ok' => false, 'error' => 'Missing WhatsApp credentials'];

    $to = bm_wa_norm($toE164orDigits);
    if ($to === '') return ['ok' => false, 'error' => 'Invalid number'];

    $url = "https://graph.facebook.com/v19.0/" . rawurlencode($phoneNumberId) . "/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $to,
        'type' => 'text',
        'text' => ['body' => $text],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($payload)) return ['ok' => false, 'error' => 'JSON encode error'];

    return bm_http_post_json($url, [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json',
    ], $payload, 10);
}

function bm_wa_send_template(string $toE164orDigits, string $templateName, string $langCode): array
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return ['ok' => false, 'error' => 'WhatsApp provider not configured'];

    $token = (string)($wa['access_token'] ?? '');
    $phoneNumberId = (string)($wa['phone_number_id'] ?? '');
    if ($token === '' || $phoneNumberId === '') return ['ok' => false, 'error' => 'Missing WhatsApp credentials'];

    $to = bm_wa_norm($toE164orDigits);
    if ($to === '') return ['ok' => false, 'error' => 'Invalid number'];

    $url = "https://graph.facebook.com/v19.0/" . rawurlencode($phoneNumberId) . "/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'to' => $to,
        'type' => 'template',
        'template' => [
            'name' => $templateName,
            'language' => ['code' => $langCode],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($payload)) return ['ok' => false, 'error' => 'JSON encode error'];

    return bm_http_post_json($url, [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json',
    ], $payload, 10);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    bm_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$user = bm_api_require_cms_user();
$role = (string)($user['role'] ?? '');
if (!in_array($role, ['admin', 'editor'], true)) bm_json(['success' => false, 'error' => 'Forbidden'], 403);

$data = bm_request_json();
$to = (string)($data['to'] ?? '');
$mode = (string)($data['mode'] ?? 'text');
$text = (string)($data['text'] ?? '');
$templateKey = (string)($data['template_key'] ?? '');

if ($to === '') bm_json(['success' => false, 'error' => 'Missing "to"'], 400);

try {
    $pdo = bm_pdo();
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wa_message_id VARCHAR(120) NULL,
        direction VARCHAR(10) NOT NULL,
        from_number VARCHAR(40) NULL,
        to_number VARCHAR(40) NULL,
        body_text LONGTEXT NULL,
        ts BIGINT NULL,
        raw_json LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(direction),
        INDEX(ts),
        INDEX(from_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_contacts (
        wa_number VARCHAR(40) NOT NULL PRIMARY KEY,
        display_name VARCHAR(120) NULL,
        assigned_to INT NULL,
        suite_key VARCHAR(60) NULL,
        stage VARCHAR(40) NULL,
        notes LONGTEXT NULL,
        last_inbound_ts BIGINT NULL,
        last_outbound_ts BIGINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(assigned_to),
        INDEX(suite_key),
        INDEX(last_inbound_ts)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kind VARCHAR(40) NOT NULL DEFAULT 'text',
        template_key VARCHAR(80) NOT NULL UNIQUE,
        title VARCHAR(120) NOT NULL,
        body_text LONGTEXT NULL,
        meta_template_name VARCHAR(120) NULL,
        meta_language VARCHAR(20) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(kind),
        INDEX(is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $nowMs = (int)(microtime(true) * 1000);
    $toDigits = bm_wa_norm($to);

    $result = null;
    $sentText = null;

    if ($mode === 'template') {
        if ($templateKey === '') bm_json(['success' => false, 'error' => 'Missing template_key'], 400);
        $stmtT = $pdo->prepare("SELECT * FROM bm_whatsapp_templates WHERE template_key = :k AND is_active = 1 LIMIT 1");
        $stmtT->execute([':k' => $templateKey]);
        $tpl = $stmtT->fetch();
        if (!$tpl) bm_json(['success' => false, 'error' => 'Template not found'], 404);
        $kind = (string)($tpl['kind'] ?? 'text');

        if ($kind === 'meta_template') {
            $tName = (string)($tpl['meta_template_name'] ?? '');
            $lang = (string)($tpl['meta_language'] ?? '');
            if ($tName === '' || $lang === '') bm_json(['success' => false, 'error' => 'Template meta fields missing'], 400);
            $result = bm_wa_send_template($toDigits, $tName, $lang);
            $sentText = '[template] ' . $templateKey;
        } else {
            $body = (string)($tpl['body_text'] ?? '');
            if ($body === '') bm_json(['success' => false, 'error' => 'Template body missing'], 400);
            $result = bm_wa_send_text($toDigits, $body);
            $sentText = $body;
        }
    } else {
        if ($text === '') bm_json(['success' => false, 'error' => 'Missing text'], 400);
        $stmtC = $pdo->prepare("SELECT last_inbound_ts FROM bm_whatsapp_contacts WHERE wa_number = :n LIMIT 1");
        $stmtC->execute([':n' => $toDigits]);
        $row = $stmtC->fetch();
        $lastInbound = (int)($row['last_inbound_ts'] ?? 0);
        if ($lastInbound > 0 && ($nowMs - $lastInbound) > (24 * 60 * 60 * 1000)) {
            bm_json(['success' => false, 'error' => 'Outside 24h window. Use template mode.'], 400);
        }

        $result = bm_wa_send_text($toDigits, $text);
        $sentText = $text;
    }

    $rawJson = null;
    $waMessageId = null;
    if (is_array($result)) {
        $rawJson = isset($result['body']) && is_string($result['body']) ? $result['body'] : null;
        $decoded = is_string($rawJson) ? json_decode($rawJson, true) : null;
        if (is_array($decoded) && is_array($decoded['messages'][0] ?? null)) {
            $waMessageId = (string)($decoded['messages'][0]['id'] ?? '');
            if ($waMessageId === '') $waMessageId = null;
        }
    }

    $stmtLog = $pdo->prepare("INSERT INTO bm_whatsapp_messages (wa_message_id, direction, to_number, body_text, ts, raw_json)
        VALUES (:wa_message_id, 'out', :to_number, :body_text, :ts, :raw_json)");
    $stmtLog->execute([
        ':wa_message_id' => $waMessageId,
        ':to_number' => $toDigits,
        ':body_text' => $sentText,
        ':ts' => $nowMs,
        ':raw_json' => $rawJson,
    ]);

    $stmtUpsert = $pdo->prepare("INSERT INTO bm_whatsapp_contacts (wa_number, last_outbound_ts)
        VALUES (:n, :ts)
        ON DUPLICATE KEY UPDATE last_outbound_ts = GREATEST(COALESCE(last_outbound_ts, 0), VALUES(last_outbound_ts))");
    $stmtUpsert->execute([':n' => $toDigits, ':ts' => $nowMs]);

    if (!is_array($result) || !($result['ok'] ?? false)) {
        bm_json(['success' => false, 'error' => 'Send failed', 'details' => $result], 502);
    }

    bm_json(['success' => true, 'result' => $result]);
} catch (Throwable $e) {
    bm_json(['success' => false, 'error' => 'Server error'], 500);
}

