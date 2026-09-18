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
