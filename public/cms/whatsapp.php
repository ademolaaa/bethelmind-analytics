<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin', 'editor']);
$pdo = bm_pdo();

function wa_norm(string $n): string
{
    $n = trim($n);
    $n = preg_replace('~[^\d+]~', '', $n) ?? '';
    if ($n === '') return '';
    if ($n[0] === '+') $n = substr($n, 1);
    return $n;
}

function wa_http_post_json(string $url, array $headers, string $body, int $timeoutSeconds = 10): array
{
    $h = [];
    foreach ($headers as $k => $v) $h[] = $k . ': ' . $v;

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $h);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeoutSeconds);
        $resp = curl_exec($ch);
        $err = curl_error($ch);
        $code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ['ok' => $resp !== false && $code >= 200 && $code < 300, 'code' => $code, 'body' => is_string($resp) ? $resp : '', 'error' => $err];
    }

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => implode("\r\n", $h),
            'content' => $body,
            'timeout' => $timeoutSeconds,
        ],
    ]);
    $resp = @file_get_contents($url, false, $context);
    $code = 0;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $line) {
            if (preg_match('~^HTTP/\S+\s+(\d{3})~', $line, $m)) {
                $code = (int)$m[1];
                break;
            }
        }
    }
    return ['ok' => is_string($resp) && $code >= 200 && $code < 300, 'code' => $code, 'body' => is_string($resp) ? $resp : '', 'error' => null];
}

function wa_send_text(string $toDigits, string $text): array
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return ['ok' => false, 'error' => 'WhatsApp provider not configured'];
    $token = (string)($wa['access_token'] ?? '');
    $phoneNumberId = (string)($wa['phone_number_id'] ?? '');
    if ($token === '' || $phoneNumberId === '') return ['ok' => false, 'error' => 'Missing WhatsApp credentials'];

    $url = "https://graph.facebook.com/v19.0/" . rawurlencode($phoneNumberId) . "/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $toDigits,
        'type' => 'text',
        'text' => ['body' => $text],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($payload)) return ['ok' => false, 'error' => 'JSON encode error'];

    return wa_http_post_json($url, [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json',
    ], $payload, 10);
}

function wa_send_template(string $toDigits, string $templateName, string $langCode): array
{
    $cfg = bm_config();
    $wa = $cfg['whatsapp'] ?? [];
    $provider = (string)($wa['provider'] ?? '');
    if ($provider !== 'meta_cloud') return ['ok' => false, 'error' => 'WhatsApp provider not configured'];
    $token = (string)($wa['access_token'] ?? '');
    $phoneNumberId = (string)($wa['phone_number_id'] ?? '');
    if ($token === '' || $phoneNumberId === '') return ['ok' => false, 'error' => 'Missing WhatsApp credentials'];

    $url = "https://graph.facebook.com/v19.0/" . rawurlencode($phoneNumberId) . "/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'to' => $toDigits,
        'type' => 'template',
        'template' => [
            'name' => $templateName,
            'language' => ['code' => $langCode],
        ],
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if (!is_string($payload)) return ['ok' => false, 'error' => 'JSON encode error'];

    return wa_http_post_json($url, [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json',
    ], $payload, 10);
}

function wa_ensure_tables(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wa_message_id VARCHAR(120) NULL,
        direction VARCHAR(10) NOT NULL,
        from_number VARCHAR(40) NULL,
        to_number VARCHAR(40) NULL,
        body_text LONGTEXT NULL,
        ts BIGINT NULL,
        raw_json LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(direction),
        INDEX(ts),
        INDEX(from_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_contacts (
        wa_number VARCHAR(40) NOT NULL PRIMARY KEY,
        display_name VARCHAR(120) NULL,
        assigned_to INT NULL,
        suite_key VARCHAR(60) NULL,
        stage VARCHAR(40) NULL,
        notes LONGTEXT NULL,
        last_inbound_ts BIGINT NULL,
        last_outbound_ts BIGINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(assigned_to),
        INDEX(suite_key),
        INDEX(last_inbound_ts)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kind VARCHAR(40) NOT NULL DEFAULT 'text',
        template_key VARCHAR(80) NOT NULL UNIQUE,
        title VARCHAR(120) NOT NULL,
        body_text LONGTEXT NULL,
        meta_template_name VARCHAR(120) NULL,
        meta_language VARCHAR(20) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(kind),
        INDEX(is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    $pdo->exec("CREATE TABLE IF NOT EXISTS bm_whatsapp_followups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wa_number VARCHAR(40) NOT NULL,
        template_id INT NULL,
        body_text LONGTEXT NULL,
        scheduled_at BIGINT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        attempts INT NOT NULL DEFAULT 0,
        last_error VARCHAR(255) NULL,
        sent_at BIGINT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX(status),
        INDEX(scheduled_at),
        INDEX(wa_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

wa_ensure_tables($pdo);

$view = (string)($_GET['view'] ?? 'inbox');
$number = wa_norm((string)($_GET['number'] ?? ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();

    $action = (string)($_POST['action'] ?? '');
    $nowMs = (int)(microtime(true) * 1000);

    try {
        if ($action === 'assign') {
            $wa = wa_norm((string)($_POST['wa_number'] ?? ''));
            $assignee = (string)($_POST['assigned_to'] ?? '');
            $assignedId = ($assignee !== '' && ctype_digit($assignee)) ? (int)$assignee : null;
            $stmt = $pdo->prepare("UPDATE bm_whatsapp_contacts SET assigned_to = :a WHERE wa_number = :n");
            $stmt->execute([':a' => $assignedId, ':n' => $wa]);
            cms_flash_set('success', 'Assigned successfully.');
        }

        if ($action === 'send') {
            $wa = wa_norm((string)($_POST['wa_number'] ?? ''));
            $mode = (string)($_POST['mode'] ?? 'text');
            $text = trim((string)($_POST['text'] ?? ''));
            $templateKey = (string)($_POST['template_key'] ?? '');

            if ($wa === '') throw new RuntimeException('Missing number');
            if ($mode === 'text') {
                $stmtC = $pdo->prepare("SELECT last_inbound_ts FROM bm_whatsapp_contacts WHERE wa_number = :n LIMIT 1");
                $stmtC->execute([':n' => $wa]);
                $c = $stmtC->fetch();
                $lastInbound = (int)($c['last_inbound_ts'] ?? 0);
                if ($lastInbound > 0 && ($nowMs - $lastInbound) > (24 * 60 * 60 * 1000)) {
                    throw new RuntimeException('Outside 24h window. Use a template.');
                }
                if ($text === '') throw new RuntimeException('Message is empty');
                $res = wa_send_text($wa, $text);
                if (!($res['ok'] ?? false)) throw new RuntimeException('Send failed');
                $rawJson = is_string($res['body'] ?? null) ? (string)$res['body'] : null;
                $pdo->prepare("INSERT INTO bm_whatsapp_messages (direction, to_number, body_text, ts, raw_json) VALUES ('out', :to, :body, :ts, :raw)")
                    ->execute([':to' => $wa, ':body' => $text, ':ts' => $nowMs, ':raw' => $rawJson]);
                $pdo->prepare("UPDATE bm_whatsapp_contacts SET last_outbound_ts = :ts WHERE wa_number = :n")->execute([':ts' => $nowMs, ':n' => $wa]);
                cms_flash_set('success', 'Message sent.');
            } else {
                if ($templateKey === '') throw new RuntimeException('Select a template');
                $stmtT = $pdo->prepare("SELECT * FROM bm_whatsapp_templates WHERE template_key = :k AND is_active = 1 LIMIT 1");
                $stmtT->execute([':k' => $templateKey]);
                $tpl = $stmtT->fetch();
                if (!$tpl) throw new RuntimeException('Template not found');
                $kind = (string)($tpl['kind'] ?? 'text');
                $sentText = null;
                $res = null;
                if ($kind === 'meta_template') {
                    $tName = (string)($tpl['meta_template_name'] ?? '');
                    $lang = (string)($tpl['meta_language'] ?? '');
                    if ($tName === '' || $lang === '') throw new RuntimeException('Template meta fields missing');
                    $res = wa_send_template($wa, $tName, $lang);
                    $sentText = '[template] ' . $templateKey;
                } else {
                    $tplText = (string)($tpl['body_text'] ?? '');
                    if ($tplText === '') throw new RuntimeException('Template body missing');
                    $res = wa_send_text($wa, $tplText);
                    $sentText = $tplText;
                }
                if (!($res['ok'] ?? false)) throw new RuntimeException('Send failed');
                $rawJson = is_string($res['body'] ?? null) ? (string)$res['body'] : null;
                $pdo->prepare("INSERT INTO bm_whatsapp_messages (direction, to_number, body_text, ts, raw_json) VALUES ('out', :to, :body, :ts, :raw)")
                    ->execute([':to' => $wa, ':body' => $sentText, ':ts' => $nowMs, ':raw' => $rawJson]);
                $pdo->prepare("UPDATE bm_whatsapp_contacts SET last_outbound_ts = :ts WHERE wa_number = :n")->execute([':ts' => $nowMs, ':n' => $wa]);
                cms_flash_set('success', 'Template sent.');
            }
        }

        if ($action === 'schedule') {
            $wa = wa_norm((string)($_POST['wa_number'] ?? ''));
            $minutes = (int)($_POST['minutes'] ?? 0);
            $templateId = (string)($_POST['template_id'] ?? '');
            $bodyText = trim((string)($_POST['text'] ?? ''));
            if ($wa === '' || $minutes <= 0) throw new RuntimeException('Invalid schedule');
            $scheduledAt = $nowMs + ($minutes * 60 * 1000);
            $tplId = ($templateId !== '' && ctype_digit($templateId)) ? (int)$templateId : null;
            $stmt = $pdo->prepare("INSERT INTO bm_whatsapp_followups (wa_number, template_id, body_text, scheduled_at) VALUES (:n, :t, :b, :s)");
            $stmt->execute([':n' => $wa, ':t' => $tplId, ':b' => ($bodyText !== '' ? $bodyText : null), ':s' => $scheduledAt]);
            cms_flash_set('success', 'Follow-up scheduled.');
        }

        if ($action === 'template_upsert') {
            $templateKey = trim((string)($_POST['template_key'] ?? ''));
            $title = trim((string)($_POST['title'] ?? ''));
            $kind = (string)($_POST['kind'] ?? 'text');
            $bodyText = (string)($_POST['body_text'] ?? '');
            $metaName = trim((string)($_POST['meta_template_name'] ?? ''));
            $metaLang = trim((string)($_POST['meta_language'] ?? ''));
            $isActive = isset($_POST['is_active']) ? 1 : 0;

            if ($templateKey === '' || $title === '') throw new RuntimeException('Template key and title are required');
            if (!in_array($kind, ['text', 'meta_template'], true)) $kind = 'text';

            $stmt = $pdo->prepare("INSERT INTO bm_whatsapp_templates (kind, template_key, title, body_text, meta_template_name, meta_language, is_active)
                VALUES (:kind, :k, :t, :b, :mn, :ml, :a)
                ON DUPLICATE KEY UPDATE
                  kind = VALUES(kind),
                  title = VALUES(title),
                  body_text = VALUES(body_text),
                  meta_template_name = VALUES(meta_template_name),
                  meta_language = VALUES(meta_language),
                  is_active = VALUES(is_active)");
            $stmt->execute([
                ':kind' => $kind,
                ':k' => $templateKey,
                ':t' => $title,
                ':b' => ($bodyText !== '' ? $bodyText : null),
                ':mn' => ($metaName !== '' ? $metaName : null),
                ':ml' => ($metaLang !== '' ? $metaLang : null),
                ':a' => $isActive,
            ]);
            cms_flash_set('success', 'Template saved.');
        }
    } catch (Throwable $e) {
        cms_flash_set('error', $e->getMessage());
    }

    $redirect = '/cms/whatsapp.php';
    if ($view) $redirect .= '?view=' . urlencode($view);
    if ($number) $redirect .= ($view ? '&' : '?') . 'number=' . urlencode($number);
    cms_redirect($redirect);
}

$users = [];
try {
    $users = $pdo->query("SELECT id, email, role FROM cms_users WHERE is_active = 1 ORDER BY role DESC, email ASC")->fetchAll();
} catch (Throwable) {
}

$templates = [];
try {
    $templates = $pdo->query("SELECT id, template_key, title, kind, is_active FROM bm_whatsapp_templates ORDER BY is_active DESC, title ASC")->fetchAll();
} catch (Throwable) {
}

$contacts = [];
try {
    $contacts = $pdo->query("SELECT c.*, u.email AS assigned_email
        FROM bm_whatsapp_contacts c
        LEFT JOIN cms_users u ON u.id = c.assigned_to
        ORDER BY COALESCE(c.last_inbound_ts, 0) DESC, c.updated_at DESC
        LIMIT 200")->fetchAll();
} catch (Throwable) {
}

$messages = [];
if ($number !== '') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM bm_whatsapp_messages
            WHERE from_number = :n OR to_number = :n
            ORDER BY COALESCE(ts, 0) DESC, id DESC
            LIMIT 80");
        $stmt->execute([':n' => $number]);
        $messages = $stmt->fetchAll();
    } catch (Throwable) {
    }
}

ob_start();
?>
<div style="display:flex;gap:10px;flex-wrap:wrap">
  <a class="btn <?= $view === 'inbox' ? 'btn-primary' : '' ?>" href="/cms/whatsapp.php?view=inbox">Inbox</a>
  <a class="btn <?= $view === 'templates' ? 'btn-primary' : '' ?>" href="/cms/whatsapp.php?view=templates">Templates</a>
  <a class="btn <?= $view === 'followups' ? 'btn-primary' : '' ?>" href="/cms/whatsapp.php?view=followups">Follow-ups</a>
</div>

<?php if ($view === 'templates'): ?>
  <div style="margin-top:16px" class="grid">
    <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:14px;background:rgba(255,255,255,.02)">
      <div class="pill">Create / update template</div>
      <form method="post" style="margin-top:12px">
        <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
        <input type="hidden" name="action" value="template_upsert" />
        <label>Template key</label>
        <input name="template_key" placeholder="e.g. welcome_growth" />
        <div style="height:10px"></div>
        <label>Title</label>
        <input name="title" placeholder="Welcome / qualify" />
        <div style="height:10px"></div>
        <label>Kind</label>
        <select name="kind">
          <option value="text">Text (24h window)</option>
          <option value="meta_template">Meta template (outside 24h)</option>
        </select>
        <div style="height:10px"></div>
        <label>Body text (for Text kind)</label>
        <textarea name="body_text" placeholder="Paste the exact message to send"></textarea>
        <div style="height:10px"></div>
        <label>Meta template name (for Meta template kind)</label>
        <input name="meta_template_name" placeholder="approved_template_name" />
        <div style="height:10px"></div>
        <label>Meta language code</label>
        <input name="meta_language" placeholder="en_US" />
        <div style="margin-top:10px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <label style="margin:0">
            <input type="checkbox" name="is_active" checked />
            <span style="margin-left:8px">Active</span>
          </label>
          <button class="btn btn-primary" type="submit">Save template</button>
        </div>
      </form>
    </div>

    <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:14px;background:rgba(255,255,255,.02)">
      <div class="pill">Existing templates</div>
      <table class="table" style="margin-top:10px">
        <thead>
          <tr>
            <th>Key</th>
            <th>Title</th>
            <th>Kind</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($templates as $t): ?>
            <tr>
              <td><?= cms_h((string)$t['template_key']) ?></td>
              <td><?= cms_h((string)$t['title']) ?></td>
              <td><?= cms_h((string)$t['kind']) ?></td>
              <td><?= (int)($t['is_active'] ?? 0) === 1 ? 'Active' : 'Off' ?></td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$templates): ?>
            <tr><td colspan="4" class="muted">No templates yet.</td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>

<?php elseif ($view === 'followups'): ?>
  <?php
  $followups = [];
  try {
      $followups = $pdo->query("SELECT f.*, t.template_key AS template_key, t.title AS template_title
          FROM bm_whatsapp_followups f
          LEFT JOIN bm_whatsapp_templates t ON t.id = f.template_id
          ORDER BY f.scheduled_at DESC
          LIMIT 200")->fetchAll();
  } catch (Throwable) {
  }
  ?>
  <div style="margin-top:16px" class="pill">Scheduled follow-ups</div>
  <table class="table" style="margin-top:10px">
    <thead>
      <tr>
        <th>Number</th>
        <th>When</th>
        <th>Status</th>
        <th>Template</th>
        <th>Error</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($followups as $f): ?>
        <tr>
          <td><a href="/cms/whatsapp.php?view=inbox&number=<?= urlencode((string)$f['wa_number']) ?>"><?= cms_h((string)$f['wa_number']) ?></a></td>
          <td><?= cms_h((string)$f['scheduled_at']) ?></td>
          <td><?= cms_h((string)$f['status']) ?></td>
          <td><?= cms_h((string)($f['template_title'] ?? $f['template_key'] ?? '—')) ?></td>
          <td class="muted"><?= cms_h((string)($f['last_error'] ?? '')) ?></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$followups): ?>
        <tr><td colspan="5" class="muted">No follow-ups yet.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>

<?php else: ?>
  <div style="margin-top:16px" class="grid">
    <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:14px;background:rgba(255,255,255,.02)">
      <div class="pill">Inbox</div>
      <div class="muted" style="margin-top:6px">Pick a contact to view messages, assign, and reply.</div>
      <table class="table" style="margin-top:10px">
        <thead>
          <tr>
            <th>Contact</th>
            <th>Suite</th>
            <th>Assigned</th>
            <th>Last inbound</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($contacts as $c): ?>
            <?php $n = (string)($c['wa_number'] ?? ''); ?>
            <tr>
              <td>
                <a href="/cms/whatsapp.php?view=inbox&number=<?= urlencode($n) ?>">
                  <div style="font-weight:900"><?= cms_h($n) ?></div>
                  <div class="muted" style="font-size:12px"><?= cms_h((string)($c['display_name'] ?? '')) ?></div>
                </a>
              </td>
              <td><?= cms_h((string)($c['suite_key'] ?? '—')) ?></td>
              <td class="muted"><?= cms_h((string)($c['assigned_email'] ?? 'Unassigned')) ?></td>
              <td class="muted"><?= cms_h((string)($c['last_inbound_ts'] ?? '—')) ?></td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$contacts): ?>
            <tr><td colspan="4" class="muted">No contacts yet. Configure your webhook, then message your WhatsApp number.</td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>

    <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:14px;background:rgba(255,255,255,.02)">
      <div class="pill">Conversation</div>
      <?php if ($number === ''): ?>
        <div class="muted" style="margin-top:10px">Select a contact from the inbox to view conversation and respond.</div>
      <?php else: ?>
        <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between">
          <div>
            <div style="font-weight:900"><?= cms_h($number) ?></div>
            <div class="muted" style="margin-top:4px">Reply within 24 hours using text; use templates outside the window.</div>
          </div>
        </div>

        <form method="post" style="margin-top:14px">
          <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
          <input type="hidden" name="action" value="assign" />
          <input type="hidden" name="wa_number" value="<?= cms_h($number) ?>" />
          <label>Assign to</label>
          <select name="assigned_to">
            <option value="">Unassigned</option>
            <?php foreach ($users as $u): ?>
              <option value="<?= (int)$u['id'] ?>"><?= cms_h((string)$u['email']) ?> (<?= cms_h((string)$u['role']) ?>)</option>
            <?php endforeach; ?>
          </select>
          <div style="margin-top:10px">
            <button class="btn" type="submit">Update assignment</button>
          </div>
        </form>

        <div style="margin-top:16px" class="grid">
          <div>
            <form method="post">
              <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
              <input type="hidden" name="action" value="send" />
              <input type="hidden" name="wa_number" value="<?= cms_h($number) ?>" />
              <label>Send message</label>
              <select name="mode">
                <option value="text">Text (24h window)</option>
                <option value="template">Template</option>
              </select>
              <div style="height:10px"></div>
              <label>Template (if using Template)</label>
              <select name="template_key">
                <option value="">Select template</option>
                <?php foreach ($templates as $t): ?>
                  <?php if ((int)($t['is_active'] ?? 0) !== 1) continue; ?>
                  <option value="<?= cms_h((string)$t['template_key']) ?>"><?= cms_h((string)$t['title']) ?> (<?= cms_h((string)$t['kind']) ?>)</option>
                <?php endforeach; ?>
              </select>
              <div style="height:10px"></div>
              <label>Text (if using Text mode)</label>
              <textarea name="text" placeholder="Type your reply"></textarea>
              <div style="margin-top:10px">
                <button class="btn btn-primary" type="submit">Send</button>
              </div>
            </form>
          </div>

          <div>
            <form method="post">
              <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
              <input type="hidden" name="action" value="schedule" />
              <input type="hidden" name="wa_number" value="<?= cms_h($number) ?>" />
              <label>Schedule follow-up</label>
              <select name="minutes">
                <option value="30">In 30 minutes</option>
                <option value="120">In 2 hours</option>
                <option value="1440">In 24 hours</option>
              </select>
              <div style="height:10px"></div>
              <label>Template (optional)</label>
              <select name="template_id">
                <option value="">No template</option>
                <?php foreach ($templates as $t): ?>
                  <?php if ((int)($t['is_active'] ?? 0) !== 1) continue; ?>
                  <option value="<?= (int)$t['id'] ?>"><?= cms_h((string)$t['title']) ?> (<?= cms_h((string)$t['kind']) ?>)</option>
                <?php endforeach; ?>
              </select>
              <div style="height:10px"></div>
              <label>Text (optional)</label>
              <textarea name="text" placeholder="If no template, paste a text message (only within 24h window)"></textarea>
              <div style="margin-top:10px">
                <button class="btn" type="submit">Schedule</button>
              </div>
              <div class="muted" style="margin-top:8px;font-size:12px">
                Use a cron job to call <code>/api/cron_whatsapp_followups.php</code> and send scheduled messages.
              </div>
            </form>
          </div>
        </div>

        <div style="margin-top:16px">
          <div class="pill">Recent messages</div>
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;max-height:520px;overflow:auto">
            <?php foreach ($messages as $m): ?>
              <?php $dir = (string)($m['direction'] ?? ''); ?>
              <div style="border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">
                  <div class="tag"><?= $dir === 'in' ? 'Inbound' : 'Outbound' ?></div>
                  <div class="muted" style="font-size:12px"><?= cms_h((string)($m['ts'] ?? '')) ?></div>
                </div>
                <div style="margin-top:10px;white-space:pre-wrap;line-height:1.45"><?= cms_h((string)($m['body_text'] ?? '')) ?></div>
              </div>
            <?php endforeach; ?>
            <?php if (!$messages): ?>
              <div class="muted">No messages for this contact yet.</div>
            <?php endif; ?>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </div>
<?php endif; ?>

<?php
$content = ob_get_clean();
$title = 'WhatsApp';
include __DIR__ . '/_layout.php';

