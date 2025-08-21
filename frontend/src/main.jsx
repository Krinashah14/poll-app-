import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import CreatePoll from "./pages/CreatePoll.jsx";
import PollPage from "./pages/PollPage.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/create" element={<CreatePoll />} />
      <Route path="/poll/:id" element={<PollPage />} />
    </Routes>
  </BrowserRouter>
);
