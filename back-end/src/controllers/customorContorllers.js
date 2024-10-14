// controllers/customorControllers.js
const {
  getAllCustomors,
  getCustomorById,
  createCustomor,
  updateCustomor,
  updateDataStatusModel,
  deleteCustomors,
  getFilteredCustomors,
  getTotalCustomorCount,
  getRecentUrlCodeSettings,
  countCustomorBySettingId,
} = require("../models/customorModels");
// 필터 넣은 get
const fetchFilteredCustomorData = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.body;
    const offset = (page - 1) * limit;
    console.log(filters);

    // 총 데이터 개수를 가져옴
    const totalCount = await getTotalCustomorCount(filters);

    // 페이지네이션을 고려한 데이터 조회
    const filteredCustomorData = await getFilteredCustomors(
      filters,
      offset,
      limit
    );

    // 필드 이름 변경 및 원래 필드 제거
    const processedData = filteredCustomorData.map((item) => {
      const newItem = {
        ...item,
        urlCodeSetting:
          item.url_code_setting_customor_db_url_code_setting_idTourl_code_setting,
      };
      delete newItem.url_code_setting_customor_db_url_code_setting_idTourl_code_setting;
      return newItem;
    });

    // 최신 url_code_setting 데이터 10개 가져오기
    const recentSettings = await getRecentUrlCodeSettings(filters);

    // 각 setting id에 대한 customor_db 데이터 카운트
    const counts = await Promise.all(
      recentSettings.map(async (setting) => {
        const count = await countCustomorBySettingId(setting.id);
        return {
          ad_title: setting.ad_title,
          id: setting.id,
          count: count,
        };
      })
    );

    // 빈 배열도 허용하여 200 OK 응답을 보냄
    res.json({
      total: totalCount,
      data: processedData, // 필터링된 데이터가 없으면 빈 배열 반환
      recentSettings: counts,
    });
  } catch (error) {
    console.error("Error fetching filtered customor data:", error);
    res.status(500).json({ error: "서버 오류입니다." });
  }
};

// GET 요청: 특정 ID의 customor 데이터를 가져오기
const fetchCustomorById = async (req, res) => {
  const { id } = req.params;

  try {
    const customorData = await getCustomorById(id);

    if (!customorData) {
      return res.status(404).json({ error: "해당 데이터를 찾을 수 없습니다." });
    }

    res.json(customorData);
  } catch (error) {
    console.error("Error fetching customor data by ID:", error);
    res.status(500).json({ error: "서버 오류입니다." });
  }
};

// POST 요청: 사용자 데이터 제출
const submitCustomorData = async (req, res) => {
  try {
    const { urlCode, name, phone } = req.body;

    // 기본값 설정 및 데이터 정제
    const customorData = {
      name: name || "",
      phone: phone || "",
      url_code: urlCode || "",
      dividend_status: null, // 추가 필드: 필요에 따라 기본값 설정
      date: null,
      initial_status: null,
      no_answer_count: 0,
      recall_request_at: null,
      reservation_date: null,
      visit_status: null,
      // 필요한 경우, 추가 필드를 여기에 포함
    };

    // 데이터베이스에 새 레코드 생성
    const newCustomor = await createCustomor(customorData);

    res.status(201).json(newCustomor);
  } catch (error) {
    console.error("Error submitting customor data:", error);
    res.status(500).json({ error: "서버 오류입니다." });
  }
};

// PUT 요청: 사용자 데이터 수정
const updateCustomorData = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedCustomor = await updateCustomor(id, req.body);
    res.status(200).json(updatedCustomor);
  } catch (error) {
    console.error("Error updating customor data:", error);
    res.status(500).json({ error: "서버 오류입니다." });
  }
};

// 삭제 휴지통
const updateDataStatus = async (req, res) => {
  const { ids, data_status } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "업데이트할 ID를 제공해야 합니다." });
  }

  try {
    const updated = await updateDataStatusModel(ids, data_status);
    res.json({ message: `${updated.count}개의 데이터가 업데이트되었습니다.` });
  } catch (error) {
    console.error("Error updating data status:", error);
    res.status(500).json({ error: "데이터 업데이트 중 오류가 발생했습니다." });
  }
};

const handleDeleteCustomors = async (req, res) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) {
    return res.status(400).send({ message: "No IDs provided for deletion." });
  }

  try {
    const result = await deleteCustomors(ids);
    return res.json({
      message: `${result.count} customors were deleted permanently.`,
    });
  } catch (error) {
    console.error("Failed to delete customors:", error);
    return res.status(500).send({ message: "Error deleting customors." });
  }
};
module.exports = {
  // fetchCustomorData,
  fetchFilteredCustomorData,
  fetchCustomorById,
  submitCustomorData,
  updateCustomorData,
  updateDataStatus,
  handleDeleteCustomors,
};
