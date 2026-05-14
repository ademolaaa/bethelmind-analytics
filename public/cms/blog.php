<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin', 'editor']);

$raw = bm_setting_get('blog_posts');
$data = json_decode((string)$raw, true);
if (!is_array($data)) $data = [];

function validate_posts(array $arr): void
{
    foreach ($arr as $i => $p) {
        if (!is_array($p)) throw new RuntimeException("Post #{$i} must be an object.");
        $slug = (string)($p['slug'] ?? '');
        $title = (string)($p['title'] ?? '');
        $description = (string)($p['description'] ?? '');
        if ($slug === '' || $title === '' || $description === '') throw new RuntimeException("Post #{$i} requires slug, title, description.");
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();
    try {
        $json = (string)($_POST['json'] ?? '');
        $decoded = json_decode($json, true);
        if (!is_array($decoded)) throw new RuntimeException('Invalid JSON. Expected an array of posts.');
        validate_posts($decoded);
        $encoded = json_encode($decoded, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (!is_string($encoded)) throw new RuntimeException('Failed to encode JSON.');
        bm_setting_set('blog_posts', $encoded);
        cms_flash_set('success', 'Blog posts saved.');
        cms_redirect('/cms/blog.php');
    } catch (Throwable $e) {
        cms_flash_set('error', $e->getMessage());
        cms_redirect('/cms/blog.php');
    }
}

ob_start();
?>
<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap">
  <div>
    <div style="font-weight:900;font-size:16px">Blog content</div>
    <div class="muted" style="margin-top:6px">
      This controls <strong>/blog</strong> and <strong>/blog/:slug</strong> when the frontend is configured to load from <strong>/api/content.php</strong>.
    </div>
  </div>
  <div class="pill"><?= count($data) ?> post(s)</div>
</div>

<div style="margin-top:14px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
  <div class="muted" style="font-weight:900">Schema</div>
  <div class="muted" style="margin-top:8px;line-height:1.6">
    Required fields per item: <strong>slug</strong>, <strong>title</strong>, <strong>description</strong>.<br />
    Recommended fields: date, tags, ogImage, blocks (h2/h3/p/ul/cta/links).
  </div>
</div>

<form method="post" style="margin-top:14px">
  <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
  <label>blog_posts JSON</label>
  <textarea name="json" style="min-height:420px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"><?= cms_h(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '[]') ?></textarea>
  <div style="margin-top:12px;display:flex;justify-content:flex-end">
    <button class="btn btn-primary" type="submit">Save blog posts</button>
  </div>
</form>
<?php
$content = ob_get_clean();
$title = 'Blog';
include __DIR__ . '/_layout.php';

