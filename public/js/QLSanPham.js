$(document).ready(function () {
    // ==========================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ==========================================
    const API_URL = "/api/SanPhams";
    const PAGE_SIZE = 16;
    let currentPage = 1;
    let searchTimeout = null;

    // Load dữ liệu lần đầu
    fetchData(1);

    // ==========================================
    // 2. XỬ LÝ SỰ KIỆN TÌM KIẾM & LỌC
    // ==========================================

    // Tìm kiếm (Debounce 0.5s)
    $('#productSearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            $('#categoryFilter').val(''); // Reset danh mục khi tìm tên
            fetchData(1);
        }, 500);
    });

    // Khi chọn Danh mục -> Gán vào ô tìm kiếm & gọi dữ liệu
    $('#categoryFilter').change(function () {
        $('#productSearch').val('');
        fetchData(1);
    });

    // Khi chọn Trạng thái hoặc Sắp xếp -> Gọi lại dữ liệu
    $('#statusFilter, #sortFilter').change(function () {
        fetchData(1);
    });

    // ==========================================
    // 3. LOGIC GỌI API & LỌC DỮ LIỆU
    // ==========================================
    function fetchData(page) {
        currentPage = page;

        // A. Xử lý Danh Mục (Giả lập tìm kiếm theo tên như bạn yêu cầu)
        let keyword = $('#productSearch').val().trim();
        let categoryVal = $('#categoryFilter').val();
        let categoryText = $('#categoryFilter option:selected').text().trim();
        let sort = $('#sortFilter').length ? $('#sortFilter').val() : '';

        // Nếu chọn danh mục (không phải 'Tất cả'), dùng tên danh mục làm từ khóa
        let finalSearchName = (categoryVal && categoryVal !== "") ? categoryText : keyword;

        // B. Tạo URL
        let url = `${API_URL}/SearchAdvanced?page=${page}&limit=${PAGE_SIZE}`;
        if (finalSearchName) url += `&ten=${encodeURIComponent(finalSearchName)}`;
        if (sort) url += `&sort=${sort}`;

        // Hiển thị loading
        $('#productsTable tbody').html('<tr><td colspan="8" class="text-center py-4">Đang tải... <i class="fas fa-spinner fa-spin"></i></td></tr>');

        // C. Gọi AJAX
        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                let products = response.data || [];
                let pagination = response.pagination || {};

                // D. Xử lý Lọc Trạng Thái (Lọc bằng JS ở Client)
                let statusFilter = $('#statusFilter').val();
                if (statusFilter) {
                    products = products.filter(sp => {
                        let sl = sp.SoLuongTon;
                        if (statusFilter === 'in_stock') return sl > 20;
                        if (statusFilter === 'low_stock') return sl > 0 && sl <= 20;
                        if (statusFilter === 'out_of_stock') return sl == 0;
                        return true;
                    });
                }

                // E. Render
                if (products.length > 0) {
                    renderTable(products);
                    renderPagination(pagination);
                } else {
                    showNoResult();
                }
            },
            error: function (err) {
                console.error("Lỗi:", err);
                $('#productsTable tbody').html('<tr><td colspan="8" class="text-center text-danger">Lỗi kết nối!</td></tr>');
            }
        });
    }

    // ==========================================
    // 4. HÀM RENDER GIAO DIỆN
    // ==========================================
    function showNoResult() {
        $('#productsTable tbody').html('<tr><td colspan="8" class="text-center py-4">Không tìm thấy sản phẩm nào!</td></tr>');
    }

    function renderTable(products) {
        let htmlContent = '';
        products.forEach(sp => {
            // Format Tiền & Ngày
            let giaBan = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.GiaBan);
            let ngayNhap = sp.NgayNhap ? new Date(sp.NgayNhap).toLocaleDateString('vi-VN') : '';

            // Logic CSS Trạng thái
            let statusClass = 'inactive';
            let statusText = 'Hết hàng';
            let stockHtml = `<span>${sp.SoLuongTon}</span>`;

            if (sp.SoLuongTon > 20) {
                statusClass = 'active';
                statusText = 'Còn hàng';
            } else if (sp.SoLuongTon > 0) {
                statusClass = 'pending';
                statusText = 'Sắp hết';
                if (sp.SoLuongTon <= 10) {
                    stockHtml = `<span class="text-danger fw-bold">${sp.SoLuongTon}</span> <i class="fas fa-exclamation-triangle text-warning"></i>`;
                }
            } else {
                stockHtml = `<span class="text-muted">0</span>`;
            }

            // QUAN TRỌNG: Chuẩn bị JSON để gắn vào data-product (phục vụ nút Xem/Sửa)
            // Thay thế dấu " bằng &quot; để không lỗi HTML
            let spJson = JSON.stringify(sp).replace(/"/g, '&quot;');

            htmlContent += `
                <tr data-product="${spJson}">
                    <td><strong>${sp.MaSP}</strong></td>
                    <td>
                        <div class="product-info">
                            <div class="product-name fw-bold">${sp.TenSanPham}</div>
                            <div class="product-spec text-muted small">${sp.TenNCC || sp.MaNCC}</div>
                        </div>
                    </td>
                    <td><span class="category-badge">${sp.TenDM || sp.MaDM}</span></td>
                    <td><strong>${giaBan}</strong></td>
                    <td>${stockHtml}</td>
                    <td>${ngayNhap}</td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" onclick="viewProductDetail('${sp.MaSP}')"><i class="fas fa-eye"></i></button>
                            <button class="action-btn edit-btn" onclick="editProduct('${sp.MaSP}')"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-btn" onclick="deleteProduct('${sp.MaSP}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
        $('#productsTable tbody').html(htmlContent);
    }

    function renderPagination(pagination) {
        let totalPages = pagination.totalPages;
        let curPage = parseInt(pagination.currentPage);
        if (totalPages === 0) totalPages = 1; // Fallback

        let html = '<div class="d-flex align-items-center justify-content-center mt-3 gap-2">';

        let prevDisabled = curPage <= 1 ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage - 1}" ${prevDisabled}><i class="fas fa-chevron-left"></i></button>`;

        html += `<span class="text-muted mx-2">Trang ${curPage} / ${totalPages}</span>`;

        let nextDisabled = curPage >= totalPages ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage + 1}" ${nextDisabled}><i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';

        $('#pagination').html(html);

        $('.page-link').click(function () {
            if (!$(this).attr('disabled')) fetchData($(this).data('page'));
        });
    }

    // ==========================================
    // 5. CÁC HÀM XỬ LÝ MODAL (XEM, SỬA, XÓA)
    // PHẢI GẮN VÀO WINDOW ĐỂ HTML GỌI ĐƯỢC
    // ==========================================

    // Helper: Tìm sản phẩm trong bảng hiện tại
    function getProductFromRow(maSP) {
        const row = $(`tr[data-product*='"MaSP":"${maSP}"']`);
        if (row.length > 0) {
            return row.data('product'); // jQuery tự parse JSON từ data-product
        }
        return null;
    }

    // Helper: Format tiền tệ
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // Helper: Đóng mở Modal
    window.openModal = function (id) { $('#' + id).css('display', 'flex'); }
    window.closeModal = function (id) {
        $('#' + id).css('display', 'none');
        if (id === 'addProductModal') $('#addProductForm')[0].reset();
    }





    // --- CHỨC NĂNG XEM CHI TIẾT (Phục hồi từ code cũ) ---
    window.viewProductDetail = function (maSP) {
        let product = getProductFromRow(maSP);
        if (!product) { alert('Không tìm thấy dữ liệu!'); return; }

        // Biến toàn cục để dùng cho nút "Chỉnh sửa" trong modal xem
        window.currentViewingProduct = product;

        // Tạo HTML chi tiết (Copy từ logic cũ của bạn) 
        let detailHtml = `
            <div class="product-detail">
                <div class="product-header mb-4">
                    <h3>${product.TenSanPham}</h3>
                    <div class="text-muted">Mã: ${product.MaSP}</div>
                </div>
                <div class="row" style="display:flex; gap:20px;">
                    <div class="col-md-6" style="flex:1">
                         <p><strong>Danh mục:</strong> ${product.TenDM || product.MaDM}</p>
                         <p><strong>Nhà cung cấp:</strong> ${product.TenNCC || product.MaNCC}</p>
                         <p><strong>Ngày nhập:</strong> ${product.NgayNhap ? new Date(product.NgayNhap).toLocaleDateString('vi-VN') : ''}</p>
                         <p><strong>Tồn kho:</strong> ${product.SoLuongTon}</p>
                    </div>
                    <div class="col-md-6" style="flex:1">
                         <p><strong>Giá bán:</strong> ${formatCurrency(product.GiaBan)}</p>
                         <p><strong>Trạng thái:</strong> ${product.SoLuongTon > 20 ? 'Còn hàng' : 'Sắp hết'}</p>
                         <p><strong>Hình ảnh:</strong> ${product.HinhAnh || 'Chưa có'}</p>
                    </div>
                </div>
                <div class="detail-section mt-3">
                    <h5>Mô tả:</h5>
                    <div class="product-description text-muted">${product.MoTa || 'Chưa có mô tả'}</div>
                </div>
            </div>
        `;

        $('#productDetailContent').html(detailHtml);
        window.openModal('viewProductModal');
    };

    // Hàm chuyển từ Xem -> Sửa
    window.editCurrentProduct = function () {
        if (window.currentViewingProduct) {
            window.closeModal('viewProductModal');
            window.editProduct(window.currentViewingProduct.MaSP);
        }
    }

    // --- CHỨC NĂNG SỬA (Phục hồi từ code cũ) ---
    // --- CHỨC NĂNG SỬA (Lấy dữ liệu tươi từ API) ---
    window.editProduct = function (maSP) {
        // 1. Gọi API lấy chi tiết sản phẩm
        $.ajax({
            url: `${API_URL}/${maSP}`, // Endpoint: /api/SanPhams/SPxxx
            method: 'GET',
            success: function (product) {
                // 2. Nếu thành công, điền dữ liệu vào Form

                // ID ẩn và ID hiển thị
                $('#editMaSP').val(product.MaSP);
                $('#displayMaSP').val(product.MaSP);

                // Tìm form sửa
                let form = $('#editProductForm');

                // Điền các trường thông tin
                form.find('input[name="TenSanPham"]').val(product.TenSanPham);
                form.find('select[name="MaDM"]').val(product.MaDM);
                form.find('select[name="MaNCC"]').val(product.MaNCC);
                form.find('input[name="GiaBan"]').val(product.GiaBan);
                form.find('input[name="SoLuongTon"]').val(product.SoLuongTon);
                form.find('input[name="HinhAnh"]').val(product.HinhAnh);
                form.find('textarea[name="MoTa"]').val(product.MoTa);

                // Xử lý ngày tháng (input type="date" cần format yyyy-MM-dd)
                if (product.NgayNhap) {
                    try {
                        let dateVal = new Date(product.NgayNhap).toISOString().split('T')[0];
                        form.find('input[name="NgayNhap"]').val(dateVal);
                    } catch (e) {
                        console.error("Lỗi format ngày:", e);
                        form.find('input[name="NgayNhap"]').val('');
                    }
                }

                // 3. Mở Modal
                window.openModal('editProductModal');
            },
            error: function (err) {
                console.error("Lỗi lấy chi tiết:", err);
                alert('Không thể tải thông tin sản phẩm này!');
            }
        });
    };

    // --- CHỨC NĂNG CẬP NHẬT (Gọi API) ---
    // --- CHỨC NĂNG LƯU CẬP NHẬT (Gọi API PUT) ---
    window.updateProduct = function () {
        // 1. Lấy mã sản phẩm đang sửa
        let maSP = $('#editMaSP').val();
        if (!maSP) { alert("Lỗi: Không tìm thấy mã sản phẩm!"); return; }

        // 2. Lấy dữ liệu từ Form
        let formData = new FormData(document.getElementById('editProductForm'));
        let data = Object.fromEntries(formData.entries());

        // Chuyển đổi kiểu dữ liệu số cho đúng chuẩn Backend (nếu cần)
        data.GiaBan = parseInt(data.GiaBan);
        data.SoLuongTon = parseInt(data.SoLuongTon);

        // 3. Gọi API Update (PUT)
        $.ajax({
            url: `${API_URL}/${maSP}`, // Endpoint: /api/SanPhams/SPxxx
            method: 'PUT',             // Phương thức cập nhật
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                alert('Cập nhật sản phẩm thành công!');
                window.closeModal('editProductModal');

                // Load lại trang hiện tại để thấy thay đổi
                fetchData(currentPage);
            },
            error: function (xhr) {
                let msg = xhr.responseJSON?.message || 'Lỗi cập nhật sản phẩm!';
                alert('Thất bại: ' + msg);
            }
        });
    }

    // --- CHỨC NĂNG XÓA ---
    window.deleteProduct = function (maSP) {
        if (confirm('Bạn có chắc muốn xóa sản phẩm ' + maSP + '?')) {
            $.ajax({
                url: `${API_URL}/${maSP}`,
                method: 'DELETE',
                success: function () {
                    alert('Đã xóa thành công!');
                    fetchData(currentPage);
                },
                error: function () { alert('Không thể xóa sản phẩm này!'); }
            });
        }
    };

    // --- CHỨC NĂNG THÊM MỚI ---
    // --- CHỨC NĂNG THÊM MỚI (Đã sửa lỗi ép kiểu số) ---
    window.saveProduct = function () {
        let formData = new FormData(document.getElementById('addProductForm'));
        let data = Object.fromEntries(formData.entries());

        // Validate cơ bản
        if (!data.MaSP || !data.TenSanPham) {
            alert('Vui lòng nhập đủ thông tin (Mã SP, Tên SP)!');
            return;
        }

        // === SỬA LỖI TẠI ĐÂY ===
        // Chuyển đổi "GiaBan" và "SoLuongTon" từ chuỗi sang số
        if (data.GiaBan) data.GiaBan = parseInt(data.GiaBan);
        if (data.SoLuongTon) data.SoLuongTon = parseInt(data.SoLuongTon);
        // =======================

        $.ajax({
            url: API_URL, // Endpoint: /api/SanPhams
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Thêm mới thành công!');
                window.closeModal('addProductModal');
                document.getElementById('addProductForm').reset(); // Xóa trắng form
                fetchData(1); // Load lại danh sách trang 1
            },
            error: function (err) {
                // Hiển thị lỗi chi tiết trả về từ Backend
                let msg = err.responseJSON?.message || 'Mã SP có thể đã tồn tại hoặc lỗi server';
                console.error("Lỗi thêm mới:", err);
                alert('Lỗi thêm mới: ' + msg);
            }
        });
    }
    // --- CHỨC NĂNG XUẤT EXCEL ---
    window.exportToExcel = function() {
        if (confirm("Xác nhận xuất danh sách sản phẩm ra Excel?")) {
            // Cách đơn giản nhất để tải file từ API GET
            window.location.href = `${API_URL}/Export/Excel`;
        }
    };

    
    // --- HÀM LOAD THỐNG KÊ DANH MỤC ---
    
    function loadCategoryStats() {
        $.ajax({
            url: "/api/SanPhams/ThongKe/DanhMuc",
            method: "GET",
            success: function (data) {
                const tbody = $("#categoryStatsTable");
                if(tbody.length === 0) return;

                tbody.empty();

                if (!data || data.length === 0) {
                    tbody.html('<tr><td colspan="6" class="text-center">Chưa có dữ liệu</td></tr>');
                    return;
                }

                let html = "";
                data.forEach(item => {
                    let giaTriFormatted = new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', currency: 'VND' 
                    }).format(item.GiaTriTonKho);
                    let tenDM = item.TenDanhMuc || item.MaDM || "Khác";

                    // === CẬP NHẬT DÒNG NÀY ĐỂ THÊM CỘT ĐÃ BÁN ===
                    html += `
                        <tr>
                            <td><strong>${tenDM}</strong></td>
                            <td class="text-center">${item.SoLuongSP}</td>
                            <td class="text-center">${item.TongTonKho}</td>
                            <td class="text-end">${giaTriFormatted}</td>
                            <td class="text-center">
                                <span class="badge bg-info text-dark">${item.DaBanThangNay}</span>
                            </td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-outline-primary" onclick="filterByCategory('${item.MaDM}')">
                                    <i class="fas fa-search"></i> Chi tiết
                                </button>
                            </td>
                        </tr>
                    `;
                });
                tbody.html(html);
            },
            error: function (err) {
                console.error("Lỗi tải thống kê:", err);
            }
        });
    }

    // --- HÀM HỖ TRỢ: KHI BẤM "XEM CHI TIẾT" ---
    // Hàm này sẽ tự động điền MaDM vào bộ lọc ở trên và reload bảng sản phẩm
    function filterByCategory(maDM) {
        // Gán giá trị vào select box
        $("#categoryFilter").val(maDM).change(); // .change() để kích hoạt sự kiện lọc của code cũ

        // Cuộn trang lên bảng danh sách sản phẩm
        $('html, body').animate({
            scrollTop: $(".table-container").first().offset().top - 100
        }, 500);
    }


    loadCategoryStats();

    // --- HÀM LOAD THỐNG KÊ TỔNG QUAN (4 THẺ CARD) ---
    function loadProductStats() {
        $.ajax({
            url: "/api/SanPhams/ThongKe/TongQuan",
            method: "GET",
            success: function (data) {
                // data trả về: { TongSanPham: 5, TongGiaTri: 785000000, SapHetHang: 1, BanChay: 2 }
                
                // 1. Tổng sản phẩm
                $('#statTotalProducts').text(data.TongSanPham);

                // 2. Tổng giá trị (Format tiền Việt: 785.000.000 đ)
                // Hàm format rút gọn (nếu số quá lớn có thể chuyển thành "785 triệu")
                let formattedValue = new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', currency: 'VND' 
                }).format(data.TongGiaTri);
                
                // Nếu muốn hiển thị chữ "triệu/tỷ" cho gọn:
                if (data.TongGiaTri >= 1000000000) {
                    formattedValue = (data.TongGiaTri / 1000000000).toFixed(1) + ' tỷ';
                } else if (data.TongGiaTri >= 1000000) {
                    formattedValue = (data.TongGiaTri / 1000000).toFixed(0) + ' triệu';
                }
                
                $('#statTotalValue').text(formattedValue);

                // 3. Sắp hết hàng
                $('#statLowStock').text(data.SapHetHang);

                // 4. Bán chạy
                $('#statBestSellers').text(data.BanChay);
            },
            error: function (err) {
                console.error("Lỗi tải thống kê tổng quan:", err);
            }
        });
    }

    // --- GỌI HÀM KHI TRANG LOAD ---
    // (Thêm dòng này vào trong $(document).ready cùng với các hàm khác)
    loadProductStats();
});