<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin', 'editor']);

$pdo = bm_pdo();

$defaultPages = [
    ['slug' => '/', 'title' => 'Home'],
    ['slug' => '/solutions', 'title' => 'Solutions'],
    ['slug' => '/pricing', 'title' => 'Pricing'],
    ['slug' => '/about', 'title' => 'About'],
    ['slug' => '/contact', 'title' => 'Contact'],
    ['slug' => '/booking', 'title' => 'Booking'],
    ['slug' => '/free-audit', 'title' => 'Free audit'],
    ['slug' => '/whatsapp', 'title' => 'WhatsApp'],
    ['slug' => '/blog', 'title' => 'Blog'],
];

function fetch_pages(PDO $pdo): array
{
    $rows = $pdo->query('SELECT slug, meta_title, meta_description, og_image, robots FROM cms_pages ORDER BY slug ASC')->fetchAll();
    return is_array($rows) ? $rows : [];
}

function normalize_slug(string $slug): string
{
    $slug = trim($slug);
    if ($slug === '') return '';
    if ($slug[0] !== '/') $slug = '/' . $slug;
    $slug = preg_replace('~\s+~', '', $slug) ?? $slug;
    if (strlen($slug) > 1) $slug = rtrim($slug, '/');
    return $slug;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();
    $rows = $_POST['pages'] ?? [];
    if (!is_array($rows)) $rows = [];

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('INSERT INTO cms_pages (slug, meta_title, meta_description, og_image, robots) VALUES (:s, :t, :d, :i, :r)
            ON DUPLICATE KEY UPDATE meta_title = VALUES(meta_title), meta_description = VALUES(meta_description), og_image = VALUES(og_image), robots = VALUES(robots)');

        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $slug = normalize_slug((string)($row['slug'] ?? ''));
            $metaTitle = trim((string)($row['meta_title'] ?? ''));
            $metaDesc = trim((string)($row['meta_description'] ?? ''));
            $ogImage = trim((string)($row['og_image'] ?? ''));
            $robots = trim((string)($row['robots'] ?? ''));

            if ($slug === '' || $metaTitle === '' || $metaDesc === '') continue;
            if ($ogImage === '') $ogImage = null;
            if ($robots === '') $robots = null;

            $stmt->execute([
                ':s' => $slug,
                ':t' => mb_substr($metaTitle, 0, 120),
                ':d' => mb_substr($metaDesc, 0, 255),
                ':i' => $ogImage,
                ':r' => $robots,
            ]);
        }
        $pdo->commit();
        cms_flash_set('success', 'Meta saved successfully.');
        cms_redirect('/cms/meta.php');
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        cms_flash_set('error', $e->getMessage());
        cms_redirect('/cms/meta.php');
    }
}

$existing = fetch_pages($pdo);
$bySlug = [];
foreach ($existing as $row) {
    $s = (string)($row['slug'] ?? '');
    if ($s !== '') $bySlug[$s] = $row;
}

$rows = [];
foreach ($defaultPages as $p) {
    $slug = $p['slug'];
    $row = $bySlug[$slug] ?? [
        'slug' => $slug,
        'meta_title' => ($p['title'] . ' | Bethelmind Analytics'),
        'meta_description' => '',
        'og_image' => '',
        'robots' => '',
    ];
    $rows[] = $row;
}

foreach ($existing as $row) {
    $slug = (string)($row['slug'] ?? '');
    $known = array_filter($defaultPages, fn($p) => $p['slug'] === $slug);
    if (!$known) $rows[] = $row;
}

$cfg = bm_config();
$uploadsUrl = (string)($cfg['uploads']['url'] ?? '/uploads');
$media = [];
try {
    $stmt = $pdo->query('SELECT file_name, original_name, mime, uploaded_at FROM cms_media ORDER BY uploaded_at DESC LIMIT 20');
    $media = $stmt->fetchAll();
    if (!is_array($media)) $media = [];
} catch (Throwable) {
}

ob_start();
?>
<div class="muted">Edit SEO titles, descriptions, Open Graph image, and robots for each route.</div>

<form method="post" style="margin-top:14px">
  <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
  <table class="table" style="margin-top:10px">
    <thead>
      <tr>
        <th style="width:170px">Route</th>
        <th>Meta title</th>
        <th>Meta description</th>
        <th style="width:220px">OG image URL</th>
        <th style="width:160px">Robots</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($rows as $i => $row): ?>
        <tr>
          <td>
            <input name="pages[<?= $i ?>][slug]" value="<?= cms_h((string)($row['slug'] ?? '')) ?>" />
          </td>
          <td>
            <input name="pages[<?= $i ?>][meta_title]" value="<?= cms_h((string)($row['meta_title'] ?? '')) ?>" />
          </td>
          <td>
            <textarea name="pages[<?= $i ?>][meta_description]" style="min-height:70px"><?= cms_h((string)($row['meta_description'] ?? '')) ?></textarea>
          </td>
          <td>
            <input name="pages[<?= $i ?>][og_image]" value="<?= cms_h((string)($row['og_image'] ?? '')) ?>" placeholder="<?= cms_h($uploadsUrl . '/...') ?>" />
          </td>
          <td>
            <input name="pages[<?= $i ?>][robots]" value="<?= cms_h((string)($row['robots'] ?? '')) ?>" placeholder="index,follow" />
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>

  <div style="margin-top:12px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
    <button class="btn btn-primary" type="submit">Save meta</button>
  </div>
</form>

<div style="margin-top:22px;border-top:1px solid rgba(255,255,255,.10);padding-top:18px">
  <div style="font-weight:900">Quick copy: recent uploads</div>
  <div class="muted" style="margin-top:6px">Paste these into OG image URL fields.</div>
  <div style="margin-top:12px;display:grid;grid-template-columns:1fr;gap:10px">
    <?php foreach ($media as $m): $file = (string)($m['file_name'] ?? ''); if ($file === '') continue; $url = rtrim($uploadsUrl, '/') . '/' . $file; ?>
      <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <div style="font-weight:900"><?= cms_h((string)($m['original_name'] ?? $file)) ?></div>
          <div class="muted" style="margin-top:4px"><?= cms_h($url) ?></div>
        </div>
        <button class="btn" type="button" onclick="navigator.clipboard.writeText('<?= cms_h($url) ?>')">Copy URL</button>
      </div>
    <?php endforeach; ?>
    <?php if (count($media) === 0): ?>
      <div class="muted">No uploads yet. Upload images in Media.</div>
    <?php endif; ?>
  </div>
</div>
<?php
$content = ob_get_clean();
$title = 'Meta';
include __DIR__ . '/_layout.php';

