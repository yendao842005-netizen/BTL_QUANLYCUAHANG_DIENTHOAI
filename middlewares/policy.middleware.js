import { checkPolicy } from "../services/policy.service.js";

export function authorizePolicy(policy) {
  return async (req, res, next) => {
    // Lấy ID tài nguyên từ URL (nếu có), ví dụ /users/:id
    const resourceId = req.params.id || req.params.MaTK || req.params.MaKH;

    try {
      const allowed = await checkPolicy({
        user: req.user, // Có được từ middleware authenticate trước đó
        policy,
        resourceId
      });

      if (!allowed) {
        return res.status(403).json({
          message: "Bạn không có quyền thực hiện thao tác này"
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Lỗi kiểm tra quyền hạn" });
    }
  };
}