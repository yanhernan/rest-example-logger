import { v4 } from "uuid";
import { Logger } from "../config/logger";
import { Trace } from "../utils/trace";

const getTraceIdKey = (req) => {
  const { headers } = req;
  const headerNames = Object.keys(headers);
  const traceIdKey = headerNames.find(
    (headerName) => headerName.toLowerCase() === "traceid"
  );
  return traceIdKey;
};

const generateTraceId = () => {
  return v4().replace(/(-)/g, "");
};

const setTraceId = (req, traceId) => {
  req.headers.traceId = traceId;
};

export const onRequest = () => {
  return (req, res, next) => {
    let traceId = getTraceIdKey(req);
    if (!traceId) {
      traceId = generateTraceId();
      setTraceId(req, traceId);
    }
    Trace.setTrace(traceId);
    res.setHeader('traceId', traceId);
    Logger.active().info(
      {
        traceId,
        pidProcess: process.ppid,
        content: { url: res.url, method: req.method },
      },
      "Request"
    );
    return (function run(traceId) {
      res.on("finish", onResponse());
      const response = next();
      return response;
    })(traceId);
  };
};

export const onResponse = () => {
  return function () {
    const res = this;
    const headers = res.getHeaders();
    const traceId = headers[getTraceIdKey({ headers })];
    Logger.active().info(
      { traceId, content: { status: res.statusCode } },
      "Response"
    );
  };
};

export const onError = () => (err, req, res, next) => {
  const traceId = getTraceIdKey(req);
  Logger.active().info(
    { content: { error: err.message }, traceId: traceId },
    "Error"
  );
  return next();
};
