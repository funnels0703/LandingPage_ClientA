import React, { useEffect, useState } from "react";
import axios from "axios";
import FilterComponent from "./FilterComponent";
import AccordionComponent from "./AccordionComponent";
import StatCard from "./StatCard";
import DeleteButton from "./DeleteButton";
import "./customordata.scss";

function CustomorDataPage({ title, get_status, put_status }) {
  const formatKoreanDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Seoul",
    };
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
  };

  const [customors, setCustomors] = useState([]);
  const [editState, setEditState] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [totalCounts, setTotalCounts] = useState([]); // 전체 페이지 수

  const limit = 10; // 한 페이지에 보여줄 데이터 수
  const [recentSettings, setRecentSettings] = useState([]);
  const [checkedCompanies, setCheckedCompanies] = useState([]); // 체크된 회사 목록
  const [companyOptions, setCompanyOptions] = useState([]); // 회사 필터 옵션
  // 날짜 관련
  const [customDateRange, setCustomDateRange] = useState({
    startDate: formatKoreanDate(new Date()),
    endDate: formatKoreanDate(new Date()),
  });
  // 병원 관련
  const [selectedHospital, setSelectedHospital] = useState(undefined); // 초기 상태를 undefined로 설정
  const [hospitalOptions, setHospitalOptions] = useState([]); // get 으로 받은 병원들의 데이터

  // 회사 필터 상태 --------------------------------------------
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false); // 회사 필터 열림/닫힘 상태
  const [newCompany, setNewCompany] = useState("");

  const closeCompanyDropdown = () => {
    if (isCompanyDropdownOpen) {
      setIsCompanyDropdownOpen(false);
    }
  };

  // urlCodeTitleID 별 필터 (아코디언의 버튼 클릭 시)
  const [urlCodeId, setUrlCodeId] = useState();
  // filters 상태를 CustomorDataPage에서 관리
  const [filters, setFilters] = useState({
    url_code: "",
  });

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    fetchData(filters); // currentPage가 변경될 때마다 데이터 가져오기
  }, [currentPage, filters, checkedCompanies, customDateRange, newCompany]);

  const fetchData = async (filters = {}) => {
    setLoading(true);
    const convertToISOFormat = (dateString) => {
      // 날짜 문자열을 '2024년 10월 7일'에서 Date 객체로 변환
      const [year, month, day] = dateString
        .replace(/년|월/g, "-")
        .replace(/일/g, "")
        .trim()
        .split("-");

      // 새로운 Date 객체 생성
      const date = new Date(`${year}-${month}-${day}`);

      // ISO 형식으로 반환
      return date.toISOString();
    };
    // 예시 사용
    const startDate = convertToISOFormat(customDateRange.startDate);
    const endDate = convertToISOFormat(customDateRange.endDate);

    try {
      const response = await axios.post("/api/customor/search", {
        data_status: get_status,
        page: currentPage,
        limit,
        advertising_company_ids: checkedCompanies,
        newCompany: newCompany && newCompany,
        startDate: startDate, // 날짜 필터 변환된 형식
        endDate: endDate, // 날짜 필터 변환된 형식
        urlCodeId: urlCodeId, // urlCodeId 추가
        ...filters,
      });

      if (response.data.total.totalCount > 0) {
        setCustomors(
          response.data.data.map((customor) => ({
            ...customor,
            isSelected: false,
          }))
        );
        setTotalPages(Math.ceil(response.data.total.totalCount / limit));
        setTotalCounts(response.data.total);
        const initialState = {};
        response.data.data.forEach((item) => {
          initialState[item.id] = false;
        });
        setRecentSettings(response.data.recentSettings);
        setEditState(initialState);
      } else {
        // total이 0일 경우
        setCustomors([]); // 빈 배열로 설정
        setTotalPages(1); // 페이지를 1로 설정
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  // 매체 필터링 버튼 클릭 핸들러
  const handleMediaFilter = (company) => {
    const updatedFilters = { ...filters, advertising_company: company };
    setFilters(updatedFilters);
    fetchData(updatedFilters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };
  const handleApplyFilters = () => {
    fetchData(filters);
  };

  const handleCheckboxChange = (index) => {
    setCustomors((prevCustomors) =>
      prevCustomors.map((customor, i) =>
        i === index
          ? { ...customor, isSelected: !customor.isSelected }
          : customor
      )
    );
  };

  const handleEdit = (id) => {
    setEditState((prev) => ({ ...prev, [id]: true }));
  };

  const handleInputChange = (index, field, value) => {
    setCustomors((prevCustomors) =>
      prevCustomors.map((customor, i) =>
        i === index ? { ...customor, [field]: value } : customor
      )
    );
  };

  const handleSubmit = async (index) => {
    const customor = customors[index];
    try {
      const response = await axios.put(
        `/api/customor/${customor.id}`,
        customor
      );
      console.log("Data updated successfully:", response.data);
      setEditState((prev) => ({ ...prev, [customor.id]: false }));
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  // 영구 삭제 하면 안됨 put 으로 수정 예정
  const handlePermanentDelete = async () => {
    const selectedIds = customors
      .filter((customor) => customor.isSelected)
      .map((customor) => customor.id);
    if (selectedIds.length > 0) {
      try {
        const response = await axios.delete(`/api/customor/delete`, {
          data: { ids: selectedIds },
        });
        console.log("Permanent delete successful:", response.data);
        alert("선택한 데이터가 영구적으로 삭제되었습니다.");
        await fetchData();
      } catch (error) {
        console.error("Error during permanent deletion:", error);
        alert("영구 삭제 중 오류가 발생했습니다.");
      }
    } else {
      alert("삭제할 데이터를 선택하세요.");
    }
  };

  const handleUpdateStatus = async () => {
    const selectedIds = customors
      .filter((customor) => customor.isSelected)
      .map((customor) => customor.id);
    if (selectedIds.length > 0) {
      try {
        const response = await axios.put(`/api/customor/update-status`, {
          ids: selectedIds,
          data_status: put_status,
        });
        console.log("Status updated successfully:", response.data);
        alert("선택한 데이터가 삭제되었습니다.");
        await fetchData();
      } catch (error) {
        console.error("Error updating status:", error);
        alert("선택한 데이터가 삭제 중 오류가 발생했습니다.");
      }
    } else {
      alert("삭제할 데이터를 선택하세요.");
    }
  };

  //   console.log("checkedCompanies", checkedCompanies);
  //   console.log("companyOptions", companyOptions);
  //   console.log("customDateRange", customDateRange);
  //   console.log("selectedHospital", selectedHospital);

  return (
    <div className="DataContainer container">
      {/* <h2>{title}</h2> */}

      {/* filters 상태와 handleFilterChange 함수를 FilterComponent에 전달 */}
      <FilterComponent
        filters={filters}
        onFilterChange={handleFilterChange}
        handleApplyFilters={handleApplyFilters}
        checkedCompanies={checkedCompanies}
        setCheckedCompanies={setCheckedCompanies}
        companyOptions={companyOptions}
        setCompanyOptions={setCompanyOptions}
        // 매체 검색 드롭다운 설정
        isCompanyDropdownOpen={isCompanyDropdownOpen}
        setIsCompanyDropdownOpen={setIsCompanyDropdownOpen}
        closeCompanyDropdown={closeCompanyDropdown}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        hospitalOptions={hospitalOptions}
        setHospitalOptions={setHospitalOptions}
        selectedHospital={selectedHospital}
        setSelectedHospital={setSelectedHospital}
      />
      {/* 최근 설정 카드 */}
      <div className="itdependson" onClick={closeCompanyDropdown}>
        <div className="userSetCompany cardMarginAdded">
          <StatCard
            label="DB 전체"
            value={
              totalCounts && totalCounts.totalCount !== undefined
                ? totalCounts.totalCount
                : 0
            }
          />
        </div>
        {/* 매체별 갯수 및 리스트 */}
        <div className="userSetCompany cardAllSet">
          {(typeof checkedCompanies === "string"
            ? checkedCompanies.split(",").map((id) => parseInt(id)) // 문자열을 배열로 변환
            : Array.isArray(checkedCompanies)
            ? checkedCompanies // 이미 배열인 경우 그대로 사용
            : []
          ) // 배열도 아니고 문자열도 아니면 빈 배열
            .map((companyId) => {
              // companyOptions에서 companyId와 일치하는 매체 찾기
              const company = companyOptions.find(
                (company) => company.id === companyId
              );

              if (company) {
                // totalCounts가 정의되어 있는지 확인
                const countData =
                  totalCounts && totalCounts.countsByCompany
                    ? totalCounts.countsByCompany.find(
                        (count) => count.advertising_company_id === company.id
                      )
                    : null;

                // countData가 있는 경우, value를 count로 설정하고 없으면 "0"으로 설정
                const value = countData ? countData.count : 0;

                return (
                  <StatCard
                    key={company.id}
                    id={company.id}
                    label={company.name}
                    value={value}
                    newCompany={newCompany}
                    setNewCompany={setNewCompany}
                  />
                );
              }
              return null; // 일치하는 회사가 없으면 아무것도 반환하지 않음
            })}
        </div>
      </div>
      <div className="recent-settings" onClick={closeCompanyDropdown}>
        <AccordionComponent
          recentSettings={recentSettings}
          setUrlCodeId={setUrlCodeId}
        />
      </div>
      {/* 삭제 버튼 */}
      <div className="button-group" onClick={closeCompanyDropdown}>
        <DeleteButton handleUpdateStatus={handleUpdateStatus} />
        {get_status === 1 && (
          <button
            onClick={() => handlePermanentDelete()}
            className="permanent-delete"
          >
            영구삭제
          </button>
        )}
      </div>

      <table className="customor-table" onClick={closeCompanyDropdown}>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>선택</th>
            <th style={{ textAlign: "center" }}>No</th>
            <th>배당 여부</th>
            <th>병원명</th>
            <th>매체</th>
            <th>광고 제목</th>
            <th>이벤트명</th>
            <th>이름</th>
            <th>전화번호</th>
            <th>일자</th>
            <th style={{ textAlign: "center" }}>상태</th>
          </tr>
        </thead>
        {/* 데이터 뿌려주는 부분 */}
        <tbody>
          {totalPages === 0 ? (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                아직 데이터가 없습니다.
              </td>
            </tr>
          ) : (
            customors.map((customor, index) => (
              <tr
                key={customor.id}
                className={customor.isSelected ? "selected" : ""}
              >
                <td style={{ width: "3%" }}>
                  <input
                    type="checkbox"
                    checked={customor.isSelected}
                    onChange={() => handleCheckboxChange(index)}
                    style={{ textAlign: "center" }}
                  />
                </td>
                <td style={{ width: "2%", textAlign: "center" }}>
                  {customor.id}
                </td>
                <td style={{ width: "5%" }}>
                  <input
                    type="text"
                    value={customor.dividend_status}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "dividend_status",
                        e.target.value
                      )
                    }
                    disabled={true}
                  />
                </td>
                <td style={{ width: "9%" }}>
                  <input
                    type="text"
                    value={customor.hospital_name}
                    onChange={(e) =>
                      handleInputChange(index, "hospital_name", e.target.value)
                    }
                    disabled={true}
                  />
                </td>
                <td style={{ width: "5%" }}>
                  <input
                    type="text"
                    value={customor.advertising_company}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "advertising_company",
                        e.target.value
                      )
                    }
                    disabled={true}
                  />
                </td>
                <td style={{ width: "11%" }}>
                  <input
                    type="text"
                    value={customor.ad_title}
                    onChange={(e) =>
                      handleInputChange(index, "ad_title", e.target.value)
                    }
                    disabled={true}
                  />
                </td>
                <td style={{ width: "8%" }}>
                  <input
                    type="text"
                    value={customor.event_name}
                    onChange={(e) =>
                      handleInputChange(index, "event_name", e.target.value)
                    }
                    disabled={true}
                  />
                </td>
                <td style={{ width: "7%" }}>
                  <input
                    type="text"
                    value={customor.name}
                    onChange={(e) =>
                      handleInputChange(index, "name", e.target.value)
                    }
                    disabled={!editState[customor.id]}
                  />
                </td>
                <td style={{ width: "8%" }}>
                  <input
                    type="text"
                    value={customor.phone ? customor.phone.split("T")[0] : ""}
                    onChange={(e) =>
                      handleInputChange(index, "phone", e.target.value)
                    }
                    disabled={!editState[customor.id]}
                  />
                </td>
                <td style={{ width: "11%" }}>
                  <input
                    type="text"
                    value={
                      customor.created_at
                        ? customor.created_at.split(".")[0]
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange(index, "created_at", e.target.value)
                    }
                    disabled={true}
                  />
                </td>
                <td style={{ width: "3%" }}>
                  {editState[customor.id] ? (
                    <button
                      className="submit-button"
                      onClick={() => handleSubmit(index)}
                    >
                      저장
                    </button>
                  ) : (
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(customor.id)}
                    >
                      수정
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          이전
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          다음
        </button>
      </div>
    </div>
  );
}

export default CustomorDataPage;
