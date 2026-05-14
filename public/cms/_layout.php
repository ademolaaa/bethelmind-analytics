<?php

declare(strict_types=1);

$role = (string)($user['role'] ?? '');
$flashSuccess = cms_flash_get('success');
$flashError = cms_flash_get('error');

?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= cms_h($title) ?> | Bethelmind CMS</title>
  <style>
    :root{--bg:#0b1220;--card:#0f1a2c;--border:rgba(255,255,255,.10);--muted:#94a3b8;--text:#e5e7eb;--brand:#14b8a6;--danger:#fb7185;--warn:#f59e0b}
    *{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);margin:0}
    a{color:inherit;text-decoration:none}
    .wrap{display:grid;grid-template-columns:280px 1fr;min-height:100vh}
    .side{border-right:1px solid var(--border);background:rgba(255,255,255,.02)}
    .brand{padding:18px 18px 14px}
    .brand .k{display:inline-flex;gap:8px;align-items:center;padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);font-size:12px;font-weight:800;color:#cbd5e1}
    .brand h1{margin:10px 0 0;font-size:18px;letter-spacing:-.02em}
    .nav{padding:10px}
    .nav a{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 12px;border-radius:12px;color:#cbd5e1;border:1px solid transparent}
    .nav a:hover{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.08)}
    .nav .muted{font-size:12px;color:var(--muted)}
    .main{padding:24px 18px}
    .container{max-width:1100px;margin:0 auto}
    .top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .title{font-size:26px;font-weight:900;margin:0}
    .sub{margin:6px 0 0;color:var(--muted);line-height:1.4}
    .card{margin-top:18px;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:18px}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:8px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);font-size:12px;font-weight:800;color:#cbd5e1}
    .btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:11px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#e5e7eb;font-weight:800;cursor:pointer}
    .btn-primary{background:var(--brand);border-color:rgba(20,184,166,.45);color:#062e2a}
    .btn-danger{background:rgba(251,113,133,.15);border-color:rgba(251,113,133,.35);color:#fecdd3}
    .grid{display:grid;grid-template-columns:1fr;gap:14px}
    @media (min-width:920px){.grid{grid-template-columns:1fr 1fr}}
    label{display:block;font-size:12px;font-weight:800;color:#cbd5e1;margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em}
    input,textarea,select{width:100%;padding:12px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:#0b1220;color:#e5e7eb}
    textarea{min-height:120px;resize:vertical}
    input:focus,textarea:focus,select:focus{outline:2px solid rgba(20,184,166,.55);border-color:transparent}
    .flash{margin-top:14px;border-radius:12px;padding:12px;font-weight:700}
    .flash-ok{border:1px solid rgba(16,185,129,.35);background:rgba(16,185,129,.12);color:#bbf7d0}
    .flash-err{border:1px solid rgba(244,63,94,.35);background:rgba(244,63,94,.12);color:#fecdd3}
    .table{width:100%;border-collapse:separate;border-spacing:0 10px}
    .table th{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);text-align:left;padding:0 10px}
    .table td{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);padding:12px 10px}
    .table tr td:first-child{border-top-left-radius:12px;border-bottom-left-radius:12px}
    .table tr td:last-child{border-top-right-radius:12px;border-bottom-right-radius:12px}
    .tag{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.03);font-size:12px;font-weight:800}
    .tag-admin{border-color:rgba(245,158,11,.35);background:rgba(245,158,11,.10);color:#fde68a}
    .tag-editor{border-color:rgba(20,184,166,.35);background:rgba(20,184,166,.10);color:#99f6e4}
    .tag-viewer{border-color:rgba(148,163,184,.35);background:rgba(148,163,184,.10);color:#e2e8f0}
    .right{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
    .muted{color:var(--muted)}
    @media (max-width:900px){.wrap{grid-template-columns:1fr}.side{position:sticky;top:0;z-index:30}}
  </style>
</head>
<body>
  <div class="wrap">
    <aside class="side">
      <div class="brand">
        <div class="k">Bethelmind CMS</div>
        <h1>Admin Dashboard</h1>
        <div class="muted" style="margin-top:6px"><?= cms_h((string)$user['email']) ?></div>
      </div>
      <nav class="nav">
        <a href="/cms/index.php"><span>Overview</span><span class="muted">Home</span></a>
        <a href="/cms/content.php"><span>Content</span><span class="muted">Text & structure</span></a>
        <a href="/cms/solutions.php"><span>Solutions</span><span class="muted">Offers</span></a>
        <a href="/cms/blog.php"><span>Blog</span><span class="muted">Articles</span></a>
        <a href="/cms/meta.php"><span>Meta</span><span class="muted">SEO</span></a>
        <a href="/cms/media.php"><span>Media</span><span class="muted">Uploads</span></a>
        <a href="/cms/whatsapp.php"><span>WhatsApp</span><span class="muted">Inbox</span></a>
        <?php if ($role === 'admin'): ?>
          <a href="/cms/users.php"><span>Users</span><span class="muted">RBAC</span></a>
          <a href="/cms/export.php"><span>Export</span><span class="muted">Hostinger</span></a>
        <?php endif; ?>
        <a href="/cms/logout.php"><span>Logout</span><span class="muted">Exit</span></a>
      </nav>
    </aside>

    <main class="main">
      <div class="container">
        <div class="top">
          <div>
            <h2 class="title"><?= cms_h($title) ?></h2>
            <div class="sub">Role: <span class="tag <?= $role === 'admin' ? 'tag-admin' : ($role === 'editor' ? 'tag-editor' : 'tag-viewer') ?>"><?= cms_h($role) ?></span></div>
          </div>
          <div class="right">
            <a class="btn" href="/" target="_blank" rel="noopener">Open website</a>
          </div>
        </div>

        <?php if ($flashSuccess): ?>
          <div class="flash flash-ok"><?= cms_h($flashSuccess) ?></div>
        <?php endif; ?>
        <?php if ($flashError): ?>
          <div class="flash flash-err"><?= cms_h($flashError) ?></div>
        <?php endif; ?>

        <div class="card">
          <?= $content ?>
        </div>
      </div>
    </main>
  </div>
</body>
</html>

