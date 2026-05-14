<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin', 'editor']);

$cfg = bm_config();
$uploadDir = (string)($cfg['uploads']['dir'] ?? (__DIR__ . '/../uploads'));
$uploadUrl = (string)($cfg['uploads']['url'] ?? '/uploads');
$maxBytes = (int)($cfg['uploads']['max_bytes'] ?? (8 * 1024 * 1024));

if (!is_dir($uploadDir)) @mkdir($uploadDir, 0755, true);

function media_ext_from_mime(string $mime, string $original): string
{
    $map = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        'image/svg+xml' => 'svg',
        'application/pdf' => 'pdf',
    ];
    if (isset($map[$mime])) return $map[$mime];
    $ext = strtolower(pathinfo($original, PATHINFO_EXTENSION));
    return preg_match('/^[a-z0-9]{1,8}$/', $ext) ? $ext : 'bin';
}

function media_kind(string $mime): string
{
    if (str_starts_with($mime, 'image/')) return 'image';
    if ($mime === 'application/pdf') return 'document';
    return 'file';
}

$pdo = bm_pdo();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();
    $action = (string)($_POST['action'] ?? '');

    if ($action === 'delete') {
        $id = (int)($_POST['id'] ?? 0);
        try {
            cms_require_role($user, ['admin', 'editor']);
            $stmt = $pdo->prepare('SELECT file_name FROM cms_media WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch();
            if ($row && is_string($row['file_name'])) {
                $file = $row['file_name'];
                $pdo->prepare('DELETE FROM cms_media WHERE id = :id')->execute([':id' => $id]);
                $path = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $file;
                if (is_file($path)) @unlink($path);
            }
            cms_flash_set('success', 'File deleted.');
        } catch (Throwable $e) {
            cms_flash_set('error', $e->getMessage());
        }
        cms_redirect('/cms/media.php');
    }

    if ($action === 'upload') {
        try {
            if (!isset($_FILES['file']) || !is_array($_FILES['file'])) throw new RuntimeException('No file uploaded.');
            $f = $_FILES['file'];
            if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) throw new RuntimeException('Upload failed.');

            $tmp = (string)($f['tmp_name'] ?? '');
            $original = (string)($f['name'] ?? 'upload');
            $size = (int)($f['size'] ?? 0);
            if ($size <= 0) throw new RuntimeException('Empty upload.');
            if ($size > $maxBytes) throw new RuntimeException('File too large.');

            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = (string)$finfo->file($tmp);

            $allowed = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/gif',
                'image/svg+xml',
                'application/pdf',
            ];
            if (!in_array($mime, $allowed, true)) throw new RuntimeException('Unsupported file type.');

            $ext = media_ext_from_mime($mime, $original);
            $name = bin2hex(random_bytes(16)) . '.' . $ext;
            $dest = rtrim($uploadDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $name;

            if (!move_uploaded_file($tmp, $dest)) throw new RuntimeException('Failed to move uploaded file.');

            $stmt = $pdo->prepare('INSERT INTO cms_media (file_name, original_name, mime, size_bytes, kind, uploaded_by) VALUES (:f, :o, :m, :s, :k, :u)');
            $stmt->execute([
                ':f' => $name,
                ':o' => mb_substr($original, 0, 255),
                ':m' => $mime,
                ':s' => $size,
                ':k' => media_kind($mime),
                ':u' => (int)$user['id'],
            ]);

            cms_flash_set('success', 'File uploaded.');
        } catch (Throwable $e) {
            cms_flash_set('error', $e->getMessage());
        }
        cms_redirect('/cms/media.php');
    }
}

$items = [];
try {
    $items = $pdo->query('SELECT id, file_name, original_name, mime, size_bytes, kind, uploaded_at FROM cms_media ORDER BY uploaded_at DESC LIMIT 200')->fetchAll();
    if (!is_array($items)) $items = [];
} catch (Throwable) {
}

function pretty_bytes(int $b): string
{
    if ($b < 1024) return $b . ' B';
    $kb = $b / 1024;
    if ($kb < 1024) return round($kb, 1) . ' KB';
    return round($kb / 1024, 1) . ' MB';
}

ob_start();
?>
<div class="grid">
  <div>
    <div style="font-weight:900;font-size:16px">Upload</div>
    <div class="muted" style="margin-top:6px">Images (JPG/PNG/WebP/GIF/SVG) and PDF documents.</div>
    <form method="post" enctype="multipart/form-data" style="margin-top:12px">
      <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
      <input type="hidden" name="action" value="upload" />
      <label>Choose file</label>
      <input type="file" name="file" required />
      <div class="muted" style="margin-top:10px">Max size: <?= cms_h((string)pretty_bytes($maxBytes)) ?></div>
      <div style="margin-top:12px;display:flex;justify-content:flex-end">
        <button class="btn btn-primary" type="submit">Upload</button>
      </div>
    </form>
  </div>
  <div>
    <div style="font-weight:900;font-size:16px">Usage</div>
    <div class="muted" style="margin-top:6px">Copy the URL and paste it into content or meta fields.</div>
    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
      <div class="muted" style="font-weight:900">Base uploads URL</div>
      <div style="margin-top:6px;font-weight:900"><?= cms_h(rtrim($uploadUrl, '/')) ?></div>
      <div class="muted" style="margin-top:10px">Example:</div>
      <div style="margin-top:6px"><?= cms_h(rtrim($uploadUrl, '/') . '/your-file.jpg') ?></div>
    </div>
  </div>
</div>

<div style="margin-top:22px;border-top:1px solid rgba(255,255,255,.10);padding-top:18px">
  <div style="font-weight:900;font-size:16px">Library</div>
  <div class="muted" style="margin-top:6px">Most recent uploads (max 200).</div>

  <table class="table" style="margin-top:12px">
    <thead>
      <tr>
        <th style="width:110px">Preview</th>
        <th>File</th>
        <th style="width:140px">Type</th>
        <th style="width:120px">Size</th>
        <th style="width:190px">Uploaded</th>
        <th style="width:170px">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($items as $it): $id = (int)($it['id'] ?? 0); $file = (string)($it['file_name'] ?? ''); if ($file === '') continue; $mime = (string)($it['mime'] ?? ''); $url = rtrim($uploadUrl, '/') . '/' . $file; ?>
        <tr>
          <td>
            <?php if (str_starts_with($mime, 'image/')): ?>
              <img src="<?= cms_h($url) ?>" alt="" style="width:92px;height:54px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,.14)" />
            <?php else: ?>
              <div class="tag"><?= cms_h((string)($it['kind'] ?? 'file')) ?></div>
            <?php endif; ?>
          </td>
          <td>
            <div style="font-weight:900"><?= cms_h((string)($it['original_name'] ?? $file)) ?></div>
            <div class="muted" style="margin-top:4px"><?= cms_h($url) ?></div>
          </td>
          <td><?= cms_h($mime) ?></td>
          <td><?= cms_h(pretty_bytes((int)($it['size_bytes'] ?? 0))) ?></td>
          <td class="muted"><?= cms_h((string)($it['uploaded_at'] ?? '')) ?></td>
          <td>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn" type="button" onclick="navigator.clipboard.writeText('<?= cms_h($url) ?>')">Copy URL</button>
              <a class="btn" href="<?= cms_h($url) ?>" target="_blank" rel="noopener">Open</a>
              <form method="post" style="display:inline">
                <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
                <input type="hidden" name="action" value="delete" />
                <input type="hidden" name="id" value="<?= $id ?>" />
                <button class="btn btn-danger" type="submit" onclick="return confirm('Delete this file?')">Delete</button>
              </form>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (count($items) === 0): ?>
        <tr><td colspan="6" class="muted">No files uploaded yet.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>
<?php
$content = ob_get_clean();
$title = 'Media';
include __DIR__ . '/_layout.php';

