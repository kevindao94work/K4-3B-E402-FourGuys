export type StreamEvent =
  | { type: "meta"; [key: string]: unknown }
  | { type: "delta"; text: string }
  | { type: "trace"; trace: unknown }
  | { type: "error"; error: string }
  | { type: "done" };

type SendEvent = (event: StreamEvent) => void;

const headers = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

export function streamResponse(run: (send: SendEvent) => Promise<void>) {
  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        const send: SendEvent = (event) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          await run(send);
        } catch (error) {
          console.error("SSE route error", error);
          send({ type: "error", error: "AI chưa thể phản hồi. Hãy thử lại sau." });
        } finally {
          send({ type: "done" });
          controller.close();
        }
      },
    }),
    { headers },
  );
}

export async function streamCompletionText(
  stream: AsyncIterable<{ choices: Array<{ delta?: { content?: string | null } }> }>,
  onDelta: (text: string) => void,
) {
  let text = "";
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (!delta) continue;
    text += delta;
    onDelta(delta);
  }
  return text;
}

/**
 * Collect a structured completion while exposing only selected top-level string
 * values. This keeps JSON syntax and untrusted fields out of the chat UI while
 * the caller can still validate the complete response once it ends.
 */
export async function streamCompletionJsonFields(
  stream: AsyncIterable<{ choices: Array<{ delta?: { content?: string | null } }> }>,
  fields: readonly string[],
  onFieldDelta: (field: string, text: string) => void,
) {
  const visibleFields = new Set(fields);
  let text = "";
  let depth = 0;
  let rootState: "key" | "colon" | "value" | "afterValue" = "key";
  let currentKey = "";
  let stringKind: "key" | "value" | "other" | null = null;
  let stringValue = "";
  let escaped = false;
  let readingUnicodeEscape = false;
  let unicodeDigits = "";

  const appendStringCharacter = (character: string) => {
    if (stringKind === "key") stringValue += character;
    if (stringKind === "value" && visibleFields.has(currentKey)) onFieldDelta(currentKey, character);
  };

  const consumeCharacter = (character: string) => {
    if (stringKind) {
      if (readingUnicodeEscape) {
        unicodeDigits += character;
        if (unicodeDigits.length === 4) {
          appendStringCharacter(String.fromCharCode(Number.parseInt(unicodeDigits, 16)));
          unicodeDigits = "";
          readingUnicodeEscape = false;
          escaped = false;
        }
        return;
      }
      if (escaped) {
        if (character === "u") {
          readingUnicodeEscape = true;
          unicodeDigits = "";
          return;
        }
        const escapedCharacters: Record<string, string> = {
          '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t",
        };
        appendStringCharacter(escapedCharacters[character] ?? character);
        escaped = false;
        return;
      }
      if (character === "\\") {
        escaped = true;
        return;
      }
      if (character === '"') {
        if (stringKind === "key") {
          currentKey = stringValue;
          rootState = "colon";
        } else if (stringKind === "value") {
          rootState = "afterValue";
        }
        stringKind = null;
        stringValue = "";
        return;
      }
      appendStringCharacter(character);
      return;
    }

    if (character === "{") {
      depth += 1;
      return;
    }
    if (character === "}" || character === "]") {
      depth -= 1;
      return;
    }
    if (character === "[") {
      depth += 1;
      return;
    }
    if (depth !== 1) return;
    if (character === ",") {
      rootState = "key";
      currentKey = "";
      return;
    }
    if (character === ":" && rootState === "colon") {
      rootState = "value";
      return;
    }
    if (character === '"') {
      if (rootState === "key") {
        stringKind = "key";
        stringValue = "";
      } else if (rootState === "value") {
        stringKind = "value";
      } else {
        stringKind = "other";
      }
    }
  };

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (!delta) continue;
    text += delta;
    for (const character of delta) consumeCharacter(character);
  }
  return text;
}
