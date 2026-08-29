import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    // Authenticate user
    const { isAuthenticated } = getKindeServerSession();
    const authenticated = await isAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to upload files." },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Unsupported Content-Type. Send multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided in form data." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed (PNG, JPG, WebP)." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate clean filename inside destination/ folder
    const fileExt = file.name.split(".").pop() || "png";
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const key = `destination/${sanitizedBase}-${Date.now()}.${fileExt}`;

    const result = await uploadToR2(buffer, key, file.type || "image/png");

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
    });
  } catch (error: any) {
    console.error("Cloudflare R2 Upload Error:", error);

    // Better error messages for common R2 issues
    const code = error?.Code || error?.$metadata?.httpStatusCode;
    let message = error?.message || "Failed to upload to Cloudflare R2.";

    if (error?.Code === "NoSuchBucket") {
      message =
        "R2 bucket not found. Check CLOUDFLARE_R2_BUCKET_NAME in .env and ensure the API token has Object Read & Write permissions for this bucket.";
    } else if (error?.Code === "AccessDenied" || code === 403) {
      message =
        "R2 access denied. The API token may lack Object Write permissions for this bucket.";
    } else if (error?.Code === "InvalidAccessKeyId") {
      message =
        "Invalid R2 access key. Check CLOUDFLARE_R2_ACCESS_KEY_ID in .env.";
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
