import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import QRCode from "qrcode";
import Results from "../components/Results.jsx";
import "./PollPage.css";

const API = "http://localhost:4000/api";

export default function PollPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [expired, setExpired] = useState(false);
  const [myChoice, setMyChoice] = useState("");
  const [qr, setQr] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState("");

  const shareUrl = useMemo(() => `${window.location.origin}/poll/${id}`, [id]);

  useEffect(() => {
    const loadPoll = async () => {
      try {
        const response = await fetch(`${API}/polls/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setPoll(data.poll);
          setExpired(data.expired);
        } else {
          setError(data.error || "Poll not found");
        }
      } catch (err) {
        setError("Failed to load poll");
      }
    };

    loadPoll();
    QRCode.toDataURL(shareUrl, { width: 200, margin: 1 }).then(setQr);
  }, [id, shareUrl]);

  useEffect(() => {
    // Live results via SSE
    const es = new EventSource(`${API}/polls/${id}/stream`);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.totals && poll) {
          setPoll(p => ({ ...p, totals: data.totals }));
        }
      } catch (err) {
        console.error('SSE parsing error:', err);
      }
    };
    
    es.onerror = (err) => {
      console.error('SSE error:', err);
    };

    return () => es.close();
  }, [id, poll]);

  const vote = async () => {
    if (!myChoice || voting) return;
    
    setVoting(true);
    setError("");

    try {
      const res = await fetch(`${API}/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: myChoice })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setHasVoted(true);
        // Show success message briefly
        setTimeout(() => {
          // Scroll to results after voting
          document.querySelector('.results-section')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 500);
      } else {
        setError(data.error || "Failed to vote");
        if (data.error === "already voted") {
          setHasVoted(true);
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setVoting(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
      alert("Link copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("Link copied to clipboard!");
    }
  };

  if (error && !poll) {
    return (
      <div className="poll-page-container">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>Poll Not Found</h2>
          <p>{error}</p>
          <Link to="/create" className="create-new-btn">
            Create New Poll
          </Link>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="poll-page-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  const timeUntilExpiry = new Date(poll.expiresAt) - new Date();
  const hoursLeft = Math.max(0, Math.floor(timeUntilExpiry / (1000 * 60 * 60)));
  const minutesLeft = Math.max(0, Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="poll-page-container">
      <div className="poll-card">
        {/* Header */}
        <div className="poll-header">
          <Link to="/" className="back-button">
            ← Back to Home
          </Link>
          <div className="poll-status">
            {expired ? (
              <span className="status-badge expired">Expired</span>
            ) : (
              <span className="status-badge active">Active</span>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="question-section">
          <h1 className="poll-question">{poll.question}</h1>
          <div className="poll-meta">
            {!expired ? (
              <p className="expiry-time">
                ⏰ Expires in {hoursLeft > 0 && `${hoursLeft}h `}{minutesLeft}m
              </p>
            ) : (
              <p className="expiry-time expired">
                ⏰ Expired on {new Date(poll.expiresAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Sharing Section */}
        <div className="sharing-section">
          <div className="qr-container">
            {qr && <img src={qr} alt="QR Code" className="qr-code" />}
            <div className="share-actions">
              <button onClick={copyShareUrl} className="share-btn">
                📋 Copy Link
              </button>
            </div>
          </div>
          <div className="share-url">
            <small>Share: {shareUrl}</small>
          </div>
        </div>

        {/* Voting Section */}
        {!expired && !hasVoted ? (
          <div className="voting-section">
            <h3 className="voting-title">Cast Your Vote</h3>
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}
            <div className="voting-options">
              {poll.Options?.map((option, index) => (
                <label key={option.id} className="voting-option">
                  <input
                    type="radio"
                    name="pollOption"
                    value={option.id}
                    onChange={(e) => setMyChoice(e.target.value)}
                    disabled={voting}
                  />
                  <div className="option-content">
                    <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                    <span className="option-text">{option.text}</span>
                  </div>
                </label>
              ))}
            </div>
            <button 
              className="vote-button" 
              disabled={!myChoice || voting}
              onClick={vote}
            >
              {voting ? (
                <span className="voting-spinner">
                  <span className="spinner"></span>
                  Submitting...
                </span>
              ) : (
                <>
                  🗳️ Submit Vote
                </>
              )}
            </button>
          </div>
        ) : hasVoted ? (
          <div className="voted-section">
            <div className="voted-message">
              <span className="voted-icon">✅</span>
              <h3>Vote Submitted!</h3>
              <p>Thank you for participating. Check out the live results below.</p>
            </div>
          </div>
        ) : (
          <div className="expired-section">
            <div className="expired-message">
              <span className="expired-icon">⏰</span>
              <h3>Poll Expired</h3>
              <p>This poll is no longer accepting votes. View the final results below.</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="results-section">
          <Results pollId={id} />
        </div>
      </div>
    </div>
  );
}