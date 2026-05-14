<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/app.php';

$lockFile = __DIR__ . '/installed.lock';
$isInstalled = is_file($lockFile) || is_file(__DIR__ . '/../config/generated.php');

function h(string $v): string
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function random_password(int $len = 16): string
{
    $bytes = random_bytes($len);
    return substr(rtrim(strtr(base64_encode($bytes), '+/', '-_'), '='), 0, $len);
}

function schema_sql(): array
{
    return [
        "CREATE TABLE IF NOT EXISTS app_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            setting_key VARCHAR(80) NOT NULL UNIQUE,
            setting_value LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS cms_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(190) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(40) NOT NULL DEFAULT 'editor',
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS cms_media (
            id INT AUTO_INCREMENT PRIMARY KEY,
            file_name VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            mime VARCHAR(120) NOT NULL,
            size_bytes INT NOT NULL,
            kind VARCHAR(40) NOT NULL DEFAULT 'image',
            uploaded_by INT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(uploaded_at),
            CONSTRAINT fk_media_user FOREIGN KEY (uploaded_by) REFERENCES cms_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS cms_pages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(120) NOT NULL UNIQUE,
            meta_title VARCHAR(120) NOT NULL,
            meta_description VARCHAR(255) NOT NULL,
            og_image VARCHAR(255) NULL,
            robots VARCHAR(60) NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS bm_leads (
            lead_id VARCHAR(80) NOT NULL PRIMARY KEY,
            name VARCHAR(120) NULL,
            email VARCHAR(190) NULL,
            phone VARCHAR(40) NULL,
            channel VARCHAR(40) NULL,
            source VARCHAR(120) NULL,
            subject VARCHAR(190) NULL,
            message LONGTEXT NULL,
            path VARCHAR(255) NULL,
            first_touch_json LONGTEXT NULL,
            last_touch_json LONGTEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(email),
            INDEX(source),
            INDEX(channel)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS bm_lead_ai (
            lead_id VARCHAR(80) NOT NULL PRIMARY KEY,
            provider VARCHAR(40) NOT NULL,
            model VARCHAR(80) NULL,
            suite_key VARCHAR(60) NULL,
            confidence DECIMAL(5,4) NULL,
            summary VARCHAR(255) NULL,
            reply_subject VARCHAR(190) NULL,
            reply_body LONGTEXT NULL,
            raw_json LONGTEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(provider),
            INDEX(suite_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS bm_funnel_events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id VARCHAR(80) NOT NULL UNIQUE,
            lead_id VARCHAR(80) NOT NULL,
            session_id VARCHAR(80) NOT NULL,
            name VARCHAR(80) NOT NULL,
            ts BIGINT NOT NULL,
            props_json LONGTEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX(name),
            INDEX(ts),
            INDEX(lead_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS bm_whatsapp_messages (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS bm_whatsapp_contacts (
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
            INDEX(last_inbound_ts),
            CONSTRAINT fk_whatsapp_assigned_to FOREIGN KEY (assigned_to) REFERENCES cms_users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS bm_whatsapp_templates (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        "CREATE TABLE IF NOT EXISTS bm_whatsapp_followups (
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
            INDEX(wa_number),
            CONSTRAINT fk_followup_template FOREIGN KEY (template_id) REFERENCES bm_whatsapp_templates(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    ];
}

function ensure_defaults(PDO $pdo): void
{
    $defaultPath = __DIR__ . '/../cms/default_site_content.json';
    $defaultJson = is_file($defaultPath) ? file_get_contents($defaultPath) : '{}';
    if (!is_string($defaultJson) || trim($defaultJson) === '') $defaultJson = '{}';
    $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('site_content', :v) ON DUPLICATE KEY UPDATE setting_key = setting_key")
        ->execute([':v' => $defaultJson]);
    $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('solutions', '[]') ON DUPLICATE KEY UPDATE setting_key = setting_key")->execute();
    $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('blog_posts', '[]') ON DUPLICATE KEY UPDATE setting_key = setting_key")->execute();
}

$cfg = bm_config();
$defaults = [
    'db_host' => $cfg['db']['host'] ?? 'localhost',
    'db_name' => $cfg['db']['name'] ?? '',
    'db_user' => $cfg['db']['user'] ?? '',
    'base_url' => $cfg['base_url'] ?? bm_base_url(),
];

$state = [
    'done' => false,
    'error' => null,
    'admin_email' => 'admin@bethelmind.com',
    'admin_password' => random_password(),
];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$isInstalled) {
    $dbHost = trim((string)($_POST['db_host'] ?? 'localhost'));
    $dbName = trim((string)($_POST['db_name'] ?? ''));
    $dbUser = trim((string)($_POST['db_user'] ?? ''));
    $dbPass = (string)($_POST['db_pass'] ?? '');
    $baseUrl = trim((string)($_POST['base_url'] ?? bm_base_url()));
    $adminEmail = trim((string)($_POST['admin_email'] ?? $state['admin_email']));
    $adminPassword = (string)($_POST['admin_password'] ?? $state['admin_password']);

    if ($dbHost === '' || $dbName === '' || $dbUser === '' || $adminEmail === '' || $adminPassword === '') {
        $state['error'] = 'Please fill all required fields.';
    } else {
        try {
            $dsn = "mysql:host={$dbHost};dbname={$dbName};charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            foreach (schema_sql() as $sql) $pdo->exec($sql);
            ensure_defaults($pdo);

            $hash = password_hash($adminPassword, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO cms_users (email, password_hash, role, is_active) VALUES (:e, :p, 'admin', 1)
                ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin', is_active = 1");
            $stmt->execute([':e' => $adminEmail, ':p' => $hash]);

            $generatedPath = __DIR__ . '/../config/generated.php';
            $generated = [
                'base_url' => $baseUrl,
                'db' => [
                    'host' => $dbHost,
                    'name' => $dbName,
                    'user' => $dbUser,
                    'pass' => $dbPass,
                    'charset' => 'utf8mb4',
                ],
                'ai' => [
                    'provider' => '',
                    'gemini_api_key' => '',
                    'gemini_model' => 'gemini-2.5-flash-lite',
                ],
                'whatsapp' => [
                    'provider' => '',
                    'access_token' => '',
                    'phone_number_id' => '',
                    'verify_token' => '',
                    'admin_numbers' => [],
                    'auto_reply_enabled' => false,
                    'auto_reply_text' => '',
                ],
                'cron' => [
                    'token' => '',
                ],
                'uploads' => [
                    'dir' => __DIR__ . '/../uploads',
                    'url' => '/uploads',
                    'max_bytes' => 8388608,
                ],
                'security' => [
                    'session_name' => 'bm_cms',
                ],
            ];

            $php = "<?php\n\nreturn " . var_export($generated, true) . ";\n";
            if (!is_dir(dirname($generatedPath))) mkdir(dirname($generatedPath), 0755, true);
            if (file_put_contents($generatedPath, $php) === false) {
                throw new RuntimeException('Failed to write config/generated.php. Ensure the /config directory is writable.');
            }

            file_put_contents($lockFile, 'installed');
            $state['done'] = true;
            $state['admin_email'] = $adminEmail;
            $state['admin_password'] = $adminPassword;
            $defaults = [
                'db_host' => $dbHost,
                'db_name' => $dbName,
                'db_user' => $dbUser,
                'base_url' => $baseUrl,
            ];
        } catch (Throwable $e) {
            $state['error'] = $e->getMessage();
        }
    }
}

$writableConfig = is_writable(__DIR__ . '/../config') || (!is_dir(__DIR__ . '/../config') && is_writable(dirname(__DIR__ . '/../config')));
$writableUploads = is_dir(__DIR__ . '/../uploads') ? is_writable(__DIR__ . '/../uploads') : is_writable(dirname(__DIR__ . '/../uploads'));

?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bethelmind CMS Installer</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0b1220;color:#e5e7eb;margin:0}
    .wrap{max-width:980px;margin:0 auto;padding:40px 18px}
    .card{background:#0f1a2c;border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:20px}
    .grid{display:grid;grid-template-columns:1fr;gap:14px}
    @media (min-width:860px){.grid{grid-template-columns:1fr 1fr}}
    label{display:block;font-size:12px;font-weight:700;color:#cbd5e1;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em}
    input{width:100%;padding:12px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#0b1220;color:#e5e7eb}
    input:focus{outline:2px solid rgba(20,184,166,.55);border-color:transparent}
    .btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:12px;border:0;background:#14b8a6;color:#062e2a;font-weight:800;cursor:pointer}
    .btn:disabled{opacity:.6;cursor:not-allowed}
    .muted{color:#94a3b8;font-size:14px;line-height:1.45}
    .title{font-size:28px;font-weight:900;margin:0 0 6px}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);font-size:12px;font-weight:800;color:#cbd5e1}
    .error{margin-top:14px;border:1px solid rgba(244,63,94,.35);background:rgba(244,63,94,.12);padding:12px;border-radius:12px;color:#fecdd3}
    .ok{margin-top:14px;border:1px solid rgba(16,185,129,.35);background:rgba(16,185,129,.12);padding:12px;border-radius:12px;color:#bbf7d0}
    .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between}
    a{color:#5eead4}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="row">
      <div>
        <div class="badge">Installer • <?= h(bm_detect_env()) ?></div>
        <h1 class="title">Bethelmind CMS Installer</h1>
        <div class="muted">Creates database tables, writes configuration, and sets up your first admin user.</div>
      </div>
      <div class="muted">Target admin: <a href="/cms/login.php">/cms/login.php</a></div>
    </div>

    <div class="card" style="margin-top:18px">
      <div class="row">
        <div class="muted">
          Config writable: <strong><?= $writableConfig ? 'Yes' : 'No' ?></strong> •
          Uploads writable: <strong><?= $writableUploads ? 'Yes' : 'No' ?></strong>
        </div>
        <?php if ($isInstalled): ?>
          <div class="badge">Already installed</div>
        <?php endif; ?>
      </div>

      <?php if ($state['error']): ?>
        <div class="error"><?= h($state['error']) ?></div>
      <?php endif; ?>

      <?php if ($state['done']): ?>
        <div class="ok">
          <div style="font-weight:900;font-size:16px">Install complete</div>
          <div class="muted" style="margin-top:8px">
            Admin email: <strong><?= h($state['admin_email']) ?></strong><br />
            Admin password: <strong><?= h($state['admin_password']) ?></strong><br />
            Login: <a href="/cms/login.php">/cms/login.php</a>
          </div>
          <div class="muted" style="margin-top:10px">Security: delete the <strong>/install</strong> folder after login.</div>
        </div>
      <?php elseif (!$isInstalled): ?>
        <form method="post" style="margin-top:16px">
          <div class="grid">
            <div>
              <label>Database Host</label>
              <input name="db_host" value="<?= h($defaults['db_host']) ?>" required />
            </div>
            <div>
              <label>Database Name</label>
              <input name="db_name" value="<?= h($defaults['db_name']) ?>" required />
            </div>
            <div>
              <label>Database User</label>
              <input name="db_user" value="<?= h($defaults['db_user']) ?>" required />
            </div>
            <div>
              <label>Database Password</label>
              <input name="db_pass" type="password" value="" />
            </div>
            <div>
              <label>Base URL</label>
              <input name="base_url" value="<?= h($defaults['base_url']) ?>" required />
            </div>
            <div></div>
            <div>
              <label>Admin Email</label>
              <input name="admin_email" value="<?= h($state['admin_email']) ?>" required />
            </div>
            <div>
              <label>Admin Password</label>
              <input name="admin_password" value="<?= h($state['admin_password']) ?>" required />
            </div>
          </div>

          <div class="row" style="margin-top:16px">
            <div class="muted">Tip: Create the MySQL database/user in Hostinger hPanel first, then paste credentials here.</div>
            <button class="btn" type="submit" <?= (!$writableConfig || !$writableUploads) ? 'disabled' : '' ?>>Install</button>
          </div>
        </form>
      <?php else: ?>
        <div class="muted" style="margin-top:14px">If you need to reinstall, remove <strong>/config/generated.php</strong> and <strong>/install/installed.lock</strong>.</div>
      <?php endif; ?>
    </div>
  </div>
</body>
</html>

