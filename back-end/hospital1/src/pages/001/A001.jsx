import React from "react";
import "./A001.css"; // a001.css 파일 임포트

function A001() {
  return (
    <div className="A001">
      <img
        src={`${process.env.PUBLIC_URL}/images/001/test001.png`}
        alt="Test Image"
      />
    </div>
  );
}

export default A001;
