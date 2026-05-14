<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_current_user();
if ($user) cms_redirect('/cms/index.php');

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim((string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($email === '' || $password === '') {
        $error = 'Enter your email and password.';
    } else {
        try {
            $pdo = bm_pdo();
            $stmt = $pdo->prepare('SELECT id, email, password_hash, role, is_active FROM cms_users WHERE email = :e LIMIT 1');
            $stmt->execute([':e' => $email]);
            $row = $stmt->fetch();

            $ok = $row && (int)$row['is_active'] === 1 && is_string($row['password_hash']) && password_verify($password, $row['password_hash']);

            if ($ok) {
                session_regenerate_id(true);
                $_SESSION['user_id'] = (int)$row['id'];
                $pdo->prepare('UPDATE cms_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => (int)$row['id']]);
                cms_redirect('/cms/index.php');
            } else {
                $error = 'Invalid credentials.';
            }
        } catch (Throwable $e) {
            $error = $e->getMessage();
        }
    }
}

?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login | Bethelmind CMS</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0b1220;color:#e5e7eb;margin:0}
    .wrap{max-width:520px;margin:0 auto;padding:46px 18px}
    .card{background:#0f1a2c;border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:20px}
    .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);font-size:12px;font-weight:800;color:#cbd5e1}
    h1{margin:10px 0 0;font-size:26px;font-weight:900}
    .muted{color:#94a3b8;font-size:14px;line-height:1.45;margin-top:6px}
    label{display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.08em}
    input{width:100%;padding:12px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#0b1220;color:#e5e7eb}
    input:focus{outline:2px solid rgba(20,184,166,.55);border-color:transparent}
    .btn{margin-top:16px;display:inline-flex;align-items:center;justify-content:center;padding:12px 16px;border-radius:12px;border:0;background:#14b8a6;color:#062e2a;font-weight:900;cursor:pointer;width:100%}
    .error{margin-top:14px;border:1px solid rgba(244,63,94,.35);background:rgba(244,63,94,.12);padding:12px;border-radius:12px;color:#fecdd3;font-weight:700}
    a{color:#5eead4}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="badge">Bethelmind CMS • <?= cms_h(bm_detect_env()) ?></div>
    <h1>Admin login</h1>
    <div class="muted">Sign in to edit website content, media, and SEO.</div>

    <div class="card" style="margin-top:18px">
      <?php if ($error): ?>
        <div class="error"><?= cms_h($error) ?></div>
      <?php endif; ?>
      <form method="post" autocomplete="on">
        <label>Email</label>
        <input name="email" type="email" required value="<?= cms_h((string)($_POST['email'] ?? '')) ?>" />
        <label>Password</label>
        <input name="password" type="password" required />
        <button class="btn" type="submit">Login</button>
      </form>
      <div class="muted" style="margin-top:14px">
        Not installed yet? Run the installer at <a href="/install/index.php">/install/index.php</a>.
      </div>
    </div>
  </div>
</body>
</html>

