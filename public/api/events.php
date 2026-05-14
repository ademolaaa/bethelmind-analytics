<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    bm_json(['success' => false, 'error' => 'Method not allowed'], 405);
}

function bm_events_ensure_tables(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_funnel_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(80) NOT NULL UNIQUE,
        lead_id VARCHAR(80) NOT NULL,
        session_id VARCHAR(80) NOT NULL,
        name VARCHAR(80) NOT NULL,
        ts BIGINT NOT NULL,
        props_json LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(name),
        INDEX(ts),
        INDEX(lead_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

$data = bm_request_json();
$eventId = (string)($data['event_id'] ?? '');
$leadId = (string)($data['lead_id'] ?? '');
$sessionId = (string)($data['session_id'] ?? '');
$name = (string)($data['name'] ?? '');
$ts = (int)($data['ts'] ?? 0);
$props = $data['props'] ?? null;

if ($eventId === '' || $leadId === '' || $sessionId === '' || $name === '' || $ts <= 0) {
    bm_json(['success' => false, 'error' => 'Missing required fields'], 400);
}

$propsJson = null;
if ($props !== null) {
    $propsJson = json_encode($props, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($propsJson)) $propsJson = null;
}

try {
    $pdo = bm_pdo();
    bm_events_ensure_tables($pdo);
    $stmt = $pdo->prepare("INSERT IGNORE INTO bm_funnel_events (event_id, lead_id, session_id, name, ts, props_json)
        VALUES (:event_id, :lead_id, :session_id, :name, :ts, :props_json)");
    $stmt->execute([
        ':event_id' => $eventId,
        ':lead_id' => $leadId,
        ':session_id' => $sessionId,
        ':name' => $name,
        ':ts' => $ts,
        ':props_json' => $propsJson,
    ]);

    bm_json(['success' => true]);
} catch (Throwable $e) {
    bm_json(['success' => false, 'error' => 'Server error'], 500);
}

