<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin', 'editor']);

$raw = bm_setting_get('solutions');
$data = json_decode((string)$raw, true);
if (!is_array($data)) $data = [];

function validate_solutions(array $arr): void
{
    foreach ($arr as $i => $s) {
        if (!is_array($s)) throw new RuntimeException("Solution #{$i} must be an object.");
        $id = (string)($s['id'] ?? '');
        $title = (string)($s['title'] ?? '');
        if ($id === '' || $title === '') throw new RuntimeException("Solution #{$i} requires id and title.");
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();
    try {
        $json = (string)($_POST['json'] ?? '');
        $decoded = json_decode($json, true);
        if (!is_array($decoded)) throw new RuntimeException('Invalid JSON. Expected an array of solutions.');
        validate_solutions($decoded);
        $encoded = json_encode($decoded, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (!is_string($encoded)) throw new RuntimeException('Failed to encode JSON.');
        bm_setting_set('solutions', $encoded);
        cms_flash_set('success', 'Solutions saved.');
        cms_redirect('/cms/solutions.php');
    } catch (Throwable $e) {
        cms_flash_set('error', $e->getMessage());
        cms_redirect('/cms/solutions.php');
    }
}

ob_start();
?>
<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap">
  <div>
    <div style="font-weight:900;font-size:16px">Solutions content</div>
    <div class="muted" style="margin-top:6px">
      This controls solution pages and the solutions hub when the frontend is configured to load from <strong>/api/content.php</strong>.
    </div>
  </div>
  <div class="pill"><?= count($data) ?> item(s)</div>
</div>

<div style="margin-top:14px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
  <div class="muted" style="font-weight:900">Schema</div>
  <div class="muted" style="margin-top:8px;line-height:1.6">
    Required fields per item: <strong>id</strong>, <strong>title</strong>.<br />
    Recommended fields: cardTitle, cardBenefit, targetAudience, iconName, intro, painPoints, whatWeBuild, howItWorks, timelineAndPricing, whatYouGet, faq.
  </div>
</div>

<form method="post" style="margin-top:14px">
  <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
  <label>solutions JSON</label>
  <textarea name="json" style="min-height:420px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"><?= cms_h(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '[]') ?></textarea>
  <div style="margin-top:12px;display:flex;justify-content:flex-end">
    <button class="btn btn-primary" type="submit">Save solutions</button>
  </div>
</form>
<?php
$content = ob_get_clean();
$title = 'Solutions';
include __DIR__ . '/_layout.php';

