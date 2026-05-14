<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';

$user = cms_require_login();
cms_require_role($user, ['admin']);

$pdo = bm_pdo();

function u_random_password(int $len = 16): string
{
    $bytes = random_bytes($len);
    return substr(rtrim(strtr(base64_encode($bytes), '+/', '-_'), '='), 0, $len);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    cms_verify_csrf();
    $action = (string)($_POST['action'] ?? '');

    try {
        if ($action === 'create') {
            $email = trim((string)($_POST['email'] ?? ''));
            $role = trim((string)($_POST['role'] ?? 'editor'));
            $password = (string)($_POST['password'] ?? '');
            if ($email === '' || $password === '') throw new RuntimeException('Email and password are required.');
            if (!in_array($role, ['admin', 'editor', 'viewer'], true)) $role = 'editor';

            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('INSERT INTO cms_users (email, password_hash, role, is_active) VALUES (:e, :p, :r, 1)');
            $stmt->execute([':e' => $email, ':p' => $hash, ':r' => $role]);
            cms_flash_set('success', 'User created.');
            cms_redirect('/cms/users.php');
        }

        if ($action === 'update') {
            $id = (int)($_POST['id'] ?? 0);
            $role = trim((string)($_POST['role'] ?? 'editor'));
            $active = (int)($_POST['is_active'] ?? 1) === 1 ? 1 : 0;
            if (!in_array($role, ['admin', 'editor', 'viewer'], true)) $role = 'editor';
            if ($id === (int)$user['id'] && $active === 0) throw new RuntimeException('You cannot deactivate your own account.');

            $stmt = $pdo->prepare('UPDATE cms_users SET role = :r, is_active = :a WHERE id = :id');
            $stmt->execute([':r' => $role, ':a' => $active, ':id' => $id]);
            cms_flash_set('success', 'User updated.');
            cms_redirect('/cms/users.php');
        }

        if ($action === 'reset_password') {
            $id = (int)($_POST['id'] ?? 0);
            $password = (string)($_POST['password'] ?? '');
            if ($password === '') $password = u_random_password();
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE cms_users SET password_hash = :p WHERE id = :id');
            $stmt->execute([':p' => $hash, ':id' => $id]);
            cms_flash_set('success', 'Password updated. New password: ' . $password);
            cms_redirect('/cms/users.php');
        }

        cms_flash_set('error', 'Unknown action.');
        cms_redirect('/cms/users.php');
    } catch (Throwable $e) {
        cms_flash_set('error', $e->getMessage());
        cms_redirect('/cms/users.php');
    }
}

$users = [];
try {
    $users = $pdo->query('SELECT id, email, role, is_active, created_at, last_login_at FROM cms_users ORDER BY id ASC')->fetchAll();
    if (!is_array($users)) $users = [];
} catch (Throwable) {
}

ob_start();
?>
<div class="grid">
  <div>
    <div style="font-weight:900;font-size:16px">Create user</div>
    <div class="muted" style="margin-top:6px">Admins can manage users; editors can change content; viewers are read-only.</div>
    <form method="post" style="margin-top:12px">
      <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
      <input type="hidden" name="action" value="create" />
      <label>Email</label>
      <input name="email" type="email" required />
      <div class="grid" style="margin-top:12px">
        <div>
          <label>Role</label>
          <select name="role">
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label>Password</label>
          <input name="password" required />
        </div>
      </div>
      <div style="margin-top:12px;display:flex;justify-content:flex-end">
        <button class="btn btn-primary" type="submit">Create</button>
      </div>
    </form>
  </div>
  <div>
    <div style="font-weight:900;font-size:16px">Security</div>
    <div class="muted" style="margin-top:6px">Use long passwords, keep admin accounts limited, and deactivate unused users.</div>
    <div style="margin-top:12px;border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;background:rgba(255,255,255,.02)">
      <div class="muted" style="font-weight:900">Recommended roles</div>
      <div style="margin-top:8px;line-height:1.6">
        <div><span class="tag tag-admin">admin</span> Full access, including users and export.</div>
        <div style="margin-top:6px"><span class="tag tag-editor">editor</span> Content, meta, media.</div>
        <div style="margin-top:6px"><span class="tag tag-viewer">viewer</span> Read-only access.</div>
      </div>
    </div>
  </div>
</div>

<div style="margin-top:22px;border-top:1px solid rgba(255,255,255,.10);padding-top:18px">
  <div style="font-weight:900;font-size:16px">Users</div>
  <table class="table" style="margin-top:12px">
    <thead>
      <tr>
        <th style="width:60px">ID</th>
        <th>Email</th>
        <th style="width:120px">Role</th>
        <th style="width:120px">Active</th>
        <th style="width:190px">Last login</th>
        <th style="width:220px">Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($users as $u): $id = (int)($u['id'] ?? 0); ?>
        <tr>
          <td><?= $id ?></td>
          <td>
            <div style="font-weight:900"><?= cms_h((string)($u['email'] ?? '')) ?></div>
            <div class="muted" style="margin-top:4px">Created: <?= cms_h((string)($u['created_at'] ?? '')) ?></div>
          </td>
          <td>
            <form method="post">
              <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
              <input type="hidden" name="action" value="update" />
              <input type="hidden" name="id" value="<?= $id ?>" />
              <select name="role" onchange="this.form.submit()">
                <?php foreach (['admin','editor','viewer'] as $r): ?>
                  <option value="<?= $r ?>" <?= ((string)($u['role'] ?? '') === $r) ? 'selected' : '' ?>><?= $r ?></option>
                <?php endforeach; ?>
              </select>
              <input type="hidden" name="is_active" value="<?= ((int)($u['is_active'] ?? 0) === 1) ? '1' : '0' ?>" />
            </form>
          </td>
          <td>
            <form method="post">
              <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
              <input type="hidden" name="action" value="update" />
              <input type="hidden" name="id" value="<?= $id ?>" />
              <input type="hidden" name="role" value="<?= cms_h((string)($u['role'] ?? 'editor')) ?>" />
              <select name="is_active" onchange="this.form.submit()">
                <option value="1" <?= ((int)($u['is_active'] ?? 0) === 1) ? 'selected' : '' ?>>Yes</option>
                <option value="0" <?= ((int)($u['is_active'] ?? 0) === 0) ? 'selected' : '' ?>>No</option>
              </select>
            </form>
          </td>
          <td class="muted"><?= cms_h((string)($u['last_login_at'] ?? '')) ?></td>
          <td>
            <form method="post" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <input type="hidden" name="csrf" value="<?= cms_h(cms_csrf_token()) ?>" />
              <input type="hidden" name="action" value="reset_password" />
              <input type="hidden" name="id" value="<?= $id ?>" />
              <input name="password" placeholder="New password (blank = random)" style="width:200px" />
              <button class="btn" type="submit">Reset</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (count($users) === 0): ?>
        <tr><td colspan="6" class="muted">No users found.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>
<?php
$content = ob_get_clean();
$title = 'Users';
include __DIR__ . '/_layout.php';

