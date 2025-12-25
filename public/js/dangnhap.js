function validateForm() {
    let isValid = true;

    // Lấy giá trị các trường nhập
   
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Xóa lỗi cũ

    document.getElementById("emailError").innerText = "";
    document.getElementById("passwordError").innerText = "";

    // Kiểm tra từng trường
  

    if (email === "" || !email.includes("@")) {
        document.getElementById("emailError").innerText = "Email không hợp lệ.";
        isValid = false;
    }

    if (password === "" || password.length < 6) {
        document.getElementById("passwordError").innerText = "Mật khẩu phải có ít nhất 6 ký tự.";
        isValid = false;
    }

     // Lấy danh sách tài khoản từ localStorage
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  // Kiểm tra xem tài khoản có tồn tại và mật khẩu có khớp không
  const userAccount = accounts.find((account) => account.email === email && account.password === password && email !== "" && password !== "" );

    // Nếu hợp lệ
    if (userAccount) {
        alert("Đăng nhập thành công!");
         // Giả sử người dùng đăng nhập thành công
        localStorage.setItem("isLoggedIn", "true"); // Lưu trạng thái đăng nhập
        window.location.href = "/index.html"; // Đường dẫn đến trang chủ
    }
    else {
        alert("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
}