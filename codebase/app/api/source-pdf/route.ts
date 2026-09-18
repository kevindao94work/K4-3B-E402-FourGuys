import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadKnowledgeMap } from "@/app/lib/server-knowledge-map";

export const runtime = "nodejs";

export async function GET() {
  try {
    const map = await loadKnowledgeMap();
    const filename = path.basename(map.source.pdf);
    const localPath = path.join(process.cwd(), "data", "slides", filename);
    const pdf = await readFile(localPath).catch(() =>
      readFile(path.join(process.cwd(), "..", "data", "slides", filename)),
    );
    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Không tìm thấy file slide local được khai báo trong Knowledge Map. Hãy kiểm tra data/slides và data/ingested/d1-knowledge-map.json." },
      { status: 404 },
    );
  }
}
