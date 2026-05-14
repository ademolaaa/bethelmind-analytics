<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

try {
    $pdo = bm_pdo();
    $rows = $pdo->query('SELECT slug, meta_title, meta_description, og_image, robots, updated_at FROM cms_pages ORDER BY slug ASC')->fetchAll();
    if (!is_array($rows)) $rows = [];
    $out = [];
    foreach ($rows as $r) {
        $slug = (string)($r['slug'] ?? '');
        if ($slug === '') continue;
        $out[$slug] = [
            'title' => (string)($r['meta_title'] ?? ''),
            'description' => (string)($r['meta_description'] ?? ''),
            'ogImage' => (string)($r['og_image'] ?? ''),
            'robots' => (string)($r['robots'] ?? ''),
            'updatedAt' => (string)($r['updated_at'] ?? ''),
        ];
    }
    bm_json($out);
} catch (Throwable $e) {
    bm_json(['error' => $e->getMessage()], 500);
}

