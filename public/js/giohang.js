// js/giohang.js

// Biến lưu trữ danh sách giỏ hàng tạm thời
var list = []; 

$(document).ready(function () {
    // 1. Kiểm tra trạng thái đăng nhập để update Header
    if (typeof checkLoginStatus === "function") {
        checkLoginStatus();
    }
    
    // 2. Load dữ liệu giỏ hàng từ Server
    LoadData();
});

// --- 1. HÀM THÊM VÀO GIỎ HÀNG ---
async function addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        if(confirm("Bạn cần đăng nhập để mua hàng. Đến trang đăng nhập ngay?")) {
            window.location.href = "/dangnhap";
        }
        return;
    }

    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Đã thêm sản phẩm vào giỏ hàng!");
            LoadData(); 
        } else {
            alert(data.message || "Lỗi khi thêm vào giỏ hàng!");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể kết nối đến máy chủ.");
    }
}

// --- 2. LOAD DATA (Lấy từ DB) ---
async function LoadData() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        list = [];
        renderTable();
        updateCartIcon(0);
        return;
    }

    try {
        const response = await fetch('/api/cart', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const result = await response.json();
            // Lưu dữ liệu vào biến list toàn cục
            list = result.data || []; 
            
            // Vẽ bảng và update icon
            renderTable();
            updateCartIcon();
        }
    } catch (error) {
        console.error("Lỗi load giỏ hàng:", error);
    }
}

// --- 3. VẼ BẢNG GIỎ HÀNG (SỬA LẠI TÊN BIẾN CHO KHỚP API) ---
function renderTable() {
    var tableBody = document.getElementById("listCart");
    if (!tableBody) return; 

    var str = "";
    var totalMoney = 0;

    if (list.length > 0) {
        for (let x of list) {
            // [QUAN TRỌNG] Sửa tên biến khớp với DTO trả về từ API
            // x.DonGia, x.SoLuong, x.HinhAnh, x.TenSanPham, x.MaSP
            let itemTotal = x.DonGia * x.SoLuong;
            totalMoney += itemTotal;

            // Xử lý ảnh
            let imgUrl = x.HinhAnh && !x.HinhAnh.startsWith('http') ? `img/img trang sp/${x.HinhAnh}` : (x.HinhAnh || 'img/no-image.png');

            str += `
            <tr>
                <td style="display: flex;align-items: center;">
                    <img src="${imgUrl}" alt="${x.TenSanPham}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;"> 
                    <a href="/chitietsp?id=${x.MaSP}" style="color: black; text-decoration: none; font-weight: 500;">${x.TenSanPham}</a>
                </td>
                <td></td>
                <td>${formatMoney(x.DonGia)}</td>
                <td>
                    <button onclick="changeQuantity('${x.MaSP}', -1)" style="border: none; background-color: #F3F4F6;cursor: pointer; width: 25px;">-</button>
                    <input readonly style="border: none; background-color: #F3F4F6; width: 30px; text-align: center;" type="text" value="${x.SoLuong}">
                    <button onclick="changeQuantity('${x.MaSP}', 1)" style="border: none; background-color: #F3F4F6;cursor: pointer; width: 25px;">+</button>
                </td>
                <td style="color: #d70018; font-weight: bold;">${formatMoney(itemTotal)}</td>
                <td>
                    <button onclick="XoaItem('${x.MaSP}')" style="border: none;cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        }
    } else {
        str = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Giỏ hàng của bạn đang trống!</td></tr>';
    }

    tableBody.innerHTML = str;
    $("#spTong").text(formatMoney(totalMoney));
    $("#tTong").text(formatMoney(totalMoney));
}

// --- 4. CÁC HÀM TƯƠNG TÁC ---

async function changeQuantity(productId, change) {
    const token = localStorage.getItem('accessToken');
    
    // Tìm item trong list (Sửa x.product_id thành x.MaSP)
    const item = list.find(x => x.MaSP == productId);
    if (!item) return;
    
    let newQty = item.SoLuong + change;
    if (newQty < 1) return; 

    try {
        await fetch('/api/cart/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: productId, quantity: newQty })
        });
        LoadData(); 
    } catch (error) {
        console.error("Lỗi update:", error);
    }
}

async function XoaItem(productId) {
    if (!confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
    
    const token = localStorage.getItem('accessToken');
    try {
        await fetch(`/api/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        LoadData();
    } catch (error) {
        console.error("Lỗi xóa:", error);
    }
}

async function XoaCart() {
    if (!confirm("Bạn muốn xóa tất cả sản phẩm?")) return;

    const token = localStorage.getItem('accessToken');
    try {
        await fetch(`/api/cart/clear`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        LoadData();
    } catch (error) {
        console.error("Lỗi xóa hết:", error);
    }
}

function updateCartIcon(forcedQty) {
    let totalQty = 0;
    
    if (typeof forcedQty !== 'undefined') {
        totalQty = forcedQty;
    } else if (list && list.length > 0) {
        totalQty = list.length; // Đếm số loại sản phẩm
    }

    const notice = document.querySelector(".notice");
    if (notice) {
        notice.innerText = totalQty;
        if (totalQty > 0) {
            notice.style.display = 'block'; 
        } else {
            notice.style.display = 'none';
        }
    }
}

function ThanhToan() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("Vui lòng đăng nhập để thanh toán!");
        window.location.href = "/dangnhap";
        return;
    }
    
    if (list.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    window.location.href = "/thanhtoan";
}

function Sanpham() {
    window.location.href = "/sanpham";
}

function updateCart() {
    LoadData();
    alert("Dữ liệu đã được đồng bộ!");
}

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}