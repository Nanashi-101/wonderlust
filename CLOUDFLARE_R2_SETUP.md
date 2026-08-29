# Cloudflare R2 Storage Integration Guide

This project is configured to support **Cloudflare R2 Storage** (S3-compatible object storage) for uploading and serving all project images and media.

---

## 1. Environment Configuration (`.env`)

Add the following environment variables to your `.env` file:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_r2_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="wonderlust-media"

# Public R2 Domain / Custom CDN URL (e.g. https://pub-xxxx.r2.dev or custom domain https://media.wonderlust.com)
CLOUDFLARE_R2_PUBLIC_DOMAIN="https://pub-xxxx.r2.dev"
NEXT_PUBLIC_R2_PUBLIC_URL="https://pub-xxxx.r2.dev"
```

---

## 2. Cloudflare R2 Bucket Setup Steps

1. **Log in to Cloudflare Dashboard**:
   - Go to **R2** from the left navigation menu.
   - Click **Create Bucket** and name it `wonderlust-media`.

2. **Generate R2 API Tokens**:
   - Go to **R2** > **Manage R2 API Tokens**.
   - Click **Create API Token**.
   - Set Permissions to **Admin Read & Write**.
   - Copy the **Account ID**, **Access Key ID**, and **Secret Access Key** into your `.env`.

3. **Enable Public Access / Custom Domain**:
   - Under your bucket settings, navigate to **Settings** > **Public Access**.
   - Click **Connect Custom Domain** (e.g., `media.wonderlust.com`) OR enable the **R2.dev dev subdomain** (e.g., `https://pub-xxxx.r2.dev`).
   - Copy this URL into `CLOUDFLARE_R2_PUBLIC_DOMAIN`.

---

## 3. How to Upload Files in the App

### Option A: Using the `/api/upload` Endpoint

Send a `POST` request with `multipart/form-data`:

```typescript
const formData = new FormData();
formData.append("file", fileObject);

const res = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const data = await res.json();
console.log("R2 Public Image URL:", data.url);
```

### Option B: Using the `uploadToR2` Helper in Server Actions

```typescript
import { uploadToR2 } from "@/lib/r2";

const result = await uploadToR2(buffer, "destination/ladakh.png", "image/png");
console.log(result.url);
```

---

## 4. Migrating Public Folder Files to R2

To upload your remaining public files (`bgpiclogo.png`, `package-bg.png`, `member-pic.png`, `destination/*`, `gallery/*`, `partners/*`) to Cloudflare R2:

1. Upload the files directly via the **Cloudflare R2 Dashboard UI** or using Wrangler CLI:
   ```bash
   npx wrangler r2 object put wonderlust-media/destination/Ladakh.png --file=./public/destination/Ladakh.png
   ```
2. Replace local image paths in `prisma/seed.ts` or database records with your R2 public URL:
   `https://pub-xxxx.r2.dev/destination/Ladakh.png`.
