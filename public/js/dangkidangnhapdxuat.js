

// Hàm xử lý đăng xuất
function logout() {
    localStorage.removeItem("isLoggedIn"); // Xóa trạng thái đăng nhập
    document.getElementById("auth-options").style.display = "block"; // Hiển thị lại đăng nhập/đăng ký
    document.getElementById("auth-options1").style.display = "block"; // Hiển thị lại đăng nhập/đăng ký

    document.getElementById("logout-option").style.display = "none"; // Ẩn nút đăng xuất
}

// Kiểm tra trạng thái đăng nhập khi tải trang
document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        // Ẩn nút đăng nhập/đăng ký, hiển thị nút đăng xuất
        document.getElementById("auth-options").style.display = "none";
        document.getElementById("auth-options1").style.display = "none";

        document.getElementById("logout-option").style.display = "block";
    }
});
