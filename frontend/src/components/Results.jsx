import React, { useEffect, useState } from "react";
import "./Results.css";

const API = "http://localhost:4000/api";

export default function Results({ pollId }) {
  const [data, setData] = useState({ totals: [], totalVotes: 0, insight: null });
  const [loading, setLoading] = useState(true);
  const [animateChange, setAnimateChange] = useState(false);

  const load = async () => {
    try {
      const r = await fetch(`${API}/polls/${pollId}/results`);
      const d = await r.json();
      
      // Trigger animation on data change
      if (data.totalVotes > 0 && d.totalVotes !== data.totalVotes) {
        setAnimateChange(true);
        setTimeout(() => setAnimateChange(false), 600);
      }
      
      setData(d);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load results:', error);
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, [pollId]);

  // Calculate percentages and find winner
  const totalVotes = data.totalVotes || 0;
  const maxVotes = Math.max(...data.totals.map(t => t.count), 1);
  const resultsWithPercentages = data.totals.map(t => ({
    ...t,
    percentage: totalVotes > 0 ? Math.round((t.count / totalVotes) * 100) : 0,
    isWinning: t.count === maxVotes && t.count > 0
  }));

  if (loading) {
    return (
      <div className="results-container">
        <div className="results-header">
          <h3 className="results-title">
            <span className="results-icon">📊</span>
            Loading Results...
          </h3>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-bar"></div>
          <div className="skeleton-bar"></div>
          <div className="skeleton-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h3 className="results-title">
          <span className="results-icon">📊</span>
          Live Results
        </h3>
        <div className="total-votes-badge">
          <span className="vote-count">{totalVotes}</span>
          <span className="vote-label">vote{totalVotes !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className={`results-list ${animateChange ? 'updating' : ''}`}>
        {resultsWithPercentages
          .sort((a, b) => b.count - a.count) // Sort by vote count descending
          .map((option, index) => (
          <div 
            key={option.optionId} 
            className={`result-item ${option.isWinning ? 'winning' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="result-header">
              <div className="option-info">
                {option.isWinning && totalVotes > 0 && (
                  <span className="winner-crown">👑</span>
                )}
                <span className="option-text">{option.text}</span>
                {index === 0 && totalVotes > 1 && (
                  <span className="leading-badge">Leading</span>
                )}
              </div>
              <div className="vote-stats">
                <span className="vote-count-large">{option.count}</span>
                <span className="percentage">{option.percentage}%</span>
              </div>
            </div>
            
            <div className="progress-container">
              <div 
                className="progress-bar"
                style={{ 
                  '--progress': `${option.percentage}%`,
                  '--bar-color': option.isWinning ? '#10b981' : `hsl(${220 + index * 30}, 70%, 55%)`
                }}
              >
                <div className="progress-fill"></div>
              </div>
            </div>

            <div className="result-details">
              {totalVotes > 0 && (
                <div className="vote-breakdown">
                  <div className="vote-dots">
                    {Array.from({ length: Math.min(option.count, 20) }).map((_, i) => (
                      <div 
                        key={i} 
                        className="vote-dot"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      ></div>
                    ))}
                    {option.count > 20 && <span className="more-votes">+{option.count - 20}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.insight && (
        <div className="insight-section">
          <div className="insight-header">
            <span className="insight-icon">💡</span>
            <span className="insight-label">AI Insight</span>
          </div>
          <p className="insight-text">{data.insight}</p>
        </div>
      )}

      {totalVotes === 0 && (
        <div className="no-votes-state">
          <div className="no-votes-icon">🗳️</div>
          <p className="no-votes-text">No votes yet</p>
          <small className="no-votes-subtitle">Share the poll to start collecting votes!</small>
        </div>
      )}

      {totalVotes > 0 && totalVotes < 5 && (
        <div className="early-stage-notice">
          <span className="notice-icon">⏳</span>
          <small>Results will become more meaningful as more people vote</small>
        </div>
      )}
    </div>
  );
}