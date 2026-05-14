<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
$pdo = bm_pdo();

$contentVal = null;
$contentUpdatedAt = null;
try {
    $stmt = $pdo->prepare("SELECT setting_value, updated_at FROM app_settings WHERE setting_key = 'site_content' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch();
    if ($row) {
        $contentVal = is_string($row['setting_value'] ?? null) ? (string)$row['setting_value'] : null;
        $contentUpdatedAt = (string)($row['updated_at'] ?? '');
    }
} catch (Throwable) {
}

$mediaCount = 0;
$userCount = 0;
try {
    $mediaCount = (int)$pdo->query('SELECT COUNT(*) AS c FROM cms_media')->fetch()['c'];
} catch (Throwable) {
}
if ((string)$user['role'] === 'admin') {
    try {
        $userCount = (int)$pdo->query('SELECT COUNT(*) AS c FROM cms_users')->fetch()['c'];
    } catch (Throwable) {
    }
}

$hasContent = $contentVal && trim($contentVal) !== '' && trim($contentVal) !== '{}' && trim($contentVal) !== 'null';

ob_start();
?>
<div class="grid">
  <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:14px;background:rgba(255,255,255,.02)">
    <div class="pill">Content</div>
    <div style="margin-top:10px;font-size:26px;font-weight:900"><?= $hasContent ? 'Configured' : 'Using fallback' ?></div>
    <div class="muted" style="margin-top:6px">Last update: <?= $contentUpdatedAt ? cms_h($contentUpdatedAt) : '—' ?></div>
    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
      <a class="btn btn-primary" href="/cms/content.php">Edit content</a>
      <a class="btn" href="/cms/meta.php">Edit SEO meta</a>
    </div>
  </div>

  <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:14px;background:rgba(255,255,255,.02)">
    <div class="pill">Media</div>
    <div style="margin-top:10px;font-size:26px;font-weight:900"><?= (int)$mediaCount ?></div>
    <div class="muted" style="margin-top:6px">Uploaded assets available for use across the site.</div>
    <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
      <a class="btn btn-primary" href="/cms/media.php">Upload & manage</a>
      <a class="btn" href="/" target="_blank" rel="noopener">View site</a>
    </div>
  </div>
</div>

<div style="margin-top:16px;border-top:1px solid rgba(255,255,255,.10);padding-top:16px">
  <div class="grid">
    <div>
      <div style="font-weight:900;font-size:16px">Quick actions</div>
      <div class="muted" style="margin-top:6px">Use these to safely update content without touching code.</div>
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
        <a class="btn" href="/cms/content.php">Edit website text</a>
        <a class="btn" href="/cms/meta.php">Edit titles & descriptions</a>
        <a class="btn" href="/cms/media.php">Upload images</a>
      </div>
    </div>
    <div>
      <div style="font-weight:900;font-size:16px">Access control</div>
      <div class="muted" style="margin-top:6px">
        Signed in as <strong><?= cms_h((string)$user['email']) ?></strong>.
        <?php if ((string)$user['role'] === 'admin'): ?>
          There are <strong><?= (int)$userCount ?></strong> user account(s).
        <?php else: ?>
          Ask an admin to add additional users or change roles.
        <?php endif; ?>
      </div>
      <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
        <?php if ((string)$user['role'] === 'admin'): ?>
          <a class="btn" href="/cms/users.php">Manage users</a>
          <a class="btn" href="/cms/export.php">Export package</a>
        <?php endif; ?>
        <a class="btn btn-danger" href="/cms/logout.php">Logout</a>
      </div>
    </div>
  </div>
</div>
<?php
$content = ob_get_clean();

$title = 'Overview';
include __DIR__ . '/_layout.php';

