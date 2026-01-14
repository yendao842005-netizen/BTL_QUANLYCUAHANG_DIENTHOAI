$(document).ready(function () {
    // ==========================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ==========================================
    const API_URL = "/api/KhachHangs";

    const token = localStorage.getItem('accessToken');
    if (!token) {
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/login";
        return;
    }

    $.ajaxSetup({
        headers: { 'Authorization': 'Bearer ' + token },
        error: function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 401 || jqXHR.status === 403) {
                alert("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
                window.location.href = "/login";
            }
        }
    });
    
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

                customers = customers.map(kh => {
                    // Logic phân loại (phải khớp với logic hiển thị ở renderTable)
                    let rank = 'regular'; // Mặc định là Thường
                    let chiTieu = Number(kh.TongChiTieu || 0);
                    let soDon = Number(kh.TongDon || 0);

                    if (chiTieu > 50000000) {
                        rank = 'vip';
                    } else if (soDon === 0) {
                        rank = 'new';
                    }

                    // Trả về object khách hàng đã có thêm thuộc tính LoaiKH
                    return {
                        ...kh,
                        LoaiKH: rank
                    };
                });
                // 3. Lọc Client-side (Code cũ của bạn giữ nguyên)
                let typeFilter = $('#customerTypeFilter').val();   // giá trị: 'vip', 'regular', 'new'
               // let statusFilter = $('#customerStatusFilter').val();

                if (typeFilter) {
                    // Bây giờ kh.LoaiKH đã có dữ liệu để so sánh
                    customers = customers.filter(kh => kh.LoaiKH === typeFilter);
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

            if ((kh.TongChiTieu > 50000000)) { // Logic giả định hoặc lấy từ DB
                loaiKHClass = 'vip';
                loaiKHText = 'VIP';
                crownIcon = '<i class="fas fa-crown text-warning ms-1" title="VIP"></i>';
            } else if (kh.TongDon === 0) {
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
                            <button class="action-btn view-btn" data-id="${kh.MaKH}" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" data-id="${kh.MaKH}" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" data-id="${kh.MaKH}" title="Xóa">
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
        if (totalCount) {
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
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    // --- CHỨC NĂNG THÊM MỚI ---
    window.saveCustomer = function () {
        let formData = new FormData(document.getElementById('addCustomerForm'));
        let data = Object.fromEntries(formData.entries());

        // Validate cơ bản (Chỉ bắt buộc Họ tên và SĐT)
        if (!data.HoTen || !data.SoDienThoai) {
            alert('Vui lòng nhập Họ tên và Số điện thoại!');
            return;
        }

        // --- SỬA LỖI 1: Xử lý Mã Khách Hàng ---
        // Nếu người dùng không nhập mã (để trống), ta xóa trường MaKH đi 
        // để Backend tự động sinh mã (tránh gửi chuỗi rỗng "" gây lỗi logic)
        if (!data.MaKH || data.MaKH.trim() === "") {
            delete data.MaKH;
        } else {
            // Nếu có nhập, trim bỏ khoảng trắng thừa
            data.MaKH = data.MaKH.trim().toUpperCase();
        }

        $.ajax({
            url: API_URL, // POST /api/KhachHangs
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            // --- SỬA LỖI 2: Thêm tham số 'response' vào hàm success ---
            success: function (response) {
                // Kiểm tra xem response có trả về MaKH không, nếu không thì hiện "mới"
                let newId = (response && response.MaKH) ? response.MaKH : "mới";
                
                alert(`Thêm khách hàng ${newId} thành công!`);
                
                // Đóng modal và reset form
                window.closeModal('addCustomerModal');
                
                // Load lại dữ liệu trang 1 ngay lập tức
                fetchData(1); 
            },
            error: function (err) {
                console.error(err);
                // Lấy thông báo lỗi từ backend trả về (ví dụ: Trùng mã KH)
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
        $.ajax({
            url: `${API_URL}/${maKH}/DonHang`,
            method: 'GET',
            success: function (response) {
                const kh = response.KhachHang;
                const orders = response.LichSuMuaHang || [];

                window.currentViewingCustomer = kh;

                // Render HTML
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
                                        <strong>Tổng chi tiêu:</strong> ${formatCurrency(orders.reduce((sum, ord) => sum + (Number(ord.TongTien) || 0), 0))}
                                    </div>
                                    <div class="mt-2">
                                        <button class="btn btn-sm btn-outline-success btn-export-history" data-id="${kh.MaKH}">
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
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orders.length === 0 ? '<tr><td colspan="5" class="text-center">Chưa có đơn hàng nào</td></tr>' :
                        orders.map(order => {
                            return `
                                <tr>
                                    <td><a href="#" class="text-primary">${order.MaHD}</a></td>
                                    <td>${formatDate(order.NgayLap)}</td>
                                    <td>${formatCurrency(order.TongTien)}</td>
                                    <td><span class="badge bg-${order.TrangThai === 'HoanThanh' ? 'success' : 'warning'}">${order.TrangThai}</span></td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="action-btn view-btn btn-view-order" data-id="${order.MaHD}" title="Xem chi tiết">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
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
            error: function (xhr) {
                // Nếu lỗi 403 nghĩa là chưa sửa file routes/api.js
                if(xhr.status === 403) alert('Bạn không có quyền xem lịch sử đơn hàng của khách này!');
                else alert('Không thể tải chi tiết khách hàng!');
            }
        });
    }

    // Nút Sửa trong modal xem chi tiết
    window.editCurrentCustomer = function () {
        if (window.currentViewingCustomer) {
            window.closeModal('viewCustomerModal');
            window.editCustomer(window.currentViewingCustomer.MaKH);
        }
    }

    // --- CHỨC NĂNG XUẤT EXCEL ---
    // --- HÀM DÙNG CHUNG ĐỂ TẢI FILE CÓ TOKEN ---
async function downloadFileWithToken(url, fileName) {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            if (response.status === 401) alert("Hết phiên đăng nhập!");
            else alert("Lỗi khi tải file!");
            return;
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối server!");
    }
}

// 1. Xuất toàn bộ danh sách
window.exportToExcel = function () {
    if (confirm("Xuất danh sách tất cả khách hàng ra Excel?")) {
        const dateStr = new Date().toISOString().slice(0, 10);
        downloadFileWithToken(`${API_URL}/Export/Excel`, `DS_KhachHang_${dateStr}.xlsx`);
    }
}

// 2. Xuất chi tiết 1 khách hàng (Lịch sử mua hàng)
window.exportCustomerExcel = function (maKH) {
    // Không cần confirm vì user đã bấm nút nhỏ
    downloadFileWithToken(`${API_URL}/${maKH}/Export/Excel`, `LichSu_MuaHang_${maKH}.xlsx`);
}

    // ==========================================
    // 6. LOAD THỐNG KÊ (Stats Cards)
    // ==========================================
    function loadVipStats() {
        // API: /KhachHangs/VipStats -> Trả về danh sách top chi tiêu
        $.ajax({
            url: `${API_URL}/VipStats`,
            method: 'GET',
            success: function (data) {
                // data là mảng các khách hàng VIP
                if (data && Array.isArray(data)) {
                    // Cập nhật thẻ VIP Customers
                    let vipCount = data.filter(c => c.HangThanhVien !== 'Mới').length;
                    $('#statVIPCustomers').text(vipCount);

                    // 2. Đếm khách hàng Mới (Số lần mua = 0) [PHẦN BẠN CẦN]
                    // Lưu ý: API VipStats trả về key là 'SoLanMua' (do Repository đặt alias)
                    let newCount = data.filter(c => Number(c.SoLanMua || 0) === 0).length;
                    $('#statNewCustomers').text(newCount);

                    // Cập nhật tổng doanh thu từ top khách hàng (hoặc cần API khác chính xác hơn)
                    let totalRevenue = data.reduce((sum, item) => sum + Number(item.TongChiTieu), 0);
                    // Format rút gọn (785 triệu)
                    let formattedRev = new Intl.NumberFormat('vi-VN', { maximumSignificantDigits: 3 }).format(totalRevenue / 1000000) + ' triệu';
                    $('#statTotalRevenue').text(formattedRev);
                }
            },
            error: function (err) { console.error("Lỗi load stats:", err); }
        });
    }

    // ==========================================
    // 7. CÁC HÀM TIỆN ÍCH KHÁC (Phân khúc, Chăm sóc)
    // ==========================================

    // Giả lập logic Client-side cho các nút chưa có API
    window.sendCustomerMessage = function (maKH) {
        alert(`Đang gửi tin nhắn đến khách hàng ${maKH}...`);
    }
    window.callCustomer = function (sdt) {
        alert(`Đang quay số: ${sdt}`);
    }
    window.sendCustomerCare = function () {
        alert('Đã gửi tin nhắn chăm sóc tự động!');
    }


 

    window.previewSegment = function () {
        $('#previewCount').text(Math.floor(Math.random() * 10)); // Random số liệu demo
    }

    window.resetFilters = function() {
        $('#customerSearch').val('');
        $('#customerTypeFilter').val('');
        // $('#customerStatusFilter').val(''); // Nếu có dùng
        fetchData(1);
    };

    // ==========================================
    // 8. BẮT SỰ KIỆN CLICK (THAY THẾ ONCLICK HTML)
    // ==========================================

        // Các nút tĩnh
        $('#btnExport').click(function() { window.exportToExcel(); });
        $('#btnOpenAddModal').click(function() { window.openModal('addCustomerModal'); });
        $('#btnResetFilters').click(function() { window.resetFilters(); });

        // Các nút trong Modal
        $('#btnSaveCustomer').click(function() { window.saveCustomer(); });
        $('#btnUpdateCustomer').click(function() { window.updateCustomer(); });
        $('#btnEditCurrentCustomer').click(function() { window.editCurrentCustomer(); });

        // Nút Đóng Modal (Tự động đóng khi click vào class .close-modal HOẶC .btn-close-modal)
        // .close-modal: Dùng cho nút X
        // .btn-close-modal: Dùng cho nút thường (Đóng/Hủy)
        $(document).on('click', '.close-modal, .btn-close-modal', function() {
            let modalId = $(this).closest('.modal').attr('id');
            if (modalId) window.closeModal(modalId);
        });

        // Các nút động trong bảng (Xem/Sửa/Xóa)
        $(document).on('click', '.view-btn', function() {
            let id = $(this).data('id');
            window.viewCustomerDetail(id);
        });

        $(document).on('click', '.edit-btn', function() {
            let id = $(this).data('id');
            window.editCustomer(id);
        });

        $(document).on('click', '.delete-btn', function() {
            let id = $(this).data('id');
            window.deleteCustomer(id);
        });

        // 6. Xử lý các nút BÊN TRONG Modal Chi Tiết (Sinh ra động)
        
        // Nút "Xuất lịch sử mua hàng"
        $(document).on('click', '.btn-export-history', function() {
            let id = $(this).data('id');
            window.exportCustomerExcel(id);
        });

        // Nút "Xem chi tiết đơn hàng" (trong bảng lịch sử)
        $(document).on('click', '.btn-view-order', function() {
            let maHD = $(this).data('id');
            alert("Tính năng xem chi tiết đơn hàng " + maHD + " đang phát triển!"); 
            // Hoặc gọi hàm window.viewOrderDetail(maHD) nếu bạn đã có
        });

        // 1. Xử lý Đăng xuất (Cho cả nút ở Sidebar và Header)
        $('.logout-btn').click(function() {
            localStorage.clear();
            window.location.href = "/login";
        });

        // 2. Các chức năng trong Modal Phân Khúc
        
        // Nút Thêm tiêu chí
        $('#btnAddCriterion').click(function() {
            const template = `
                <div class="criterion mt-2">
                    <select class="form-control" name="criteriaField">
                        <option value="totalSpent">Tổng chi tiêu</option>
                        <option value="orderCount">Số lượng đơn hàng</option>
                        <option value="customerType">Loại khách hàng</option>
                    </select>
                    <select class="form-control" name="criteriaOperator">
                        <option value=">">Lớn hơn</option>
                        <option value="<">Nhỏ hơn</option>
                        <option value="=">Bằng</option>
                    </select>
                    <input type="text" class="form-control" name="criteriaValue" placeholder="Giá trị">
                    <button type="button" class="btn btn-sm btn-outline-danger btn-remove-criteria" style="margin-left: 5px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            $('.segment-criteria').append(template);
        });

        // Nút Xóa tiêu chí (Nút con sinh ra động)
        $(document).on('click', '.btn-remove-criteria', function() {
            $(this).closest('.criterion').remove();
        });

        // Nút Xem trước
        $('#btnPreviewSegment').click(function() {
            // Giả lập random số lượng khách
            $('#previewCount').text(Math.floor(Math.random() * 50) + 1);
        });

        // Nút Tạo phân khúc
        $('#btnCreateSegment').click(function() {
            const name = $('input[name="segmentName"]').val();
            if(!name) { alert("Vui lòng nhập tên phân khúc!"); return; }
            
            alert("Đã tạo phân khúc: " + name);
            window.closeModal('segmentCustomersModal');
        });

        // 3. Mở Modal Phân khúc (Nếu chưa có nút này ở HTML thì thêm id="btnOpenSegment" vào nút mở)
        $('#btnOpenSegment').click(function(){
            window.openModal('segmentCustomersModal');
        });
});