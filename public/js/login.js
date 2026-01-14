// js/login.js

document.getElementById('adminLoginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            const roleId = parseInt(data.user.role_id);

            // --- LOGIC MỚI: CHẶN KHÁCH HÀNG ---
            // Nếu KHÔNG PHẢI là Admin (1) hoặc Nhân viên (2)
            if (roleId !== 1 && roleId !== 2) {
                localStorage.removeItem('accessToken');
                // Báo lỗi không tồn tại
                alert("Tài khoản không tồn tại hoặc bạn không có quyền truy cập!");
                return;
            }

            // --- ĐÚNG LÀ ADMIN/NV ---
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('userRole', roleId);
            localStorage.setItem('username', data.user.username);
            
            // Nếu có thông tin chi tiết nhân viên
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Chuyển hướng
            if (roleId === 1) {
                window.location.href = "/TongQuanHeThong"; // Trang Admin
            } else {
                window.location.href = "/QLSanPham"; // Trang Nhân viên
            }

        } else {
            alert("Tài khoản hoặc mật khẩu không đúng!");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
});