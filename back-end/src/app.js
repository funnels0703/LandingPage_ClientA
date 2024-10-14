const express = require("express");
const path = require("path");
const cors = require("cors");
const urlCodeRoutes = require("./routes/urlCodeRoutes");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

// 도메인 별로 다른 static 경로 설정
app.use((req, res, next) => {
  const host = req.headers.host;

  switch (host) {
    case "aaa.com":
      app.use(express.static(path.join(__dirname, "../hospital1/build")));
      req.staticPath = path.join(__dirname, "../hospital1/build/index.html");
      break;
    case "bbb.com":
      app.use(express.static(path.join(__dirname, "../hospital2/build")));
      req.staticPath = path.join(__dirname, "../hospital2/build/index.html");
      break;
    case "ccc.com":
      app.use(express.static(path.join(__dirname, "../hospital3/build")));
      req.staticPath = path.join(__dirname, "../hospital3/build/index.html");
      break;
    case "ddd.com":
      app.use(express.static(path.join(__dirname, "../hospital4/build")));
      req.staticPath = path.join(__dirname, "../hospital4/build/index.html");
      break;
    default:
      next();
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
app.use("/api", urlCodeRoutes);

module.exports = app;
