<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin', 'editor']);

function cms_array_get(array $arr, string $path, $default = '')
{
    $parts = array_values(array_filter(explode('.', $path), fn($p) => $p !== ''));
    $cur = $arr;
    foreach ($parts as $p) {
        if (!is_array($cur) || !array_key_exists($p, $cur)) return $default;
        $cur = $cur[$p];
    }
    return $cur;
}

function cms_array_set(array &$arr, string $path, $value): void
{
    $parts = array_values(array_filter(explode('.', $path), fn($p) => $p !== ''));
    $cur =& $arr;
    foreach ($parts as $i => $p) {
        if ($i === count($parts) - 1) {
            $cur[$p] = $value;
            return;
        }
        if (!isset($cur[$p]) || !is_array($cur[$p])) $cur[$p] = [];
        $cur =& $cur[$p];
    }
}

function cms_sanitize_rich_html(string $html): string
{
    $html = preg_replace('~<\s*script[^>]*>.*?<\s*/\s*script\s*>~is', '', $html) ?? '';
    $html = preg_replace('~on\w+\s*=\s*"[^"]*"~i', '', $html) ?? '';
    $html = preg_replace("~on\w+\s*=\s*'[^']*'~i", '', $html) ?? '';
    $html = preg_replace('~javascript:\s*~i', '', $html) ?? '';

    $allowed = '<p><br><b><strong><i><em><u><ul><ol><li><a><h2><h3><blockquote>';
    $html = strip_tags($html, $allowed);
    return trim($html);
}

function cms_lines_to_array(string $text): array
{
    $lines = preg_split('/\R/', $text) ?: [];
    $out = [];
    foreach ($lines as $l) {
        $v = trim($l);
        if ($v !== '') $out[] = $v;
    }
    return $out;
}

function cms_array_to_lines(array $arr): string
{
    $out = [];
    foreach ($arr as $v) {
        if (is_string($v) && trim($v) !== '') $out[] = trim($v);
    }
    return implode("\n", $out);
}

function cms_parse_link_lines(string $text): array
{
    $lines = preg_split('/\R/', $text) ?: [];
    $links = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $parts = array_map('trim', explode('|', $line, 2));
        $label = $parts[0] ?? '';
        $href = $parts[1] ?? '';
        if ($label !== '' && $href !== '') $links[] = ['label' => $label, 'href' => $href];
    }
    return $links;
}

function cms_link_lines(array $links): string
{
    $out = [];
    foreach ($links as $l) {
        if (!is_array($l)) continue;
        $label = (string)($l['label'] ?? '');
        $href = (string)($l['href'] ?? '');
        if ($label !== '' && $href !== '') $out[] = $label . ' | ' . $href;
    }
    return implode("\n", $out);
}

$raw = bm_setting_get('site_content');
if (!$raw || trim($raw) === '' || trim($raw) === '{}' || trim($raw) === 'null') {
    $defaultPath = __DIR__ . '/default_site_content.json';
    $raw = is_file($defaultPath) ? file_get_contents($defaultPath) : '{}';
}
$data = json_decode((string)$raw, true);
if (!is_array($data)) $data = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();
    $mode = (string)($_POST['mode'] ?? 'quick');

    try {
        if ($mode === 'json') {
            $json = (string)($_POST['content_json'] ?? '');
            $decoded = json_decode($json, true);
            if (!is_array($decoded)) throw new RuntimeException('Invalid JSON.');
            $data = $decoded;
        } else {
            cms_array_set($data, 'hero.headlineStart', trim((string)($_POST['hero_headlineStart'] ?? '')));
            cms_array_set($data, 'hero.headlineEnd', trim((string)($_POST['hero_headlineEnd'] ?? '')));
            cms_array_set($data, 'hero.subheadline', cms_sanitize_rich_html((string)($_POST['hero_subheadline'] ?? '')));
            cms_array_set($data, 'hero.ctaPrimary', trim((string)($_POST['hero_ctaPrimary'] ?? '')));
            cms_array_set($data, 'hero.ctaSecondary', trim((string)($_POST['hero_ctaSecondary'] ?? '')));

            cms_array_set($data, 'socialProof.text', trim((string)($_POST['social_text'] ?? '')));
            for ($i = 0; $i < 3; $i++) {
                cms_array_set($data, "socialProof.stats.$i.value", trim((string)($_POST["social_stats_{$i}_value"] ?? '')));
                cms_array_set($data, "socialProof.stats.$i.label", trim((string)($_POST["social_stats_{$i}_label"] ?? '')));
            }

            cms_array_set($data, 'solutionsSection.tagline', trim((string)($_POST['solutions_tagline'] ?? '')));
            cms_array_set($data, 'solutionsSection.headline', trim((string)($_POST['solutions_headline'] ?? '')));
            cms_array_set($data, 'solutionsSection.description', cms_sanitize_rich_html((string)($_POST['solutions_description'] ?? '')));

            cms_array_set($data, 'ctaSection.headline', trim((string)($_POST['cta_headline'] ?? '')));
            cms_array_set($data, 'ctaSection.subheadline', cms_sanitize_rich_html((string)($_POST['cta_subheadline'] ?? '')));
            cms_array_set($data, 'ctaSection.benefits', cms_lines_to_array((string)($_POST['cta_benefits'] ?? '')));
            cms_array_set($data, 'ctaSection.ctaButton', trim((string)($_POST['cta_button'] ?? '')));
            cms_array_set($data, 'ctaSection.ctaSecondary', trim((string)($_POST['cta_secondary'] ?? '')));
            cms_array_set($data, 'ctaSection.footerNote', cms_sanitize_rich_html((string)($_POST['cta_footer'] ?? '')));

            cms_array_set($data, 'about.hero.title', trim((string)($_POST['about_title'] ?? '')));
            cms_array_set($data, 'about.hero.subtitle', cms_sanitize_rich_html((string)($_POST['about_subtitle'] ?? '')));
            cms_array_set($data, 'about.mission.title', trim((string)($_POST['mission_title'] ?? '')));
            cms_array_set($data, 'about.mission.description', cms_sanitize_rich_html((string)($_POST['mission_description'] ?? '')));

            cms_array_set($data, 'pricing.hero.title', trim((string)($_POST['pricing_title'] ?? '')));
            cms_array_set($data, 'pricing.hero.subtitle', cms_sanitize_rich_html((string)($_POST['pricing_subtitle'] ?? '')));
            for ($p = 0; $p < 3; $p++) {
                cms_array_set($data, "pricing.plans.$p.name", trim((string)($_POST["plan_{$p}_name"] ?? '')));
                cms_array_set($data, "pricing.plans.$p.price", trim((string)($_POST["plan_{$p}_price"] ?? '')));
                cms_array_set($data, "pricing.plans.$p.description", cms_sanitize_rich_html((string)($_POST["plan_{$p}_description"] ?? '')));
                cms_array_set($data, "pricing.plans.$p.features", cms_lines_to_array((string)($_POST["plan_{$p}_features"] ?? '')));
                cms_array_set($data, "pricing.plans.$p.cta", trim((string)($_POST["plan_{$p}_cta"] ?? '')));
                cms_array_set($data, "pricing.plans.$p.highlighted", (($_POST["plan_{$p}_highlighted"] ?? '') === '1'));
            }

            cms_array_set($data, 'contact.hero.title', trim((string)($_POST['contact_title'] ?? '')));
            cms_array_set($data, 'contact.hero.subtitle', cms_sanitize_rich_html((string)($_POST['contact_subtitle'] ?? '')));
            cms_array_set($data, 'contact.info.email', trim((string)($_POST['contact_email'] ?? '')));
            cms_array_set($data, 'contact.info.phone', trim((string)($_POST['contact_phone'] ?? '')));
            cms_array_set($data, 'contact.info.address', trim((string)($_POST['contact_address'] ?? '')));

            cms_array_set($data, 'footer.companyName', trim((string)($_POST['footer_company'] ?? '')));
            cms_array_set($data, 'footer.description', cms_sanitize_rich_html((string)($_POST['footer_description'] ?? '')));
            cms_array_set($data, 'footer.copyright', trim((string)($_POST['footer_copyright'] ?? '')));
            for ($c = 0; $c < 2; $c++) {
                cms_array_set($data, "footer.columns.$c.title", trim((string)($_POST["footer_col_{$c}_title"] ?? '')));
                $links = cms_parse_link_lines((string)($_POST["footer_col_{$c}_links"] ?? ''));
                cms_array_set($data, "footer.columns.$c.links", $links);
            }
        }

        $json = json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        if (!is_string($json)) throw new RuntimeException('Failed to encode JSON.');
        bm_setting_set('site_content', $json);
        cms_flash_set('success', 'Content saved successfully.');
        cms_redirect('/cms/content.php');
    } catch (Throwable $e) {
        cms_flash_set('error', $e->getMessage());
        cms_redirect('/cms/content.php');
    }
}

$socialStats = cms_array_get($data, 'socialProof.stats', []);
if (!is_array($socialStats)) $socialStats = [];
while (count($socialStats) < 3) $socialStats[] = ['value' => '', 'label' => ''];

$ctaBenefits = cms_array_get($data, 'ctaSection.benefits', []);
if (!is_array($ctaBenefits)) $ctaBenefits = [];

$footerCols = cms_array_get($data, 'footer.columns', []);
if (!is_array($footerCols)) $footerCols = [];
while (count($footerCols) < 2) $footerCols[] = ['title' => '', 'links' => []];

$plans = cms_array_get($data, 'pricing.plans', []);
if (!is_array($plans)) $plans = [];
while (count($plans) < 3) $plans[] = ['name' => '', 'price' => '', 'description' => '', 'features' => [], 'cta' => '', 'highlighted' => false];

ob_start();
?>
<form method="post">
  <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
  <input type="hidden" name="mode" value="quick" />

  <div class="grid">
    <div>
      <div style="font-weight:900;font-size:16px">Hero</div>
      <div class="muted" style="margin-top:6px">Primary headline, subheadline, and CTA labels.</div>
      <div style="margin-top:14px">
        <label>Headline start</label>
        <input name="hero_headlineStart" value="<?= cms_h((string)cms_array_get($data, 'hero.headlineStart')) ?>" />
        <label style="margin-top:12px">Headline end</label>
        <input name="hero_headlineEnd" value="<?= cms_h((string)cms_array_get($data, 'hero.headlineEnd')) ?>" />
        <label style="margin-top:12px">Subheadline (rich text)</label>
        <textarea class="wysiwyg" name="hero_subheadline"><?= cms_h((string)cms_array_get($data, 'hero.subheadline')) ?></textarea>
        <div class="grid" style="margin-top:12px">
          <div>
            <label>Primary CTA</label>
            <input name="hero_ctaPrimary" value="<?= cms_h((string)cms_array_get($data, 'hero.ctaPrimary')) ?>" />
          </div>
          <div>
            <label>Secondary CTA</label>
            <input name="hero_ctaSecondary" value="<?= cms_h((string)cms_array_get($data, 'hero.ctaSecondary')) ?>" />
          </div>
        </div>
      </div>
    </div>

    <div>
      <div style="font-weight:900;font-size:16px">Social proof</div>
      <div class="muted" style="margin-top:6px">Trust line and key metrics.</div>
      <div style="margin-top:14px">
        <label>Line</label>
        <input name="social_text" value="<?= cms_h((string)cms_array_get($data, 'socialProof.text')) ?>" />
        <div style="margin-top:12px">
          <div class="muted" style="font-weight:800;margin-bottom:8px">Stats</div>
          <?php for ($i = 0; $i < 3; $i++): $s = is_array($socialStats[$i]) ? $socialStats[$i] : []; ?>
            <div class="grid" style="margin-top:10px">
              <div>
                <label>Value <?= $i + 1 ?></label>
                <input name="social_stats_<?= $i ?>_value" value="<?= cms_h((string)($s['value'] ?? '')) ?>" />
              </div>
              <div>
                <label>Label <?= $i + 1 ?></label>
                <input name="social_stats_<?= $i ?>_label" value="<?= cms_h((string)($s['label'] ?? '')) ?>" />
              </div>
            </div>
          <?php endfor; ?>
        </div>
      </div>
    </div>
  </div>

  <div style="margin-top:18px;border-top:1px solid rgba(255,255,255,.10);padding-top:18px" class="grid">
    <div>
      <div style="font-weight:900;font-size:16px">Solutions section</div>
      <div style="margin-top:14px">
        <label>Tagline</label>
        <input name="solutions_tagline" value="<?= cms_h((string)cms_array_get($data, 'solutionsSection.tagline')) ?>" />
        <label style="margin-top:12px">Headline</label>
        <input name="solutions_headline" value="<?= cms_h((string)cms_array_get($data, 'solutionsSection.headline')) ?>" />
        <label style="margin-top:12px">Description (rich text)</label>
        <textarea class="wysiwyg" name="solutions_description"><?= cms_h((string)cms_array_get($data, 'solutionsSection.description')) ?></textarea>
      </div>
    </div>
    <div>
      <div style="font-weight:900;font-size:16px">CTA section</div>
      <div style="margin-top:14px">
        <label>Headline</label>
        <input name="cta_headline" value="<?= cms_h((string)cms_array_get($data, 'ctaSection.headline')) ?>" />
        <label style="margin-top:12px">Subheadline (rich text)</label>
        <textarea class="wysiwyg" name="cta_subheadline"><?= cms_h((string)cms_array_get($data, 'ctaSection.subheadline')) ?></textarea>
        <label style="margin-top:12px">Benefits (one per line)</label>
        <textarea name="cta_benefits"><?= cms_h(cms_array_to_lines($ctaBenefits)) ?></textarea>
        <div class="grid" style="margin-top:12px">
          <div>
            <label>Primary button</label>
            <input name="cta_button" value="<?= cms_h((string)cms_array_get($data, 'ctaSection.ctaButton')) ?>" />
          </div>
          <div>
            <label>Secondary button</label>
            <input name="cta_secondary" value="<?= cms_h((string)cms_array_get($data, 'ctaSection.ctaSecondary')) ?>" />
          </div>
        </div>
        <label style="margin-top:12px">Footer note (rich text)</label>
        <textarea class="wysiwyg" name="cta_footer"><?= cms_h((string)cms_array_get($data, 'ctaSection.footerNote')) ?></textarea>
      </div>
    </div>
  </div>

  <div style="margin-top:18px;border-top:1px solid rgba(255,255,255,.10);padding-top:18px" class="grid">
    <div>
      <div style="font-weight:900;font-size:16px">About page</div>
      <div style="margin-top:14px">
        <label>Hero title</label>
        <input name="about_title" value="<?= cms_h((string)cms_array_get($data, 'about.hero.title')) ?>" />
        <label style="margin-top:12px">Hero subtitle (rich text)</label>
        <textarea class="wysiwyg" name="about_subtitle"><?= cms_h((string)cms_array_get($data, 'about.hero.subtitle')) ?></textarea>
        <label style="margin-top:12px">Mission title</label>
        <input name="mission_title" value="<?= cms_h((string)cms_array_get($data, 'about.mission.title')) ?>" />
        <label style="margin-top:12px">Mission description (rich text)</label>
        <textarea class="wysiwyg" name="mission_description"><?= cms_h((string)cms_array_get($data, 'about.mission.description')) ?></textarea>
        <div class="muted" style="margin-top:10px">Values are stored in JSON. Use Advanced JSON editor for values/icons.</div>
      </div>
    </div>
    <div>
      <div style="font-weight:900;font-size:16px">Pricing page</div>
      <div style="margin-top:14px">
        <label>Hero title</label>
        <input name="pricing_title" value="<?= cms_h((string)cms_array_get($data, 'pricing.hero.title')) ?>" />
        <label style="margin-top:12px">Hero subtitle (rich text)</label>
        <textarea class="wysiwyg" name="pricing_subtitle"><?= cms_h((string)cms_array_get($data, 'pricing.hero.subtitle')) ?></textarea>
      </div>
      <div style="margin-top:14px">
        <div style="font-weight:900">Plans</div>
        <?php for ($p = 0; $p < 3; $p++): $plan = is_array($plans[$p]) ? $plans[$p] : []; ?>
          <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
            <div class="muted" style="font-weight:900">Plan <?= $p + 1 ?></div>
            <div class="grid" style="margin-top:10px">
              <div>
                <label>Name</label>
                <input name="plan_<?= $p ?>_name" value="<?= cms_h((string)($plan['name'] ?? '')) ?>" />
              </div>
              <div>
                <label>Price</label>
                <input name="plan_<?= $p ?>_price" value="<?= cms_h((string)($plan['price'] ?? '')) ?>" />
              </div>
            </div>
            <label style="margin-top:12px">Description (rich text)</label>
            <textarea class="wysiwyg" name="plan_<?= $p ?>_description"><?= cms_h((string)($plan['description'] ?? '')) ?></textarea>
            <label style="margin-top:12px">Features (one per line)</label>
            <textarea name="plan_<?= $p ?>_features"><?= cms_h(cms_array_to_lines(is_array($plan['features'] ?? null) ? (array)$plan['features'] : [])) ?></textarea>
            <div class="grid" style="margin-top:12px">
              <div>
                <label>CTA label</label>
                <input name="plan_<?= $p ?>_cta" value="<?= cms_h((string)($plan['cta'] ?? '')) ?>" />
              </div>
              <div>
                <label>Highlighted</label>
                <select name="plan_<?= $p ?>_highlighted">
                  <option value="0" <?= !($plan['highlighted'] ?? false) ? 'selected' : '' ?>>No</option>
                  <option value="1" <?= ($plan['highlighted'] ?? false) ? 'selected' : '' ?>>Yes</option>
                </select>
              </div>
            </div>
          </div>
        <?php endfor; ?>
      </div>
    </div>
  </div>

  <div style="margin-top:18px;border-top:1px solid rgba(255,255,255,.10);padding-top:18px" class="grid">
    <div>
      <div style="font-weight:900;font-size:16px">Contact page</div>
      <div style="margin-top:14px">
        <label>Title</label>
        <input name="contact_title" value="<?= cms_h((string)cms_array_get($data, 'contact.hero.title')) ?>" />
        <label style="margin-top:12px">Subtitle (rich text)</label>
        <textarea class="wysiwyg" name="contact_subtitle"><?= cms_h((string)cms_array_get($data, 'contact.hero.subtitle')) ?></textarea>
        <div class="grid" style="margin-top:12px">
          <div>
            <label>Email</label>
            <input name="contact_email" value="<?= cms_h((string)cms_array_get($data, 'contact.info.email')) ?>" />
          </div>
          <div>
            <label>Phone</label>
            <input name="contact_phone" value="<?= cms_h((string)cms_array_get($data, 'contact.info.phone')) ?>" />
          </div>
        </div>
        <label style="margin-top:12px">Address</label>
        <input name="contact_address" value="<?= cms_h((string)cms_array_get($data, 'contact.info.address')) ?>" />
      </div>
    </div>

    <div>
      <div style="font-weight:900;font-size:16px">Footer</div>
      <div style="margin-top:14px">
        <label>Company name</label>
        <input name="footer_company" value="<?= cms_h((string)cms_array_get($data, 'footer.companyName')) ?>" />
        <label style="margin-top:12px">Description (rich text)</label>
        <textarea class="wysiwyg" name="footer_description"><?= cms_h((string)cms_array_get($data, 'footer.description')) ?></textarea>
        <label style="margin-top:12px">Copyright</label>
        <input name="footer_copyright" value="<?= cms_h((string)cms_array_get($data, 'footer.copyright')) ?>" />
        <?php for ($c = 0; $c < 2; $c++): $col = is_array($footerCols[$c]) ? $footerCols[$c] : []; ?>
          <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
            <div class="muted" style="font-weight:900">Column <?= $c + 1 ?></div>
            <label style="margin-top:10px">Title</label>
            <input name="footer_col_<?= $c ?>_title" value="<?= cms_h((string)($col['title'] ?? '')) ?>" />
            <label style="margin-top:12px">Links (Label | /path)</label>
            <textarea name="footer_col_<?= $c ?>_links"><?= cms_h(cms_link_lines(is_array($col['links'] ?? null) ? (array)$col['links'] : [])) ?></textarea>
          </div>
        <?php endfor; ?>
      </div>
    </div>
  </div>

  <div style="margin-top:18px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
    <div class="muted">Use Advanced JSON editor for fields not shown here (FAQ, case studies, values, etc.).</div>
    <button class="btn btn-primary" type="submit">Save quick changes</button>
  </div>
</form>

<div style="margin-top:22px;border-top:1px solid rgba(255,255,255,.10);padding-top:18px">
  <div style="font-weight:900;font-size:16px">Advanced JSON</div>
  <div class="muted" style="margin-top:6px">This updates the full website content object stored in the database.</div>
  <form method="post" style="margin-top:12px">
    <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
    <input type="hidden" name="mode" value="json" />
    <label>site_content JSON</label>
    <textarea name="content_json" style="min-height:320px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"><?= cms_h(json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?: '{}') ?></textarea>
    <div style="margin-top:12px;display:flex;justify-content:flex-end">
      <button class="btn btn-primary" type="submit">Save JSON</button>
    </div>
  </form>
</div>

<script src="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"></script>
<script>
  if (window.tinymce) {
    tinymce.init({
      selector: 'textarea.wysiwyg',
      menubar: false,
      plugins: 'link lists',
      toolbar: 'bold italic underline | bullist numlist | link | removeformat',
      branding: false,
      height: 220
    });
  }
</script>
<?php
$content = ob_get_clean();
$title = 'Content';
include __DIR__ . '/_layout.php';

