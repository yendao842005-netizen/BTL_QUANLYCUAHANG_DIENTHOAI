import { z } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    // --- BƯỚC 1: KIỂM TRA LOẠI SCHEMA ---
    // Kiểm tra xem schema này có được định nghĩa theo kiểu mới (có key body/query/params) không
    const isNewStyle = schema instanceof z.ZodObject && 
                       Object.keys(schema.shape).some(key => ['body', 'query', 'params'].includes(key));

    if (isNewStyle) {
      // --- XỬ LÝ KIỂU MỚI (Cho Giỏ hàng, Hóa đơn...) ---
      // Validate cả body, query, params cùng lúc
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Gán ngược lại dữ liệu sạch vào request
      if (validatedData.body) req.body = validatedData.body;
      if (validatedData.query) req.query = validatedData.query;
      if (validatedData.params) req.params = validatedData.params;

    } else {
      // --- XỬ LÝ KIỂU CŨ (Cho Đăng nhập, Đăng ký cũ...) ---
      // Chỉ validate req.body như cũ
      const validatedBody = schema.parse(req.body);
      req.body = validatedBody;
    }

    next();
  } catch (err) {
    // --- XỬ LÝ LỖI CHUNG ---
    if (err instanceof z.ZodError) {
      const errorMessages = err.errors.map((issue) => ({
        // Xóa chữ "body." ở đầu để thông báo lỗi đẹp hơn
        field: issue.path.join('.').replace(/^body\./, ''),
        message: issue.message,
      }));

      return res.status(400).json({
        status: "error",
        message: "Dữ liệu không hợp lệ",
        errors: errorMessages,
      });
    }
    next(err);
  }
};