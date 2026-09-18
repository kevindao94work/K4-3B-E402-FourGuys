import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  try {
    const pdfPath = path.join(process.cwd(), "..", "data", "slides", "d1-slide-hackathon.pdf");
    const pdf = await readFile(pdfPath);
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=d1-slide-hackathon.pdf",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return Response.json(
      { error: "Không tìm thấy file slide local. Hãy giữ data/slides/d1-slide-hackathon.pdf cạnh thư mục codebase." },
      { status: 404 },
    );
  }
}
