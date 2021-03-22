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
    let inputData = "";

    req.on("data", (chunk) => {
      inputData += chunk.toString();
    });
    let traceId = getTraceIdKey(req);
    if (!traceId) {
      traceId = generateTraceId();
      setTraceId(req, traceId);
    }
    Trace.setTrace(traceId);
    res.setHeader("traceId", traceId);
    const end = res.end;
    res.end = (data) => {
      res.body = data;
      end.call(res, data);
    };

    req.on("end", () => {
      Logger.active().info(
        {
          traceId,
          content: { body: inputData, url: res.url, method: req.method },
        },
        "Request"
      );
      res.on("close", onResponse(traceId));
      next();
    });
  };
};

const onResponse = (traceId) => {
  return function () {
    const res = this;
    const headers = res.getHeaders();
    Logger.active().info(
      { traceId, content: { body: res.body, status: res.statusCode } },
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
