import express from "express";
import fs from "fs";
import log4js from "log4js";
import path from "path";
import cors from "cors";
import https from "https";

import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const key = process.env.PRE_PRIVATE_KEY;
const cert = process.env.PRE_CERTIFICATE;

const https_options = {
  key: fs.readFileSync(key),
  cert: fs.readFileSync(cert),
};

const app = express();

app.use(cors());

const webServer = https.createServer(https_options, app);

const __filename = fileURLToPath(import.meta.url);
let logfile = path.parse(__filename).name + ".log";
log4js.configure({
  appenders: {
    file: {
      type: "file",
      filename: logfile,
      layout: {
        type: "pattern",
        pattern: "%d{yyyyMMdd hh:mm:ss.SSS} %-5p %m",
      },
    },
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%[%d{yyyyMMdd hh:mm:ss.SSS} %-5p%] %m",
      },
    },
    wrapper: { type: "logLevelFilter", appender: "console", level: "info" },
  },
  categories: {
    default: { appenders: ["file", "wrapper"], level: "debug" },
  },
});

const logger = log4js.getLogger();

app.use(express.json());

app.get("/api", (req, res) => {
  res.json(data);
});

app.post("/chat_completion", (req, res) => {
  logger.info("--- POST(/chat_completion) request received ---");
  logger.debug("req : %s", req.body);
  const rawdata = fs.readFileSync("chat_completion.json");
  const data = JSON.parse(rawdata);
  logger.debug("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});

app.post("/add_evaluation", (req, res) => {
  logger.info("--- POST(/add_evaluation) request received ---");
  logger.debug("req : %s", req.body);
  const rawdata = fs.readFileSync("add_evaluation.json");
  const data = JSON.parse(rawdata);
  logger.debug("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});

app.get("/get_modellist", (req, res) => {
  logger.info("--- POST(/get_modellist) request received ---");
  const rawdata = fs.readFileSync("get_modellist.json");
  const data = JSON.parse(rawdata);
  logger.debug("data.models.length : %d", data.models.length);
  for (let i = 0; i < data.models.length; i++) {
    logger.debug("model[%d] : \n%s", i, data.models[i]);
  }

  logger.info("--- POST response ---");
  res.status(200).json(data);
});

app.post("/multiturn_completion", (req, res) => {
  logger.info("--- POST(/multiturn_completion) request received ---");
  //logger.debug("req : %s", req.body);
  logger.debug("req : %s", JSON.stringify(req.body));
  const rawdata = fs.readFileSync("multiturn_completion.json");
  const data = JSON.parse(rawdata);
  logger.debug("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});

app.post("/count_tokens", (req, res) => {
  logger.info("--- POST(/count_tokens) request received ---");
  logger.debug("req : %s", JSON.stringify(req.body));
  const rawdata = fs.readFileSync("count_tokens.json");
  const data = JSON.parse(rawdata);
  logger.debug("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});

webServer.listen(3030, () => {
  logger.info("Server running on port 3030");
});
