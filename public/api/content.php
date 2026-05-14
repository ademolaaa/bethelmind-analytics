<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function safe_decode(?string $json, string $kind)
{
    if (!$json) return null;
    $trim = trim($json);
    if ($trim === '' || $trim === '{}' || $trim === 'null') return null;
    $data = json_decode($json, true);
    if ($kind === 'array' && is_array($data)) return $data;
    return null;
}

try {
    $siteContent = safe_decode(bm_setting_get('site_content'), 'array');
    $solutions = safe_decode(bm_setting_get('solutions'), 'array') ?? [];
    $blogPosts = safe_decode(bm_setting_get('blog_posts'), 'array') ?? [];

    $pdo = bm_pdo();
    $rows = $pdo->query('SELECT slug, meta_title, meta_description, og_image, robots, updated_at FROM cms_pages ORDER BY slug ASC')->fetchAll();
    if (!is_array($rows)) $rows = [];
    $meta = [];
    foreach ($rows as $r) {
        $slug = (string)($r['slug'] ?? '');
        if ($slug === '') continue;
        $meta[$slug] = [
            'title' => (string)($r['meta_title'] ?? ''),
            'description' => (string)($r['meta_description'] ?? ''),
            'ogImage' => (string)($r['og_image'] ?? ''),
            'robots' => (string)($r['robots'] ?? ''),
            'updatedAt' => (string)($r['updated_at'] ?? ''),
        ];
    }

    bm_json([
        'site_content' => $siteContent,
        'solutions' => $solutions,
        'blog_posts' => $blogPosts,
        'meta' => $meta,
    ]);
} catch (Throwable $e) {
    bm_json(['error' => $e->getMessage()], 500);
}

