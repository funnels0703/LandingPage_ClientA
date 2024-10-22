import React, { useState } from "react";
import axios from "axios";
import "./RandingTest002.css"; // CSS 파일 임포트

function RandingTest002({ urlCode, urlCodeSettingId }) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitCount, setSubmitCount] = useState(0); // 제출 횟수를 추적할 상태
  const [isTestComplete, setIsTestComplete] = useState(false); // 테스트 완료 여부를 추적하는 상태

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

  // 500ms 딜레이를 주는 함수
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 자동 테스트 버튼을 눌렀을 때 로컬 스토리지 값이 400이 될 때까지 자동 제출
  const handleAutoTest = async () => {
    let autoTestCount = localStorage.getItem("autoTestCount");
    if (!autoTestCount) {
      autoTestCount = 0; // 로컬 스토리지에 값이 없을 경우 초기값 설정
    } else {
      autoTestCount = parseInt(autoTestCount);
    }

    // 400이 될 때까지 POST 요청을 반복, 요청 간 500ms 딜레이
    while (autoTestCount < 400) {
      generateRandomData(); // 랜덤 데이터 생성

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
        console.log("자동 제출 성공", response.data);
        autoTestCount++;
        localStorage.setItem("autoTestCount", autoTestCount); // 로컬 스토리지에 값 업데이트
      } catch (error) {
        console.error("자동 제출 실패", error);
        break; // 에러 발생 시 자동 제출 중지
      }

      await delay(60000);
    }

    if (autoTestCount >= 400) {
      setIsTestComplete(true); // 테스트 완료 상태로 설정
      alert("자동 테스트 완료: 제출 횟수 400회 달성");
    }
  };

  // 다시 테스트하기 버튼 클릭 시 초기화 함수
  const resetTest = () => {
    setSubmitCount(0);
    localStorage.removeItem("autoTestCount"); // 로컬 스토리지 값 초기화
    setIsTestComplete(false); // 테스트 완료 상태 해제
  };

  // 테스트가 완료된 경우 종료 화면 표시
  if (isTestComplete) {
    return (
      <div className="test-complete-container">
        <h1>테스트가 완료되었습니다.</h1>
        <button onClick={resetTest} className="reset-button">
          다시 테스트 하기
        </button>
      </div>
    );
  }

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

      {/* 자동 테스트 버튼 추가 */}
      <button onClick={handleAutoTest} className="auto-test-button">
        자동 테스트
      </button>
    </div>
  );
}

export default RandingTest002;
