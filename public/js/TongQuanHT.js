// ==========================================
// 1. CẤU HÌNH & KHỞI TẠO
// ==========================================
const DASHBOARD_API_URL = "/api/Dashboard/TongQuan";
const API_CHART_URL = "/api/Dashboard/Vebieudo";

//Tổng quan hệ thống đầu trang 
// ==========================================
// 2. HÀM GỌI API & XỬ LÝ DỮ LIỆU (Core)
// ==========================================
async function loadDashboardStats() {
    try {
        // Gọi API lấy dữ liệu
        const response = await fetch(DASHBOARD_API_URL);

        if (!response.ok) {
            throw new Error("Lỗi khi gọi API Dashboard");
        }

        const data = await response.json();

        // Sau khi có dữ liệu, gọi hàm render để vẽ lên giao diện
        renderDashboard(data);

    } catch (error) {
        console.error("Lỗi:", error);
        // Có thể hiển thị thông báo lỗi lên giao diện nếu cần
    }
}

// ==========================================
// 3. HÀM RENDER GIAO DIỆN (UI)
// ==========================================
function renderDashboard(data) {
    // Lấy danh sách 4 thẻ card theo thứ tự trong HTML
    // [0]: Doanh thu, [1]: Đơn hàng, [2]: Khách hàng, [3]: Tồn kho
    const cards = document.querySelectorAll('.dashboard-cards .card');

    if (cards.length < 4) return;

    // --- CARD 1: DOANH THU ---
    updateCardUI(cards[0], {
        title: 'Doanh thu tháng này',
        value: formatCurrency(data.DoanhThu.Chinh),
        percent: data.DoanhThu.PhanTram,
        isPositive: data.DoanhThu.TangTruong,
        compareText: 'tháng trước',
        footerText: `Tháng trước: ${formatCurrency(data.DoanhThu.Phu)}`
    });

    // --- CARD 2: ĐƠN HÀNG ---
    updateCardUI(cards[1], {
        title: 'Tổng đơn hàng tháng này',
        value: data.DonHang.Chinh,
        percent: data.DonHang.PhanTram,
        isPositive: data.DonHang.TangTruong,
        compareText: 'tháng trước',
        footerText: `${data.DonHang.Phu} đơn đang chờ xử lý`
    });

    // --- CARD 3: KHÁCH HÀNG ---
    updateCardUI(cards[2], {
        title: 'Khách mua đơn tháng này',
        value: data.KhachHang.Chinh,
        percent: data.KhachHang.PhanTram,
        isPositive: data.KhachHang.TangTruong,
        compareText: 'tháng trước',
        footerText: `Tổng hệ thống: ${data.KhachHang.Tong} khách`
    });

    // --- CARD 4: TỒN KHO ---
    // Card này có cấu trúc hơi khác (không có % ở API hiện tại)
    const stockCard = cards[3];
    stockCard.querySelector('.card-title').textContent = 'Sản phẩm tồn kho';
    stockCard.querySelector('.card-value').textContent = data.TonKho.Chinh;

    // Mặc định luôn hiển thị mũi tên xanh cho tồn kho
    updatePercentUI(stockCard.querySelector('.card-change'), 0, true, 'hôm qua');

    stockCard.querySelector('.card-footer').innerHTML =
        `<i class="fas fa-info-circle"></i> ${data.TonKho.Phu} sản phẩm sắp hết hàng`;
}

// ==========================================
// 4. CÁC HÀM TIỆN ÍCH (HELPER)
// ==========================================

// Hàm cập nhật chung cho từng thẻ Card
function updateCardUI(cardElement, config) {
    // Cập nhật Tiêu đề
    const titleEl = cardElement.querySelector('.card-title');
    if (titleEl) titleEl.textContent = config.title;

    // Cập nhật Giá trị lớn
    const valueEl = cardElement.querySelector('.card-value');
    if (valueEl) valueEl.textContent = config.value;

    // Cập nhật Phần trăm tăng/giảm
    const changeEl = cardElement.querySelector('.card-change');
    if (changeEl) {
        updatePercentUI(changeEl, config.percent, config.isPositive, config.compareText);
    }

    // Cập nhật Footer
    const footerEl = cardElement.querySelector('.card-footer');
    if (footerEl) {
        footerEl.innerHTML = `<i class="fas fa-info-circle"></i> ${config.footerText}`;
    }
}

// Hàm xử lý hiển thị mũi tên xanh/đỏ và phần trăm
function updatePercentUI(element, percent, isPositive, text) {
    // Xóa class cũ để tránh bị trùng
    element.classList.remove('positive', 'negative');

    // Thêm class mới dựa trên tăng (positive) hay giảm (negative)
    element.classList.add(isPositive ? 'positive' : 'negative');

    const iconClass = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const percentValue = Math.abs(percent || 0); // Lấy giá trị tuyệt đối

    element.innerHTML = `<i class="fas ${iconClass}"></i> <span>${percentValue}% so với ${text}</span>`;
}

// Hàm định dạng tiền tệ rút gọn (VD: 1.2 tỷ, 500 triệu)
function formatCurrency(amount) {
    if (!amount) return '0 đ';
    const num = Number(amount);

    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + ' tỷ';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + ' triệu';
    }

    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}


//Vẽ biểu đồ doanh thu, sản phẩm bán chạy, cơ cấu danh mục

// ==========================================
// 3. LOGIC TẢI & VẼ BIỂU ĐỒ (CHARTS)
// ==========================================
async function loadCharts() {
    try {
        const response = await fetch(API_CHART_URL);
        const data = await response.json();

        // Kiểm tra dữ liệu trả về (theo cấu trúc tiếng Việt mới)
        if (data.DuLieuBieuDo) {
            const bieuDo = data.DuLieuBieuDo;

            // 1. Vẽ biểu đồ Doanh thu
            if (bieuDo.DoanhThu && bieuDo.DoanhThu.MangDuLieu) {
                drawRevenueChart(bieuDo.DoanhThu.MangDuLieu);
            }

            // 2. Vẽ biểu đồ Top SP
            if (bieuDo.SanPhamBanChay) {
                drawTopProductsChart({
                    labels: bieuDo.SanPhamBanChay.DanhSachTen,
                    data: bieuDo.SanPhamBanChay.MangSoLuong
                });
            }

            // 3. Vẽ biểu đồ Danh mục
            if (bieuDo.CoCauDanhMuc) {
                drawCategoryChart({
                    labels: bieuDo.CoCauDanhMuc.DanhSachTen,
                    data: bieuDo.CoCauDanhMuc.MangSoLuong
                });
            }
            // 4. Vẽ bảng Đơn hàng gần đây (Mới)
            if (data.DonHangGanDay) {
                renderRecentOrders(data.DonHangGanDay);
            }

        }
    } catch (error) {
        console.error("Lỗi tải biểu đồ:", error);
    }
}

// --- HÀM VẼ BIỂU ĐỒ 1: DOANH THU (Line) ---
function drawRevenueChart(revenueData) {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return; // Kiểm tra nếu không có thẻ canvas thì bỏ qua
    const ctx = canvas.getContext('2d');

    // Tạo gradient
    let gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(67, 97, 238, 0.2)');
    gradient.addColorStop(1, 'rgba(67, 97, 238, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: revenueData,
                borderColor: '#4361ee',
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#4361ee',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { borderDash: [5, 5] },
                    ticks: {
                        callback: function (value) {
                            if (value >= 1000000) return (value / 1000000) + ' tr';
                            return value;
                        }
                    }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

// --- HÀM VẼ BIỂU ĐỒ 2: TOP SẢN PHẨM (Bar) ---

// --- BIỂU ĐỒ 2: TOP SẢN PHẨM (Bar Chart) - Giao diện gốc + Dữ liệu API ---
// --- BIỂU ĐỒ 2: TOP SẢN PHẨM (Nâng cấp giao diện đẹp hơn) ---
function drawTopProductsChart(chartData) {
    const canvas = document.getElementById('topProductsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Tạo Gradient màu cho từng cột (Hiệu ứng chuyển màu từ đậm sang nhạt)
    // Blue
    let gradBlue = ctx.createLinearGradient(0, 0, 0, 400);
    gradBlue.addColorStop(0, 'rgba(67, 97, 238, 1)');
    gradBlue.addColorStop(1, 'rgba(67, 97, 238, 0.2)');

    // Purple
    let gradPurple = ctx.createLinearGradient(0, 0, 0, 400);
    gradPurple.addColorStop(0, 'rgba(114, 9, 183, 1)');
    gradPurple.addColorStop(1, 'rgba(114, 9, 183, 0.2)');

    // Pink
    let gradPink = ctx.createLinearGradient(0, 0, 0, 400);
    gradPink.addColorStop(0, 'rgba(247, 37, 133, 1)');
    gradPink.addColorStop(1, 'rgba(247, 37, 133, 0.2)');

    // Orange
    let gradOrange = ctx.createLinearGradient(0, 0, 0, 400);
    gradOrange.addColorStop(0, 'rgba(255, 158, 0, 1)');
    gradOrange.addColorStop(1, 'rgba(255, 158, 0, 0.2)');

    // Teal (Green)
    let gradTeal = ctx.createLinearGradient(0, 0, 0, 400);
    gradTeal.addColorStop(0, 'rgba(6, 214, 160, 1)');
    gradTeal.addColorStop(1, 'rgba(6, 214, 160, 0.2)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Số lượng bán',
                data: chartData.data,
                backgroundColor: [gradBlue, gradPurple, gradPink, gradOrange, gradTeal],
                borderColor: ['#4361ee', '#7209b7', '#f72585', '#ff9e00', '#06d6a0'],
                borderWidth: 0, // Bỏ viền để gradient trông mượt hơn
                borderRadius: 8, // Bo tròn góc cột (Modern UI)
                barThickness: 35, // Độ rộng cột vừa phải
                hoverBackgroundColor: ['#3b52d4', '#61089e', '#d41c6f', '#e08b00', '#05b589'] // Màu khi di chuột vào
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Tooltip nền trắng
                    titleColor: '#333',
                    bodyColor: '#333',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function (context) {
                            return ' Đã bán: ' + context.raw + ' sản phẩm';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0', // Màu lưới nhạt
                        borderDash: [5, 5] // Lưới nét đứt (thẩm mỹ hơn)
                    },
                    ticks: {
                        font: { size: 12 },
                        color: '#888'
                    }
                },
                x: {
                    grid: { display: false }, // Ẩn lưới trục X cho thoáng
                    ticks: {
                        font: { size: 12, weight: '500' },
                        color: '#555'
                    }
                }
            },
            animation: {
                duration: 1500, // Hiệu ứng nảy lên khi load trang
                easing: 'easeOutQuart'
            }
        }
    });
}

// --- HÀM VẼ BIỂU ĐỒ 3: DANH MỤC (Doughnut) ---
function drawCategoryChart(chartData) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: ['#4361ee', '#7209b7', '#f72585', '#ff9e00', '#06d6a0'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });
}
// --- HÀM VẼ BẢNG ĐƠN HÀNG GẦN ĐÂY ---
function renderRecentOrders(orders) {
    const tableBody = document.querySelector('.widget-content tbody');
    if (!tableBody) return;

    // Xóa dữ liệu mẫu cũ trong HTML
    tableBody.innerHTML = '';

    orders.forEach(order => {
        // Xử lý trạng thái để hiện màu sắc (class CSS)
        let statusClass = '';
        let statusText = '';
        
        switch (order.TrangThai) {
            case 'HoanThanh':
                statusClass = 'completed';
                statusText = 'Hoàn thành';
                break;
            case 'ChoXuLy':
                statusClass = 'pending';
                statusText = 'Chờ xử lý';
                break;
            case 'DaHuy':
                statusClass = 'cancelled';
                statusText = 'Đã hủy';
                break;
            default:
                statusClass = 'pending';
                statusText = order.TrangThai;
        }

        // Format tiền tệ
        const tongTien = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.TongTien);
        
        // Format ngày (dd/mm/yyyy)
        const ngayLap = new Date(order.NgayLap).toLocaleDateString('vi-VN');

        // Tạo dòng HTML
        const row = `
            <tr>
                <td>${order.MaHD}</td>
                <td>${order.TenKhachHang || 'Khách vãng lai'}</td>
                <td>${ngayLap}</td>
                <td>${tongTien}</td>
                <td><span class="status ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" title="Xem chi tiết" onclick="alert('Xem chi tiết ${order.MaHD}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${order.TrangThai === 'ChoXuLy' ? `
                        <button class="action-btn edit-btn" title="Xử lý" onclick="alert('Xử lý ${order.MaHD}')">
                            <i class="fas fa-check"></i>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
        
        // Thêm vào bảng
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}
// --- HÀM XỬ LÝ TẢI FILE ---
function exportReport() {
    if (confirm("Bạn có muốn tải xuống báo cáo tổng quan hệ thống không?")) {
        // Gọi API để trình duyệt tự tải file về
        window.location.href = "/api/Dashboard/Export";
    }
}
// ==========================================
//  KHỞI TẠO KHI LOAD TRANG
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Chạy hàm load dữ liệu ngay khi web tải xong
    loadDashboardStats();
    loadCharts();
    // --- THÊM MỚI: BẮT SỰ KIỆN NÚT XUẤT BÁO CÁO ---
    const btnExport = document.querySelector('.page-actions .btn-outline');
    
    if (btnExport) {
        btnExport.addEventListener('click', function(e) {
            e.preventDefault(); // Ngặn chặn hành vi mặc định nếu có
            exportReport();
        });
    }
});