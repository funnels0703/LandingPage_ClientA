// models/customorModels.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFilteredCustomors = async (filters, offset = 0, limit = 10) => {
  const {
    advertising_company_ids,
    newCompany, // newCompany 추가
    startDate,
    endDate,
    url_code,
    selected_hospital_id, // 병원 ID 필터 추가
  } = filters;

  // newCompany가 있을 경우 advertising_company_ids에 newCompany 사용
  const companyIds = newCompany
    ? [parseInt(newCompany, 10)] // newCompany는 정수로 변환
    : advertising_company_ids
    ? advertising_company_ids
        .split(",")
        .map(Number)
        .filter((id) => id !== 0)
    : [];

  try {
    const urlCodeSettings = await prisma.url_code_setting.findMany({
      where: {
        AND: [
          {
            advertising_company_id: {
              in: companyIds.length > 0 ? companyIds : undefined,
            },
          },
          selected_hospital_id
            ? { hospital_name_id: selected_hospital_id }
            : {}, // 병원 ID 필터 적용
        ],
      },
      select: {
        id: true,
        ad_title: true,
        hospital_name_id: true,
        event_name_id: true,
        advertising_company_id: true,
      },
    });

    const urlCodeSettingIds = urlCodeSettings.map((setting) => setting.id);

    console.log(companyIds, urlCodeSettingIds);

    // 2. customor_db에서 url_code_setting_id로 필터링하여 데이터 조회
    const filteredCustomors = await prisma.customor_db.findMany({
      where: {
        data_status: 0,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        url_code_setting_id: {
          in: urlCodeSettingIds.length > 0 ? urlCodeSettingIds : undefined,
        },
        ...(url_code ? { url_code } : {}),
      },
      skip: offset,
      take: limit,
    });

    // hospital_name, event_name, advertising_company 이름을 가져오기
    const customorDataWithNames = await Promise.all(
      filteredCustomors.map(async (customor) => {
        const urlCodeSetting = urlCodeSettings.find(
          (setting) => setting.id === customor.url_code_setting_id
        );
        if (!urlCodeSetting) return customor;

        // hospital_name, event_name, advertising_company의 name 필드 조회
        const [hospital, event, company] = await Promise.all([
          prisma.hospital_name.findUnique({
            where: { id: urlCodeSetting.hospital_name_id },
            select: { name: true },
          }),
          prisma.event_name.findUnique({
            where: { id: urlCodeSetting.event_name_id },
            select: { name: true },
          }),
          prisma.advertising_company.findUnique({
            where: { id: urlCodeSetting.advertising_company_id },
            select: { name: true },
          }),
        ]);

        return {
          ...customor,
          hospital_name: hospital ? hospital.name : null,
          event_name: event ? event.name : null,
          advertising_company: company ? company.name : null,
          ad_title: urlCodeSetting.ad_title, // ad_title 추가
        };
      })
    );

    return customorDataWithNames;
  } catch (error) {
    console.error("Error fetching filtered customor data:", error);
    throw error;
  }
};

// 총 개수를 가져오는 함수
const getTotalCustomorCount = async (filters) => {
  const {
    advertising_company_ids,
    startDate,
    endDate,
    url_code,
    selected_hospital_id,
  } = filters;

  const companyIds = advertising_company_ids
    ? advertising_company_ids.split(",").map(Number)
    : [];

  try {
    // URL 코드 설정 ID를 가져옴
    const urlCodeSettingIds = await getUrlCodeSettingIds(
      companyIds,
      selected_hospital_id
    );

    console.log("Company IDs:", companyIds);
    console.log("Selected Hospital ID:", selected_hospital_id);
    console.log("URL Code Setting IDs:", urlCodeSettingIds);

    // 총 개수 카운트
    const totalCount = await prisma.customor_db.count({
      where: {
        data_status: 0,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        url_code_setting_id: {
          in: urlCodeSettingIds,
        },
        ...(url_code ? { url_code } : {}),
      },
    });

    // 각 광고 회사별 카운트
    const companyCounts = await prisma.customor_db.groupBy({
      by: ["url_code_setting_id"], // URL 코드 설정 ID로 그룹화
      where: {
        data_status: 0,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        url_code_setting_id: {
          in: urlCodeSettingIds,
        },
        ...(url_code ? { url_code } : {}),
      },
      _count: {
        url_code_setting_id: true,
      },
    });

    // 결과를 회사 ID로 매핑하고 중복 제거 및 카운트 합산
    const countsByCompany = {};

    await Promise.all(
      companyCounts.map(async (company) => {
        const setting = await prisma.url_code_setting.findUnique({
          where: { id: company.url_code_setting_id },
          select: { advertising_company_id: true },
        });

        const advertising_company_id = setting.advertising_company_id;

        // countsByCompany에 카운트 누적
        if (!countsByCompany[advertising_company_id]) {
          countsByCompany[advertising_company_id] = 0; // 초기화
        }
        countsByCompany[advertising_company_id] +=
          company._count.url_code_setting_id; // 카운트 추가
      })
    );

    // 최종 결과 배열로 변환
    const countsArray = Object.entries(countsByCompany).map(
      ([advertising_company_id, count]) => ({
        advertising_company_id: Number(advertising_company_id),
        count,
      })
    );

    console.log("Total Count:", totalCount);
    console.log("Counts by Company:", countsArray);

    return {
      totalCount,
      countsByCompany: countsArray,
    };
  } catch (error) {
    console.error("Error fetching total customor count:", error);
    throw error;
  }
};

// url_code_setting_ids를 가져오는 헬퍼 함수
const getUrlCodeSettingIds = async (companyIds, selected_hospital_id) => {
  const urlCodeSettings = await prisma.url_code_setting.findMany({
    where: {
      AND: [
        {
          advertising_company_id: {
            in: companyIds.length > 0 ? companyIds : undefined,
          },
        },
        selected_hospital_id ? { hospital_name_id: selected_hospital_id } : {}, // 병원 ID 필터 적용
      ],
    },
    select: {
      id: true,
    },
  });

  return urlCodeSettings.map((setting) => setting.id);
};

// 특정 ID의 customor 데이터 가져오기 (GET by ID)
const getCustomorById = async (id) => {
  return prisma.customor_db.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      dividend_status: true,
      date: true,
      name: true,
      phone: true,
      initial_status: true,
      no_answer_count: true,
      recall_request_at: true,
      reservation_date: true,
      visit_status: true,
      url_code: true,
      url_code_setting: {
        select: {
          hospital_name: true,
          advertising_company: true,
          ad_title: true,
        },
      },
    },
  });
};

// customor 데이터 생성 (POST)
const createCustomor = async (data) => {
  return prisma.customor_db.create({
    data: {
      name: data.name,
      phone: data.phone,
      url_code: data.url_code,
      dividend_status: data.dividend_status || null,
      date: data.date || null,
      initial_status: data.initial_status || null,
      no_answer_count: data.no_answer_count || 0,
      recall_request_at: data.recall_request_at || null,
      reservation_date: data.reservation_date || null,
      visit_status: data.visit_status || null,
    },
  });
};

// 특정 ID의 customor 데이터 업데이트 (PUT)
const updateCustomor = async (id, data) => {
  return prisma.customor_db.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name,
      phone: data.phone,
      url_code: data.url_code,
      dividend_status: data.dividend_status || null,
      date: data.date ? new Date(data.date) : null,
      initial_status: data.initial_status || null,
      no_answer_count: data.no_answer_count || 0,
      recall_request_at: data.recall_request_at
        ? new Date(data.recall_request_at)
        : null,
      reservation_date: data.reservation_date
        ? new Date(data.reservation_date)
        : null,
      visit_status: data.visit_status || null,
    },
  });
};

//복원도 구현해야해서 data_status 받아오는걸로 구현해야함
const updateDataStatusModel = async (ids, data_status) => {
  return prisma.customor_db.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      data_status: data_status,
    },
  });
};

const deleteCustomors = async (ids) => {
  return await prisma.customor.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};

// url_code_setting의 최신 5개 데이터 가져오기
const getRecentUrlCodeSettings = async (filters) => {
  const {
    startDate,
    endDate,
    selected_hospital_id, // 병원 ID 필터
    advertising_company_ids, // 매체 필터
  } = filters;

  try {
    return await prisma.url_code_setting.findMany({
      take: 8,
      orderBy: {
        created_at: "desc",
      },
      where: {
        AND: [
          selected_hospital_id
            ? { hospital_name_id: selected_hospital_id }
            : {}, // 병원 ID 필터 적용
          advertising_company_ids && advertising_company_ids.length > 0
            ? {
                advertising_company_id: {
                  in: advertising_company_ids
                    .split(",")
                    .map(Number)
                    .filter((id) => !isNaN(id)), // 매체 ID 필터 적용
                },
              }
            : {}, // 매체 ID 필터 적용
          {
            created_at: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          },
        ],
      },
      select: {
        id: true,
        ad_title: true,
        hospital_name_id: true, // 병원 ID도 선택적으로 가져올 수 있습니다.
      },
    });
  } catch (error) {
    console.error("Error fetching recent URL code settings:", error);
    throw error;
  }
};

// customor_db에서 특정 url_code_setting_id에 대한 데이터 수 카운트
const countCustomorBySettingId = async (settingId) => {
  return await prisma.customor_db.count({
    where: {
      url_code_setting_id: settingId,
    },
  });
};

module.exports = {
  // getAllCustomors,
  getFilteredCustomors,
  getTotalCustomorCount,
  getCustomorById,
  createCustomor,
  updateCustomor,
  updateDataStatusModel,
  deleteCustomors,
  // 매체별 갯수
  getRecentUrlCodeSettings,
  countCustomorBySettingId,
};
