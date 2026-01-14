// js/dangnhap.js

async function validateForm() {
    let isValid = true;
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Reset lỗi
    document.getElementById("usernameError").innerText = "";
    document.getElementById("passwordError").innerText = "";

    if (username === "") {
        document.getElementById("usernameError").innerText = "Vui lòng nhập tên đăng nhập.";
        isValid = false;
    }
    if (password === "") {
        document.getElementById("passwordError").innerText = "Vui lòng nhập mật khẩu.";
        isValid = false;
    }

    if (!isValid) return;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            const roleId = parseInt(data.user.role_id);

            // --- LOGIC MỚI: CHẶN ADMIN/NHÂN VIÊN ---
            // Nếu là Admin (1) hoặc NV (2) -> Báo lỗi như sai pass
            if (roleId === 1 || roleId === 2) {
                // Xóa token ngay lập tức để bảo mật
                localStorage.removeItem('accessToken');
                
                // Hiển thị lỗi chung chung để họ không biết đây là tk admin
                alert("Tên đăng nhập hoặc mật khẩu không đúng."); 
                return; 
            }

            // --- NẾU LÀ KHÁCH HÀNG (3) THÌ CHO QUA ---
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('userRole', roleId);
            localStorage.setItem('username', data.user.username);
            
            alert("Đăng nhập thành công!");
            window.location.href = "/trangchu";

        } else {
            // Lỗi từ server trả về
            alert("Tên đăng nhập hoặc mật khẩu không đúng.");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối máy chủ.");
    }
}