# alifatehi.site

Personal / professional site. Next.js 16 (App Router) + TypeScript + Tailwind v4,
bilingual fa/en, MDX content in-repo, deployable to any plain Node host.

---

## راه‌اندازی

```bash
npm install
npm run fonts          # کپی فونت‌ها از node_modules به src/assets/fonts
cp .env.example .env
npm run dev
```

`.env`:

| متغیر | توضیح |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | دامنه بدون اسلش پایانی. canonical، hreflang، sitemap و OG همه از همین یک مقدار می‌خوانند. |
| `CONTACT_WORKER_URL` | آدرس HTTPS ورکر واسط تلگرام. |
| `CONTACT_WORKER_SECRET` | secret مشترک سمت سرور Next و Cloudflare؛ حداقل ۳۲ کاراکتر تصادفی. |

توکن تلگرام و چت آیدی در secretهای Cloudflare نگهداری می‌شوند. راهنمای اتصال
و کد Worker در `RUNFLARE.md` است. تنظیم ناقص Worker خطا می‌دهد و به ارسال
مستقیم یا کنسول fallback نمی‌کند. بدون هیچ تنظیم اعلان، در توسعه پیام‌ها در
کنسول لاگ می‌شوند و در پروداکشن فرم خطا می‌دهد.

## دستورها

| دستور | کار |
| --- | --- |
| `npm run dev` | سرور توسعه |
| `npm run build` | اعتبارسنجی محتوا → صدور پیام‌های فرم → بیلد استاتیک در `out/` → تولید کارت‌های OG |
| `npm run deploy` | دیپلوی legacy خروجی استاتیک؛ برای Runflare از Git/Docker استفاده کنید |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run content:check` | فقط اعتبارسنجی MDX |
| `npm run og` | فقط تولید کارت‌های OG |
| `npm run media` | تبدیل تصاویر `assets/images` به AVIF/WebP در `public/media` |
| `npm run fonts` | کپی فونت‌ها از `node_modules` |

بعد از build، `npm start` سرور standalone را اجرا می‌کند.

## افزودن محتوا

سه مجموعه، هرکدام یک پوشه per-locale:

```
content/services/{fa,en}/<slug>.mdx
content/portfolio/{fa,en}/<slug>.mdx
content/blog/{fa,en}/<slug>.mdx
```

- **نام فایل، اسلاگ است.** اسلاگ‌های fa و en می‌توانند کاملاً متفاوت باشند.
- **`translationKey` نسخه‌های دو زبان را جفت می‌کند.** hreflang، سوییچ زبان و
  sitemap همگی از همین کلید می‌خوانند — نه از اسلاگ.
- اسکیمای فرانت‌متر در `src/lib/content/schemas.ts` است و در `prebuild` اجرا
  می‌شود؛ خطا یعنی بیلد fail می‌شود، نه اینکه صفحه ناقص منتشر شود.

دو قانون که عمداً در سطح تایپ اجبار شده‌اند:

- هر کیس‌استادی حداقل **یک متریک** با `before`/`after` لازم دارد.
- هر مقاله بلاگ **`relatedService` اجباری** دارد؛ لینک داخلی به صفحه خدمت
  قابل فراموش‌شدن نیست.

## دیپلوی

سایت برای اجرای **Next.js standalone** روی Runflare آماده است. فرم تماس از API
داخلی Next.js استفاده می‌کند و به PHP-FPM وابسته نیست.

راهنمای کامل Runflare در `RUNFLARE.md` و Dockerfile آماده در `Dockerfile` است.
برای دامنه اصلی، `SITE_ENV=staging` را تنظیم نکنید تا صفحات index شوند.

```bash
npm ci
NEXT_PUBLIC_SITE_URL=https://دامنه-اصلی npm run build
npm start
```

## تصمیم‌های معماری

- **فارسی بدون پیشوند، انگلیسی با پیشوند.** `/services/speed` فارسی است و
  `/en/services/speed` انگلیسی. بازار اول ایران است، پس آدرس‌های فارسی
  کوتاه‌اند. صفحه‌ها زیر درخت `[locale]` زندگی می‌کنند و `src/proxy.ts`
  مسیر بدون پیشوند را *rewrite* می‌کند (نه ریدایرکت)، پس URL تمیز می‌ماند.
- **`/fa/...` هیچ‌وقت آدرس عمومی نیست** و با ۳۰۸ روی شکل بدون پیشوند تا
  می‌شود. چون فایل‌ها فیزیکاً آنجا هستند، بدون این قانون هر سند فارسی دو
  آدرس قابل ایندکس می‌داشت.
- **روی `/` ریدایرکت بر اساس Accept-Language نداریم.** سرو کردن زبان متفاوت
  روی آدرس کانونیکال بسته به اینکه چه کسی درخواست داده، سیگنال گوگل را
  می‌شکند — و خزنده گوگل از لوکال آمریکا می‌آید، یعنی صفحه انگلیسی را
  به‌عنوان صفحه اصلی ایندکس می‌کرد. `/` برای همه فارسی است.
- **`src/proxy.ts`** جایگزین `middleware.ts` است (قرارداد Next 16).
- **`src/lib/content/reader.ts` تنها ماژولی است که `fs` را می‌شناسد.**
  مهاجرت به CMS یعنی بازنویسی همین یک فایل.
- **فرم تماس روی `api/contact` است.** همان قوانین سمت Node را دارد و با
  Server API و Server Action قابل استفاده است.
- **فرم بدون جاوااسکریپت هم کار می‌کند.** یک `<form method="POST">` واقعی
  است و به API داخلی Next ارسال می‌شود.
- **کارت‌های OG در زمان بیلد ساخته می‌شوند** با resvg، نه satori — satori
  حروف فارسی را متصل نمی‌کند.
- **تصاویر در زمان بیلد بهینه می‌شوند**؛ `images.unoptimized` روشن است تا
  رانتایم هاست هیچ CPUای خرج تصویر نکند.
- **هیچ کلاس جهت‌دار Tailwind مجاز نیست.** یک قانون ESLint استفاده از
  `ml-`، `text-left` و مشابه را خطا می‌دهد؛ فقط `ms-`, `me-`, `ps-`, `pe-`,
  `start-`, `end-`, `text-start`, `text-end`.
- **سوییچ زبان لینک hreflang را از `<head>` می‌خواند** چون اسلاگ‌ها بین دو
  زبان متفاوت‌اند و با جابه‌جایی پیشوند قابل حدس زدن نیستند. فقط *مسیر* را
  از آن برمی‌دارد نه آدرس کامل، تا روی localhost و دامنه استیجینگ هم کار کند.

## کارهای باقی‌مانده

- [ ] `NEXT_PUBLIC_SITE_URL` را با دامنه واقعی جایگزین کنید.
- [ ] در `src/lib/site.ts` هندل‌های گیت‌هاب، لینکدین و تلگرام را درست کنید.
- [ ] اعداد کیس‌استادی‌ها نمونه‌اند. داخل هر فایل MDX یک کامنت `TODO` هست.
- [ ] کاورهای `public/media/covers/*.svg` جای‌نگه‌دارند.
- [ ] Search Console و sitemap را ثبت کنید.
