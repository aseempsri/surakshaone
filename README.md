# SurakshaOne

Marketing site for SurakshaOne.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deployment

Every push to `main` runs GitHub Actions and deploys to GitHub Pages.

Live domain: https://surakshaone.com/

In the repo: **Settings → Pages → Source → GitHub Actions**.

### Connect `surakshaone.com` (GoDaddy)

Keep **default GoDaddy nameservers**. Do not switch nameservers — only edit DNS records.

1. In GitHub: **Settings → Pages → Custom domain** → enter `surakshaone.com` → Save → enable **Enforce HTTPS** once DNS is verified.
2. In GoDaddy → DNS Records for `surakshaone.com`:
   - Delete (or edit) the parked **A** record on `@`.
   - Add four **A** records for `@` (host `@` or blank):

     | Type | Name | Value | TTL |
     | --- | --- | --- | --- |
     | A | `@` | `185.199.108.153` | 600 |
     | A | `@` | `185.199.109.153` | 600 |
     | A | `@` | `185.199.110.153` | 600 |
     | A | `@` | `185.199.111.153` | 600 |

   - Edit the **www** CNAME so it points to `aseempsri.github.io` (not `surakshaone.com`).
3. Wait for DNS (often minutes, sometimes up to 24–48 hours), then open https://surakshaone.com/
4. Leave NS / SOA / `_domainconnect` / `_dmarc` alone unless you have a reason to change them.

Repo publishes `public/CNAME` → `surakshaone.com` so GitHub Pages keeps the custom domain on each deploy.
