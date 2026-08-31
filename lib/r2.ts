import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "wonderlust-media";
const publicDomain = process.env.CLOUDFLARE_R2_PUBLIC_DOMAIN || process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

/**
 * Returns an initialized S3Client for Cloudflare R2 Storage.
 */
export function getR2Client(): S3Client {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Cloudflare R2 environment variables. Please configure CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY in .env"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Generates the public CDN / R2 URL for a given object key.
 */
export function getPublicR2Url(key: string): string {
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  if (publicDomain) {
    const domain = publicDomain.endsWith("/") ? publicDomain.slice(0, -1) : publicDomain;
    return `${domain}/${cleanKey}`;
  }
  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${cleanKey}`;
}

/**
 * Uploads a file Buffer directly to Cloudflare R2.
 */
export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  const s3 = getR2Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3.send(command);

  return {
    key,
    url: getPublicR2Url(key),
  };
}

/**
 * Generates a pre-signed PUT URL for client-side uploads directly to Cloudflare R2.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 3600
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const s3 = getR2Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: expiresInSeconds });

  return {
    uploadUrl,
    publicUrl: getPublicR2Url(key),
    key,
  };
}
