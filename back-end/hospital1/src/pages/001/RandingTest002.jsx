import React, { useState } from "react";
import axios from "axios";
import "./RandingTest002.css"; // CSS 파일 임포트

function RandingTest002({ urlCode, urlCodeSettingId }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  console.log(urlCode, urlCodeSettingId);
  const handleFormSubmit = async () => {
    // 현재 날짜 및 시간을 'YYYY-MM-DD HH:mm:ss' 포맷으로 설정
    const currentDateTime = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    try {
      const response = await axios.post("/api/randing/customor", {
        name,
        phoneNumber,
        date: currentDateTime,
        urlCode,
        urlCodeSettingId,
      });
      console.log("폼 제출 성공", response.data);
      alert("제출해 주셔서 감사합니다!");
    } catch (error) {
      console.error("폼 제출 실패", error);
      alert("정보 제출에 실패했습니다.");
    }
  };

  return (
    <div className="form-container">
      <h2>RandingTest002</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름을 입력하세요"
        className="input-field"
      />
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="전화번호를 입력하세요"
        className="input-field"
      />
      <button onClick={handleFormSubmit} className="submit-button">
        테스트 제출
      </button>
    </div>
  );
}

export default RandingTest002;
