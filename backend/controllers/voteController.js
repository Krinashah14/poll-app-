import { Poll, Option, Vote } from "../models/index.js";
import { deviceHash } from "../utils/hash.js";

export async function castVote(req, res) {
  try {
    const { id } = req.params;
    const { optionId } = req.body;

    const poll = await Poll.findByPk(id);
    if (!poll) return res.status(404).json({ error: "not found" });
    if (new Date() > poll.expiresAt) return res.status(400).json({ error: "poll expired" });

    const option = await Option.findOne({ where: { id: optionId, pollId: id } });
    if (!option) return res.status(400).json({ error: "invalid option" });

    const fpHash = deviceHash(req);

    // prevent duplicate per poll (soft)
    const existing = await Vote.findOne({ where: { pollId: id, fpHash } });
    if (existing) {
      return res.status(409).json({ error: "already voted" });
    }

    await Vote.create({ pollId: id, optionId, fpHash });
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server" });
  }
}

// Server-Sent Events for real-time updates
export async function streamResults(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const pollId = req.params.id;

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const tick = async () => {
    try {
      const poll = await Poll.findByPk(pollId, { include: [Option] });
      if (!poll) return send({ error: "not found" });

      // compute counts quickly
      const votes = await Vote.findAll({ where: { pollId }, attributes: ["optionId"] });
      const counts = new Map();
      for (const v of votes) counts.set(v.optionId, (counts.get(v.optionId) || 0) + 1);
      const totals = poll.Options.map(o => ({ text: o.text, optionId: o.id, count: counts.get(o.id) || 0 }));
      send({ totals, totalVotes: votes.length });
    } catch (e) {
      send({ error: "server" });
    }
  };

  // push every 2s (simple demo)
  const interval = setInterval(tick, 2000);
  req.on("close", () => clearInterval(interval));
}
