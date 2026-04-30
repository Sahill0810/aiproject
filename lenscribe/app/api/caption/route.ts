export async function POST(req: Request) {
    try {
      const file = await req.arrayBuffer();
  
      const response = await fetch(
        "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/octet-stream",
          },
          body: file,
        }
      );
  
      const data = await response.json();
  
      return Response.json(data);
    } catch (error) {
      return Response.json({ error: "Failed to fetch" }, { status: 500 });
    }
  }