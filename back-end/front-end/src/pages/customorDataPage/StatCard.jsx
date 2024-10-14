import React, { useState } from "react";

function StatCard({ label, value, id, setNewCompany }) {
  const handleClick = () => {
    // 클릭할 때마다 newCompany에 id 값만 저장
    setNewCompany(String(id));
  };

  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" onClick={handleClick}>
        {value}
        <span>건</span>
      </div>
    </div>
  );
}

export default StatCard;
