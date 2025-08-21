export function buildInsight(totals) {
  // totals: [{text, count}] — simple rules engine per spec
  const totalVotes = totals.reduce((s, t) => s + t.count, 0);
  if (totalVotes < 20) return null;

  const sorted = [...totals].sort((a,b)=>b.count-a.count);
  const [top, second] = [sorted[0], sorted[1] || { count: 0 }];
  const pct = totalVotes ? Math.round((top.count / totalVotes) * 100) : 0;
  const margin = top.count - second.count;

  if (second && top.count === second.count) return `It's a tie so far at ${pct}% each.`;
  if (margin / totalVotes > 0.1) return `${top.text} leads strongly with ${pct}%.`;
  return `${top.text} is currently ahead with ${pct}%.`;
}
