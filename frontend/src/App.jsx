import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Poll App</h1>
      <p>Create a poll, share the link, vote anonymously, and see live results.</p>
      <Link to="/create">Create a Poll</Link>
    </div>
  );
}
