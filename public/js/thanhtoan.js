// js/thanhtoan.js

// Biến lưu giỏ hàng
var list = [];

$(document).ready(function () {
  // 1. Kiểm tra đăng nhập & Header
  if (typeof checkLoginStatus === "function") {
    checkLoginStatus();
  }

  // 2. Load thông tin giỏ hàng & khách hàng
  LoadData();
});

async function LoadData() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("Vui lòng đăng nhập để thanh toán!");
    window.location.href = "/dangnhap";
    return;
  }

  try {
    // --- A. LẤY GIỎ HÀNG ---
    const cartRes = await fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (cartRes.ok) {
      const result = await cartRes.json();
      list = result.data || [];
      if (list.length === 0) {
        alert("Giỏ hàng trống! Quay lại mua sắm nhé.");
        window.location.href = "/sanpham";
        return;
      }
      renderOrderSummary(); // Vẽ bảng tóm tắt
    }

    // --- B. LẤY THÔNG TIN KHÁCH HÀNG (Tự động điền) ---
    // Gọi API lấy thông tin user hiện tại (Giả sử bạn có API này)
    // Nếu chưa có API riêng, có thể lấy tạm username từ localStorage hoặc bỏ qua
    /* const userRes = await fetch('/api/auth/me', { ... });
        if(userRes.ok) {
            const user = await userRes.json();
            $('#name').val(user.HoTen);
            $('#email').val(user.Email);
            $('#sdt').val(user.SoDienThoai);
            $('#diachi').val(user.DiaChi);
        }
        */
  } catch (error) {
    console.error("Lỗi tải trang thanh toán:", error);
  }
}

function renderOrderSummary() {
  let str = "";
  let total = 0;

  for (let x of list) {
    // Tính tiền: Dùng tên trường khớp với DTO Backend (DonGia, SoLuong...)
    let itemTotal = x.DonGia * x.SoLuong;
    total += itemTotal;

    // Ảnh
    let imgUrl =
      x.HinhAnh && !x.HinhAnh.startsWith("http")
        ? `img/img trang sp/${x.HinhAnh}`
        : x.HinhAnh || "img/no-image.png";

    str += `
        <tr>
            <td><img width="50px" src="${imgUrl}" alt="${x.TenSanPham}"></td>
            <td style="padding-left: 10px;">${x.TenSanPham}</td>
            <td style="text-align: center;">x${x.SoLuong}</td>
            <td style="text-align: right;">${formatMoney(itemTotal)}</td>
        </tr>`;
  }

  document.getElementById("listsp").innerHTML = str;
  $("#spTong").text(formatMoney(total));
  $("#tTong").text(formatMoney(total));
}

// --- XỬ LÝ THANH TOÁN ---
async function Thanhtoan() {
    const token = localStorage.getItem('accessToken');
    
    // 1. Lấy dữ liệu từ giao diện
    const address = $("#diachi").val().trim();
    const paymentMethod = $("input[name='mucgia']:checked").next('label').text().trim();
    const dob = $("#ngaysinh").val();   // Lấy ngày sinh
    const gender = $("#gioitinh").val(); // Lấy giới tính ("" hoặc "Nam", "Nu", "Khac")

    // 2. Validate cơ bản (Chỉ bắt buộc địa chỉ)
    $(".error").text(""); 
    if (address === "") {
        $("#diachiError").text("Vui lòng nhập địa chỉ nhận hàng.");
        return; 
    }

    if (confirm("Xác nhận đặt hàng?")) {
        try {
            // 3. [QUAN TRỌNG] Tạo đối tượng dữ liệu (Payload)
            // Chỉ đưa vào những thông tin CẦN THIẾT
            const payload = {
                DiaChiGiaoHang: address,
                PhuongThucThanhToan: mapPaymentMethod(paymentMethod),
                GhiChu: "Khách đặt hàng qua Web"
            };

            // 4. [FIX LỖI] Chỉ thêm Ngày sinh nếu có nhập
            if (dob && dob !== "") {
                payload.NgaySinh = dob;
            }

            // 5. [FIX LỖI] Chỉ thêm Giới tính nếu có chọn (khác rỗng)
            if (gender && gender !== "") {
                payload.GioiTinh = gender;
            }

            // Gửi dữ liệu đi
            const response = await fetch('/api/HoaDons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload) // Gửi payload đã lọc sạch lỗi
            });

            const data = await response.json();

            if (response.ok) {
                alert("🎉 Đặt hàng thành công! Mã đơn: " + data.MaHD);
                list = []; // Xóa giỏ hàng tạm
                window.location.href = "/trangchu"; 
            } else {
                // Hiển thị lỗi rõ ràng hơn
                const msg = data.message || (data.errors ? JSON.stringify(data.errors) : "Lỗi đặt hàng");
                alert("Lỗi: " + msg);
            }

        } catch (error) {
            console.error("Lỗi hệ thống:", error);
            alert("Không thể kết nối đến máy chủ.");
        }
    }
}

// Hàm phụ trợ: Map tên phương thức thanh toán sang ENUM DB
function mapPaymentMethod(text) {
  if (text.includes("ngân hàng")) return "ChuyenKhoan";
  if (text.includes("Ví")) return "The"; // Hoặc 'Ví' nếu DB có
  return "TienMat"; // Mặc định COD
}

function formatMoney(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}
