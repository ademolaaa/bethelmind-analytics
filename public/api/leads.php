<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    bm_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

function bm_leads_ensure_tables(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_leads (
        lead_id VARCHAR(80) NOT NULL PRIMARY KEY,
        name VARCHAR(120) NULL,
        email VARCHAR(190) NULL,
        phone VARCHAR(40) NULL,
        channel VARCHAR(40) NULL,
        source VARCHAR(120) NULL,
        subject VARCHAR(190) NULL,
        message LONGTEXT NULL,
        path VARCHAR(255) NULL,
        first_touch_json LONGTEXT NULL,
        last_touch_json LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(email),
        INDEX(source),
        INDEX(channel)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

function bm_extract_contact_email(PDO $pdo): string
{
    $val = bm_setting_get('site_content');
    if (!is_string($val) || trim($val) === '') return 'support@bethelmind.com';
    $data = json_decode($val, true);
    if (!is_array($data)) return 'support@bethelmind.com';
    $email = $data['contact']['info']['email'] ?? null;
    if (!is_string($email) || trim($email) === '') return 'support@bethelmind.com';
    return $email;
}

function bm_send_lead_email(string $to, string $subject, string $body): void
{
    $headers = [];
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-type: text/plain; charset=UTF-8';
    $headers[] = 'From: Bethelmind Website <noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '>';
    @mail($to, $subject, $body, implode("\r\n", $headers));
}

function bm_leads_ensure_ai_table(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_lead_ai (
        lead_id VARCHAR(80) NOT NULL PRIMARY KEY,
        provider VARCHAR(40) NOT NULL,
        model VARCHAR(80) NULL,
        suite_key VARCHAR(60) NULL,
        confidence DECIMAL(5,4) NULL,
        summary VARCHAR(255) NULL,
        reply_subject VARCHAR(190) NULL,
        reply_body LONGTEXT NULL,
        raw_json LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(provider),
        INDEX(suite_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
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

function bm_wa_norm(string $n): string
{
    $n = trim($n);
    $n = preg_replace('~[^\d+]~', '', $n) ?? '';
    if ($n === '') return '';
    if ($n[0] === '+') $n = substr($n, 1);
    return $n;
}

function bm_whatsapp_send_text(string $toE164orDigits, string $text): void
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return;
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

function bm_whatsapp_notify_admins(array $lead, string $messageText): void
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return;
    $admins = $wa['admin_numbers'] ?? [];
    if (!is_array($admins) || count($admins) === 0) return;

    foreach ($admins as $n) {
        if (!is_string($n) || trim($n) === '') continue;
        bm_whatsapp_send_text($n, $messageText);
    }
}

function bm_extract_first_json_object(string $text): ?array
{
    $start = strpos($text, '{');
    if ($start === false) return null;
    $end = strrpos($text, '}');
    if ($end === false || $end <= $start) return null;
    $slice = substr($text, $start, $end - $start + 1);
    $data = json_decode($slice, true);
    return is_array($data) ? $data : null;
}

function bm_gemini_enrich_lead(array $lead): ?array
{
    $cfg = bm_config();
    $key = (string)($cfg['ai']['gemini_api_key'] ?? '');
    $model = (string)($cfg['ai']['gemini_model'] ?? 'gemini-2.5-flash-lite');
    if ($key === '') return null;

    $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" . rawurlencode($model) . ":generateContent?key=" . rawurlencode($key);

    $suiteKeys = ['education-suite', 'commerce-suite', 'healthcare-suite', 'real-estate-suite', 'logistics-suite', 'growth-suite'];

    $prompt = [
        'You are a sales assistant for Bethelmind Analytics.',
        'Classify this inbound lead into the best product suite and produce a short, practical follow-up email draft.',
        'Return ONLY valid JSON (no markdown, no extra text).',
        'JSON schema:',
        '{',
        '  "suite_key": "education-suite|commerce-suite|healthcare-suite|real-estate-suite|logistics-suite|growth-suite",',
        '  "confidence": 0.0,',
        '  "summary": "one sentence summary (max 180 chars)",',
        '  "reply_subject": "short subject",',
        '  "reply_body": "email body in plain text, 6-12 lines, with 3 short questions",',
        '  "recommended_next_step": "whatsapp|email|call|booking"',
        '}',
        'Lead details:',
        json_encode($lead, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
        'Notes:',
        '- Prefer Nigeria-specific language.',
        '- If unsure, choose growth-suite.',
        '- Keep it cost-conscious and action-driven.',
    ];

    $payload = json_encode([
        'contents' => [
            ['role' => 'user', 'parts' => [['text' => implode("\n", $prompt)]]],
        ],
        'generationConfig' => [
            'temperature' => 0.2,
            'maxOutputTokens' => 400,
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($payload)) return null;

    $res = bm_http_post_json($endpoint, ['Content-Type' => 'application/json'], $payload, 10);
    if (!$res['ok']) return ['raw' => $res['body'], 'error' => 'gemini_http_error', 'code' => $res['code']];

    $decoded = json_decode($res['body'], true);
    $text = null;
    if (is_array($decoded)) {
        $text = $decoded['candidates'][0]['content']['parts'][0]['text'] ?? null;
    }
    if (!is_string($text)) $text = $res['body'];

    $json = bm_extract_first_json_object($text);
    if (!is_array($json)) return ['raw' => $res['body'], 'error' => 'gemini_parse_error'];

    $suite = (string)($json['suite_key'] ?? '');
    if (!in_array($suite, $suiteKeys, true)) $json['suite_key'] = 'growth-suite';
    $conf = $json['confidence'] ?? null;
    if (!is_numeric($conf)) $json['confidence'] = 0.4;
    $json['raw'] = $res['body'];
    $json['model'] = $model;
    return $json;
}

$data = bm_request_json();
$leadId = (string)($data['lead_id'] ?? '');
if ($leadId === '') bm_json(['success' => false, 'error' => 'Missing lead_id'], 400);

$name = isset($data['name']) ? trim((string)$data['name']) : null;
$email = isset($data['email']) ? trim((string)$data['email']) : null;
$phone = isset($data['phone']) ? trim((string)$data['phone']) : null;
$channel = isset($data['channel']) ? trim((string)$data['channel']) : null;
$source = isset($data['source']) ? trim((string)$data['source']) : null;
$subject = isset($data['subject']) ? trim((string)$data['subject']) : null;
$message = isset($data['message']) ? (string)$data['message'] : null;
$path = isset($data['path']) ? trim((string)$data['path']) : null;

$firstTouchJson = null;
if (isset($data['first_touch']) && is_array($data['first_touch'])) {
    $firstTouchJson = json_encode($data['first_touch'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}
$lastTouchJson = null;
if (isset($data['last_touch']) && is_array($data['last_touch'])) {
    $lastTouchJson = json_encode($data['last_touch'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

try {
    $pdo = bm_pdo();
    bm_leads_ensure_tables($pdo);

    $stmt = $pdo->prepare("INSERT INTO bm_leads
        (lead_id, name, email, phone, channel, source, subject, message, path, first_touch_json, last_touch_json)
        VALUES
        (:lead_id, :name, :email, :phone, :channel, :source, :subject, :message, :path, :first_touch_json, :last_touch_json)
        ON DUPLICATE KEY UPDATE
          name = COALESCE(VALUES(name), name),
          email = COALESCE(VALUES(email), email),
          phone = COALESCE(VALUES(phone), phone),
          channel = COALESCE(VALUES(channel), channel),
          source = COALESCE(VALUES(source), source),
          subject = COALESCE(VALUES(subject), subject),
          message = COALESCE(VALUES(message), message),
          path = COALESCE(VALUES(path), path),
          first_touch_json = COALESCE(VALUES(first_touch_json), first_touch_json),
          last_touch_json = COALESCE(VALUES(last_touch_json), last_touch_json)");

    $stmt->execute([
        ':lead_id' => $leadId,
        ':name' => ($name !== '' ? $name : null),
        ':email' => ($email !== '' ? $email : null),
        ':phone' => ($phone !== '' ? $phone : null),
        ':channel' => ($channel !== '' ? $channel : null),
        ':source' => ($source !== '' ? $source : null),
        ':subject' => ($subject !== '' ? $subject : null),
        ':message' => ($message !== '' ? $message : null),
        ':path' => ($path !== '' ? $path : null),
        ':first_touch_json' => $firstTouchJson,
        ':last_touch_json' => $lastTouchJson,
    ]);

    $to = bm_extract_contact_email($pdo);
    $safeSubject = ($subject && $subject !== '') ? $subject : 'Website inquiry';
    $emailSubject = "[Bethelmind Lead] {$safeSubject}";

    $bodyLines = [];
    $bodyLines[] = "New lead from Bethelmind website";
    $bodyLines[] = "";
    $bodyLines[] = "Lead ID: {$leadId}";
    if ($channel) $bodyLines[] = "Channel: {$channel}";
    if ($source) $bodyLines[] = "Source: {$source}";
    if ($path) $bodyLines[] = "Path: {$path}";
    if ($name) $bodyLines[] = "Name: {$name}";
    if ($email) $bodyLines[] = "Email: {$email}";
    if ($phone) $bodyLines[] = "Phone: {$phone}";
    $bodyLines[] = "";
    if ($message) {
        $bodyLines[] = "Message:";
        $bodyLines[] = $message;
        $bodyLines[] = "";
    }
    if ($firstTouchJson) $bodyLines[] = "First touch: {$firstTouchJson}";
    if ($lastTouchJson) $bodyLines[] = "Last touch: {$lastTouchJson}";

    $cfg = bm_config();
    $aiProvider = (string)($cfg['ai']['provider'] ?? '');
    if ($aiProvider === 'gemini' && (string)($cfg['ai']['gemini_api_key'] ?? '') !== '') {
        $ai = bm_gemini_enrich_lead([
            'lead_id' => $leadId,
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'channel' => $channel,
            'source' => $source,
            'subject' => $subject,
            'path' => $path,
            'message' => $message,
            'first_touch' => $firstTouchJson ? json_decode($firstTouchJson, true) : null,
            'last_touch' => $lastTouchJson ? json_decode($lastTouchJson, true) : null,
        ]);

        if (is_array($ai) && !isset($ai['error'])) {
            bm_leads_ensure_ai_table($pdo);
            $stmt2 = $pdo->prepare("INSERT INTO bm_lead_ai
                (lead_id, provider, model, suite_key, confidence, summary, reply_subject, reply_body, raw_json)
                VALUES
                (:lead_id, :provider, :model, :suite_key, :confidence, :summary, :reply_subject, :reply_body, :raw_json)
                ON DUPLICATE KEY UPDATE
                  provider = VALUES(provider),
                  model = VALUES(model),
                  suite_key = VALUES(suite_key),
                  confidence = VALUES(confidence),
                  summary = VALUES(summary),
                  reply_subject = VALUES(reply_subject),
                  reply_body = VALUES(reply_body),
                  raw_json = VALUES(raw_json)");
            $stmt2->execute([
                ':lead_id' => $leadId,
                ':provider' => 'gemini',
                ':model' => (string)($ai['model'] ?? ''),
                ':suite_key' => (string)($ai['suite_key'] ?? ''),
                ':confidence' => (float)($ai['confidence'] ?? 0.0),
                ':summary' => (string)($ai['summary'] ?? ''),
                ':reply_subject' => (string)($ai['reply_subject'] ?? ''),
                ':reply_body' => (string)($ai['reply_body'] ?? ''),
                ':raw_json' => (string)($ai['raw'] ?? ''),
            ]);

            $bodyLines[] = "";
            $bodyLines[] = "AI enrichment:";
            $bodyLines[] = "Suite: " . (string)($ai['suite_key'] ?? '');
            $bodyLines[] = "Confidence: " . (string)($ai['confidence'] ?? '');
            if (!empty($ai['summary'])) $bodyLines[] = "Summary: " . (string)$ai['summary'];
            if (!empty($ai['reply_body'])) {
                $bodyLines[] = "";
                $bodyLines[] = "Suggested reply:";
                if (!empty($ai['reply_subject'])) $bodyLines[] = "Subject: " . (string)$ai['reply_subject'];
                $bodyLines[] = (string)$ai['reply_body'];
            }
        }
    }
    $body = implode("\n", $bodyLines);

    bm_send_lead_email($to, $emailSubject, $body);

    $notifyTextLines = [];
    $notifyTextLines[] = "New lead: " . ($safeSubject ?: "Website inquiry");
    if ($name) $notifyTextLines[] = "Name: {$name}";
    if ($email) $notifyTextLines[] = "Email: {$email}";
    if ($phone) $notifyTextLines[] = "Phone: {$phone}";
    if ($source) $notifyTextLines[] = "Source: {$source}";
    if ($path) $notifyTextLines[] = "Page: {$path}";
    $notifyText = implode("\n", $notifyTextLines);
    bm_whatsapp_notify_admins(['lead_id' => $leadId], $notifyText);

    bm_json(['success' => true]);
} catch (Throwable $e) {
    bm_json(['success' => false, 'error' => 'Server error'], 500);
}
