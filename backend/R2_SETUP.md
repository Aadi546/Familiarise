# Cloudflare R2 Setup

Use this when you are ready to enable photo and video uploads.

## 1. Create The Bucket

1. Open Cloudflare Dashboard.
2. Go to **R2 Object Storage**.
3. Create a bucket, for example:

```txt
family-hub-media
```

## 2. Create R2 API Credentials

1. In Cloudflare R2, open **Manage R2 API Tokens**.
2. Create an API token with access to the bucket.
3. Copy:
   - Access Key ID
   - Secret Access Key
   - Account ID

## 3. Enable Public Reads

For this MVP, the app stores public media URLs in Supabase.

Choose one:

- Enable the bucket's public development URL.
- Or connect a custom domain to the bucket.

Copy the public base URL. It should look like one of these:

```txt
https://pub-xxxxxxxx.r2.dev
https://media.your-domain.com
```

## 4. Configure CORS

Direct browser uploads use signed PUT URLs, so the bucket must allow your local frontend origin.

In the R2 bucket CORS settings, add:

```json
[
  {
    "AllowedOrigins": ["http://localhost:5173"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

When deployed, add your production frontend URL to `AllowedOrigins`.

## 5. Update backend/.env

Set these values:

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET=family-hub-media
R2_PUBLIC_BASE_URL=https://pub-xxxxxxxx.r2.dev
```

Restart the backend after changing `.env`.

## 6. Check Storage Status

Open:

```txt
http://localhost:5000/api/media/status
```

Expected:

```json
{
  "configured": true
}
```

Then refresh the frontend. The media attach buttons will become active.
