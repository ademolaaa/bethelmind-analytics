<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $val = bm_setting_get('site_content');
    if (!$val) bm_json(null);
    $trim = trim($val);
    if ($trim === '' || $trim === '{}' || $trim === 'null') bm_json(null);
    $decoded = json_decode($val, true);
    if (!is_array($decoded) || count($decoded) === 0) bm_json(null);
    bm_raw_json($val);
} catch (Throwable $e) {
    bm_json(['error' => $e->getMessage()], 500);
}
