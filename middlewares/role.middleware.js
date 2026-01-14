export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    // req.user.role lấy từ Token (được giải mã ở auth.middleware)
    // allowedRoles là mảng các ID được phép (VD: [1, 2])
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Bạn không có quyền truy cập tài nguyên này (Role Denied)" 
      });
    }

    next();
  };
}