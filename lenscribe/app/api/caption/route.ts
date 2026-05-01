export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const blob = await req.blob();

    const formData = new FormData();
    formData.append("file", blob, "image.jpg");

    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.error) throw new Error(data.error);

    return Response.json({ caption: data.caption_en });
  } catch (err: any) {
    console.error(err);
    return Response.json(
      { error: err.message ?? "Server error" },
      { status: 500 }
    );
  }
}