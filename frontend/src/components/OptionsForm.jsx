import React from "react";
import "./OptionsForm.css";

export default function OptionsForm({ options, setOptions }) {
  const set = (i, val) => {
    if (val.length > 80) return; // Max 80 chars per option
    const next = [...options];
    next[i] = val;
    setOptions(next);
  };

  const add = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
    }
  };

  const remove = (i) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== i));
    }
  };

  const moveUp = (i) => {
    if (i > 0) {
      const next = [...options];
      [next[i], next[i-1]] = [next[i-1], next[i]];
      setOptions(next);
    }
  };

  const moveDown = (i) => {
    if (i < options.length - 1) {
      const next = [...options];
      [next[i], next[i+1]] = [next[i+1], next[i]];
      setOptions(next);
    }
  };

  return (
    <div className="options-form">
      <div className="options-header">
        <label className="form-label">Poll Options</label>
        <span className="options-count">({options.filter(o => o.trim()).length}/4)</span>
      </div>
      
      <div className="options-list">
        {options.map((opt, i) => (
          <div key={i} className="option-item">
            <div className="option-number">{i + 1}</div>
            
            <div className="option-input-wrapper">
              <input 
                className="option-input"
                value={opt} 
                onChange={(e) => set(i, e.target.value)} 
                placeholder={`Option ${i + 1}`}
                maxLength={80}
              />
              <div className="option-char-count">{opt.length}/80</div>
            </div>

            <div className="option-controls">
              {options.length > 1 && (
                <>
                  <button 
                    type="button" 
                    className="control-btn move-btn"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button 
                    type="button" 
                    className="control-btn move-btn"
                    onClick={() => moveDown(i)}
                    disabled={i === options.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                </>
              )}
              
              {options.length > 2 && (
                <button 
                  type="button" 
                  className="control-btn remove-btn"
                  onClick={() => remove(i)}
                  title="Remove option"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {options.length < 4 && (
        <button 
          type="button" 
          className="add-option-btn"
          onClick={add}
        >
          <span className="add-icon">+</span>
          Add Option
        </button>
      )}

      <div className="options-hint">
        <small>💡 You can have 2-4 options, up to 80 characters each</small>
      </div>
    </div>
  );
}