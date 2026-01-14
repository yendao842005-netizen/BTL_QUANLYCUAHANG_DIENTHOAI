import { z } from "zod";

// Dành cho khách hàng tự đăng ký (Public)
export const registerCustomerSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập tối thiểu 3 ký tự"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  name: z.string().min(2, "Họ tên không hợp lệ"),
  phone: z.string().regex(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ").optional(),
  
  // Các trường optional cho khách
  address: z.string().optional(),
  gender: z.enum(['Nam', 'Nu', 'Khac']).optional(),
  birthdate: z.string().date().optional() // YYYY-MM-DD
});

export const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu")
});