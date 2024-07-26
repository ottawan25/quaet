import express from "express";
import next from "next";
import https from "https";
import fs from "fs";
import { networkInterfaces } from "os";

const port = 4300;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  expressApp.get("*", (req, res) => handle(req, res));
  const key = process.env.NEXT_PUBLIC_QAE_PRIVATE_KEY;
  const cert = process.env.NEXT_PUBLIC_QAE_CERTIFICATE;
  if (!key || !cert) {
    throw new Error("QAE_PRIVATE_KEY or QAE_CERTIFICATE must be set");
  }
  const options = {
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
  };
  const netIFs = networkInterfaces();
  const useIF = process.env.NEXT_PUBLIC_NETWORK_INTERFACE;
  let ipaddr = "x.x.x.x";
  const regExpUseIF = new RegExp(useIF);
  for (let key in netIFs) {
    const result = key.match(regExpUseIF);
    if (result != null) {
      const net = netIFs[key]?.find((v) => v.family === "IPv4");
      ipaddr = net.address;
      break;
    }
  }
  https.createServer(options, expressApp).listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log(`> Ready on https://${ipaddr}:${port}`);
  });
});
