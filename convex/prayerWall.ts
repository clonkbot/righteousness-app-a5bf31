import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("prayerWall")
      .withIndex("by_created")
      .order("desc")
      .take(50);
  },
});

export const create = mutation({
  args: {
    intention: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("prayerWall", {
      userId,
      userName: args.userName,
      intention: args.intention,
      prayerCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const incrementPrayer = mutation({
  args: { id: v.id("prayerWall") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const prayer = await ctx.db.get(args.id);
    if (!prayer) throw new Error("Not found");
    await ctx.db.patch(args.id, { prayerCount: prayer.prayerCount + 1 });
  },
});
