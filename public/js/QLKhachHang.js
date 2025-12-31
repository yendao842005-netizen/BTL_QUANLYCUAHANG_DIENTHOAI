$(document).ready(function () {
    // ==========================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ==========================================
    const API_URL = "/api/KhachHangs";
    const PAGE_SIZE = 10;
    let currentPage = 1;
    let searchTimeout = null;

    // Load dữ liệu lần đầu
    fetchData(1);
    loadVipStats(); // Load thống kê VIP nếu có

    // ==========================================
    // 2. XỬ LÝ SỰ KIỆN TÌM KIẾM & LỌC
    // ==========================================

    // Tìm kiếm (Debounce 0.5s)
    $('#customerSearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            fetchData(1);
        }, 500);
    });

    // Khi chọn bộ lọc -> Gọi lại dữ liệu
    $('#customerTypeFilter, #customerStatusFilter').change(function () {
        fetchData(1);
    });

    // ==========================================
    // 3. LOGIC GỌI API & LỌC DỮ LIỆU
    // ==========================================
    function fetchData(page) {
        currentPage = page;
        let keyword = $('#customerSearch').val().trim();
        
        // Logic xác định URL dựa trên hành động
        let url = '';
        
        // A. Nếu có từ khóa tìm kiếm -> Gọi API Search
        if (keyword) {
            // Tự động nhận diện loại tìm kiếm
            if (keyword.includes('@')) {
                url = `${API_URL}/Search?email=${encodeURIComponent(keyword)}`;
            } else if (/^\d+$/.test(keyword)) {
                // Nếu toàn số -> Tìm theo SĐT
                url = `${API_URL}/Search?soDienThoai=${encodeURIComponent(keyword)}`;
            } else {
                // Mặc định tìm theo tên
                url = `${API_URL}/Search?hoTen=${encodeURIComponent(keyword)}`;
            }
        } else {
            // B. Nếu không tìm kiếm -> Gọi API Phân trang
            url = `${API_URL}/PhanTrang?page=${page}`;
        }

        // Hiển thị loading
        $('#customersTable tbody').html('<tr><td colspan="8" class="text-center py-4">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>');

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                // Xử lý dữ liệu trả về (cấu trúc có thể khác nhau giữa Search và Phân trang)
                let customers = [];
                let pagination = {};

                if (response.data && response.pagination) {
                    // Cấu trúc trả về từ /PhanTrang
                    customers = response.data;
                    pagination = response.pagination;
                } else if (Array.isArray(response)) {
                    // Cấu trúc trả về từ /Search (thường trả về mảng trực tiếp)
                    customers = response;
                    // Mock pagination cho search nếu API không trả về
                    pagination = { totalPages: 1, currentPage: 1 };
                }

                // C. Lọc Client-side (Loại KH, Trạng thái)
                let typeFilter = $('#customerTypeFilter').val();
                let statusFilter = $('#customerStatusFilter').val();

                if (typeFilter) {
                    customers = customers.filter(kh => kh.LoaiKH === typeFilter);
                }
                if (statusFilter) {
                    // Giả sử API trả về trường TrangThai, nếu không có thì bỏ qua
                    customers = customers.filter(kh => kh.TrangThai === statusFilter);
                }

                // D. Render
                if (customers.length > 0) {
                    renderTable(customers);
                    renderPagination(pagination);
                    // Cập nhật thống kê sơ bộ từ dữ liệu tải về
                    updateQuickStats(customers.length, pagination.totalItems); 
                } else {
                    showNoResult();
                }
            },
            error: function (err) {
                console.error("Lỗi tải dữ liệu:", err);
                $('#customersTable tbody').html('<tr><td colspan="8" class="text-center text-danger">Lỗi kết nối server!</td></tr>');
            }
        });
    }

    // ==========================================
    // 4. HÀM RENDER GIAO DIỆN
    // ==========================================
    function showNoResult() {
        $('#customersTable tbody').html('<tr><td colspan="8" class="text-center py-4">Không tìm thấy khách hàng nào!</td></tr>');
        $('#pagination').empty();
    }

    function renderTable(customers) {
        let htmlContent = '';
        customers.forEach(kh => {
            // Format Tiền & Ngày
            let tongChiTieu = kh.TongChiTieu ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kh.TongChiTieu) : '0 ₫';
            let tongDon = kh.TongDon || 0;
            
            // Xử lý badge Loại KH
            let loaiKHClass = 'regular';
            let loaiKHText = 'Thường';
            let crownIcon = '';
            
            if (kh.LoaiKH === 'vip' || (kh.TongChiTieu > 50000000)) { // Logic giả định hoặc lấy từ DB
                loaiKHClass = 'vip';
                loaiKHText = 'VIP';
                crownIcon = '<i class="fas fa-crown text-warning ms-1" title="VIP"></i>';
            } else if (kh.LoaiKH === 'new') {
                loaiKHClass = 'new';
                loaiKHText = 'Mới';
            }

            // Prepare JSON data for Edit/View actions
            let khJson = JSON.stringify(kh).replace(/"/g, '&quot;');

            htmlContent += `
                <tr data-customer="${khJson}">
                    <td><strong>${kh.MaKH}</strong></td>
                    <td>
                        <div class="customer-name">
                            ${kh.HoTen}
                            ${crownIcon}
                        </div>
                    </td>
                    <td>${kh.SoDienThoai}</td>
                    <td>${kh.Email || '-'}</td>
                    <td><span class="customer-type ${loaiKHClass}">${loaiKHText}</span></td>
                    <td class="text-center">${tongDon}</td>
                    <td><strong>${tongChiTieu}</strong></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewCustomerDetail('${kh.MaKH}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="editCustomer('${kh.MaKH}')" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteCustomer('${kh.MaKH}')" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        $('#customersTable tbody').html(htmlContent);
    }

    function renderPagination(pagination) {
        let totalPages = pagination.totalPages || 1;
        let curPage = parseInt(pagination.currentPage) || 1;

        let html = '<div class="d-flex justify-content-center align-items-center gap-2 mt-3">';

        // Nut Previous
        let prevDisabled = curPage <= 1 ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage - 1}" ${prevDisabled}><i class="fas fa-chevron-left"></i></button>`;

        html += `<span class="text-muted mx-2">Trang ${curPage} / ${totalPages}</span>`;

        // Nut Next
        let nextDisabled = curPage >= totalPages ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage + 1}" ${nextDisabled}><i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';

        $('#pagination').html(html);

        $('.page-link').click(function () {
            if (!$(this).attr('disabled')) fetchData($(this).data('page'));
        });
    }
    
    function updateQuickStats(currentCount, totalCount) {
        // Cập nhật thẻ thống kê "Tổng khách hàng" nếu API có trả về tổng
        if(totalCount) {
             $('#statTotalCustomers').text(totalCount);
        }
    }

    // ==========================================
    // 5. CÁC HÀM XỬ LÝ MODAL & HÀNH ĐỘNG (GLOBAL)
    // ==========================================

    // --- Helpers ---
    window.openModal = function (id) { $('#' + id).css('display', 'flex'); }
    window.closeModal = function (id) {
        $('#' + id).css('display', 'none');
        if (id === 'addCustomerModal') $('#addCustomerForm')[0].reset();
    }
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }
    function formatDate(dateString) {
        if(!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    // --- CHỨC NĂNG THÊM MỚI ---
    window.saveCustomer = function () {
        let formData = new FormData(document.getElementById('addCustomerForm'));
        let data = Object.fromEntries(formData.entries());

        // Validate cơ bản
        if (!data.MaKH || !data.HoTen || !data.SoDienThoai) {
            alert('Vui lòng nhập Mã KH, Họ tên và SĐT!');
            return;
        }

        $.ajax({
            url: API_URL, // POST /api/KhachHangs
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Thêm khách hàng thành công!');
                window.closeModal('addCustomerModal');
                fetchData(1); // Reload
            },
            error: function (err) {
                let msg = err.responseJSON?.message || 'Lỗi hệ thống';
                alert('Thêm thất bại: ' + msg);
            }
        });
    }

    // --- CHỨC NĂNG SỬA ---
    window.editCustomer = function (maKH) {
        // Gọi API lấy chi tiết để đảm bảo dữ liệu mới nhất
        $.ajax({
            url: `${API_URL}/${maKH}`,
            method: 'GET',
            success: function (customer) {
                $('#editMaKH').val(customer.MaKH);
                $('#displayMaKH').val(customer.MaKH);

                let form = $('#editCustomerForm');
                form.find('input[name="HoTen"]').val(customer.HoTen);
                form.find('input[name="SoDienThoai"]').val(customer.SoDienThoai);
                form.find('input[name="Email"]').val(customer.Email);
                form.find('textarea[name="DiaChi"]').val(customer.DiaChi);
                form.find('select[name="LoaiKH"]').val(customer.LoaiKH);
                form.find('select[name="NguonKH"]').val(customer.NguonKH);
                form.find('select[name="GioiTinh"]').val(customer.GioiTinh);
                form.find('textarea[name="GhiChu"]').val(customer.GhiChu);

                // Xử lý ngày sinh (input type date yêu cầu yyyy-MM-dd)
                if (customer.NgaySinh) {
                    try {
                        let dateVal = new Date(customer.NgaySinh).toISOString().split('T')[0];
                        form.find('input[name="NgaySinh"]').val(dateVal);
                    } catch (e) {
                        form.find('input[name="NgaySinh"]').val('');
                    }
                }

                window.openModal('editCustomerModal');
            },
            error: function () {
                alert('Không thể tải thông tin khách hàng!');
            }
        });
    };

    window.updateCustomer = function () {
        let maKH = $('#editMaKH').val();
        let formData = new FormData(document.getElementById('editCustomerForm'));
        let data = Object.fromEntries(formData.entries());

        $.ajax({
            url: `${API_URL}/${maKH}`, // PUT /api/KhachHangs/:MaKH
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Cập nhật thành công!');
                window.closeModal('editCustomerModal');
                fetchData(currentPage);
            },
            error: function (err) {
                let msg = err.responseJSON?.message || 'Lỗi cập nhật';
                alert('Cập nhật thất bại: ' + msg);
            }
        });
    }

    // --- CHỨC NĂNG XÓA ---
    window.deleteCustomer = function (maKH) {
        if (confirm(`Bạn có chắc muốn xóa khách hàng ${maKH}?`)) {
            $.ajax({
                url: `${API_URL}/${maKH}`,
                method: 'DELETE',
                success: function () {
                    alert('Đã xóa thành công!');
                    fetchData(currentPage);
                },
                error: function (err) {
                    alert('Lỗi khi xóa: ' + (err.responseJSON?.message || 'Không xác định'));
                }
            });
        }
    };

    // --- CHỨC NĂNG XEM CHI TIẾT & LỊCH SỬ MUA HÀNG ---
    window.viewCustomerDetail = function (maKH) {
        // 1. Gọi API lấy thông tin chi tiết và lịch sử đơn hàng
        // API này được định nghĩa trong controller: getOrders -> /KhachHangs/:MaKH/DonHang
        $.ajax({
            url: `${API_URL}/${maKH}/DonHang`,
            method: 'GET',
            success: function (response) {
                // Response: { KhachHang: {...}, LichSuMuaHang: [...] }
                const kh = response.KhachHang;
                const orders = response.LichSuMuaHang || [];
                
                window.currentViewingCustomer = kh; // Lưu lại để dùng cho nút Sửa

                // Render Thông tin chung
                let infoHtml = `
                    <div class="customer-detail">
                        <div class="customer-header mb-4">
                            <h3>${kh.HoTen}</h3>
                            <div class="text-muted">Mã: ${kh.MaKH}</div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="detail-section">
                                    <h5><i class="fas fa-id-card"></i> Thông tin cá nhân</h5>
                                    <table class="detail-table">
                                        <tr><td><strong>SĐT:</strong></td><td>${kh.SoDienThoai}</td></tr>
                                        <tr><td><strong>Email:</strong></td><td>${kh.Email || '-'}</td></tr>
                                        <tr><td><strong>Địa chỉ:</strong></td><td>${kh.DiaChi || '-'}</td></tr>
                                        <tr><td><strong>Ngày sinh:</strong></td><td>${formatDate(kh.NgaySinh)}</td></tr>
                                        <tr><td><strong>Giới tính:</strong></td><td>${kh.GioiTinh || '-'}</td></tr>
                                    </table>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="detail-section">
                                    <h5><i class="fas fa-chart-line"></i> Tổng quan</h5>
                                    <div class="alert alert-info">
                                        <strong>Tổng số đơn:</strong> ${orders.length} <br>
                                        <strong>Tổng chi tiêu:</strong> ${formatCurrency(orders.reduce((sum, ord) => sum + (Number(ord.TongTien)||0), 0))}
                                    </div>
                                    <div class="mt-2">
                                        <button class="btn btn-sm btn-outline-success" onclick="exportCustomerExcel('${kh.MaKH}')">
                                            <i class="fas fa-file-excel"></i> Xuất lịch sử mua hàng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section mt-3">
                            <h5><i class="fas fa-history"></i> Lịch sử mua hàng</h5>
                            <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                                <table class="table table-bordered table-sm">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Mã HĐ</th>
                                            <th>Ngày lập</th>
                                            <th>Sản phẩm</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orders.length === 0 ? '<tr><td colspan="5" class="text-center">Chưa có đơn hàng nào</td></tr>' : 
                                          orders.map(order => {
                                            // Lấy danh sách tên sản phẩm trong đơn (giới hạn hiển thị)
                                            let productNames = order.ChiTietSanPham 
                                                ? order.ChiTietSanPham.map(sp => `${sp.TenSanPham} (x${sp.SoLuong})`).join(', ') 
                                                : 'Chi tiết...';
                                            
                                            return `
                                            <tr>
                                                <td><a href="#" class="text-primary">${order.MaHD}</a></td>
                                                <td>${formatDate(order.NgayLap)}</td>
                                                <td><small>${productNames}</small></td>
                                                <td>${formatCurrency(order.TongTien)}</td>
                                                <td><span class="badge bg-${order.TrangThai === 'HoanThanh' ? 'success' : 'warning'}">${order.TrangThai}</span></td>
                                            </tr>
                                            `;
                                          }).join('')
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
                
                $('#customerDetailContent').html(infoHtml);
                window.openModal('viewCustomerModal');
            },
            error: function () {
                alert('Không thể tải chi tiết khách hàng!');
            }
        });
    }
    
    // Nút Sửa trong modal xem chi tiết
    window.editCurrentCustomer = function() {
        if(window.currentViewingCustomer) {
            window.closeModal('viewCustomerModal');
            window.editCustomer(window.currentViewingCustomer.MaKH);
        }
    }

    // --- CHỨC NĂNG XUẤT EXCEL ---
    // 1. Xuất toàn bộ danh sách
    window.exportToExcel = function() {
        if(confirm("Xuất danh sách tất cả khách hàng ra Excel?")) {
            window.location.href = `${API_URL}/Export/Excel`;
        }
    }

    // 2. Xuất chi tiết 1 khách hàng
    window.exportCustomerExcel = function(maKH) {
        window.location.href = `${API_URL}/${maKH}/Export/Excel`;
    }

    // ==========================================
    // 6. LOAD THỐNG KÊ (Stats Cards)
    // ==========================================
    function loadVipStats() {
        // API: /KhachHangs/VipStats -> Trả về danh sách top chi tiêu
        $.ajax({
            url: `${API_URL}/VipStats`,
            method: 'GET',
            success: function(data) {
                // data là mảng các khách hàng VIP
                if(data && Array.isArray(data)) {
                    // Cập nhật thẻ VIP Customers
                    let vipCount = data.filter(c => c.HangThanhVien !== 'Thành Viên').length;
                    $('#statVIPCustomers').text(vipCount);

                    // Cập nhật tổng doanh thu từ top khách hàng (hoặc cần API khác chính xác hơn)
                    let totalRevenue = data.reduce((sum, item) => sum + Number(item.TongChiTieu), 0);
                    // Format rút gọn (785 triệu)
                    let formattedRev = new Intl.NumberFormat('vi-VN', { maximumSignificantDigits: 3 }).format(totalRevenue / 1000000) + ' triệu';
                    $('#statTotalRevenue').text(formattedRev);
                }
            },
            error: function(err) { console.error("Lỗi load stats:", err); }
        });
    }

    // ==========================================
    // 7. CÁC HÀM TIỆN ÍCH KHÁC (Phân khúc, Chăm sóc)
    // ==========================================
    
    // Giả lập logic Client-side cho các nút chưa có API
    window.sendCustomerMessage = function(maKH) {
        alert(`Đang gửi tin nhắn đến khách hàng ${maKH}...`);
    }
    window.callCustomer = function(sdt) {
        alert(`Đang quay số: ${sdt}`);
    }
    window.sendCustomerCare = function() {
        alert('Đã gửi tin nhắn chăm sóc tự động!');
    }
    
    // Logic thêm tiêu chí phân khúc (Client UI only)
    window.addCriterion = function() {
        let html = `
            <div class="criterion mt-2 d-flex gap-2">
                 <select class="form-control" name="criteriaField">
                    <option value="totalSpent">Tổng chi tiêu</option>
                    <option value="orderCount">Số đơn hàng</option>
                </select>
                <select class="form-control" name="criteriaOperator">
                    <option value=">">Lớn hơn</option>
                    <option value="<">Nhỏ hơn</option>
                </select>
                <input type="text" class="form-control" placeholder="Giá trị">
                <button type="button" class="btn btn-sm btn-danger" onclick="$(this).parent().remove()"><i class="fas fa-times"></i></button>
            </div>
        `;
        $('.segment-criteria').append(html);
    }
    
    window.createSegment = function() {
        // Đây chỉ là UI, cần API POST /PhanKhuc nếu muốn lưu thật
        alert('Tạo phân khúc thành công (Demo)!');
        window.closeModal('segmentCustomersModal');
    }
    
    window.previewSegment = function() {
        $('#previewCount').text(Math.floor(Math.random() * 10)); // Random số liệu demo
    }
});