// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import A001 from "./pages/001/001.jsx";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<A001 />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
