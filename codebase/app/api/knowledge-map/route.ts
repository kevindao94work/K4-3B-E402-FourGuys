import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  try {
    let mapPath = path.join(process.cwd(), "data", "ingested", "d1-knowledge-map.json");
    try {
      await readFile(mapPath, "utf8");
    } catch {
      mapPath = path.join(process.cwd(), "..", "data", "ingested", "d1-knowledge-map.json");
    }
    const raw = await readFile(mapPath, "utf8");
    const map = JSON.parse(raw) as { lesson_id?: string; learning_units?: unknown[] };
    if (!map.lesson_id || !Array.isArray(map.learning_units)) throw new Error("Invalid knowledge map");

    return Response.json(map, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Không thể tải Knowledge Map của Day 1. Hãy kiểm tra data/ingested/d1-knowledge-map.json." },
      { status: 500 },
    );
  }
}
