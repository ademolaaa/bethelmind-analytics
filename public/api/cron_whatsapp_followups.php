<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

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

function bm_wa_send_text(string $toDigits, string $text): array
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return ['ok' => false, 'error' => 'WhatsApp provider not configured'];

    $token = (string)($wa['access_token'] ?? '');
    $phoneNumberId = (string)($wa['phone_number_id'] ?? '');
    if ($token === '' || $phoneNumberId === '') return ['ok' => false, 'error' => 'Missing WhatsApp credentials'];

    $url = "https://graph.facebook.com/v19.0/" . rawurlencode($phoneNumberId) . "/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $toDigits,
        'type' => 'text',
        'text' => ['body' => $text],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($payload)) return ['ok' => false, 'error' => 'JSON encode error'];

    return bm_http_post_json($url, [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json',
    ], $payload, 10);
}

function bm_wa_send_template(string $toDigits, string $templateName, string $langCode): array
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return ['ok' => false, 'error' => 'WhatsApp provider not configured'];

    $token = (string)($wa['access_token'] ?? '');
    $phoneNumberId = (string)($wa['phone_number_id'] ?? '');
    if ($token === '' || $phoneNumberId === '') return ['ok' => false, 'error' => 'Missing WhatsApp credentials'];

    $url = "https://graph.facebook.com/v19.0/" . rawurlencode($phoneNumberId) . "/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'to' => $toDigits,
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

$cfg = bm_config();
$expected = (string)($cfg['cron']['token'] ?? '');
$sent = (string)($_GET['token'] ?? '');
if ($expected === '' || $sent === '' || !hash_equals($expected, $sent)) {
    bm_json(['success' => false, 'error' => 'Forbidden'], 403);
}

try {
    $pdo = bm_pdo();
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_followups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wa_number VARCHAR(40) NOT NULL,
        template_id INT NULL,
        body_text LONGTEXT NULL,
        scheduled_at BIGINT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        attempts INT NOT NULL DEFAULT 0,
        last_error VARCHAR(255) NULL,
        sent_at BIGINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(status),
        INDEX(scheduled_at),
        INDEX(wa_number)
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

    $nowMs = (int)(microtime(true) * 1000);

    $stmt = $pdo->prepare("SELECT * FROM bm_whatsapp_followups
        WHERE status = 'pending' AND scheduled_at <= :now AND attempts < 3
        ORDER BY scheduled_at ASC
        LIMIT 25");
    $stmt->execute([':now' => $nowMs]);
    $rows = $stmt->fetchAll();

    $processed = 0;
    $sentCount = 0;
    $blocked = 0;

    foreach ($rows as $row) {
        $processed++;
        $id = (int)($row['id'] ?? 0);
        $to = bm_wa_norm((string)($row['wa_number'] ?? ''));
        if ($to === '' || $id <= 0) continue;

        $stmtC = $pdo->prepare("SELECT last_inbound_ts FROM bm_whatsapp_contacts WHERE wa_number = :n LIMIT 1");
        $stmtC->execute([':n' => $to]);
        $c = $stmtC->fetch();
        $lastInbound = (int)($c['last_inbound_ts'] ?? 0);
        $within24h = $lastInbound > 0 && ($nowMs - $lastInbound) <= (24 * 60 * 60 * 1000);

        $templateId = $row['template_id'] ?? null;
        $bodyText = isset($row['body_text']) ? (string)$row['body_text'] : '';

        $sendResult = null;
        $sentText = null;

        if ($templateId !== null && $templateId !== '') {
            $stmtT = $pdo->prepare("SELECT * FROM bm_whatsapp_templates WHERE id = :id AND is_active = 1 LIMIT 1");
            $stmtT->execute([':id' => (int)$templateId]);
            $tpl = $stmtT->fetch();
            if ($tpl) {
                $kind = (string)($tpl['kind'] ?? 'text');
                if ($kind === 'meta_template') {
                    $tName = (string)($tpl['meta_template_name'] ?? '');
                    $lang = (string)($tpl['meta_language'] ?? '');
                    if ($tName !== '' && $lang !== '') {
                        $sendResult = bm_wa_send_template($to, $tName, $lang);
                        $sentText = '[template] ' . (string)($tpl['template_key'] ?? '');
                    }
                } else {
                    $tplText = (string)($tpl['body_text'] ?? '');
                    if ($tplText !== '') $bodyText = $tplText;
                }
            }
        }

        if ($sendResult === null) {
            if ($bodyText === '') {
                $pdo->prepare("UPDATE bm_whatsapp_followups SET status = 'failed', attempts = attempts + 1, last_error = 'Missing message' WHERE id = :id")->execute([':id' => $id]);
                continue;
            }
            if (!$within24h) {
                $blocked++;
                $pdo->prepare("UPDATE bm_whatsapp_followups SET status = 'blocked', last_error = 'Outside 24h window' WHERE id = :id")->execute([':id' => $id]);
                continue;
            }
            $sendResult = bm_wa_send_text($to, $bodyText);
            $sentText = $bodyText;
        }

        $ok = (bool)($sendResult['ok'] ?? false);
        $rawJson = isset($sendResult['body']) && is_string($sendResult['body']) ? $sendResult['body'] : null;

        if ($ok) {
            $sentCount++;
            $pdo->prepare("UPDATE bm_whatsapp_followups SET status = 'sent', sent_at = :ts WHERE id = :id")->execute([':ts' => $nowMs, ':id' => $id]);
            $pdo->prepare("INSERT INTO bm_whatsapp_messages (direction, to_number, body_text, ts, raw_json) VALUES ('out', :to, :body, :ts, :raw)")
                ->execute([':to' => $to, ':body' => $sentText, ':ts' => $nowMs, ':raw' => $rawJson]);
            $pdo->prepare("INSERT INTO bm_whatsapp_contacts (wa_number, last_outbound_ts) VALUES (:n, :ts) ON DUPLICATE KEY UPDATE last_outbound_ts = GREATEST(COALESCE(last_outbound_ts, 0), VALUES(last_outbound_ts))")
                ->execute([':n' => $to, ':ts' => $nowMs]);
        } else {
            $err = (string)($sendResult['error'] ?? 'Send failed');
            $pdo->prepare("UPDATE bm_whatsapp_followups SET status = 'failed', attempts = attempts + 1, last_error = :e WHERE id = :id")->execute([':e' => $err, ':id' => $id]);
        }
    }

    bm_json(['success' => true, 'processed' => $processed, 'sent' => $sentCount, 'blocked' => $blocked]);
} catch (Throwable $e) {
    bm_json(['success' => false, 'error' => 'Server error'], 500);
}

