const express = require("express");
const path = require("path");
const cors = require("cors");
const randingRoutes = require("./routes/randingRoutes");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

// 사전에 정의된 static 미들웨어
const staticHospital1 = express.static(
  path.join(__dirname, "../hospital1/build")
);
const staticHospital2 = express.static(
  path.join(__dirname, "../hospital2/build")
);
const staticHospital3 = express.static(
  path.join(__dirname, "../hospital3/build")
);
const staticHospital4 = express.static(
  path.join(__dirname, "../hospital4/build")
);

app.use("/api", randingRoutes);

app.use((req, res, next) => {
  const host = req.headers.host;

  if (host.endsWith("bkmzfq.com")) {
    req.staticPath = path.join(__dirname, "../hospital1/build/index.html");
    // console.log(1);
    return staticHospital1(req, res, next);
  }
  // 테스트
  else if (host.endsWith("localhost:5000")) {
    req.staticPath = path.join(__dirname, "../hospital1/build/index.html");
    // console.log(1);
    return staticHospital1(req, res, next);
  }
  // 테스트
  else if (host.endsWith("dbgemstone.com")) {
    req.staticPath = path.join(__dirname, "../hospital2/build/index.html");
    // console.log(2);
    return staticHospital2(req, res, next);
  } else if (host.endsWith("ccc.com")) {
    req.staticPath = path.join(__dirname, "../hospital3/build/index.html");
    // console.log(3);
    return staticHospital3(req, res, next);
  } else if (host.endsWith("ddd.com")) {
    req.staticPath = path.join(__dirname, "../hospital4/build/index.html");
    // console.log(4);
    return staticHospital4(req, res, next);
  }
  next();
});

// 각 도메인에 맞는 React 앱을 제공
app.get("*", (req, res) => {
  res.sendFile(
    req.staticPath || path.join(__dirname, "../default/build/index.html")
  );
});

// Specific route for your API

module.exports = app;
