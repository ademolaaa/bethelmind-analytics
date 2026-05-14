<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin']);

function export_zip_root(string $rootPath, string $zipPath): void
{
    $zip = new ZipArchive();
    if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        throw new RuntimeException('Failed to create zip.');
    }

    $rootPath = rtrim($rootPath, DIRECTORY_SEPARATOR);
    $exclude = [
        DIRECTORY_SEPARATOR . 'cms' . DIRECTORY_SEPARATOR . 'exports' . DIRECTORY_SEPARATOR,
        DIRECTORY_SEPARATOR . '.well-known' . DIRECTORY_SEPARATOR,
    ];

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($rootPath, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($iterator as $fileInfo) {
        if (!$fileInfo instanceof SplFileInfo) continue;
        if (!$fileInfo->isFile()) continue;
        $full = $fileInfo->getPathname();
        $rel = substr($full, strlen($rootPath) + 1);
        $normalized = DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $rel);
        $skip = false;
        foreach ($exclude as $ex) {
            if (str_starts_with($normalized, $ex)) {
                $skip = true;
                break;
            }
        }
        if ($skip) continue;
        $zip->addFile($full, $rel);
    }
    $zip->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();
    try {
        if (!class_exists('ZipArchive')) throw new RuntimeException('ZipArchive is not available on this server.');
        $root = realpath($_SERVER['DOCUMENT_ROOT'] ?? '');
        if (!$root || !is_dir($root)) throw new RuntimeException('Invalid document root.');

        $tmp = tempnam(sys_get_temp_dir(), 'bm_export_');
        if (!$tmp) throw new RuntimeException('Failed to create temp file.');
        $zipPath = $tmp . '.zip';

        export_zip_root($root, $zipPath);

        $fileName = 'bethelmind_hostinger_package_' . date('Ymd_His') . '.zip';
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Content-Length: ' . filesize($zipPath));
        header('X-Content-Type-Options: nosniff');
        readfile($zipPath);
        @unlink($zipPath);
        @unlink($tmp);
        exit;
    } catch (Throwable $e) {
        cms_flash_set('error', $e->getMessage());
        cms_redirect('/cms/export.php');
    }
}

ob_start();
?>
<div style="font-weight:900;font-size:16px">Hostinger export package</div>
<div class="muted" style="margin-top:6px">
  Generates a single ZIP that contains the entire deployable site (public_html content), including CMS, API, and uploads.
</div>

<div style="margin-top:14px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
  <div class="muted" style="font-weight:900">Notes</div>
  <div style="margin-top:8px;line-height:1.6" class="muted">
    The ZIP may include sensitive configuration (database credentials) if present in <strong>/config/generated.php</strong>.<br />
    Store the exported file securely.
  </div>
</div>

<form method="post" style="margin-top:14px">
  <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
  <button class="btn btn-primary" type="submit">Generate ZIP export</button>
</form>
<?php
$content = ob_get_clean();
$title = 'Export';
include __DIR__ . '/_layout.php';

