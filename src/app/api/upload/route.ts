import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Keep this in sync with the client-side accept attribute.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    // Uploads are a privileged action: never proxy an anonymous request to ImgBB.
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "You must be signed in to upload images" },
        { status: 401 }
      );
    }

    const apiKey = process.env.IMAGEBB_API_KEY || process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "ImgBB API key is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only JPEG, PNG, WebP or GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, message: "The uploaded file is empty" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Image must be smaller than 5 MB" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    const imgbbForm = new URLSearchParams();
    imgbbForm.append("image", base64Image);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: imgbbForm,
    });

    const data = await imgbbRes.json();

    if (!imgbbRes.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.error?.message || "Failed to upload image to ImgBB" },
        { status: 500 }
      );
    }

    const url = data.data.display_url || data.data.url;
    return NextResponse.json({ success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Image upload error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
