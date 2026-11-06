# رفع خطای `tsx: not found` در Runflare

فرآیند build این پروژه قبل از `next build` چند اسکریپت TypeScript را اجرا
می‌کند؛ بنابراین `tsx` باید هنگام build نصب شده باشد. اگر Runflare با
`npm install --production` یا `npm ci --omit=dev` نصب کند، build با خطای
`sh: 1: tsx: not found` متوقف می‌شود.

در تنظیمات build سرویس، این دستور را بگذارید:

```bash
npm ci --include=dev && npm run build
```

همچنین `tsx` در `dependencies` پروژه قرار داده شده تا حتی در محیط‌هایی که
وابستگی‌های توسعه را حذف می‌کنند نیز build قابل اجرا بماند. اگر از Dockerfile
استفاده می‌کنید، Dockerfile پروژه همین حالت را پوشش می‌دهد.
