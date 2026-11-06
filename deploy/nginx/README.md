# Nginx deployment

This project builds a static Next.js site into `out/`. Nginx serves that
directory directly; there is no Node process in production. The contact form
is the only dynamic endpoint and runs through PHP-FPM.

## Install

1. Build locally with the production `NEXT_PUBLIC_SITE_URL`:

   ```bash
   npm ci
   NEXT_PUBLIC_SITE_URL=https://example.com npm run build
   ```

2. Upload the contents of `out/` to `/var/www/alifatehi.site/out/`.
3. Copy `alifatehi.site.conf.example` to Nginx's `sites-available`, then set
   `server_name`, `root`, and the installed PHP-FPM socket.
4. Enable the site and validate/reload Nginx:

   ```bash
   sudo ln -s /etc/nginx/sites-available/alifatehi.site /etc/nginx/sites-enabled/alifatehi.site
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. Copy `out/api/config.example.php` to `out/api/config.php` and fill in the
   Telegram/mail settings. Keep that file outside version control.

For HTTPS, terminate TLS in Nginx (for example with Certbot) and change the
canonical URL used at build time to `https://...`.
