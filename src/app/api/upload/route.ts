import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.IMAGEBB_API_KEY || process.env.IMGBB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "ImgBB API key is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
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
