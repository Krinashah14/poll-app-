import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import Results from "../components/Results.jsx";

const API = "http://localhost:4000/api";

export default function PollPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [expired, setExpired] = useState(false);
  const [myChoice, setMyChoice] = useState("");
  const [qr, setQr] = useState("");

  const shareUrl = useMemo(() => `${window.location.origin}/poll/${id}`, [id]);

  useEffect(() => {
    fetch(`${API}/polls/${id}`).then(r=>r.json()).then(d => {
      setPoll(d.poll); setExpired(d.expired);
    });
    QRCode.toDataURL(shareUrl).then(setQr);
  }, [id, shareUrl]);

  useEffect(() => {
    // live results via SSE
    const es = new EventSource(`${API}/polls/${id}/stream`);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.totals) setPoll(p => p ? { ...p, totals: data.totals } : p);
    };
    return () => es.close();
  }, [id]);

  if (!poll) return <div style={{ padding: 24 }}>Loading…</div>;

  const vote = async () => {
    const res = await fetch(`${API}/polls/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId: myChoice })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed");
    alert("Voted!");
  };

  return (
    <div style={{ padding: 24, maxWidth: 680 }}>
      <h2>{poll.question}</h2>
      <p>Expires: {new Date(poll.expiresAt).toLocaleString()}</p>

      <div style={{ margin: "12px 0" }}>
        <img src={qr} alt="QR" width="120" height="120" />
        <div><small>Share: {shareUrl}</small></div>
      </div>

      {!expired ? (
        <>
          <div>
            {poll.Options?.map(o => (
              <label key={o.id} style={{ display: "block", marginBottom: 8 }}>
                <input
                  type="radio"
                  name="opt"
                  value={o.id}
                  onChange={e=>setMyChoice(e.target.value)}
                /> {o.text}
              </label>
            ))}
          </div>
          <button disabled={!myChoice} onClick={vote}>Submit Vote</button>
        </>
      ) : (
        <p>Poll expired.</p>
      )}

      <hr style={{ margin: "16px 0" }} />
      <Results pollId={id} />
    </div>
  );
}
