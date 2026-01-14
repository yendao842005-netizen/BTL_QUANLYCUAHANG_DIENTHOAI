// File: js/auth_header.js

$(document).ready(function () {
    // 1. Kiểm tra trạng thái đăng nhập ngay khi tải trang
    checkLoginStatus();

    // 2. Bắt sự kiện click nút Đăng xuất bằng jQuery (Thay vì onclick trong HTML)
    // Dùng 'body' làm trung gian để đảm bảo bắt được sự kiện ngay cả khi phần tử sinh ra động
    $('body').on('click', '#btn-logout', function(e) {
        e.preventDefault(); // Chặn hành vi mặc định của thẻ a (không load lại trang)
        logout();
    });
});

function checkLoginStatus() {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username'); // Lấy tên user

    if (token) {
        // --- ĐÃ ĐĂNG NHẬP ---
        $('#auth-options').hide();  // Ẩn Đăng nhập
        $('#auth-options1').hide(); // Ẩn Đăng ký

        $('#logout-option').show(); // Hiện Đăng xuất
        
        // (Tùy chọn) Hiển thị tên: "Chào, Admin"
        // $('#logout-option a').html(`<i class="fa-solid fa-user"></i> Chào, ${username} (Thoát)`);
    } else {
        // --- CHƯA ĐĂNG NHẬP ---
        $('#auth-options').show();
        $('#auth-options1').show();
        $('#logout-option').hide();
    }
}

function logout() {
    if(confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        
        // localStorage.removeItem('cart'); // Xóa giỏ hàng nếu cần
        
        window.location.href = "/dangnhap";
    }
}