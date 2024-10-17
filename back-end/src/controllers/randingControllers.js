const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// URL 코드 설정을 가져오는 컨트롤러
const getUrlCodeSetting = async (req, res) => {
  const { urlCode } = req.params;
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.connection.remoteAddress;

  console.log(urlCode);
  try {
    const urlCodeSetting = await prisma.url_code_setting.findFirst({
      where: { url_code: urlCode },
    });

    // URL Code Setting 존재 시, click 테이블에 기록
    if (urlCodeSetting) {
      res.json(urlCodeSetting);
      // click 테이블에 데이터 추가
      await prisma.click.create({
        data: {
          url_code: urlCode,
          ip: ip,
        },
      });
    } else {
      res.status(404).send("URL Code Setting not found");
    }
  } catch (error) {
    console.error("Error accessing the database:", error);
    res.status(500).send("Server error");
  }
};

const incrementClickCount = async (req, res) => {
  const { urlCodeSettingId } = req.params;

  const id = parseInt(urlCodeSettingId);
  try {
    const result = await prisma.url_code_setting.update({
      where: { id: id },
      data: {
        db_click_count: {
          increment: 1,
        },
      },
    });
    res.status(200).json({
      message: "db_click_count incremented successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error incrementing db_click_count:", error);
    res.status(500).json({
      message: "Failed to increment db_click_count",
      error: error,
    });
  }
};

const createCustomer = async (req, res) => {
  const { name, phoneNumber, date, urlCode, urlCodeSettingId } = req.body;
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.connection.remoteAddress;

  try {
    const isoDate = new Date(date).toISOString(); // 날짜를 ISO 형식으로 변환

    const newCustomer = await prisma.customor_db.create({
      data: {
        name: name,
        phone: phoneNumber,
        date: isoDate,
        url_code: urlCode,
        url_code_setting_id: parseInt(urlCodeSettingId),
        ip: ip, // IP 주소를 데이터베이스에 저장
      },
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).send("Failed to create customer");
  }
};

module.exports = {
  getUrlCodeSetting,
  incrementClickCount,
  createCustomer,
};
