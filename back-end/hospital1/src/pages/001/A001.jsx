import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./A001.css";
import RandingTest002 from "./RandingTest002";
// A001 을 병원명으로 변경 예정 -----------------------------------------------------------------------------------------------
// 001 폴더도 병원명으로 수정 + 폴더 생성 randing adnumber가 001 인 경우 해당 이미지 랜더링 해주면 됨

// 순서가이드
// 랜더링 하면 get으로 랜딩번호와 랜딩코드를 매칭 일치한 경우 화면 랜더링
// 화면 랜더링 시 랜딩 번호에 맞는 컴포넌트를 랜더링 시킴 (이때 랜더링 시키는 컴포넌트는 랜딩페이지)

function A001() {
  const [urlCodeSettingId, setUrlCodeSettingId] = useState(null);
  const [getData, setGetData] = useState(null); // 초기 상태를 null로 설정
  const [isValidAccess, setIsValidAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
  const { adnumber, urlCode } = useParams();

  useEffect(() => {
    const fetchUrlCodeSetting = async () => {
      try {
        const response = await axios.get(`/api/randing/${urlCode}`);
        if (response.data.ad_number === adnumber) {
          setUrlCodeSettingId(response.data.id);
          setGetData(response.data);
          setIsValidAccess(true);
        } else {
          setIsValidAccess(false);
          alert("잘못된 접근입니다.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsValidAccess(false);
      } finally {
        setIsLoading(false); // 데이터 로딩이 완료되면 로딩 상태를 false로 변경
      }
    };

    if (urlCode) {
      fetchUrlCodeSetting();
    }
  }, [urlCode, adnumber]); // 의존성 배열에 adnumber 추가

  // 클릭 수 증가 함수
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        incrementClickCount();
      }, 500);
      // }, 3000); 3초

      return () => clearTimeout(timer);
    }
  }, [isLoading]); // 이 useEffect는 isLoading의 값에 의존

  // 클릭 수를 증가시키는 함수
  const incrementClickCount = async () => {
    try {
      await axios.post(`/api/randing/click/${urlCodeSettingId}`);
      console.log("Click count incremented");
    } catch (error) {
      console.error("Failed to increment click count", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isValidAccess) {
    return null;
  }

  return (
    <>
      {adnumber === "002" && (
        <RandingTest002 urlCode={urlCode} urlCodeSettingId={urlCodeSettingId} />
      )}
    </>
  );
}

export default A001;
