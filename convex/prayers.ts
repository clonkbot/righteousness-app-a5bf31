import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("prayers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    prayerType: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("prayers", {
      userId,
      title: args.title,
      content: args.content,
      prayerType: args.prayerType,
      isPublic: args.isPublic,
      isAnswered: false,
      createdAt: Date.now(),
    });
  },
});

export const markAnswered = mutation({
  args: { id: v.id("prayers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { isAnswered: !prayer.isAnswered });
  },
});

export const remove = mutation({
  args: { id: v.id("prayers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});
