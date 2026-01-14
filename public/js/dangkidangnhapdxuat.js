

// // Hàm xử lý đăng xuất
// function logout() {
//     localStorage.removeItem("isLoggedIn"); // Xóa trạng thái đăng nhập
//     document.getElementById("auth-options").style.display = "block"; // Hiển thị lại đăng nhập/đăng ký
//     document.getElementById("auth-options1").style.display = "block"; // Hiển thị lại đăng nhập/đăng ký

//     document.getElementById("logout-option").style.display = "none"; // Ẩn nút đăng xuất
// }

// // Kiểm tra trạng thái đăng nhập khi tải trang
// document.addEventListener("DOMContentLoaded", function() {
//     const isLoggedIn = localStorage.getItem("isLoggedIn");

//     if (isLoggedIn === "true") {
//         // Ẩn nút đăng nhập/đăng ký, hiển thị nút đăng xuất
//         document.getElementById("auth-options").style.display = "none";
//         document.getElementById("auth-options1").style.display = "none";

//         document.getElementById("logout-option").style.display = "block";
//     }
// });
// js/dangkidangnhapdxuat.js

// Hàm xử lý đăng xuất
function logout() {
    // 1. Xóa toàn bộ thông tin bảo mật
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("username");
    
    // 2. Chuyển hướng về trang đăng nhập hoặc trang chủ
    alert("Đã đăng xuất thành công!");
    window.location.href = "/dangnhap"; 
}

// Kiểm tra trạng thái khi tải trang
document.addEventListener("DOMContentLoaded", function() {
    // Kiểm tra xem có Token (chìa khóa vào nhà) không
    const token = localStorage.getItem("accessToken");
    const username = localStorage.getItem("username");

    const authOptions = document.getElementById("auth-options");
    const logoutOption = document.getElementById("logout-option");
    
    // Lưu ý: Bạn cần đảm bảo ID của các thẻ trong HTML header khớp với code này
    // Ví dụ: thẻ chứa nút Đăng nhập có id="auth-options"
    // Thẻ chứa nút Đăng xuất (hoặc tên user) có id="logout-option"

    if (token && logoutOption && authOptions) {
        // Đã đăng nhập -> Ẩn đăng nhập, Hiện đăng xuất/Tên user
        authOptions.style.display = "none";
        
        logoutOption.style.display = "block";
        // Nếu muốn hiện tên người dùng: 
        // logoutOption.innerHTML = `Xin chào, ${username} <a href="#" onclick="logout()"> (Đăng xuất)</a>`;
    } else {
        // Chưa đăng nhập
        if (logoutOption) logoutOption.style.display = "none";
        if (authOptions) authOptions.style.display = "block";
    }
});