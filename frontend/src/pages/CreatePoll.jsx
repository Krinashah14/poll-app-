import React, { useState } from "react";
import OptionsForm from "../components/OptionsForm.jsx";
import "./CreatePoll.css";

const API = "http://localhost:4000/api";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [ttlHours, setTtlHours] = useState(24);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick-create: auto-split options from question
  const handleQuestionChange = (value) => {
    setQuestion(value);
    
    // Auto-split if question contains delimiters
    const delimiters = [' vs ', ' or ', ', ', ' | ', ' / '];
    for (const delimiter of delimiters) {
      if (value.includes(delimiter)) {
        const parts = value.split(delimiter).map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2 && parts.length <= 4) {
          setOptions(parts.concat(['', '', '', '']).slice(0, 4));
          break;
        }
      }
    }
  };

  const onCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const cleaned = options.map(o => o.trim()).filter(Boolean);
    
    if (!question.trim()) {
      alert("Please enter a question");
      setLoading(false);
      return;
    }
    
    if (cleaned.length < 2) {
      alert("Please provide at least 2 options");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: cleaned, ttlHours })
      });
      const data = await res.json();
      if (res.ok) {
        setShareUrl(`${window.location.origin}${data.shareUrl}`);
      } else {
        alert(data.error || "Failed to create poll");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
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

  return (
    <div className="create-poll-container">
      <div className="create-poll-card">
        <div className="header">
          <h1 className="title">Create Your Poll</h1>
          <p className="subtitle">Ask a question, get instant answers</p>
        </div>

        <form onSubmit={onCreate} className="poll-form">
          <div className="form-group">
            <label className="form-label">
              Question <span className="char-count">({question.length}/120)</span>
            </label>
            <input 
              className="form-input question-input"
              value={question} 
              onChange={(e) => handleQuestionChange(e.target.value)} 
              maxLength={120}
              placeholder="What would you like to ask? (Try: 'Pizza or Pasta')"
            />
            <small className="form-hint">
              💡 Tip: Use "vs", "or", or commas to auto-create options
            </small>
          </div>

          <OptionsForm options={options} setOptions={setOptions} />

          <div className="form-group">
            <label className="form-label">Poll Duration</label>
            <div className="duration-options">
              {[1, 6, 24, 72, 168].map(hours => (
                <button
                  key={hours}
                  type="button"
                  className={`duration-btn ${ttlHours === hours ? 'active' : ''}`}
                  onClick={() => setTtlHours(hours)}
                >
                  {hours < 24 ? `${hours}h` : `${hours/24}d`}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="create-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading">
                <span className="spinner"></span>
                Creating...
              </span>
            ) : (
              <>
                Create Poll
              </>
            )}
          </button>
        </form>

        {shareUrl && (
          <div className="success-section">
            <div className="success-header">
              <span className="success-icon">✅</span>
              <h3>Poll Created Successfully!</h3>
            </div>
            
            <div className="share-section">
              <label className="form-label">Share this link:</label>
              <div className="share-input-group">
                <input 
                  className="share-input" 
                  value={shareUrl} 
                  readOnly 
                />
                <button 
                  type="button" 
                  className="copy-btn"
                  onClick={copyToClipboard}
                >
                  Copy
                </button>
              </div>
              
              <div className="share-actions">
                <a 
                  href={shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="view-poll-btn"
                >
                  View Poll
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}