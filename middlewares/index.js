import { errorResponse } from "../helpers/response.js";

// Error wrapper (bọc lỗi toàn cục)
export const middlewareErrorWrapper = async (req, res, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Middleware caught error:", err);
    if (!res.headersSent) {
      res.status(500).json(errorResponse(500, err.message));
    }
  }
};

// Bắt buộc Content-Type là JSON
export const shouldJSON = (req, res, next) => {
  if (req.headers["content-type"] !== "application/json") {
    return res
      .status(400)
      .json(errorResponse(400, "Content-type application/json required"));
  }
  next();
};

export const responseTime = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.locals._startTime = start;

  // Hook vào res.end (được gọi ngay trước khi gửi)
  const originalEnd = res.end;
  res.end = function (...args) {
    const diff = Number(process.hrtime.bigint() - res.locals._startTime) / 1_000_000;
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${diff.toFixed(2)}ms`);
    }
    originalEnd.apply(this, args);
  };

  next();
};

