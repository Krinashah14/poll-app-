import { Poll, Option, Vote } from "../models/index.js";
import { buildInsight } from "../utils/insight.js";
import { Op } from "sequelize";

export async function createPoll(req, res) {
  try {
    const { question, options, ttlHours = 24 } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2 || options.length > 4) {
      return res.status(400).json({ error: "question, 2-4 options required" });
    }
    if (question.length > 120) return res.status(400).json({ error: "question max 120 chars" });

    const expiresAt = new Date(Date.now() + Number(ttlHours) * 3600 * 1000);
    const poll = await Poll.create({ question, expiresAt });
    const toCreate = options.map(text => ({ text, pollId: poll.id }));
    await Option.bulkCreate(toCreate);

    // shareable URL (frontend route /poll/:id)
    return res.status(201).json({ id: poll.id, shareUrl: `/poll/${poll.id}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server" });
  }
}

export async function getPoll(req, res) {
  try {
    const { id } = req.params;
    const poll = await Poll.findByPk(id, { include: [Option] });
    if (!poll) return res.status(404).json({ error: "not found" });

    const expired = new Date() > poll.expiresAt;
    res.json({ poll, expired });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server" });
  }
}

export async function getResults(req, res) {
  try {
    const { id } = req.params;
    const poll = await Poll.findByPk(id, { include: [Option] });
    if (!poll) return res.status(404).json({ error: "not found" });

    const counts = await Vote.findAll({
      where: { pollId: id },
      attributes: ["optionId", [Vote.sequelize.fn("COUNT", Vote.sequelize.col("id")), "count"]],
      group: ["optionId"]
    });

    const map = new Map(counts.map(c => [c.optionId, Number(c.get("count"))]));
    const totals = poll.Options.map(o => ({ text: o.text, optionId: o.id, count: map.get(o.id) || 0 }));
    const totalVotes = totals.reduce((s,t)=>s+t.count,0);
    const insight = buildInsight(totals);

    res.json({ totals, totalVotes, insight });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server" });
  }
}
