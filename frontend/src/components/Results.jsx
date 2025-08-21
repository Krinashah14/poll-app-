import React, { useEffect, useState } from "react";

const API = "http://localhost:4000/api";

export default function Results({ pollId }) {
  const [data, setData] = useState({ totals: [], totalVotes: 0, insight: null });

  const load = async () => {
    const r = await fetch(`${API}/polls/${pollId}/results`);
    const d = await r.json();
    setData(d);
  };

  useEffect(() => { load(); }, [pollId]);

  const max = Math.max(1, ...data.totals.map(t => t.count));

  return (
    <div>
      <h3>Live Results</h3>
      {data.totals.map(t => (
        <div key={t.optionId} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{t.text}</span><span>{t.count}</span>
          </div>
          <div style={{ background: "#eee", height: 10, borderRadius: 5 }}>
            <div style={{
              width: `${(t.count / max) * 100}%`,
              background: "#2563eb",
              height: "100%",
              borderRadius: 5
            }} />
          </div>
        </div>
      ))}
      <p>Total votes: {data.totalVotes}</p>
      {data.insight && <p><em>Insight:</em> {data.insight}</p>}
    </div>
  );
}
