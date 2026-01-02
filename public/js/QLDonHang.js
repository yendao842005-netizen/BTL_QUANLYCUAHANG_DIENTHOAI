$(document).ready(function () {
    // 1. CẤU HÌNH
    const API_URL = "/api/HoaDons";
    const PRODUCT_API_URL = "/api/SanPhams";
    let currentPage = 1;
    let searchTimeout = null;
    let currentOrder = null;
    let orderItems = [];

    // Load dữ liệu
    fetchData(1);
    updateStats();

    // 2. TÌM KIẾM & LỌC
    $('#orderSearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            fetchData(1); // Gọi lại API khi gõ phím (sau 0.5s)
        }, 500);
    });

    $('#orderStatusFilter, #paymentFilter').change(function () {
        fetchData(1);
    });

    // 3. LOGIC GỌI API DANH SÁCH (Đã hỗ trợ search)
    function fetchData(page) {
        currentPage = page;
        const keyword = $('#orderSearch').val().trim();
        
        // Gọi API phân trang có kèm tham số search
        let url = `${API_URL}/PhanTrang?page=${page}`;
        if (keyword) url += `&search=${encodeURIComponent(keyword)}`;

        $('#ordersTable tbody').html('<tr><td colspan="8" class="text-center py-4">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>');

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                const orders = response.data || [];
                const pagination = response.pagination || {};

                if (orders.length > 0) {
                    renderTable(orders);
                    renderPagination(pagination);
                } else {
                    $('#ordersTable tbody').html('<tr><td colspan="8" class="text-center py-4">Không tìm thấy đơn hàng nào!</td></tr>');
                    $('#pagination').empty();
                }
            },
            error: function (err) {
                console.error("Lỗi tải đơn hàng:", err);
                $('#ordersTable tbody').html('<tr><td colspan="8" class="text-center text-danger">Lỗi kết nối server!</td></tr>');
            }
        });
    }

    // 4. CẬP NHẬT THỐNG KÊ DASHBOARD (Theo yêu cầu)
    function updateStats() {
        $.ajax({
            url: `${API_URL}/ThongKe/SoLuong`, // Gọi API đếm số lượng mới tạo
            method: 'GET',
            success: function (data) {
                // Data trả về: { TongDon, ChoXuLy, DaHuy, HoanThanh }
                
                // 1. Tổng đơn hàng
                $('#statTotalOrders').text(data.TongDon || 0);
                
                // 2. Đang chờ xử lý
                $('#statPendingOrders').text(data.ChoXuLy || 0);
                
                // 3. Đang giao hàng -> ĐỔI THÀNH -> Đã hủy (Theo yêu cầu)
                // Cập nhật số liệu
                $('#statShippingOrders').text(data.DaHuy || 0);
                // Cập nhật nhãn (Label) trên giao diện bằng JS
                $('#statShippingOrders').parent().find('p').text('Đã hủy');
                // Đổi icon/màu sắc cho phù hợp (tuỳ chọn)
                $('#statShippingOrders').parent().find('.stat-icon').css('background', 'linear-gradient(135deg, #ff5e62, #ff9966)');
                $('#statShippingOrders').parent().find('.stat-icon i').attr('class', 'fas fa-times-circle');

                // 4. Đã hoàn thành
                $('#statCompletedOrders').text(data.HoanThanh || 0);
            },
            error: function(err) {
                console.error("Lỗi tải thống kê:", err);
            }
        });
    }

    // ... (Giữ nguyên các hàm renderTable, renderPagination, createOrder, viewOrderDetail, v.v. từ phiên bản trước)
    // Đảm bảo hàm renderTable dùng đúng các trường dữ liệu (MaHD, TenKhachHang...)
    
   function renderTable(orders) {
        let html = '';
        orders.forEach(order => {
            const orderDataJson = JSON.stringify(order).replace(/"/g, '&quot;');
            
           
            // Map từ dữ liệu DB (TienMat, ChuyenKhoan, The) sang class CSS (cash, banking, card)
            let paymentClass = '';
            switch (order.PhuongThucThanhToan) {
                case 'ChuyenKhoan': paymentClass = 'banking'; break;
                case 'The': paymentClass = 'card'; break;
                default: paymentClass = 'cash'; // Mặc định là TienMat
            }
            
            // Gọi hàm lấy chữ hiển thị
            const paymentText = getPaymentText(order.PhuongThucThanhToan);
            // --------------------

            const statusClass = getStatusClass(order.TrangThai);
            const statusText = getStatusText(order.TrangThai);
            
            const dateObj = new Date(order.NgayLap);
            const dateStr = dateObj.toLocaleDateString('vi-VN');

            html += `
                <tr data-order="${orderDataJson}">
                    <td><strong>${order.MaHD}</strong></td>
                    <td>
                        <div class="customer-name">
                            ${order.TenKhachHang || 'Khách lẻ'}
                        </div>
                    </td>
                    <td>${dateStr}</td>
                    
                    <td><strong>${formatCurrency(order.TongTien)}</strong></td>
                    
                    <td>
                        <span class="payment ${paymentClass}">${paymentText}</span>
                    </td>

                    <td>
                        <span class="status ${statusClass}">${statusText}</span>
                    </td>
                    <td>
                        <span class="text-muted text-truncate" style="max-width: 150px; display: inline-block;">
                            ${order.GhiChu || ''}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" title="Xem chi tiết" onclick="viewOrderDetail('${order.MaHD}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" title="Cập nhật trạng thái" onclick="openUpdateStatusModal('${order.MaHD}')">
                                <i class="fas fa-sync"></i>
                            </button>
                            <button class="action-btn delete-btn" title="Xóa" onclick="deleteOrder('${order.MaHD}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        $('#ordersTable tbody').html(html);
    }
    // Hàm vẽ nút phân trang
    function renderPagination(pagination) {
        let totalPages = pagination.totalPages || 1;
        let curPage = parseInt(pagination.currentPage) || 1;

        // Nếu chỉ có 1 trang thì ẩn phân trang đi cho gọn
        if (totalPages <= 1) {
            $('#pagination').empty();
            return;
        }

        let html = '<div class="d-flex justify-content-center align-items-center gap-2 mt-3">';

        // Nút Previous
        let prevDisabled = curPage <= 1 ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage - 1}" ${prevDisabled}><i class="fas fa-chevron-left"></i></button>`;

        // Hiển thị số trang
        html += `<span class="text-muted mx-2">Trang ${curPage} / ${totalPages}</span>`;

        // Nút Next
        let nextDisabled = curPage >= totalPages ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage + 1}" ${nextDisabled}><i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';

        // --- ĐOẠN QUAN TRỌNG: Tự động thêm div pagination nếu chưa có ---
        // Tìm vị trí bảng (table-responsive) để chèn nút phân trang vào ngay sau đó
        let container = $('.table-container .table-responsive');
        if ($('#pagination').length === 0) {
            container.after('<div id="pagination" class="p-3"></div>');
        }
        // ---------------------------------------------------------------

        $('#pagination').html(html);

        // Gán sự kiện click cho các nút vừa tạo
        $('.page-link').click(function () {
            if (!$(this).attr('disabled')) {
                // Gọi lại hàm fetchData với số trang mới
                fetchData($(this).data('page')); 
            }
        });
    }
    // ... (Giữ nguyên các hàm helper khác)
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
    
    function getStatusText(status) {
        switch(status) {
            case 'ChoXuLy': return 'Chờ xử lý';
            case 'HoanThanh': return 'Hoàn thành';
            case 'DaHuy': return 'Đã hủy';
            default: return status;
        }
    }
    
    function getStatusClass(status) {
        switch(status) {
            case 'ChoXuLy': return 'pending';
            case 'HoanThanh': return 'completed';
            case 'DaHuy': return 'cancelled';
            default: return 'pending';
        }
    }
    
    function getPaymentText(method) {
        // method lúc này nhận giá trị: 'TienMat', 'ChuyenKhoan', hoặc 'The'
        switch(method) {
            case 'TienMat': return 'Tiền mặt';
            case 'ChuyenKhoan': return 'Chuyển khoản';
            case 'The': return 'Thẻ';
            
            // Giữ lại case cũ đề phòng dữ liệu cũ hoặc lúc tạo đơn gửi lên
            case 'cash': return 'Tiền mặt';
            case 'banking': return 'Chuyển khoản';
            case 'card': return 'Thẻ';
            
            default: return 'Tiền mặt'; // Mặc định
        }
    }
});