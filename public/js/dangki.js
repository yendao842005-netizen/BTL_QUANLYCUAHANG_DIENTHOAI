function validateForm1() {
    let isValid = true;

    // Lấy giá trị các trường nhập
    const fullname = document.getElementById("username").value.trim();
    const verification = document.getElementById("verification").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Xóa lỗi cũ
    document.getElementById("usernameError").innerText = "";
    
    document.getElementById("verificationError").innerText = "";

    document.getElementById("phoneError").innerText = "";
    document.getElementById("emailError").innerText = "";
    document.getElementById("passwordError").innerText = "";

    // Kiểm tra từng trường
    if (fullname === "" || fullname.length > 50) {
        document.getElementById("usernameError").innerText = "Tên đăng nhập không được để trống hoặc vượt quá 50 ký tự.";
        isValid = false;
    }




    if (phone === "" || isNaN(phone) || phone.length < 10) {
document.getElementById("phoneError").innerText = "Số điện thoại không hợp lệ.";
        isValid = false;
    }

    if (email === "" || !email.includes("@")) {
        document.getElementById("emailError").innerText = "Email không hợp lệ.";
        isValid = false;
    }

    if (password === "" || password.length < 6) {
        document.getElementById("passwordError").innerText = "Mật khẩu phải có ít nhất 6 ký tự.";
        isValid = false;
    }
    if (verification === "" || verification.length < 6) {
        document.getElementById("verificationError").innerText = "Mã xác nhận phải có ít nhất 6 ký tự.";
        isValid = false;
    }
     
     const account = {
        username: fullname,
        password: password,
        email: email
    };

  
    let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

   
    const isExistingUser = accounts.some((accounts) => accounts.email === email && email !== "");
    if (isExistingUser ) {
        alert("Email đã tồn tại. Vui lòng chọn email khác.");
        return;
    }

    
    accounts.push(account);

    
    localStorage.setItem("accounts", JSON.stringify(accounts));

   
    if (isValid) {
        alert("Đăng ký thành công!");
        window.location.href = "/dangnhap.html"; // Đường dẫn đến trang đăng nhập

    }
}