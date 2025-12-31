$(document).ready(function () {
    // ==========================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ==========================================
    const API_URL = "/api/NhaCungCaps";
    const PAGE_SIZE = 10;
    let currentPage = 1;
    let searchTimeout = null;
    let currentViewingSupplier = null; // Biến lưu tạm NCC đang xem để dùng cho nút Sửa

    // Load dữ liệu lần đầu
    fetchData(1);
    updateStats(); // Gọi hàm update thống kê (nếu có API riêng)

    // ==========================================
    // 2. XỬ LÝ SỰ KIỆN TÌM KIẾM & LỌC
    // ==========================================

    // Tìm kiếm (Debounce 0.5s)
    $('#supplierSearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            fetchData(1);
        }, 500);
    });

    // Khi chọn bộ lọc -> Gọi lại dữ liệu
    $('#supplierTypeFilter, #supplierStatusFilter').change(function () {
        fetchData(1);
    });

    // ==========================================
    // 3. LOGIC GỌI API & LỌC DỮ LIỆU
    // ==========================================
    function fetchData(page) {
        currentPage = page;
        let keyword = $('#supplierSearch').val().trim();

        // Logic xác định URL dựa trên hành động
        let url = '';

        // A. Nếu có từ khóa tìm kiếm -> Gọi API Search
        if (keyword) {
            // Backend đã update searchAdvanced có phân trang
            // Mặc định tìm theo tên, bạn có thể mở rộng logic tìm theo SDT/Người LH nếu muốn
            url = `${API_URL}/Search?ten=${encodeURIComponent(keyword)}&page=${page}`;
        } else {
            // B. Nếu không tìm kiếm -> Gọi API Phân trang
            url = `${API_URL}/PhanTrang?page=${page}`;
        }

        // Hiển thị loading
        $('#suppliersTable tbody').html('<tr><td colspan="9" class="text-center py-4">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>');

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                let suppliers = [];
                let pagination = {};

                // API backend trả về cấu trúc chuẩn { data: [], pagination: {} } cho cả Search và PhanTrang
                if (response.data && response.pagination) {
                    suppliers = response.data;
                    pagination = response.pagination;
                } else if (Array.isArray(response)) {
                    // Fallback cho trường hợp API cũ trả về mảng
                    suppliers = response;
                    pagination = { totalPages: 1, currentPage: 1, totalItems: suppliers.length };
                }

                // C. Lọc Client-side (cho các bộ lọc dropdown chưa support server-side)
                let typeFilter = $('#supplierTypeFilter').val(); 
                let statusFilter = $('#supplierStatusFilter').val();

                if (typeFilter) {
                    suppliers = suppliers.filter(ncc => ncc.LoaiNCC === typeFilter);
                }
                if (statusFilter) {
                    suppliers = suppliers.filter(ncc => ncc.TrangThai === statusFilter);
                }

                // D. Render
                if (suppliers.length > 0) {
                    renderTable(suppliers);
                    renderPagination(pagination);
                    // Cập nhật số liệu thống kê nhanh trên giao diện nếu cần
                    $('#statTotalSuppliers').text(pagination.totalItems);
                } else {
                    showNoResult();
                }
            },
            error: function (err) {
                console.error("Lỗi tải dữ liệu:", err);
                $('#suppliersTable tbody').html('<tr><td colspan="9" class="text-center text-danger">Lỗi kết nối server!</td></tr>');
            }
        });
    }

    // ==========================================
    // 4. HÀM RENDER GIAO DIỆN
    // ==========================================
    function showNoResult() {
        $('#suppliersTable tbody').html('<tr><td colspan="9" class="text-center py-4">Không tìm thấy nhà cung cấp nào!</td></tr>');
        $('#pagination').empty();
    }

    function renderTable(suppliers) {
        let htmlContent = '';
        suppliers.forEach(ncc => {
            // Helper convert data
            let typeName = getSupplierTypeName(ncc.LoaiNCC);
            let statusClass = ncc.TrangThai === 'active' ? 'active' : 'inactive';
            let statusText = ncc.TrangThai === 'active' ? 'Đang hợp tác' : 'Ngừng hợp tác';
            
            // Xử lý badge loại NCC (màu sắc)
            let typeClass = ncc.LoaiNCC || 'local'; 
            
            // Prepare JSON data for Edit actions
            // let nccJson = JSON.stringify(ncc).replace(/"/g, '&quot;');

            htmlContent += `
                <tr data-id="${ncc.MaNCC}">
                    <td><strong>${ncc.MaNCC}</strong></td>
                    <td>
                        <div class="supplier-name">
                            ${ncc.TenNhaCungCap}
                            ${ncc.LoaiNCC === 'manufacturer' ? '<i class="fas fa-crown text-warning ms-1" title="Nhà SX"></i>' : ''}
                        </div>
                    </td>
                    <td>
                        <div>${ncc.NguoiLienHe}</div>
                        </td>
                    <td><span class="supplier-type ${typeClass}">${typeName}</span></td>
                    
                    <td><strong>${ncc.SoSanPham || 0}</strong> SP</td>
                    <td><div>${ncc.SoDonHang || 0} đơn</div></td>
                    
                    <td>
                        <div class="supplier-rating">
                            <div class="stars small">${generateStars(ncc.DanhGia || 0)}</div>
                            <div class="rating-value ms-1">${ncc.DanhGia || 0}</div>
                        </div>
                    </td>
                    
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewSupplierDetail('${ncc.MaNCC}')" title="Xem chi tiết">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" onclick="editSupplier('${ncc.MaNCC}')" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteSupplier('${ncc.MaNCC}')" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        $('#suppliersTable tbody').html(htmlContent);
    }

    function renderPagination(pagination) {
        let totalPages = pagination.totalPages || 1;
        let curPage = parseInt(pagination.currentPage) || 1;

        let html = '<div class="d-flex justify-content-center align-items-center gap-2 mt-3">';
        
        // Prev
        let prevDisabled = curPage <= 1 ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage - 1}" ${prevDisabled}><i class="fas fa-chevron-left"></i></button>`;
        
        html += `<span class="text-muted mx-2">Trang ${curPage} / ${totalPages}</span>`;
        
        // Next
        let nextDisabled = curPage >= totalPages ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage + 1}" ${nextDisabled}><i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';

        $('#pagination').html(html);

        $('.page-link').click(function () {
            if (!$(this).attr('disabled')) fetchData($(this).data('page'));
        });
    }

    // ==========================================
    // 5. CÁC HÀM XỬ LÝ MODAL & CRUD
    // ==========================================

    // --- Helpers ---
    window.openModal = function (id) { $('#' + id).css('display', 'flex'); }
    window.closeModal = function (id) {
        $('#' + id).css('display', 'none');
        if (id === 'addSupplierModal') $('#addSupplierForm')[0].reset();
        if (id === 'addPurchaseModal') $('#purchaseForm')[0].reset();
    }

    function getSupplierTypeName(type) {
        const types = {
            'manufacturer': 'Nhà SX',
            'distributor': 'Phân phối',
            'wholesaler': 'Đại lý',
            'importer': 'Nhập khẩu',
            'local': 'Trong nước'
        };
        return types[type] || 'Khác';
    }

    function generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) stars += '<i class="fas fa-star text-warning"></i>';
            else if (i === fullStars + 1 && hasHalfStar) stars += '<i class="fas fa-star-half-alt text-warning"></i>';
            else stars += '<i class="far fa-star text-secondary"></i>';
        }
        return stars;
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // --- CHỨC NĂNG THÊM MỚI ---
    window.saveSupplier = function () {
        let formData = new FormData(document.getElementById('addSupplierForm'));
        let data = Object.fromEntries(formData.entries());

        // Validate
        if (!data.MaNCC || !data.TenNhaCungCap || !data.NguoiLienHe || !data.SoDienThoai) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc!');
            return;
        }

        // Gán giá trị mặc định nếu thiếu
        data.TrangThai = 'active'; 
        data.LoaiNCC = 'local'; // Hoặc lấy từ form nếu có select

        $.ajax({
            url: API_URL, // POST /api/NhaCungCaps
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Thêm nhà cung cấp thành công!');
                window.closeModal('addSupplierModal');
                fetchData(1);
            },
            error: function (err) {
                let msg = err.responseJSON?.message || 'Lỗi hệ thống';
                alert('Thêm thất bại: ' + msg);
            }
        });
    }

    // --- CHỨC NĂNG SỬA ---
    window.editSupplier = function (maNCC) {
        // Gọi API lấy chi tiết
        $.ajax({
            url: `${API_URL}/${maNCC}`,
            method: 'GET',
            success: function (ncc) {
                $('#editMaNCC').val(ncc.MaNCC);
                $('#displayMaNCC').val(ncc.MaNCC);
                
                $('#editTenNhaCungCap').val(ncc.TenNhaCungCap);
                $('#editNguoiLienHe').val(ncc.NguoiLienHe);
                $('#editSoDienThoai').val(ncc.SoDienThoai);
                $('#editDiaChi').val(ncc.DiaChi);
                
                // Nếu form có trường Loại NCC hoặc Email, gán thêm vào đây
                // $('#editEmail').val(ncc.Email);

                window.openModal('editSupplierModal');
            },
            error: function () {
                alert('Không thể tải thông tin nhà cung cấp!');
            }
        });
    };

    window.updateSupplier = function () {
        let maNCC = $('#editMaNCC').val();
        let formData = new FormData(document.getElementById('editSupplierForm'));
        let data = Object.fromEntries(formData.entries());

        $.ajax({
            url: `${API_URL}/${maNCC}`, // PUT /api/NhaCungCaps/:MaNCC
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Cập nhật thành công!');
                window.closeModal('editSupplierModal');
                fetchData(currentPage);
            },
            error: function (err) {
                let msg = err.responseJSON?.message || 'Lỗi cập nhật';
                alert('Cập nhật thất bại: ' + msg);
            }
        });
    }

    // --- CHỨC NĂNG XÓA ---
    window.deleteSupplier = function (maNCC) {
        if (confirm(`Bạn có chắc muốn xóa nhà cung cấp ${maNCC}?`)) {
            $.ajax({
                url: `${API_URL}/${maNCC}`,
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

    // --- CHỨC NĂNG XEM CHI TIẾT (BÁO CÁO) ---
    window.viewSupplierDetail = function (maNCC) {
        // Sử dụng API Report để lấy thông tin chi tiết và danh sách sản phẩm
        // API: /api/NhaCungCaps/BaoCao/SanPham?MaNCC=...
        $.ajax({
            url: `${API_URL}/BaoCao/SanPham?MaNCC=${maNCC}`,
            method: 'GET',
            success: function (response) {
                // Response cấu trúc: { supplierInfo: {}, summary: {}, products: [] }
                const info = response.supplierInfo;
                const stats = response.summary;
                const products = response.products || [];

                window.currentViewingSupplier = info; // Lưu để dùng cho nút Sửa

                let detailHtml = `
                <div class="supplier-detail">
                    <div class="supplier-header mb-4">
                        <h3>${info.TenNhaCungCap}</h3>
                        <div class="text-muted">Mã: ${info.MaNCC}</div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="detail-section">
                                <h5><i class="fas fa-building"></i> Thông tin cơ bản</h5>
                                <table class="detail-table">
                                    <tr><td><strong>Người LH:</strong></td><td>${info.LienHe}</td></tr>
                                    <tr><td><strong>SĐT:</strong></td><td>${info.SDT}</td></tr>
                                    <tr><td><strong>Địa chỉ:</strong></td><td>${info.DiaChi || '-'}</td></tr>
                                </table>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="detail-section">
                                <h5><i class="fas fa-chart-line"></i> Thống kê hàng hóa</h5>
                                <div class="row">
                                    <div class="col-6 mb-2"><strong>Đầu SP:</strong> ${stats.TongSoDauSanPham}</div>
                                    <div class="col-6 mb-2"><strong>Tổng tồn:</strong> ${stats.TongSoLuongTon}</div>
                                    <div class="col-12">
                                        <strong>Giá trị kho:</strong> 
                                        <span class="text-primary fw-bold">${formatCurrency(stats.TongGiaTriHang)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section mt-3">
                         <h5><i class="fas fa-box"></i> Danh sách sản phẩm cung cấp</h5>
                         <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                            <table class="table table-bordered table-sm">
                                <thead class="table-light">
                                    <tr>
                                        <th>Mã SP</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Giá bán</th>
                                        <th>Tồn kho</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${products.length === 0 ? '<tr><td colspan="4" class="text-center">Chưa có sản phẩm nào</td></tr>' : 
                                    products.map(sp => `
                                        <tr>
                                            <td>${sp.MaSanPham}</td>
                                            <td>${sp.TenSanPham}</td>
                                            <td>${formatCurrency(sp.GiaBan)}</td>
                                            <td>${sp.SoLuongTon}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
                `;
                
                $('#supplierDetailContent').html(detailHtml);
                window.openModal('viewSupplierModal');
            },
            error: function () {
                alert('Không thể tải chi tiết nhà cung cấp!');
            }
        });
    }

    // Nút Sửa trong modal xem chi tiết
    window.editCurrentSupplier = function () {
        if (window.currentViewingSupplier) {
            window.closeModal('viewSupplierModal');
            window.editSupplier(window.currentViewingSupplier.MaNCC);
        }
    }

    // --- CÁC CHỨC NĂNG KHÁC ---

    // Export Excel
    window.exportToExcel = function () {
        if(confirm('Xuất danh sách Nhà cung cấp ra Excel?')) {
            window.location.href = `${API_URL}/Export/Excel`;
        }
    }

    // Đơn nhập hàng (Purchase Order) - Placeholder logic
    window.createPurchaseOrder = function() {
        // Logic gọi API tạo đơn nhập ở đây
        // const supplierId = $('#purchaseSupplier').val();
        // ...
        alert('Chức năng tạo đơn nhập đang được phát triển (Backend API pending)');
        window.closeModal('addPurchaseModal');
    }

    // Load danh sách NCC vào dropdown đơn nhập khi mở modal (Optional)
    // Bạn có thể viết thêm logic load danh sách rút gọn vào select #purchaseSupplier ở đây
    
    function updateStats() {
        // Nếu có API thống kê dashboard riêng cho NCC thì gọi ở đây
        // Hiện tại dùng tạm số liệu đếm từ trang đầu tiên hoặc bỏ qua
    }
});