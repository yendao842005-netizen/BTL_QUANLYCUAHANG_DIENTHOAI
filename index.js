import dotenv from "dotenv";
import express from "express";
import cors from "cors";
// import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path"; // THÊM: Module để xử lý đường dẫn file/folder
import { fileURLToPath } from "url"; // THÊM: Để convert URL thành đường dẫn file (cần cho ES modules)
import { requestLogger } from "./middlewares/logger.middleware.js";
import apiRoutes from "./routes/api.js";
import webRoutes from "./routes/web.js";
import { logger } from "./config/logger.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url); // Lấy đường dẫn file hiện tại
const __dirname = path.dirname(__filename); // Lấy thư mục chứa file hiện tại
// Khi gọi res.render('sanpham'), Express sẽ tìm file views/sanpham.ejs
app.set("views", path.join(__dirname, "views"));

// Set EJS làm template engine mặc định
// Giờ không cần ghi .ejs khi render, chỉ cần tên file
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public"))); //thêm

// ---------------------------
// Basic & Security Middlewares
// ---------------------------

//app.use(helmet());
// Cấu hình CSP để cho phép onclick và load tài nguyên từ bên ngoài (cdnjs, fontawesome...)
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'", 
//         "'unsafe-inline'", 
//         "https://cdnjs.cloudflare.com", 
//         "https://kit.fontawesome.com", 
//         "https://code.jquery.com",
//         "https://cdn.jsdelivr.net" // <--- THÊM DÒNG NÀY
//       ],
//       styleSrc: [
//         "'self'", 
//         "'unsafe-inline'", 
//         "https://cdnjs.cloudflare.com", 
//         "https://fonts.googleapis.com", 
//         "https://kit.fontawesome.com",
//         "https://cdn.jsdelivr.net" // <--- THÊM DÒNG NÀY
//       ],
//       imgSrc: ["'self'", "data:", "https:"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://kit.fontawesome.com"],
//       connectSrc: ["'self'", "https://cdnjs.cloudflare.com"], 
//     },
//   })
// );
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'", 
//         "'unsafe-inline'", 
//         "https://cdnjs.cloudflare.com", 
//         "https://kit.fontawesome.com", 
//         "https://code.jquery.com",
//         "https://cdn.jsdelivr.net" // <--- THÊM DÒNG NÀY
//       ],
//       styleSrc: [
//         "'self'", 
//         "'unsafe-inline'", 
//         "https://cdnjs.cloudflare.com", 
//         "https://fonts.googleapis.com", 
//         "https://kit.fontawesome.com",
//         "https://cdn.jsdelivr.net" // <--- THÊM DÒNG NÀY
//       ],
//       imgSrc: ["'self'", "data:", "https:"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://kit.fontawesome.com"],
//       connectSrc: ["'self'", "https://cdnjs.cloudflare.com"], 
//     },
//   })
// );
app.use(cors({ origin: "*" }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));

// Cần thiết nếu bạn có form trong EJS gửi dữ liệu về server
app.use(express.urlencoded({ extended: false }));

// ---------------------------
// Custom Logging Middleware
// ---------------------------
app.use(requestLogger);

// ---------------------------
// Routes
// ---------------------------

app.use("/api", apiRoutes);
app.use("/", webRoutes);

// ---------------------------
// 404 Handler
// ---------------------------
app.use((req, res, next) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ---------------------------
// Global Error Handler
// ---------------------------
app.use((err, req, res, next) => {
  logger.error(err);

  const status = err.status || 500;

  res.status(status).json({
    status,
    message: err.message || "Internal Server Error",
  });
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
