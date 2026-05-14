<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function bm_wa_ensure_table(PDO $pdo): void
{
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
}

function bm_wa_ensure_contacts(PDO $pdo): void
{
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
}

function bm_wa_guess_suite(?string $text): ?string
{
    if (!is_string($text)) return null;
    $t = strtolower($text);
    $map = [
        'education-suite' => ['school', 'student', 'fees', 'result', 'admission', 'cbt', 'portal'],
        'commerce-suite' => ['pos', 'inventory', 'stock', 'store', 'pharmacy', 'ecommerce', 'order'],
        'healthcare-suite' => ['clinic', 'hospital', 'appointment', 'queue', 'pharmacy', 'billing'],
        'real-estate-suite' => ['real estate', 'property', 'listing', 'agent', 'rent', 'sales'],
        'logistics-suite' => ['dispatch', 'delivery', 'rider', 'logistics', 'pod', 'tracking'],
        'growth-suite' => ['website', 'whatsapp', 'crm', 'invoice', 'collections', 'dashboard', 'leads'],
    ];
    foreach ($map as $suite => $keywords) {
        foreach ($keywords as $k) {
            if ($k !== '' && str_contains($t, $k)) return $suite;
        }
    }
    return null;
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

function bm_wa_send_text(string $toE164orDigits, string $text): void
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $token = (string)($wa['access_token'] ?? '');
    $phoneNumberId = (string)($wa['phone_number_id'] ?? '');
    if ($token === '' || $phoneNumberId === '') return;

    $to = bm_wa_norm($toE164orDigits);
    if ($to === '') return;

    $url = "https://graph.facebook.com/v19.0/" . rawurlencode($phoneNumberId) . "/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $to,
        'type' => 'text',
        'text' => ['body' => $text],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($payload)) return;

    bm_http_post_json($url, [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json',
    ], $payload, 10);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$cfg = bm_config();
$verifyToken = (string)($cfg['whatsapp']['verify_token'] ?? '');

if ($method === 'GET') {
    $mode = (string)($_GET['hub_mode'] ?? $_GET['hub.mode'] ?? '');
    $token = (string)($_GET['hub_verify_token'] ?? $_GET['hub.verify_token'] ?? '');
    $challenge = (string)($_GET['hub_challenge'] ?? $_GET['hub.challenge'] ?? '');

    if ($mode === 'subscribe' && $verifyToken !== '' && hash_equals($verifyToken, $token)) {
        header('Content-Type: text/plain; charset=utf-8');
        echo $challenge;
        exit;
    }
    bm_json(['success' => false, 'error' => 'Verification failed'], 403);
}

if ($method !== 'POST') {
    bm_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

$raw = file_get_contents('php://input');
if (!is_string($raw)) $raw = '';
$payload = json_decode($raw, true);
if (!is_array($payload)) bm_json(['success' => false, 'error' => 'Invalid JSON'], 400);

try {
    $pdo = bm_pdo();
    bm_wa_ensure_table($pdo);
    bm_wa_ensure_contacts($pdo);

    $entry = $payload['entry'][0] ?? null;
    $changes = is_array($entry) ? ($entry['changes'][0]['value'] ?? null) : null;
    if (!is_array($changes)) bm_json(['success' => true]);

    $contactNameByNumber = [];
    $contacts = $changes['contacts'] ?? null;
    if (is_array($contacts)) {
        foreach ($contacts as $c) {
            if (!is_array($c)) continue;
            $waId = (string)($c['wa_id'] ?? '');
            $name = $c['profile']['name'] ?? null;
            if ($waId !== '' && is_string($name) && trim($name) !== '') {
                $contactNameByNumber[$waId] = trim($name);
            }
        }
    }

    $messages = $changes['messages'] ?? null;
    if (!is_array($messages) || count($messages) === 0) bm_json(['success' => true]);

    foreach ($messages as $m) {
        if (!is_array($m)) continue;
        $waId = (string)($m['id'] ?? '');
        $from = (string)($m['from'] ?? '');
        $ts = isset($m['timestamp']) ? (int)$m['timestamp'] * 1000 : null;
        $text = $m['text']['body'] ?? null;
        $bodyText = is_string($text) ? $text : null;

        $stmt = $pdo->prepare("INSERT INTO bm_whatsapp_messages (wa_message_id, direction, from_number, body_text, ts, raw_json)
            VALUES (:wa_message_id, 'in', :from_number, :body_text, :ts, :raw_json)");
        $stmt->execute([
            ':wa_message_id' => ($waId !== '' ? $waId : null),
            ':from_number' => ($from !== '' ? $from : null),
            ':body_text' => $bodyText,
            ':ts' => $ts,
            ':raw_json' => $raw,
        ]);

        if ($from !== '') {
            $displayName = $contactNameByNumber[$from] ?? null;
            $guessedSuite = bm_wa_guess_suite($bodyText);
            $stmtC = $pdo->prepare("INSERT INTO bm_whatsapp_contacts (wa_number, display_name, suite_key, last_inbound_ts)
                VALUES (:wa_number, :display_name, :suite_key, :last_inbound_ts)
                ON DUPLICATE KEY UPDATE
                  display_name = COALESCE(VALUES(display_name), display_name),
                  suite_key = COALESCE(VALUES(suite_key), suite_key),
                  last_inbound_ts = GREATEST(COALESCE(last_inbound_ts, 0), VALUES(last_inbound_ts))");
            $stmtC->execute([
                ':wa_number' => $from,
                ':display_name' => (is_string($displayName) && $displayName !== '' ? $displayName : null),
                ':suite_key' => ($guessedSuite !== null ? $guessedSuite : null),
                ':last_inbound_ts' => $ts ?? (int)(microtime(true) * 1000),
            ]);
        }

        $autoEnabled = (bool)($cfg['whatsapp']['auto_reply_enabled'] ?? false);
        $autoText = (string)($cfg['whatsapp']['auto_reply_text'] ?? '');
        if ($autoEnabled && $autoText !== '' && $from !== '') {
            $admins = $cfg['whatsapp']['admin_numbers'] ?? [];
            $isAdmin = false;
            if (is_array($admins)) {
                $fromNorm = bm_wa_norm($from);
                foreach ($admins as $an) {
                    if (!is_string($an)) continue;
                    if (bm_wa_norm($an) === $fromNorm) {
                        $isAdmin = true;
                        break;
                    }
                }
            }
            if ($isAdmin) continue;

            $stmtLast = $pdo->prepare("SELECT assigned_to, last_outbound_ts FROM bm_whatsapp_contacts WHERE wa_number = :n LIMIT 1");
            $stmtLast->execute([':n' => $from]);
            $row = $stmtLast->fetch();
            $assignedTo = is_array($row) ? ($row['assigned_to'] ?? null) : null;
            $lastOut = is_array($row) ? (int)($row['last_outbound_ts'] ?? 0) : 0;
            if ($assignedTo !== null && $assignedTo !== '') continue;

            $nowMs = $ts ?? (int)(microtime(true) * 1000);
            if ($lastOut > 0 && ($nowMs - $lastOut) < (6 * 60 * 60 * 1000)) continue;

            bm_wa_send_text($from, $autoText);
            $stmt2 = $pdo->prepare("INSERT INTO bm_whatsapp_messages (direction, to_number, body_text, ts, raw_json)
                VALUES ('out', :to_number, :body_text, :ts, :raw_json)");
            $stmt2->execute([
                ':to_number' => $from,
                ':body_text' => $autoText,
                ':ts' => (int)(microtime(true) * 1000),
                ':raw_json' => null,
            ]);

            $stmtU = $pdo->prepare("UPDATE bm_whatsapp_contacts SET last_outbound_ts = :ts WHERE wa_number = :n");
            $stmtU->execute([':ts' => (int)(microtime(true) * 1000), ':n' => $from]);
        }
    }

    bm_json(['success' => true]);
} catch (Throwable $e) {
    bm_json(['success' => false, 'error' => 'Server error'], 500);
}

