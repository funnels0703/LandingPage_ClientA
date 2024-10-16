// routes/randingRoutes.js
const express = require("express");
const {
  getUrlCodeSetting,
  incrementClickCount,
  createCustomer,
} = require("../controllers/randingControllers");
const router = express.Router();

// URL 코드에 대한 GET 요청 라우트
router.get("/randing/:urlCode", getUrlCodeSetting);
router.post("/randing/click/:urlCodeSettingId", incrementClickCount);

router.post("/randing/customor", createCustomer);

module.exports = router;
