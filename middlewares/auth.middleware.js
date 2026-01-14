import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "BI_MAT_KHONG_BAT_MI";

export function authenticate(req, res, next) {
  // 1. Lấy token từ header: "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Chưa đăng nhập (Thiếu Token)" });
  }

  const token = authHeader.split(" ")[1]; // Lấy phần sau chữ Bearer

  if (!token) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  // 2. Xác thực token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Phiên đăng nhập hết hạn hoặc không hợp lệ" });
    }

    // 3. Gán thông tin user vào request để dùng cho bước sau
    req.user = decoded;
    // decoded sẽ có dạng: { id: 'TK001', sub: 'NV001', role: 1, ... }

    next();
  });
}
