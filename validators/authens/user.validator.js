import { z } from "zod";

// 1. Schema cho Admin tạo Nhân viên mới
export const createEmployeeSchema = z.object({
  // --- Info Tài khoản (System Role) ---
  username: z.string()
    .min(3, "Username tối thiểu 3 ký tự")
    .max(50, "Username tối đa 50 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ chứa chữ, số và gạch dưới"),
    
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  
  // role_id: Quyền hạn trong phần mềm (1=QuanLy, 2=NhanVien)
  // Dù chức vụ là gì (Kế toán, Bảo vệ...), họ vẫn phải thuộc 1 trong 2 nhóm quyền này
  role_id: z.enum([1, 2], {
    errorMap: () => ({ message: "Quyền hạn không hợp lệ (1: Quản lý, 2: Nhân viên)" })
  }),

  // --- Info Nhân viên (Job Title & Profile) ---
  name: z.string().min(2, "Họ tên quá ngắn").max(100),
  
  phone: z.string()
    .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/, "Số điện thoại không hợp lệ"),
    
  email: z.string().email("Email không hợp lệ").max(100),
  
  address: z.string().min(5, "Địa chỉ cần chi tiết hơn").max(255),
  
  gender: z.enum(['Nam', 'Nu', 'Khac'], {
    errorMap: () => ({ message: "Giới tính phải là: Nam, Nu hoặc Khac" })
  }),
  
  birthdate: z.string().date("Ngày sinh phải là định dạng YYYY-MM-DD"), // YYYY-MM-DD
  
  salary: z.number().min(1000000, "Lương cơ bản tối thiểu 1 triệu"),

  job_title: z.string()
    .min(2, "Chức vụ quá ngắn")
    .max(50, "Chức vụ không được quá 50 ký tự"),

  start_date: z.string().date().optional()
});

// 2. Schema cập nhật nhân viên
export const updateEmployeeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/).optional(),
  email: z.string().email().optional(),
  address: z.string().max(255).optional(),
  gender: z.enum(['Nam', 'Nu', 'Khac']).optional(),
  birthdate: z.string().date().optional(),
  salary: z.number().min(0).optional(),
  
  // Update chức vụ cũng là string
  job_title: z.string().max(50).optional(),
  
  role_id: z.enum([1, 2]).optional(),
  is_active: z.boolean().optional()
});