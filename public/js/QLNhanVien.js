$(document).ready(function () {
    // ==========================================
    // 1. CẤU HÌNH & KHỞI TẠO
    // ==========================================
    const EMPLOYEE_API_URL = "/api/NhanViens";
    const ACCOUNT_API_URL = "/api/TaiKhoans";
    
    // Biến quản lý phân trang riêng biệt
    let currentEmpPage = 1;
    let currentAccPage = 1;
    
    // Biến timeout cho tìm kiếm (debounce)
    let searchTimeout = null;

    // Cache dữ liệu
    let currentEmployee = null;
    let currentAccount = null;

    // Khởi tạo
    fetchEmployees(1);
    fetchAccounts(1);
    updateStats();
    loadTopEmployees();
    
    // Tự động load danh sách nhân viên vào các select box (cho modal thêm tài khoản/chấm công)
    loadEmployeeDropdowns();

    // ==========================================
    // 2. QUẢN LÝ NHÂN VIÊN (MAIN TABLE)
    // ==========================================

    // Xử lý sự kiện tìm kiếm & lọc nhân viên
    $('#employeeSearch').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => fetchEmployees(1), 500);
    });

    $('#departmentFilter, #statusFilter').change(function () {
        fetchEmployees(1);
    });

    // Hàm tải danh sách nhân viên
    function fetchEmployees(page) {
        currentEmpPage = page;
        const keyword = $('#employeeSearch').val().trim();
        const department = $('#departmentFilter').val();
        // const status = $('#statusFilter').val(); // Nếu API hỗ trợ lọc status

        let url;
        let isSearching = keyword || department;

        $('#employeesTable tbody').html('<tr><td colspan="8" class="text-center py-4">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>');

        // LOGIC: Nếu đang tìm kiếm -> Gọi API Search, Ngược lại -> Gọi API Phân trang
        if (isSearching) {
            // Lưu ý: API Search trả về mảng, không có pagination
            url = `${EMPLOYEE_API_URL}/Search?hoTen=${encodeURIComponent(keyword)}&chucVu=${department}`; // Mapping tạm PhongBan sang ChucVu hoặc cần sửa API
            
            $.ajax({
                url: url,
                method: 'GET',
                success: function (data) {
                    renderEmployeeTable(data);
                    $('#employeePagination').empty(); // Ẩn phân trang khi search
                },
                error: handleApiError
            });
        } else {
            url = `${EMPLOYEE_API_URL}/PhanTrang?page=${page}`;
            
            $.ajax({
                url: url,
                method: 'GET',
                success: function (response) {
                    // API trả về { data: [], pagination: {} }
                    renderEmployeeTable(response.data || []);
                    renderEmployeePagination(response.pagination || {});
                },
                error: handleApiError
            });
        }
    }

    function renderEmployeeTable(employees) {
        const tbody = $('#employeesTable tbody');
        tbody.empty();

        if (employees.length === 0) {
            tbody.html('<tr><td colspan="8" class="text-center py-4">Không tìm thấy nhân viên nào</td></tr>');
            return;
        }

        employees.forEach(emp => {
            // Tính toán class CSS
            const deptClass = getDepartmentClass(emp.PhongBan || emp.ChucVu); 
            const statusClass = 'active'; // Mặc định active vì DB mẫu chưa có cột TrangThai rõ ràng
            
            const tr = `
                <tr>
                    <td><strong>${emp.MaNV}</strong></td>
                    <td>
                        <div class="employee-name">
                            ${emp.HoTen}
                            
                        </div>
                    </td>
                    <td>${emp.ChucVu}</td>
                    
                    <td><strong>${formatCurrency(emp.LuongCoBan)}</strong></td>
                    <td>
                        <div class="performance-indicator">
                            ${emp.SoDienThoai}
                        </div>
                    </td>
                   
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" title="Xem chi tiết" onclick="viewEmployeeDetail('${emp.MaNV}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" title="Sửa" onclick="openEditEmployeeModal('${emp.MaNV}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" title="Xóa" onclick="deleteEmployee('${emp.MaNV}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(tr);
        });
    }

    // Render Phân trang Nhân viên (Thêm div #employeePagination vào dưới bảng trong HTML nếu chưa có)
    function renderEmployeePagination(pagination) {
        // Tự tạo container nếu chưa có
        if ($('#employeePagination').length === 0) {
            $('.table-container:first').append('<div id="employeePagination" class="pagination-container"></div>');
        }

        let totalPages = pagination.totalPages || 1;
        let curPage = parseInt(pagination.currentPage) || 1;
        
        let html = '<div class="d-flex justify-content-center align-items-center gap-2 mt-3">';
        
        // Prev
        html += `<button class="btn btn-outline-secondary btn-sm emp-page-link" ${curPage <= 1 ? 'disabled' : ''} data-page="${curPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
        html += `<span class="text-muted mx-2">Trang ${curPage} / ${totalPages}</span>`;
        // Next
        html += `<button class="btn btn-outline-secondary btn-sm emp-page-link" ${curPage >= totalPages ? 'disabled' : ''} data-page="${curPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        html += '</div>';

        $('#employeePagination').html(html);

        // Bind event
        $('.emp-page-link').off('click').on('click', function() {
            if(!$(this).attr('disabled')) fetchEmployees($(this).data('page'));
        });
    }

    // ==========================================
    // 3. QUẢN LÝ TÀI KHOẢN (SIDEBAR WIDGET)
    // ==========================================

    // Hàm tải danh sách tài khoản (Có phân trang)
    function fetchAccounts(page) {
        currentAccPage = page;
        const url = `${ACCOUNT_API_URL}/PhanTrang?page=${page}`;

        // Hiển thị loading trong widget
        $('.account-list').html('<div class="text-center py-3"><i class="fas fa-spinner fa-spin"></i> Loading...</div>');

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                // API trả về { data: [], pagination: {} }
                const accounts = response.data || [];
                renderAccountList(accounts);
                renderAccountPagination(response.pagination || {});
            },
            error: function(err) {
                console.error(err);
                $('.account-list').html('<div class="text-center text-danger">Lỗi tải tài khoản</div>');
            }
        });
    }

    function renderAccountList(accounts) {
        const container = $('.account-list');
        container.empty();

        if(accounts.length === 0) {
            container.html('<div class="text-muted text-center py-2">Chưa có tài khoản</div>');
            return;
        }

        accounts.forEach(acc => {
            // Chuyển bit 1/0 sang active/inactive
            const statusClass = (acc.TrangThai == 1 || acc.TrangThai === 'active') ? 'active' : 'inactive';
            const statusText = (statusClass === 'active') ? 'Hoạt động' : 'Đã khóa';

            const item = `
                <div class="account-item">
                    
                    <div class="account-info">
                        <div class="account-id">${acc.TenDangNhap}</div> <div class="account-details">
                            <span>${acc.MaTK}</span>
                            <span>|</span>
                            <span>${acc.QuyenHan}</span>
                        </div>
                    </div>
                    <div class="account-actions">
                        <button class="account-action-btn account-view-btn" onclick="viewAccountDetail('${acc.MaTK}')"><i class="fas fa-eye"></i></button>
                        <button class="account-action-btn account-edit-btn" onclick="openEditAccountModal('${acc.MaTK}')"><i class="fas fa-edit"></i></button>
                        <button class="account-action-btn account-delete-btn" onclick="deleteAccount('${acc.MaTK}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            container.append(item);
        });
    }

    // Render Phân trang Tài khoản (Inject vào widget)
    function renderAccountPagination(pagination) {
        // Tìm container phân trang trong widget, nếu chưa có thì tạo
        let pager = $('#accountPagination');
        if (pager.length === 0) {
            $('.widget:has(.account-list) .widget-content').append('<div id="accountPagination" class="pagination-container small-pagination mt-3"></div>');
            pager = $('#accountPagination');
        }

        let totalPages = pagination.totalPages || 1;
        let curPage = parseInt(pagination.currentPage) || 1;

        if (totalPages <= 1) {
            pager.empty();
            return;
        }

        let html = '<div class="d-flex justify-content-between align-items-center">';
        html += `<button class="btn btn-sm btn-light acc-page-link" ${curPage <= 1 ? 'disabled' : ''} data-page="${curPage - 1}"><i class="fas fa-angle-left"></i></button>`;
        html += `<span class="small text-muted">${curPage}/${totalPages}</span>`;
        html += `<button class="btn btn-sm btn-light acc-page-link" ${curPage >= totalPages ? 'disabled' : ''} data-page="${curPage + 1}"><i class="fas fa-angle-right"></i></button>`;
        html += '</div>';

        pager.html(html);

        $('.acc-page-link').off('click').on('click', function() {
            if(!$(this).attr('disabled')) fetchAccounts($(this).data('page'));
        });
    }

    // ==========================================
    // 4. CRUD NHÂN VIÊN
    // ==========================================
    
    // Lưu nhân viên mới
    // Lưu nhân viên mới (Viết đầy đủ, ép kiểu số)
    window.saveEmployee = function () {
        // 1. Validate cơ bản
        const maNV = $('#addMaNV').val();
        const hoTen = $('#addEmployeeForm input[name="HoTen"]').val();
        const sdt = $('#addEmployeeForm input[name="SoDienThoai"]').val();

        if (!maNV || !hoTen || !sdt) {
            alert('Vui lòng điền các thông tin bắt buộc (Mã NV, Họ tên, SĐT)!');
            return;
        }

        // 2. Lấy dữ liệu thủ công từng trường
        const data = {
            MaNV: maNV,
            HoTen: hoTen,
            SoDienThoai: sdt,
            Email: $('#addEmployeeForm input[name="Email"]').val(),
            NgaySinh: $('#addEmployeeForm input[name="NgaySinh"]').val(),
            GioiTinh: $('#addEmployeeForm select[name="GioiTinh"]').val(),
            DiaChi: $('#addEmployeeForm textarea[name="DiaChi"]').val(),
            ChucVu: $('#addEmployeeForm select[name="ChucVu"]').val(),
            PhongBan: $('#addEmployeeForm select[name="PhongBan"]').val(),
            NgayVaoLam: $('#addEmployeeForm input[name="NgayVaoLam"]').val(),
            
            // --- QUAN TRỌNG: Ép kiểu số tại đây ---
            LuongCoBan: Number($('#addEmployeeForm input[name="LuongCoBan"]').val()) || 0,
            
            HopDong: $('#addEmployeeForm select[name="HopDong"]').val(),
            
            // --- QUAN TRỌNG: Ép kiểu số tại đây ---
            HeSoLuong: Number($('#addEmployeeForm input[name="HeSoLuong"]').val()) || 1.0
        };

        // 3. Gọi API
        $.ajax({
            url: EMPLOYEE_API_URL,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Thêm nhân viên thành công!');
                closeModal('addEmployeeModal');
                fetchEmployees(1); 
                updateStats();
                loadEmployeeDropdowns();
                // Reset form sau khi thêm
                $('#addEmployeeForm')[0].reset();
            },
            error: handleApiError
        });
    };

    // Mở modal sửa
    window.openEditEmployeeModal = function (maNV) {
        $.ajax({
            url: `${EMPLOYEE_API_URL}/${maNV}`,
            method: 'GET',
            success: function (emp) {
                currentEmployee = emp;
                
                // Fill data form
                $('#editMaNV').val(emp.MaNV);
                $('#displayMaNV').val(emp.MaNV);
                $('#editEmployeeForm input[name="HoTen"]').val(emp.HoTen);
                $('#editEmployeeForm input[name="SoDienThoai"]').val(emp.SoDienThoai);
                $('#editEmployeeForm input[name="Email"]').val(emp.Email);
                $('#editEmployeeForm input[name="NgaySinh"]').val(formatDateInput(emp.NgaySinh));
                $('#editEmployeeForm select[name="GioiTinh"]').val(emp.GioiTinh);
                $('#editEmployeeForm textarea[name="DiaChi"]').val(emp.DiaChi);
                $('#editEmployeeForm select[name="ChucVu"]').val(emp.ChucVu);
                // $('#editEmployeeForm select[name="PhongBan"]').val(emp.PhongBan); // Nếu có cột PhongBan
                $('#editEmployeeForm input[name="NgayVaoLam"]').val(formatDateInput(emp.NgayVaoLam));
                $('#editEmployeeForm input[name="LuongCoBan"]').val(emp.LuongCoBan);
                
                openModal('editEmployeeModal');
            },
            error: handleApiError
        });
    };

    // Cập nhật nhân viên
    // Cập nhật nhân viên (Viết đầy đủ, ép kiểu số)
    window.updateEmployee = function () {
        const maNV = $('#editMaNV').val(); // Lấy ID từ input ẩn

        // Lấy dữ liệu từ form Sửa (#editEmployeeForm)
        const data = {
            HoTen: $('#editEmployeeForm input[name="HoTen"]').val(),
            SoDienThoai: $('#editEmployeeForm input[name="SoDienThoai"]').val(),
            Email: $('#editEmployeeForm input[name="Email"]').val(),
            NgaySinh: $('#editEmployeeForm input[name="NgaySinh"]').val(),
            GioiTinh: $('#editEmployeeForm select[name="GioiTinh"]').val(),
            DiaChi: $('#editEmployeeForm textarea[name="DiaChi"]').val(),
            ChucVu: $('#editEmployeeForm select[name="ChucVu"]').val(),
            PhongBan: $('#editEmployeeForm select[name="PhongBan"]').val(),
            NgayVaoLam: $('#editEmployeeForm input[name="NgayVaoLam"]').val(),
            
            // --- QUAN TRỌNG: Ép kiểu số ---
            LuongCoBan: Number($('#editEmployeeForm input[name="LuongCoBan"]').val()) || 0,
            
            HopDong: $('#editEmployeeForm select[name="HopDong"]').val(),
            
            // --- QUAN TRỌNG: Ép kiểu số ---
            HeSoLuong: Number($('#editEmployeeForm input[name="HeSoLuong"]').val()) || 1.0
        };

        $.ajax({
            url: `${EMPLOYEE_API_URL}/${maNV}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Cập nhật thành công!');
                closeModal('editEmployeeModal');
                fetchEmployees(currentEmpPage); // Tải lại trang hiện tại
            },
            error: handleApiError
        });
    };

    // Xóa nhân viên
    window.deleteEmployee = function (maNV) {
        if (!confirm(`Xóa nhân viên ${maNV}? Hành động này sẽ xóa cả tài khoản liên quan.`)) return;

        $.ajax({
            url: `${EMPLOYEE_API_URL}/${maNV}`,
            method: 'DELETE',
            success: function () {
                alert('Đã xóa nhân viên!');
                fetchEmployees(currentEmpPage);
                updateStats();
            },
            error: handleApiError
        });
    };

    // Xem chi tiết
   // Xem chi tiết nhân viên (Đầy đủ thông tin)
    window.viewEmployeeDetail = function(maNV) {
        $.ajax({
            url: `${EMPLOYEE_API_URL}/${maNV}`,
            method: 'GET',
            success: function(emp) {
                currentEmployee = emp; // Lưu biến toàn cục để dùng cho nút Sửa

                // Xử lý dữ liệu hiển thị cho đẹp
                const luong = formatCurrency(emp.LuongCoBan);
                const ngaySinh = formatDate(emp.NgaySinh);
                const ngayVao = formatDate(emp.NgayVaoLam);
                const email = emp.Email || '<span class="text-muted fst-italic">Chưa cập nhật</span>';
                const diaChi = emp.DiaChi || '<span class="text-muted fst-italic">Chưa cập nhật</span>';
                
                // Icon giới tính
                let genderIcon = '<i class="fas fa-genderless"></i>';
                if (emp.GioiTinh === 'Nam') genderIcon = '<i class="fas fa-mars text-primary"></i>';
                if (emp.GioiTinh === 'Nu') genderIcon = '<i class="fas fa-venus text-danger"></i>';

                const html = `
                    <div class="employee-detail p-2">
                        <div class="text-center mb-4 pb-3 border-bottom">
                            <div class="avatar-circle mb-2 mx-auto shadow-sm" style="width: 80px; height: 80px; background: #f8f9fa; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #4361ee; border: 2px solid #e0e0e0;">
                                <i class="fas fa-user"></i>
                            </div>
                            <h4 class="text-primary mb-1 fw-bold">${emp.HoTen}</h4>
                            <span class="badge bg-secondary rounded-pill px-3">Mã: ${emp.MaNV}</span>
                        </div>

                        <div class="row g-4">
                            <div class="col-md-6 border-end">
                                <h6 class="text-uppercase text-secondary mb-3 small fw-bold">
                                    <i class="fas fa-address-card me-2"></i>Thông tin cá nhân
                                </h6>
                                <table class="table table-borderless table-sm">
                                    <tbody>
                                        <tr>
                                            <td class="text-muted" style="width: 100px;">Giới tính:</td>
                                            <td class="fw-medium">${genderIcon} ${emp.GioiTinh}</td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted">Ngày sinh:</td>
                                            <td class="fw-medium">${ngaySinh}</td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted">SĐT:</td>
                                            <td class="fw-bold text-dark">${emp.SoDienThoai}</td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted">Email:</td>
                                            <td class="fw-medium">${email}</td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted">Địa chỉ:</td>
                                            <td class="fw-medium">${diaChi}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="col-md-6 ps-md-4">
                                <h6 class="text-uppercase text-secondary mb-3 small fw-bold">
                                    <i class="fas fa-briefcase me-2"></i>Công việc & Chế độ
                                </h6>
                                <table class="table table-borderless table-sm">
                                    <tbody>
                                        <tr>
                                            <td class="text-muted" style="width: 110px;">Chức vụ:</td>
                                            <td><span class="badge bg-info text-dark">${emp.ChucVu}</span></td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted">Ngày vào làm:</td>
                                            <td class="fw-medium">${ngayVao}</td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted">Thâm niên:</td>
                                            <td class="fw-medium text-success">
                                                ${calculateSeniority(emp.NgayVaoLam)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="2"><hr class="my-2"></td>
                                        </tr>
                                        <tr>
                                            <td class="text-muted align-middle">Lương CB:</td>
                                            <td class="fw-bold text-success fs-5">${luong}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                       
                    </div>
                `;
                $('#employeeDetailContent').html(html);
                openModal('viewEmployeeModal');
            },
            error: handleApiError
        });
    };

    // Hàm phụ: Tính thâm niên (Hiển thị cho chuyên nghiệp)
    function calculateSeniority(dateString) {
        if(!dateString) return 'Mới vào';
        const start = new Date(dateString);
        const now = new Date();
        
        let years = now.getFullYear() - start.getFullYear();
        let months = now.getMonth() - start.getMonth();
        
        if (months < 0) {
            years--;
            months += 12;
        }
        
        if (years > 0) return `${years} năm ${months} tháng`;
        if (months > 0) return `${months} tháng`;
        return 'Dưới 1 tháng';
    }

    window.editCurrentEmployee = function() {
        if(currentEmployee) {
            closeModal('viewEmployeeModal');
            openEditEmployeeModal(currentEmployee.MaNV);
        }
    }

    // ==========================================
    // 5. CRUD TÀI KHOẢN
    // ==========================================

    window.saveAccount = function () {
        const form = document.getElementById('addAccountForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Mặc định ngày tạo
        data.NgayTao = new Date().toISOString().slice(0, 19).replace('T', ' ');

        $.ajax({
            url: ACCOUNT_API_URL,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Tạo tài khoản thành công!');
                closeModal('addAccountModal');
                fetchAccounts(1); // Reload về trang 1
            },
            error: handleApiError
        });
    };

    window.openEditAccountModal = function (maTK) {
        $.ajax({
            url: `${ACCOUNT_API_URL}/${maTK}`,
            method: 'GET',
            success: function (acc) {
                $('#editAccountMaTK').val(acc.MaTK);
                $('#displayAccountMaTK').val(acc.MaTK);
                $('#editAccountForm select[name="MaNV"]').val(acc.MaNV);
                $('#editAccountForm input[name="TenDangNhap"]').val(acc.TenDangNhap);
                // Mật khẩu không điền lại
                $('#editAccountForm select[name="QuyenHan"]').val(acc.QuyenHan);
                // Convert bit to value
                const statusVal = (acc.TrangThai == 1) ? 'active' : 'inactive';
                $('#editAccountForm select[name="TrangThai"]').val(statusVal);
                
                openModal('editAccountModal');
            },
            error: handleApiError
        });
    };

    window.updateAccount = function () {
        const maTK = $('#editAccountMaTK').val();
        const data = {
            TenDangNhap: $('#editAccountForm input[name="TenDangNhap"]').val(),
            QuyenHan: $('#editAccountForm select[name="QuyenHan"]').val(),
            TrangThai: $('#editAccountForm select[name="TrangThai"]').val() === 'active' ? 1 : 0
        };
        
        const pwd = $('#editAccountForm input[name="MatKhau"]').val();
        if(pwd) data.MatKhau = pwd;

        $.ajax({
            url: `${ACCOUNT_API_URL}/${maTK}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function () {
                alert('Cập nhật tài khoản thành công!');
                closeModal('editAccountModal');
                fetchAccounts(currentAccPage);
            },
            error: handleApiError
        });
    };

    window.deleteAccount = function (maTK) {
        if (!confirm(`Xóa tài khoản ${maTK}?`)) return;
        $.ajax({
            url: `${ACCOUNT_API_URL}/${maTK}`,
            method: 'DELETE',
            success: function () {
                alert('Đã xóa tài khoản!');
                fetchAccounts(currentAccPage);
            },
            error: handleApiError
        });
    };

    // Xem chi tiết tài khoản
    window.viewAccountDetail = function(maTK) {
         $.ajax({
            url: `${ACCOUNT_API_URL}/${maTK}`,
            method: 'GET',
            success: function (acc) {
                currentAccount = acc;
                // Gọi thêm API lấy tên NV
                $.get(`${EMPLOYEE_API_URL}/${acc.MaNV}`).always(function(nv) {
                    const tenNV = nv.HoTen || acc.MaNV;
                    const html = `
                        <div class="account-detail">
                            <h4 class="text-primary mb-3">Tài khoản: ${acc.MaTK}</h4>
                            <table class="table table-bordered">
                                <tr><th style="color: black">Nhân viên</th><td>: ${tenNV} (${acc.MaNV})</td></tr>
                                <tr><th style="color: black">Username</th><td>: ${acc.TenDangNhap}</td></tr>
                                <tr><th style="color: black">Quyền hạn</th><td>: ${acc.QuyenHan}</td></tr>
                                <tr><th style="color: black">Trạng thái</th><td>: ${acc.TrangThai == 1 ? '<span class="text-success">Hoạt động</span>' : '<span class="text-danger">Khóa</span>'}</td></tr>
                                <tr><th style="color: black">Ngày tạo</th><td>: ${formatDate(acc.NgayTao)}</td></tr>
                            </table>
                        </div>
                    `;
                    $('#accountDetailContent').html(html);
                    openModal('viewAccountModal');
                });
            }
         });
    }

    window.editCurrentAccount = function() {
        if(currentAccount) {
            closeModal('viewAccountModal');
            openEditAccountModal(currentAccount.MaTK);
        }
    }

    // ==========================================
    // 6. TIỆN ÍCH & THỐNG KÊ
    // ==========================================

    // --- CẬP NHẬT HÀM THỐNG KÊ (Phiên bản Fix lỗi NaN) ---
    function updateStats() {
        $.ajax({
            url: "/api/NhanViens/Stats/Dashboard",
            method: 'GET',
            success: function (data) {
                console.log("Stats Data:", data); // Log ra để kiểm tra nếu còn lỗi

                // 1. Tổng nhân viên
                $('#statTotalEmployees').text(data.TongNhanVien || 0);
                
                // 2. Doanh số tháng
                // Sử dụng Number() để ép kiểu, tránh trường hợp API trả về chuỗi "100000"
                const ds = Number(data.DoanhSoThang) || 0; 
                let salesText = "0 đ";
                
                if(ds >= 1000000000) {
                    salesText = (ds / 1000000000).toFixed(2) + " tỷ";
                } else if (ds >= 1000000) {
                    salesText = (ds / 1000000).toFixed(1) + " tr";
                } else {
                    salesText = new Intl.NumberFormat('vi-VN').format(ds) + " đ";
                }
                $('#statTotalSales').text(salesText);

                // 3. Tổng lương tháng
                const luong = Number(data.TongLuong) || 0;
                let salaryText = "0 đ";
                if(luong >= 1000000) {
                    salaryText = (luong / 1000000).toFixed(1) + " tr";
                } else {
                    salaryText = new Intl.NumberFormat('vi-VN').format(luong);
                }
                $('#statTotalSalary').text(salaryText);
                
                // 4. Hiệu suất trung bình
                // Kiểm tra nếu undefined thì lấy 0
                const hieuSuat = data.HieuSuatTrungBinh !== undefined ? data.HieuSuatTrungBinh : 0;
                $('#statAvgPerformance').text(hieuSuat + "%");
            },
            error: function(err) {
                console.error("Lỗi tải thống kê dashboard:", err);
                // Hiển thị giá trị mặc định nếu lỗi API
                $('#statTotalEmployees').text("0");
                $('#statTotalSales').text("0 đ");
                $('#statTotalSalary').text("0 tr");
                $('#statAvgPerformance').text("0%");
            }
        });
    }

    function loadEmployeeDropdowns() {
        $.ajax({
            url: EMPLOYEE_API_URL,
            method: 'GET',
            success: function (employees) {
                const selects = $('select[name="MaNV"]');
                selects.each(function() {
                    // Giữ lại option đầu (Chọn nhân viên)
                    $(this).find('option:not(:first)').remove();
                    employees.forEach(emp => {
                        $(this).append(`<option value="${emp.MaNV}">${emp.MaNV} - ${emp.HoTen}</option>`);
                    });
                });
            }
        });
    }

    // ==========================================
    // 7. HELPERS
    // ==========================================
    
    window.openModal = function (id) { $('#' + id).css('display', 'flex'); }
    window.closeModal = function (id) { $('#' + id).css('display', 'none'); }
    
    // Format tiền
    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // Format ngày hiển thị (dd/mm/yyyy)
    function formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    // Format ngày cho input date (yyyy-mm-dd)
    function formatDateInput(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    }

    function getDepartmentClass(dept) {
        // Map tên phòng ban/chức vụ sang class màu sắc
        if(!dept) return 'secondary';
        const d = dept.toLowerCase();
        if(d.includes('bán hàng') || d.includes('sales')) return 'sales';
        if(d.includes('kho') || d.includes('warehouse')) return 'warehouse';
        if(d.includes('kỹ thuật') || d.includes('technical')) return 'technical';
        if(d.includes('quản lý') || d.includes('manager')) return 'management';
        if(d.includes('kế toán')) return 'accounting';
        return 'primary';
    }

    function handleApiError(xhr) {
        const msg = xhr.responseJSON?.message || xhr.statusText;
        alert("Lỗi: " + msg);
        console.error(xhr);
    }
    
    // Xuất Excel
    window.exportToExcel = function() {
        window.location.href = `${EMPLOYEE_API_URL}/Export/Excel`;
    }

    window.resetFilters = function() {
        // Xóa giá trị trong ô tìm kiếm
        $('#employeeSearch').val('');
        
        // Đưa dropdown về mặc định (value="")
        $('#departmentFilter').val('');
        
        // Gọi lại hàm tải dữ liệu gốc
        fetchEmployees(1);
    };

    // --- HÀM TẢI TOP NHÂN VIÊN ---
    function loadTopEmployees() {
        $.ajax({
            url: '/api/NhanViens/Stats/TopRevenue?limit=5', // Gọi API Top 5
            method: 'GET',
            success: function(data) {
                const container = $('#topEmployeesList');
                container.empty();

                if(data.length === 0) {
                    container.html('<div class="text-center text-muted py-3">Chưa có dữ liệu doanh thu</div>');
                    return;
                }

                // Tìm doanh thu cao nhất để tính % cho thanh hiển thị (Người cao nhất là 100%)
                const maxRevenue = Math.max(...data.map(e => Number(e.TongDoanhThu))) || 1;

                data.forEach((emp, index) => {
                    const rank = index + 1;
                    // Tính phần trăm độ dài thanh bar
                    const percent = (Number(emp.TongDoanhThu) / maxRevenue) * 100;
                    
                    // Top 3 sẽ có class 'top' để highlight (nếu CSS hỗ trợ)
                    const topClass = rank <= 3 ? 'top' : '';
                    
                    // Icon huy chương cho Top 3
                    let rankDisplay = `<div class="ranking-rank">${rank}</div>`;
                    if(rank === 1) rankDisplay = `<div class="ranking-rank" style="background: #FFD700; color: #fff; border: none;"><i class="fas fa-crown"></i></div>`;
                    else if(rank === 2) rankDisplay = `<div class="ranking-rank" style="background: #C0C0C0; color: #fff; border: none;">2</div>`;
                    else if(rank === 3) rankDisplay = `<div class="ranking-rank" style="background: #CD7F32; color: #fff; border: none;">3</div>`;

                    const html = `
                        <div class="ranking-item ${topClass}">
                            ${rankDisplay}
                            <div class="ranking-info">
                                <div class="ranking-name fw-bold">${emp.HoTen}</div>
                                <div class="ranking-position text-muted small">
                                    ${emp.ChucVu} • <span class="text-primary">${emp.SoDonHang} đơn</span>
                                </div>
                            </div>
                            <div class="ranking-performance">
                                <div class="performance-value fw-bold text-dark">${formatSimpleCurrency(emp.TongDoanhThu)}</div>
                                <div class="performance-bar">
                                    <div class="performance-fill" style="width: ${percent}%"></div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(html);
                });
            },
            error: function(err) {
                console.error("Lỗi tải Top nhân viên:", err);
                $('#topEmployeesList').html('<div class="text-center text-danger py-3">Lỗi tải dữ liệu</div>');
            }
        });
    }

    // Hàm format tiền rút gọn (VD: 1.5 tỷ, 500 tr) cho đẹp widget
    function formatSimpleCurrency(amount) {
        amount = Number(amount);
        if(amount >= 1000000000) return (amount / 1000000000).toFixed(1) + ' tỷ';
        if(amount >= 1000000) return (amount / 1000000).toFixed(0) + ' tr';
        return new Intl.NumberFormat('vi-VN').format(amount);
    }
});