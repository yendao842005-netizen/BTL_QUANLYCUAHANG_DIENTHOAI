function validateForm1() {
    let isValid = true;

    // 1. Lấy giá trị từ giao diện
    // Lưu ý: Lấy đúng ID đã khai báo bên HTML
    const fullname = document.getElementById("fullname").value.trim(); // [MỚI]
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const phone = document.getElementById("phone").value.trim();

    // 2. Xóa thông báo lỗi cũ
    document.getElementById("fullnameError").innerText = "";
    document.getElementById("usernameError").innerText = "";
    document.getElementById("emailError").innerText = "";
    document.getElementById("passwordError").innerText = "";
    document.getElementById("phoneError").innerText = "";

    // 3. Validate (Kiểm tra dữ liệu)

    // Kiểm tra Họ tên
    if (fullname === "" || fullname.length < 2) {
        document.getElementById("fullnameError").innerText = "Vui lòng nhập họ tên đầy đủ.";
        isValid = false;
    }

    // Kiểm tra Tên đăng nhập
    if (username === "" || username.length < 3 || username.length > 50) {
        document.getElementById("usernameError").innerText = "Tên đăng nhập phải từ 3 đến 50 ký tự.";
        isValid = false;
    }

    // Kiểm tra Email
    if (email === "" || !email.includes("@")) {
        document.getElementById("emailError").innerText = "Email không hợp lệ.";
        isValid = false;
    }

    // Kiểm tra Mật khẩu
    if (password === "" || password.length < 6) {
        document.getElementById("passwordError").innerText = "Mật khẩu phải có ít nhất 6 ký tự.";
        isValid = false;
    }

    // Kiểm tra Số điện thoại
    if (phone === "" || isNaN(phone) || phone.length < 10) {
        document.getElementById("phoneError").innerText = "Số điện thoại không hợp lệ.";
        isValid = false;
    }

    // 4. Gửi API nếu dữ liệu hợp lệ
    if (isValid) {
        const userData = {
            username: username,
            name: fullname,      // [QUAN TRỌNG] Gửi họ tên vào trường 'name' của API
            email: email,
            password: password,
            phone: phone
        };

        // Gọi API Đăng ký
        // Đường dẫn /api/auth/register dựa trên cấu hình router của bạn
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(async response => {
            const data = await response.json();

            if (response.ok) {
                // Thành công -> Chuyển hướng về trang đăng nhập
                alert("Đăng ký thành công! Vui lòng đăng nhập.");
                window.location.href = "/dangnhap";
            } else {
                // Thất bại -> Hiển thị lỗi
                let errorMessage = data.message || "Đăng ký thất bại.";
                
                // Nếu Backend trả về chi tiết lỗi (Zod Error)
                if (data.errors && Array.isArray(data.errors)) {
                    errorMessage = "Lỗi dữ liệu:\n" + data.errors.map(e => `- ${e.message}`).join("\n");
                }
                
                alert(errorMessage);
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert("Lỗi kết nối đến máy chủ.");
        });
    }
}