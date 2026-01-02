$(document).ready(function () {
    // ==========================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ==========================================
    const API_URL = "/api/DanhMucs";
    const PRODUCT_API_URL = "/api/SanPhams"; // Dùng để lấy sản phẩm cho chi tiết danh mục
    let currentPage = 1;
    let searchTimeout = null;
    let currentCategory = null; // Biến lưu danh mục đang xem/sửa
    let categoryChart = null;   // Biến lưu instance của biểu đồ
    let totalRevenueGlobal = 0;// Biến lưu tổng doanh thu toàn bộ danh mục (dùng để tính %)
    // Load dữ liệu lần đầu
    fetchData(1);
    updateStats(); // Cập nhật thống kê tổng quan

    // ==========================================
    // 2. XỬ LÝ SỰ KIỆN TÌM KIẾM & LỌC
    // ==========================================

    // Tìm kiếm (Debounce 0.5s)
    $('#categorySearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function () {
            fetchData(1);
        }, 500);
    });

    // Khi chọn bộ lọc hoặc sắp xếp -> Gọi lại dữ liệu
    $('#statusFilter, #sortFilter').change(function () {
        fetchData(1);
    });

    // Bộ lọc biểu đồ
    $('#chartFilter').change(function () {
        // Khi đổi loại biểu đồ (Doanh thu/Số lượng), vẽ lại dựa trên dữ liệu hiện tại trong bảng
        renderChartFromTable();
    });

    // ==========================================
    // 3. LOGIC GỌI API & LỌC DỮ LIỆU
    // ==========================================
    function fetchData(page) {
        currentPage = page;
        let keyword = $('#categorySearch').val().trim();

        // Logic xác định URL
        let url = '';

        // A. Nếu có từ khóa tìm kiếm -> Gọi API Search
        if (keyword) {
            url = `${API_URL}/Search?ten=${encodeURIComponent(keyword)}`;
        } else {
            // B. Nếu không tìm kiếm -> Gọi API Phân trang
            url = `${API_URL}/PhanTrang?page=${page}`;
        }

        // Hiển thị loading
        $('#categoriesTable tbody').html('<tr><td colspan="7" class="text-center py-4">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>');

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                let categories = [];
                let pagination = {};

                // Xử lý response chuẩn { data: [], pagination: {} } hoặc mảng []
                if (response.data && response.pagination) {
                    categories = response.data;
                    pagination = response.pagination;
                } else if (Array.isArray(response)) {
                    categories = response;
                    // Mock pagination cho kết quả tìm kiếm (hoặc API trả về list full)
                    pagination = { totalPages: 1, currentPage: 1, totalItems: categories.length };
                }

                // C. Lọc Client-side (cho các bộ lọc backend chưa support)
                let statusFilter = $('#statusFilter').val();
                let sortFilter = $('#sortFilter').val();

                // Lưu ý: Backend hiện tại chưa lưu TrangThai, mặc định coi như active nếu null
                if (statusFilter) {
                    categories = categories.filter(cat => {
                        let status = cat.TrangThai || 'active';
                        return status === statusFilter;
                    });
                }

                // D. Sắp xếp Client-side
                if (sortFilter) {
                    categories.sort((a, b) => {
                        let revA = parseFloat(a.TongDoanhThu || a.DoanhThu || 0);
                        let revB = parseFloat(b.TongDoanhThu || b.DoanhThu || 0);
                        let prodA = parseInt(a.TongSanPham || a.SoSanPham || 0);
                        let prodB = parseInt(b.TongSanPham || b.SoSanPham || 0);

                        // Sắp xếp theo tên (Mặc định trong HTML cũ của bạn)
                        if (sortFilter === 'name') {
                             return a.TenDanhMuc.localeCompare(b.TenDanhMuc);
                        }
                        
                        // Sắp xếp theo Mã Danh Mục (Để hiển thị DM001, DM002...)
                        if (sortFilter === 'code') {
                            // Dùng localeCompare với numeric: true để DM2 đứng trước DM10
                            return a.MaDM.localeCompare(b.MaDM, undefined, { numeric: true });
                        }

                        if (sortFilter === 'products') return prodB - prodA;
                        if (sortFilter === 'revenue') return revB - revA;
                        
                        return 0;
                    });
                } else {
                    // Nếu không chọn filter nào (hoặc value=""), mặc định sắp xếp theo Mã DM
                     categories.sort((a, b) => a.MaDM.localeCompare(b.MaDM, undefined, { numeric: true }));
                }

                // E. Render
                if (categories.length > 0) {
                    renderTable(categories);
                    renderPagination(pagination);

                    // Cập nhật biểu đồ dựa trên dữ liệu trang hiện tại
                    renderChart(categories);
                } else {
                    showNoResult();
                }
            },
            error: function (err) {
                console.error("Lỗi tải dữ liệu:", err);
                $('#categoriesTable tbody').html('<tr><td colspan="7" class="text-center text-danger">Lỗi kết nối server!</td></tr>');
            }
        });
    }

    // Lấy số liệu thống kê tổng quan (Calls API Dashboard hoặc mock)
    // File: js/QLDanhMuc.js

    function updateStats() {
        $.ajax({
            url: '/api/DanhMucs/ThongKe/TongQuan',
            method: 'GET',
            success: function (data) {
                console.log("Stats Data (VN):", data);

                // 1. Tổng danh mục
                $('#totalCategories').text(data.TongDanhMuc);

                // 2. Tổng sản phẩm
                $('#totalProducts').text(data.TongSanPham);

                // 3. Tổng doanh thu
                // Lưu ý: data.TongDoanhThu có thể là string số hoặc number, nên parse float cho chắc chắn
                let revenue = parseFloat(data.TongDoanhThu || 0);
                $('#totalRevenue').text(formatCurrency(revenue).replace('₫', '').trim() + ' ₫');

                // 4. Doanh thu trung bình
                let avg = parseFloat(data.DoanhThuTrungBinh || 0);
                $('#avgRevenue').text(formatCurrency(avg).replace('₫', '').trim() + ' ₫');

                // Lưu tổng doanh thu vào biến toàn cục để dùng cho renderTable
                totalRevenueGlobal = revenue;
               
                // Kiểm tra nếu bảng đang hiển thị dữ liệu (không phải đang loading hay trống)
                let rows = $('#categoriesTable tbody tr');
                // Chỉ vẽ lại nếu có dòng dữ liệu và không phải dòng thông báo lỗi/loading
                if (rows.length > 0 && !rows.find('td').attr('colspan')) {
                     
                     // Lấy lại dữ liệu từ các dòng hiện tại
                     let currentData = [];
                     rows.each(function() {
                         let catStr = $(this).attr('data-category');
                         if(catStr) currentData.push(JSON.parse(catStr));
                     });
                     
                     // Gọi hàm renderTable một lần nữa với tổng doanh thu mới
                     if(currentData.length > 0) {
                         console.log("Cập nhật lại tỷ lệ %...");
                         renderTable(currentData);
                     }
                }
                // ========================================================
                // Cập nhật ngày
                const now = new Date();
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                $('#lastUpdated').text(`Cập nhật: ${now.toLocaleDateString('vi-VN', options)}`);
            },
            error: function (err) {
                console.error("Lỗi tải thống kê:", err);
                $('#totalCategories').text(0);
                $('#totalProducts').text(0);
                $('#totalRevenue').text(0);
            }
        });
    }

    // ==========================================
    // 4. HÀM RENDER GIAO DIỆN
    // ==========================================
    function showNoResult() {
        $('#categoriesTable tbody').html('<tr><td colspan="7" class="text-center py-4">Không tìm thấy danh mục nào!</td></tr>');
        $('#pagination').empty();
        if (categoryChart) categoryChart.destroy();
    }

    function renderTable(categories) {
        let htmlContent = '';
        // Tổng doanh thu giả định để tính % (Do backend chưa trả về tổng)
        //const totalRevenueEstimate = totalRevenueGlobal > 0 ? totalRevenueGlobal : 1;;

        categories.forEach(cat => {
            // Dữ liệu mock vì Backend entity chưa có field này
            let productCount = cat.SoSanPham || 0;
            let revenue = cat.DoanhThu || 0;
            let status = cat.TrangThai || 'active';
            let icon = cat.Icon || 'mobile-alt';
            // --- LOGIC TÍNH % ĐÃ SỬA ---
            let percent = '0.0'; // Mặc định là 0
            if (totalRevenueGlobal > 0) {
                // Chỉ tính toán khi đã có Tổng Doanh Thu hợp lệ từ API
                percent = ((revenue / totalRevenueGlobal) * 100).toFixed(1);
            }
            let statusClass = status === 'active' ? 'active' : 'inactive';
            let statusText = status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động';

            // Lưu data vào tr để dùng lại khi view/edit
            let catJson = JSON.stringify(cat).replace(/"/g, '&quot;');

            htmlContent += `
                <tr data-category="${catJson}">
                    <td><strong>${cat.MaDM}</strong></td>
                    <td>
                        <div class="category-info">
                            <div class="category-name">${cat.TenDanhMuc}</div>
                            <div class="category-description text-muted small">${cat.MoTa || ''}</div>
                        </div>
                    </td>
                    <td>
                        <div class="product-count">
                            <span class="count">${productCount}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(productCount * 2, 100)}%"></div>
                            </div>
                        </div>
                    </td>
                    <td><strong>${formatCurrency(revenue)}</strong></td>
                    <td>
                        <div class="revenue-share">
                            <span class="percentage">${percent}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percent}%"></div>
                            </div>
                        </div>
                    </td>
                    
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" title="Xem chi tiết" onclick="viewCategoryDetail('${cat.MaDM}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" title="Sửa" onclick="editCategory('${cat.MaDM}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" title="Xóa" onclick="deleteCategory('${cat.MaDM}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        $('#categoriesTable tbody').html(htmlContent);
    }

    function renderPagination(pagination) {
        let totalPages = pagination.totalPages || 1;
        let curPage = parseInt(pagination.currentPage) || 1;

        if (totalPages <= 1) {
            $('#pagination').empty();
            return;
        }

        let html = '<div class="d-flex justify-content-center align-items-center gap-2 mt-3">';

        // Prev
        let prevDisabled = curPage <= 1 ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage - 1}" ${prevDisabled}><i class="fas fa-chevron-left"></i></button>`;

        html += `<span class="text-muted mx-2">Trang ${curPage} / ${totalPages}</span>`;

        // Next
        let nextDisabled = curPage >= totalPages ? 'disabled' : '';
        html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${curPage + 1}" ${nextDisabled}><i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';

        // Insert vào sau table (hoặc vào div pagination nếu có)
        // Trong EJS chưa có id #pagination, ta append vào table-responsive hoặc tạo div mới
        let container = $('.table-container .table-responsive');
        if ($('#pagination').length === 0) {
            container.after('<div id="pagination" class="p-3"></div>');
        }
        $('#pagination').html(html);

        $('.page-link').click(function () {
            if (!$(this).attr('disabled')) fetchData($(this).data('page'));
        });
    }

    // ==========================================
    // 5. BIỂU ĐỒ (Chart.js)
    // ==========================================
    function renderChart(data) {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const labels = data.map(d => d.TenDanhMuc);
        const revenueData = data.map(d => d.DoanhThu || 0); // Mock data nếu null
        const productsData = data.map(d => d.SoSanPham || 0);

        const filter = $('#chartFilter').val(); // 'revenue' or 'products'
        const isRevenue = filter === 'revenue';
        const chartData = isRevenue ? revenueData : productsData;
        const labelText = isRevenue ? 'Doanh thu (VNĐ)' : 'Số sản phẩm';

        // Colors logic
        const colors = [
            'rgba(67, 97, 238, 0.8)', 'rgba(114, 9, 183, 0.8)', 'rgba(255, 158, 0, 0.8)',
            'rgba(6, 214, 160, 0.8)', 'rgba(239, 35, 60, 0.8)', 'rgba(52, 152, 219, 0.8)'
        ];

        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: labelText,
                    data: chartData,
                    backgroundColor: colors.slice(0, data.length),
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let val = context.raw;
                                return isRevenue ? formatCurrency(val) : val + ' sản phẩm';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                if (isRevenue && value >= 1000000) return (value / 1000000).toFixed(0) + ' tr';
                                return value;
                            }
                        }
                    }
                }
            }
        });
    }

    // Hàm helper để vẽ lại chart mà không cần fetch lại data (dùng data từ table)
    function renderChartFromTable() {
        let rows = document.querySelectorAll('#categoriesTable tbody tr');
        let data = [];
        rows.forEach(row => {
            let catStr = row.getAttribute('data-category');
            if (catStr) data.push(JSON.parse(catStr));
        });
        if (data.length > 0) renderChart(data);
    }

    // ==========================================
    // 6. CÁC HÀM XỬ LÝ MODAL & CRUD
    // ==========================================

    window.openModal = function (id) { $('#' + id).css('display', 'flex'); }
    window.closeModal = function (id) {
        $('#' + id).css('display', 'none');
        if (id === 'addCategoryModal') $('#addCategoryForm')[0].reset();
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // Helper lấy data từ DOM
    function getCategoryFromRow(maDM) {
        const row = document.querySelector(`tr[data-category*='"MaDM":"${maDM}"']`);
        if (row) return JSON.parse(row.getAttribute('data-category'));
        return null;
    }

    // --- CHỨC NĂNG THÊM MỚI ---
    window.saveCategory = function () {
        let formData = new FormData(document.getElementById('addCategoryForm'));
        let data = Object.fromEntries(formData.entries());

        // Validate
        if (!data.MaDM || !data.TenDanhMuc) {
            alert('Vui lòng điền mã và tên danh mục!');
            return;
        }

        // Backend chỉ nhận { MaDM, TenDanhMuc, MoTa }. Icon và TrangThai có thể không được lưu
        // nhưng ta vẫn gửi đi phòng khi backend update

        $.ajax({
            url: API_URL, // POST /api/DanhMucs
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Thêm danh mục thành công!');
                window.closeModal('addCategoryModal');
                fetchData(1);
            },
            error: function (err) {
                let msg = err.responseJSON?.message || 'Lỗi hệ thống';
                alert('Thêm thất bại: ' + msg);
            }
        });
    }

    // --- CHỨC NĂNG SỬA ---
    window.editCategory = function (maDM) {
        // Gọi API lấy chi tiết
        $.ajax({
            url: `${API_URL}/${maDM}`,
            method: 'GET',
            success: function (cat) {
                currentCategory = cat;

                $('#editMaDM').val(cat.MaDM);
                $('#displayMaDM').val(cat.MaDM);

                // Điền thông tin vào form
                // Selector cụ thể hơn để tránh nhầm lẫn
                $('#editCategoryForm input[name="TenDanhMuc"]').val(cat.TenDanhMuc);
                $('#editCategoryForm textarea[name="MoTa"]').val(cat.MoTa || '');

                // Mặc định select
                $('#editCategoryForm select[name="TrangThai"]').val(cat.TrangThai || 'active');
                $('#editCategoryForm select[name="Icon"]').val(cat.Icon || 'mobile-alt');

                window.openModal('editCategoryModal');
            },
            error: function () {
                alert('Không thể tải thông tin danh mục!');
            }
        });
    };

    window.updateCategory = function () {
        let maDM = $('#editMaDM').val();
        let formData = new FormData(document.getElementById('editCategoryForm'));
        let data = Object.fromEntries(formData.entries());

        $.ajax({
            url: `${API_URL}/${maDM}`, // PUT /api/DanhMucs/:MaDM
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Cập nhật thành công!');
                window.closeModal('editCategoryModal');
                fetchData(currentPage);
            },
            error: function (err) {
                let msg = err.responseJSON?.message || 'Lỗi cập nhật';
                alert('Cập nhật thất bại: ' + msg);
            }
        });
    }

    // --- CHỨC NĂNG XÓA ---
    window.deleteCategory = function (maDM) {
        // Kiểm tra xem danh mục có sản phẩm không (logic giả định từ dữ liệu bảng)
        let cat = getCategoryFromRow(maDM);
        if (cat && cat.SoSanPham > 0) {
            alert(`Không thể xóa danh mục này vì còn ${cat.SoSanPham} sản phẩm!`);
            return;
        }

        if (confirm(`Bạn có chắc muốn xóa danh mục ${maDM}?`)) {
            $.ajax({
                url: `${API_URL}/${maDM}`,
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

    // --- CHỨC NĂNG XEM CHI TIẾT ---
    // window.viewCategoryDetail = function (maDM) {
    //     // 1. Lấy thông tin cơ bản
    //     $.ajax({
    //         url: `${API_URL}/${maDM}`,
    //         method: 'GET',
    //         success: function (cat) {
    //             currentCategory = cat;

    //             // 2. Lấy danh sách sản phẩm thuộc danh mục này (SearchAdvanced hoặc filter)
    //             // Backend API hiện tại chưa có endpoint getProductsByCategory rõ ràng trong docs
    //             // Ta dùng SearchAdvanced hoặc PhanTrang và filter client tạm thời
    //             // Hoặc mock dữ liệu để hiển thị UI

    //             // Mock layout
    //             const mockRevenue = cat.DoanhThu || 0;
    //             const mockProductsCount = cat.SoSanPham || 0;
                

    //             let detailHtml = `
    //             <div class="category-detail">
    //                 <div class="category-header mb-4">
    //                     <h3>${cat.TenDanhMuc}</h3>
    //                     <div class="text-muted">Mã: ${cat.MaDM}</div>
    //                 </div>
                    
    //                 <div class="row">
    //                     <div class="col-md-6">
    //                         <div class="detail-section">
    //                             <h5><i class="fas fa-info-circle"></i> Thông tin chung</h5>
    //                             <table class="detail-table">
    //                                 <tr><td><strong>Mô tả:</strong></td><td>${cat.MoTa || 'Chưa có mô tả'}</td></tr>
                                    
    //                             </table>
    //                         </div>
    //                     </div>
                        
    //                     <div class="col-md-6">
    //                         <div class="detail-section">
    //                             <h5><i class="fas fa-chart-line"></i> Thống kê</h5>
    //                             <table class="detail-table">
    //                                 <tr><td><strong>Số sản phẩm:</strong></td><td>${mockProductsCount} sản phẩm</td></tr>
    //                                 <tr><td><strong>Doanh thu:</strong></td><td>${formatCurrency(mockRevenue)}</td></tr>
    //                             </table>
    //                         </div>
    //                     </div>
    //                 </div>
                    
    //                 <div class="detail-section mt-3">
    //                     <h5><i class="fas fa-box"></i> Sản phẩm tiêu biểu</h5>
    //                     <div id="sampleProductsLoader" class="text-center text-muted">Đang tải sản phẩm...</div>
    //                     <div class="sample-products-list"></div>
    //                 </div>
    //             </div>
    //             `;

    //             $('#categoryDetailContent').html(detailHtml);
    //             window.openModal('viewCategoryModal');

    //             // 3. Gọi API lấy sản phẩm thật (nếu có)
    //             // Giả lập gọi API SanPham search theo danh mục
    //             // Vì API backend chưa support filter MaDM trực tiếp trong docs API, ta bỏ qua hoặc gọi getAll
    //             // Ở đây ta hiển thị thông báo nếu chưa có API
    //             $('#sampleProductsLoader').html('<p class="small text-muted">API lấy sản phẩm theo danh mục đang được cập nhật.</p>');
    //         },
    //         error: function () {
    //             alert('Không thể tải chi tiết danh mục');
    //         }
    //     });
    // }

    window.viewCategoryDetail = function (maDM) {
        // GỌI API MỚI (Thêm /ChiTiet vào đường dẫn)
        $.ajax({
            url: `${API_URL}/ChiTiet/${maDM}?limit=10`, // Đường dẫn mới: /api/DanhMucs/ChiTiet/DM001
            method: 'GET',
            success: function (cat) {
                currentCategory = cat;

                const realRevenue = cat.DoanhThu || 0;
                const realProductsCount = cat.SoSanPham || 0;
                
                // Vì API mới trả về TrangThai='active' nên statusHtml sẽ luôn đẹp
                const statusHtml = '<span class="status active">Hoạt động</span>';

                let detailHtml = `
                <div class="category-detail">
                    <div class="category-header mb-4">
                        <h3>${cat.TenDanhMuc}</h3>
                        <div class="text-muted">Mã: ${cat.MaDM}</div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-6">
                            <div class="detail-section">
                                <h5><i class="fas fa-info-circle"></i> Thông tin chung</h5>
                                <table class="detail-table">
                                    <tr><td><strong>Mô tả:</strong></td><td>${cat.MoTa || 'Chưa có mô tả'}</td></tr>
                                    
                                </table>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="detail-section">
                                <h5><i class="fas fa-chart-line"></i> Thống kê</h5>
                                <table class="detail-table">
                                    <tr><td><strong>Số sản phẩm:</strong></td><td><span class="fw-bold">${realProductsCount}</span> sản phẩm</td></tr>
                                    <tr><td><strong>Doanh thu:</strong></td><td><span class="text-success fw-bold">${formatCurrency(realRevenue)}</span></td></tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section mt-3">
                        <h5><i class="fas fa-box"></i> Sản phẩm tiêu biểu (Top 10)</h5>
                        <div class="sample-products-list table-responsive">
                            ${renderProductList(cat.SanPhams)}
                        </div>
                    </div>
                </div>
                `;

                $('#categoryDetailContent').html(detailHtml);
                window.openModal('viewCategoryModal');
            },
            error: function (err) {
                console.error(err);
                alert('Không thể tải chi tiết danh mục');
            }
        });
    }

    // Hàm render bảng con (Giữ nguyên hoặc thêm mới nếu chưa có)
    function renderProductList(products) {
        if (!products || products.length === 0) {
            return '<div class="text-center text-muted py-3">Danh mục này chưa có sản phẩm nào.</div>';
        }
        let html = '<table class="table table-sm table-bordered mt-2"><thead class="table-light"><tr><th>Mã SP</th><th>Tên sản phẩm</th><th class="text-end">Giá bán</th><th class="text-center">Tồn</th></tr></thead><tbody>';
        products.forEach(p => {
            html += `<tr><td><small>${p.MaSP}</small></td><td>${p.TenSanPham}</td><td class="text-end text-primary">${formatCurrency(p.GiaBan)}</td><td class="text-center">${p.SoLuongTon}</td></tr>`;
        });
        html += '</tbody></table>';
        return html;
    }

    window.editCurrentCategory = function () {
        if (currentCategory) {
            window.closeModal('viewCategoryModal');
            window.editCategory(currentCategory.MaDM);
        }
    }

    // --- CÁC CHỨC NĂNG KHÁC ---
    window.exportCategories = function () {
        if (confirm("Bạn có muốn xuất danh sách danh mục ra file Excel không?")) {
            // Chuyển hướng trình duyệt đến URL API để tải file
            window.location.href = `${API_URL}/Export/Excel`;
        }
    }

    // Load sản phẩm vào bảng bên dưới (Phần "Sản phẩm theo danh mục" trong EJS)
    window.refreshProducts = function () {
        let maDM = $('#productCategoryFilter').val();
        if (!maDM) return;

        loadCategoryProducts(maDM);
    }

    // $('#productCategoryFilter').change(function () {
    //     if (this.value) loadCategoryProducts(this.value);
    // });
    // A. Tự động tải danh sách danh mục vào Dropdown khi trang vừa load
    loadCategoryOptions();

    // B. Sự kiện khi người dùng chọn danh mục từ dropdown
    $('#productCategoryFilter').change(function() {
        let maDM = $(this).val();
        
        if (maDM) {
            // Có chọn danh mục -> Gọi API lấy sản phẩm
            loadCategoryProducts(maDM);
        } else {
            // Chọn "Chọn danh mục" (Rỗng) -> Reset về trạng thái chờ
            $('#categoryProductsTable tbody').html(`
                <tr id="noProductsMessage">
                    <td colspan="7" class="text-center p-5">
                        <i class="fas fa-info-circle fa-3x text-secondary mb-3"></i>
                        <h4 class="text-secondary">Chọn danh mục để xem sản phẩm</h4>
                        <p class="text-muted">Vui lòng chọn một danh mục từ danh sách trên</p>
                    </td>
                </tr>
            `);
        }
    });

    // C. Hàm xử lý nút "Làm mới"
    window.refreshProducts = function() {
        let maDM = $('#productCategoryFilter').val();
        if(maDM) {
            loadCategoryProducts(maDM);
        } else {
            alert("Vui lòng chọn một danh mục trước!");
        }
    }

    // --- HÀM 1: TẢI DANH SÁCH DANH MỤC VÀO SELECT ---
    function loadCategoryOptions() {
        $.ajax({
            url: API_URL, // GET /api/DanhMucs
            method: 'GET',
            success: function(data) {
                let select = $('#productCategoryFilter');
                
                // Giữ lại option đầu tiên (Chọn danh mục)
                select.html('<option value="">-- Chọn danh mục --</option>');
                
                // Đổ dữ liệu vào
                // Data trả về là mảng danh mục [{MaDM, TenDanhMuc...}, ...]
                data.forEach(cat => {
                    select.append(`<option value="${cat.MaDM}">${cat.TenDanhMuc}</option>`);
                });
            },
            error: function(err) {
                console.error("Lỗi tải danh sách dropdown:", err);
            }
        });
    }

    // --- HÀM 2: TẢI TOÀN BỘ SẢN PHẨM CỦA DANH MỤC ---
    function loadCategoryProducts(maDM) {
        // 1. Hiển thị Loading đẹp mắt
        $('#categoryProductsTable tbody').html(`
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <div class="mt-2 text-primary">Đang tải dữ liệu sản phẩm...</div>
                </td>
            </tr>
        `);

        // 2. Gọi API Chi Tiết (LƯU Ý: KHÔNG TRUYỀN LIMIT ĐỂ LẤY HẾT)
        $.ajax({
            url: `${API_URL}/ChiTiet/${maDM}`, // Gọi API mới: /api/DanhMucs/ChiTiet/DMxxx
            method: 'GET',
            success: function(response) {
                // response chứa: { MaDM, TenDanhMuc, ..., SanPhams: [] }
                const products = response.SanPhams;
                
                // Trường hợp danh mục không có sản phẩm nào
                if (!products || products.length === 0) {
                     $('#categoryProductsTable tbody').html(`
                        <tr>
                            <td colspan="7" class="text-center py-4 text-muted">
                                <i class="fas fa-box-open fa-2x mb-2"></i><br>
                                Danh mục này chưa có sản phẩm nào.
                            </td>
                        </tr>
                    `);
                    return;
                }

                // Vẽ bảng
                let html = '';
                products.forEach(p => {
                    // Xử lý màu sắc cho Tồn kho
                    let stockBadge = '';
                    if (p.SoLuongTon > 10) {
                        stockBadge = `<span class="badge bg-success rounded-pill">${p.SoLuongTon}</span>`;
                    } else if (p.SoLuongTon > 0) {
                        stockBadge = `<span class="badge bg-warning text-dark rounded-pill">${p.SoLuongTon}</span>`;
                    } else {
                        stockBadge = `<span class="badge bg-danger rounded-pill">Hết hàng</span>`;
                    }

                    // Xử lý hình ảnh (nếu chưa có ảnh thì dùng icon mặc định)
                    // Giả sử đường dẫn ảnh là /uploads/... hoặc url
                    // Ở đây dùng icon mobile thay thế nếu không có ảnh
                    let imgHtml = `<div class="bg-light rounded p-2 d-inline-block text-secondary"><i class="fas fa-mobile-alt fa-lg"></i></div>`;
                    if (p.HinhAnh && p.HinhAnh.length > 5) { 
                        // Demo logic ảnh, bạn có thể sửa src="${p.HinhAnh}" tùy đường dẫn thật
                         imgHtml = `<div class="bg-light rounded p-2 d-inline-block text-primary"><i class="fas fa-image fa-lg"></i></div>`;
                    }

                    html += `
                        <tr>
                            <td class="align-middle"><strong>${p.MaSP}</strong></td>
                            <td class="align-middle">
                                <div class="d-flex align-items-center gap-2">
                                    
                                    <span class="fw-bold">${p.TenSanPham}</span>
                                </div>
                            </td>
                            <td class="align-middle text-end text-primary fw-bold">
                                ${formatCurrency(p.GiaBan)}
                            </td>
                            <td class="align-middle text-center">
                                ${stockBadge}
                            </td>
                            <td class="align-middle text-center fw-bold text-dark">
                                ${p.DaBan}
                            </td>
                            <td class="align-middle text-end text-success fw-bold">
                                ${formatCurrency(p.DoanhThuSanPham || 0)}
                            </td>
                            <td class="align-middle">
                                <span class="text-dark">
                                    <i class="fas fa-building text-muted small me-1"></i>
                                    ${p.TenNhaCungCap || 'Chưa cập nhật'}
                                </span>
                            </td>
                        </tr>
                    `;
                });

                $('#categoryProductsTable tbody').html(html);
            },
            error: function(err) {
                console.error("Lỗi tải sản phẩm:", err);
                $('#categoryProductsTable tbody').html(`
                    <tr>
                        <td colspan="7" class="text-center text-danger py-4">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Không thể tải dữ liệu sản phẩm. Vui lòng thử lại!
                        </td>
                    </tr>
                `);
            }
        });
    }
    
    // function loadCategoryProducts(maDM) {
    //     // Logic này tương tự viewDetail nhưng render vào bảng chính bên dưới dashboard
    //     // Cần API /SanPhams?MaDM=...
    //     console.log("Loading products for category:", maDM);
    //     // Implement logic call API here
    // }
});