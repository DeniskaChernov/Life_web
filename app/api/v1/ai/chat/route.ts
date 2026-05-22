import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getAnthropicClient, AI_MODEL, AI_MAX_TOKENS } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1).max(2000),
  nodeId: z.string().optional(), // focused node context
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
  }

  const { message, nodeId } = parsed.data;

  // Build context: top-level nodes of the user's root graph
  const graph = await prisma.graph.findFirst({
    where: { userId, isRoot: true },
    include: {
      nodes: { take: 50, orderBy: { depth: "asc" } },
      edges: { take: 100 },
    },
  });

  let focusedNode = null;
  if (nodeId) {
    focusedNode = await prisma.node.findFirst({ where: { id: nodeId, userId } });
  }

  const contextSummary = graph
    ? `User's Life Map ("${graph.name}") contains ${graph.nodes.length} nodes and ${graph.edges.length} connections.
Top nodes: ${graph.nodes
        .slice(0, 20)
        .map(
          (n) =>
            `[${n.category}] "${n.title}" (${n.status}, ${n.progress}% done${n.targetDate ? `, due ${new Date(n.targetDate).toLocaleDateString("ru-RU")}` : ""})`,
        )
        .join("; ")}`
    : "No graph data yet.";

  const focusContext = focusedNode
    ? `\nCurrently focused on: [${focusedNode.category}] "${focusedNode.title}" — ${focusedNode.description ?? "no description"} (Status: ${focusedNode.status}, Progress: ${focusedNode.progress}%)`
    : "";

  const systemPrompt = `You are LIFE's Strategic Intelligence — a world-class strategic advisor for the user's life graph. You think like a personal CFO, life strategist, and systems thinker combined.

Rules:
1. Never give generic advice. Be specific to the user's actual graph data.
2. Reference actual node names and numbers from the context.
3. Identify systemic patterns, not individual issues.
4. Prioritize long-term strategic implications.
5. Flag risks proactively.
6. Suggest structural solutions (new nodes, connections) not just actions.
7. Be concise and dense with information. No padding.
8. Respond in Russian if the user writes in Russian, in English otherwise.

${contextSummary}${focusContext}`;

  const anthropic = getAnthropicClient();

  let responseText = "";
  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: AI_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const firstContent = response.content[0];
    responseText = firstContent.type === "text" ? firstContent.text : "";
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: "AI_ERROR", message: errMsg }, { status: 500 });
  }

  // Save interaction
  await prisma.aiInteraction
    .create({
      data: {
        userId,
        kind: "chat",
        contextNodeId: nodeId ?? null,
        prompt: message,
        response: { text: responseText },
      },
    })
    .catch(() => {});

  return NextResponse.json({ response: responseText });
}
