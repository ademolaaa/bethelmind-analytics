Hostinger Deployment (No CLI)

This project deploys as a single folder upload to Hostinger’s public_html. The website is a built React SPA (static files) plus a PHP/MySQL CMS (admin + API) inside the same public_html directory.

What You Get
- Public site (static): /index.html + /assets/*
- CMS admin (PHP): /cms/*
- Public API (PHP): /api/*
- Installer (PHP): /install/*
- Uploads storage: /uploads/*
- Security + environment config: /config/*

Folder Structure (in Hostinger public_html)
public_html/
- index.html
- assets/
- api/
  - bootstrap.php
  - content.php
  - get_content.php
  - meta.php
  - save_content.php
- cms/
  - login.php
  - index.php
  - content.php
  - meta.php
  - media.php
  - users.php
  - export.php
  - default_site_content.json
  - _bootstrap.php
  - _layout.php
  - logout.php
- install/
  - index.php
  - installed.lock (created after install)
- uploads/
  - (your uploaded files)
- config/
  - app.php
  - generated.php (created by installer)
  - generated.example.php
- .htaccess
- robots.txt
- sitemap.xml
- llms.txt

Step-by-Step: Deploy to Hostinger (No Command Line)

1) Build the deployment folder locally
- On your computer, run:
  - npm install
  - npm run build
- This creates dist/ which already contains everything needed for Hostinger upload, including the PHP CMS/API from public/.

2) Create a database in Hostinger hPanel
- hPanel → Databases → MySQL Databases
- Create:
  - Database name
  - Database user
  - Database password
- Note the values (you will paste them into the installer).
- Host is typically localhost in Hostinger.

3) Upload to public_html
- hPanel → Files → File Manager
- Open public_html
- Upload the contents of your local dist/ directory into public_html
  - Upload files/folders inside dist/, not the dist folder itself
- Ensure these paths exist after upload:
  - public_html/cms
  - public_html/api
  - public_html/install
  - public_html/config
  - public_html/uploads

4) Ensure required folders are writable (File Manager)
- public_html/uploads should be writable (recommended 755)
- public_html/config should be writable during installation (recommended 755)

5) Run the installer in your browser
- Visit:
  - https://YOUR-DOMAIN/install/index.php
- Fill:
  - Database host: localhost
  - Database name/user/password: from hPanel
  - Base URL: https://YOUR-DOMAIN
  - Admin email/password: set your secure credentials
- Click Install
- The installer will:
  - Create tables (app_settings, cms_users, cms_media, cms_pages)
  - Write /config/generated.php
  - Store default site content in the database
  - Create/update the admin user

6) Login to the CMS
- Visit:
  - https://YOUR-DOMAIN/cms/login.php
- Edit:
  - Content → website text and structured content
  - Media → upload images/PDFs and copy URLs
  - Meta → titles/descriptions/OG/robots per route

Admin Password Notes
- /admin redirects to /cms/login.php (see public/admin/index.php).
- CMS admin password is set during installation (Step 5).
- If you use the React /admin route during local development, it reads the password from VITE_ADMIN_PASSWORD at build/runtime.

7) Secure the installer
- After you confirm CMS login works:
  - Delete the public_html/install folder in File Manager

8) Optional: Password-protect /cms in Hostinger
- Recommended for extra safety even with CMS login:
  - hPanel → Websites → Manage → Password Protect Directories
  - Protect the /cms directory (and optionally /api if you expose admin endpoints there)
- If you prefer manual .htaccess, use a standard Basic Auth setup for the /cms directory.

Export Package (Optional)
- If you want a single ZIP of the entire deployed application:
  - Login as admin → CMS → Export
  - Generate ZIP export
- This ZIP mirrors your current public_html contents.

How “Auto Hostinger Detection” Works
- /config/app.php detects environment using the server software + document root patterns and picks safe defaults (e.g., localhost DB host).
- Real credentials are stored only in /config/generated.php (written by the installer).

Security Notes
- Admin auth uses PHP sessions + password_hash()
- All DB access uses PDO prepared statements
- CMS forms include CSRF tokens
- Uploads validate MIME/type and size
- .htaccess blocks direct access to /config and disables directory listing

Common Troubleshooting
- Installer says “config not writable”
  - Set permissions on public_html/config and try again.
- SPA routes show 404 on refresh
  - Ensure .htaccess uploaded into public_html root.
- Uploads fail
  - Ensure public_html/uploads exists and is writable.
