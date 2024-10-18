import React, { useState } from "react";
import axios from "axios";
import "./RandingTest002.css"; // CSS 파일 임포트

function RandingTest002({ urlCode, urlCodeSettingId }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitCount, setSubmitCount] = useState(0); // 제출 횟수를 추적할 상태

  const handleFormSubmit = async () => {
    if (submitCount >= 5) {
      alert("제출 횟수가 최대치에 도달했습니다.");
      return;
    }

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
      setSubmitCount(submitCount + 1); // 성공 시 제출 카운트 증가
    } catch (error) {
      console.error("폼 제출 실패", error);
      alert("정보 제출에 실패했습니다.");
    }
  };
  // 한글 이름과 전화번호를 랜덤으로 생성하는 함수
  const generateRandomData = () => {
    // 초성, 중성, (선택적으로 종성)
    const consonants = [0, 2, 3, 5, 6, 7, 9, 11, 12, 14, 15, 16, 17]; // 실제 초성 위치
    const vowels = [0, 1, 3, 4, 7, 8, 16, 17, 20]; // 실제 중성 위치
    const noFinals = [0]; // 종성 없음을 위한 선택 (여기에 종성 인덱스를 추가하여 종성 사용 가능)

    let randomName = "";

    for (let i = 0; i < 3; i++) {
      const cho = consonants[Math.floor(Math.random() * consonants.length)];
      const jung = vowels[Math.floor(Math.random() * vowels.length)];
      const jong = noFinals[Math.floor(Math.random() * noFinals.length)]; // 종성 없음을 기본으로 설정

      // 유니코드 한글 음절 계산
      const code = 44032 + cho * 588 + jung * 28 + jong;
      randomName += String.fromCharCode(code);
    }

    const randomPhone = "010" + Math.floor(10000000 + Math.random() * 90000000);

    setName(randomName);
    setPhoneNumber(randomPhone);
  };

  return (
    <div className="form-container">
      <div className="image-container">
        <img
          src={`${process.env.PUBLIC_URL}/images/001/091101.gif`}
          alt="첫번째 이미지"
        />
        <img
          src={`${process.env.PUBLIC_URL}/images/001/091102.jpg`}
          alt="두번째 이미지"
        />
        <img
          src={`${process.env.PUBLIC_URL}/images/001/091103.jpg`}
          alt="세번째 이미지"
        />
        <img
          src={`${process.env.PUBLIC_URL}/images/001/091104.jpg`}
          alt="네번째 이미지"
        />
        <button onClick={generateRandomData} className="random-button">
          자동 생성
        </button>

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
          className="input-field input-ptionBottom"
        />
        <img
          onClick={handleFormSubmit}
          src={`${process.env.PUBLIC_URL}/images/001/091105.png`}
          alt="다섯번째 이미지"
        />

        <img
          src={`${process.env.PUBLIC_URL}/images/001/091106.jpg`}
          alt="여섯번째 이미지"
        />
      </div>
    </div>
  );
}

export default RandingTest002;
