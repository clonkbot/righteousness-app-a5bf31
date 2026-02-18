import { action, query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("searchHistory")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const saveSearch = mutation({
  args: {
    query: v.string(),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("searchHistory", {
      userId,
      query: args.query,
      response: args.response,
      createdAt: Date.now(),
    });
  },
});

export const searchWithGrok = action({
  args: {
    query: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are a helpful Christian spiritual advisor and Bible scholar.
    Answer questions about faith, scripture, Christian living, and spiritual guidance with wisdom and compassion.
    Always ground your answers in Biblical truth while being loving and understanding.
    If asked about specific Bible verses, provide the full text and context.
    Keep responses concise but meaningful, around 2-3 paragraphs.`;

    try {
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${args.apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-3-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: args.query },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Grok API error: ${error}`);
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "Unable to get response";

      // Save to history
      await ctx.runMutation(api.search.saveSearch, {
        query: args.query,
        response: answer,
      });

      return answer;
    } catch (error) {
      throw new Error(`Failed to search: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});
