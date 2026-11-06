# استقرار روی Runflare (سرویس Next.js)

دامنه: **https://alifatehi.ir** — این مقدار در `src/lib/site.ts`
(`PRODUCTION_URL`) ثبت است و اگر `NEXT_PUBLIC_SITE_URL` موقع build در دسترس
نباشد، همین استفاده می‌شود. پس canonical، sitemap و چک Origin فرم تماس
هیچ‌وقت به `localhost` نمی‌افتند.

## تنظیمات سرویس

| مورد | مقدار |
| --- | --- |
| نوع سرویس | Next.js / Node.js |
| نسخه Node | 20 یا بالاتر |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `npm start` |
| Port | `3000` (یا هر چه Runflare در `PORT` بدهد؛ سرور خودش می‌خواند) |

`--include=dev` لازم است: `next build` تایپ‌چک می‌کند و `@types/*` در
devDependencies هستند. اگر پنل `NODE_ENV=production` را موقع نصب ست کند،
بدون این فلگ build می‌شکند.

`npm start` خودش `HOSTNAME=0.0.0.0` را ست می‌کند. سرور standalone در غیر این
صورت روی hostname کانتینر گوش می‌دهد و ممکن است از بیرون در دسترس نباشد.

## متغیرهای محیطی (پنل Runflare)

```env
NEXT_PUBLIC_SITE_URL=https://alifatehi.ir
CONTACT_WORKER_URL=https://aged-haze-03a8.tpapda.workers.dev/
CONTACT_WORKER_SECRET=<همان secret ست‌شده در Cloudflare، حداقل ۳۲ کاراکتر>
```

- **`SITE_ENV` را ست نکنید.** `SITE_ENV=staging` کل سایت را noindex می‌کند.
- هیچ secretی را با پیشوند `NEXT_PUBLIC_` تعریف نکنید.
- `CONTACT_WORKER_SECRET` در زمان اجرا خوانده می‌شود؛ بعد از تغییرش فقط
  ری‌استارت لازم است، نه build دوباره.

## دامنه

`alifatehi.ir` و `www.alifatehi.ir` را در پنل به سرویس وصل کنید و SSL را
فعال کنید. نسخه www را به نسخه بدون www **ریدایرکت ۳۰۱** کنید؛ canonical
همه صفحه‌ها بدون www است. فرم تماس هر دو را قبول می‌کند.

## بعد از deploy چک کنید

- `/` و `/en/` → ۲۰۰
- `/services` → ۳۰۸ به `/services/` (همه آدرس‌ها اسلش پایانی دارند)
- `/fa/` → ۳۰۸ به `/`
- `/robots.txt` → `Allow: /` و آدرس sitemap روی `alifatehi.ir`
- `/sitemap.xml` → ۴۴ آدرس، همه روی `https://alifatehi.ir`
- سورس صفحه اصلی: `<meta name="robots" content="index, follow">` و تگ
  `google-site-verification`
- یک پیام تستی از فرم تماس (پیام واقعی به تلگرام می‌رود)

بعد از آن، در Google Search Console سایت‌مپ را ثبت کنید.

## فرم تماس

مسیر: مرورگر → `/api/contact/` روی Next.js → Cloudflare Worker (HTTPS) →
تلگرام. کد Worker در `deploy/cloudflare/contact-worker.mjs` است. توکن تلگرام
و چت آیدی فقط در Cloudflare هستند (`TELEGRAM_BOT_TOKEN`، `TELEGRAM_CHAT_ID`).
یک secret با `openssl rand -hex 32` بسازید و مقدار یکسان را در Runflare و
Cloudflare با نام `CONTACT_WORKER_SECRET` بگذارید.

محدودیت ارسال (۵ ارسال معتبر در ۱۰ دقیقه) در حافظه هر پردازش است. با بیش
از یک replica، هر replica شمارنده خودش را دارد.

## روش Docker (جایگزین)

`Dockerfile` هم آماده است و `.dockerignore` جلوی کپی‌شدن `node_modules`
میزبان را می‌گیرد. آدرس سایت در Dockerfile پیش‌فرض `https://alifatehi.ir`
است؛ برای نسخه تست `--build-arg NEXT_PUBLIC_SITE_URL=...` بدهید.
