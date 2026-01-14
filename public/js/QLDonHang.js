$(document).ready(function () {
  // ==========================================
  // 1. CẤU HÌNH & KHỞI TẠO
  // ==========================================
  const API_URL = "/api/HoaDons";
  const PRODUCT_API_URL = "/api/SanPhams";
  const DETAIL_API_URL = "/api/ChiTietHoaDons"; // Dựa trên api.js
  const CUSTOMER_API_URL = "/api/KhachHangs";
  const EMPLOYEE_API_URL = "/api/NhanViens";

  // Lấy token từ bộ nhớ
  const token = localStorage.getItem("accessToken");

  // Nếu không có token -> Đá về trang đăng nhập ngay
  if (!token) {
    alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
    window.location.href = "/login";
    return; // Dừng chạy code
  }

  // Cấu hình tự động gắn Token vào TẤT CẢ các lệnh gọi $.ajax bên dưới
  $.ajaxSetup({
    headers: {
      Authorization: "Bearer " + token,
    },
    // Xử lý chung khi lỗi Token hết hạn (401, 403)
    error: function (jqXHR, textStatus, errorThrown) {
      if (jqXHR.status === 401 || jqXHR.status === 403) {
        alert("Phiên làm việc hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      }
    },
  });

  let currentPage = 1;
  let searchTimeout = null;
  let orderItems = []; // Mảng chứa sản phẩm khi tạo đơn mới
  let currentViewingOrder = null;
  // Biến lưu danh sách khách hàng để dùng cho việc autofill
  let customersListCache = [];
  // Load dữ liệu lần đầu
  fetchData(1);
  updateStats(); // Load thống kê dashboard
  loadDropdownData();
  // ==========================================
  // 2. XỬ LÝ SỰ KIỆN TÌM KIẾM & LỌC
  // ==========================================

  // Tìm kiếm đơn hàng (Debounce 0.5s)
  $("#orderSearch").on("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      fetchData(1);
    }, 500);
  });

  // Lọc theo trạng thái và thanh toán
  $("#orderStatusFilter, #paymentFilter").change(function () {
    fetchData(1);
  });

  // Tìm kiếm SẢN PHẨM trong Modal Tạo đơn
  $("#productSearchInput").on("input", function () {
    let keyword = $(this).val().trim();
    if (keyword.length > 1) {
      searchProductsFromApi(keyword);
    } else {
      $("#productSearchResults").html("");
    }
  });

  // ==========================================
  // 3. LOGIC GỌI API DANH SÁCH
  // ==========================================
  function fetchData(page) {
    currentPage = page;
    const keyword = $("#orderSearch").val().trim();
    const status = $("#orderStatusFilter").val();
    const payment = $("#paymentFilter").val();

    // Xây dựng URL với các tham số query
    let url = `${API_URL}/PhanTrang?page=${page}`;
    if (keyword) url += `&search=${encodeURIComponent(keyword)}`;
    // Sửa status -> trangThai
    if (status) url += `&trangThai=${status}`;
    // Sửa payment -> phuongThuc
    if (payment) url += `&phuongThuc=${payment}`;

    $("#ordersTable tbody").html(
      '<tr><td colspan="8" class="text-center py-4">Đang tải dữ liệu... <i class="fas fa-spinner fa-spin"></i></td></tr>'
    );

    $.ajax({
      url: url,
      method: "GET",
      success: function (response) {
        const orders = response.data || [];
        const pagination = response.pagination || {};

        if (orders.length > 0) {
          renderTable(orders);
          renderPagination(pagination);
        } else {
          $("#ordersTable tbody").html(
            '<tr><td colspan="8" class="text-center py-4">Không tìm thấy đơn hàng nào!</td></tr>'
          );
          $("#pagination").empty();
        }
      },
      error: function (err) {
        console.error("Lỗi tải đơn hàng:", err);
        $("#ordersTable tbody").html(
          '<tr><td colspan="8" class="text-center text-danger">Lỗi kết nối server!</td></tr>'
        );
      },
    });
  }

  function updateStats() {
    $.ajax({
      url: `${API_URL}/ThongKe/SoLuong`,
      method: "GET",
      success: function (data) {
        $("#statTotalOrders").text(data.TongDon || 0);
        $("#statPendingOrders").text(data.ChoXuLy || 0);
        $("#statShippingOrders").text(data.DaHuy || 0); // Mapping theo yêu cầu cũ: Đang giao -> Đã hủy
        $("#statCompletedOrders").text(data.HoanThanh || 0);
      },
    });
  }

  // ==========================================
  // 4. RENDER GIAO DIỆN
  // ==========================================
  function renderTable(orders) {
    let html = "";
    orders.forEach((order) => {
      // Không cần lưu data-order quá lớn vào DOM nữa, ta sẽ fetch lại khi xem chi tiết
      const statusClass = getStatusClass(order.TrangThai);
      const statusText = getStatusText(order.TrangThai);
      const paymentClass = getPaymentClass(order.PhuongThucThanhToan);
      const paymentText = getPaymentText(order.PhuongThucThanhToan);
      const dateStr = formatDate(order.NgayLap);

      html += `
                <tr>
                    <td><strong>${order.MaHD}</strong></td>
                    <td>
                        <div class="customer-name">
                            ${order.TenKhachHang || "Khách vãng lai"}
                        </div>
                    </td>
                    <td>${dateStr}</td>
                    <td><strong>${formatCurrency(order.TongTien)}</strong></td>
                    <td><span class="payment ${paymentClass}">${paymentText}</span></td>
                    <td><span class="status ${statusClass}">${statusText}</span></td>
                    <td><span class="text-muted text-truncate" style="max-width: 150px; display: inline-block;">${
                      order.GhiChu || ""
                    }</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view-btn" title="Xem chi tiết" onclick="viewOrderDetail('${
                              order.MaHD
                            }')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-btn" title="Cập nhật trạng thái" onclick="openUpdateStatusModal('${
                              order.MaHD
                            }', '${order.TrangThai}')">
                                <i class="fas fa-sync"></i>
                            </button>
                            <button class="action-btn delete-btn" title="Xóa" onclick="deleteOrder('${
                              order.MaHD
                            }')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
    });
    $("#ordersTable tbody").html(html);
  }

  function renderPagination(pagination) {
    let totalPages = pagination.totalPages || 1;
    let curPage = parseInt(pagination.currentPage) || 1;

    let html =
      '<div class="d-flex justify-content-center align-items-center gap-2 mt-3">';

    // Nut Previous
    let prevDisabled = curPage <= 1 ? "disabled" : "";
    html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${
      curPage - 1
    }" ${prevDisabled}><i class="fas fa-chevron-left"></i></button>`;

    html += `<span class="text-muted mx-2">Trang ${curPage} / ${totalPages}</span>`;

    // Nut Next
    let nextDisabled = curPage >= totalPages ? "disabled" : "";
    html += `<button class="btn btn-outline-secondary btn-sm page-link" data-page="${
      curPage + 1
    }" ${nextDisabled}><i class="fas fa-chevron-right"></i></button>`;
    html += "</div>";

    $("#pagination").html(html);

    $(".page-link").click(function () {
      if (!$(this).attr("disabled")) fetchData($(this).data("page"));
    });
  }

  // ==========================================
  // 5. CHỨC NĂNG: XEM CHI TIẾT (QUAN TRỌNG)
  // ==========================================
  // Hàm xem chi tiết đơn hàng (Đầy đủ)
  window.viewOrderDetail = function (maHD) {
    // 1. Định nghĩa URL API (Dựa trên api.js của bạn)
    const urlOrder = `/api/HoaDons/${maHD}`;
    const urlDetails = `/api/ChiTietHoaDons/HoaDon/${maHD}`;

    // 2. Gọi API song song bằng $.when
    $.when(
      $.ajax({ url: urlOrder, method: "GET" }), // API 1: Lấy thông tin chung
      $.ajax({ url: urlDetails, method: "GET" }) // API 2: Lấy list sản phẩm
    )
      .done(function (orderRes, itemsRes) {
        // $.when trả về mảng [data, status, xhr]. Ta cần lấy phần tử [0] là data.
        const order = orderRes[0];
        const items = itemsRes[0];

        // 3. CẬP NHẬT BIẾN TOÀN CỤC (Quan trọng cho chức năng Cập nhật trạng thái)
        // Biến này được dùng ở hàm updateStatusCurrentOrder()
        if (typeof currentOrder !== "undefined") {
          currentOrder = order;
        } else {
          window.currentOrder = order;
        }

        // 4. Xử lý hiển thị thông tin chung
        // Logic: Ưu tiên lấy TenKhachHang (từ JOIN), nếu ko có thì lấy TenKH, ko có nữa thì 'Khách lẻ'
        const tenKhach = order.TenKhachHang || order.TenKH || "Khách lẻ";
        const tenNV = order.TenNhanVien || order.NhanVien || "Admin / Hệ thống";
        const ghiChu = order.GhiChu ? order.GhiChu : "<i>Không có ghi chú</i>";
        const hinhThucTT =
          order.PhuongThucThanhToan || order.HinhThucTT || "cash";

        // 5. Xử lý danh sách sản phẩm (Items HTML)
        let itemsHtml = "";
        if (items && items.length > 0) {
          items.forEach((item, index) => {
            // Đảm bảo có thành tiền (nếu API không trả về cột ThanhTien thì tự tính)
            const thanhTien = item.ThanhTien || item.SoLuong * item.DonGia;

            itemsHtml += `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td>
                            <div class="fw-bold">${
                              item.TenSanPham || "Mã SP: " + item.MaSP
                            }</div>
                        </td>
                        <td class="text-end">${formatCurrency(item.DonGia)}</td>
                        <td class="text-center">${item.SoLuong}</td>
                        <td class="text-end fw-bold">${formatCurrency(
                          thanhTien
                        )}</td>
                    </tr>
                `;
          });
        } else {
          itemsHtml = `<tr><td colspan="5" class="text-center text-muted py-3">Không có sản phẩm nào trong đơn hàng này</td></tr>`;
        }

        // 6. Tạo nội dung HTML cho Modal
        const detailContent = `
            <div class="order-detail">
                <div class="order-header mb-4 pb-3 border-bottom">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3 class="m-0 text-primary">Đơn hàng #${
                          order.MaHD
                        }</h3>
                        <span class="status ${order.TrangThai}">
                            ${getStatusText(order.TrangThai)}
                        </span>
                    </div>
                    <div class="text-muted small">
                        <i class="far fa-clock"></i> Ngày đặt: ${formatDate(
                          order.NgayLap
                        )}
                    </div>
                </div>

                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="detail-section h-100 p-3 bg-light rounded border">
                            <h5 class="text-secondary mb-3"><i class="fas fa-user-circle me-2"></i>Thông tin chung</h5>
                            <table class="detail-table w-100">
                                <tr>
                                    <td style="width: 100px; font-weight: 600;">Khách hàng:</td>
                                    <td>${tenKhach}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: 600;">Nhân viên:</td>
                                    <td>${tenNV}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: 600;">Ghi chú:</td>
                                    <td class="text-break">${ghiChu}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="detail-section h-100 p-3 bg-light rounded border">
                            <h5 class="text-secondary mb-3"><i class="fas fa-wallet me-2"></i>Thanh toán</h5>
                            <table class="detail-table w-100">
                                <tr>
                                    <td style="width: 120px; font-weight: 600;">Hình thức:</td>
                                    <td>
                                        <span class="payment ${hinhThucTT}">
                                            ${getPaymentText(hinhThucTT)}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="font-weight: 600;">Tổng tiền:</td>
                                    <td>
                                        <span class="text-danger fw-bold fs-5">
                                            ${formatCurrency(order.TongTien)}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h5 class="text-secondary mb-3"><i class="fas fa-box-open me-2"></i>Danh sách sản phẩm</h5>
                    <div class="table-responsive rounded border">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th class="text-center" style="width: 50px;">STT</th>
                                    <th>Sản phẩm</th>
                                    <th class="text-end">Đơn giá</th>
                                    <th class="text-center" style="width: 100px;">Số lượng</th>
                                    <th class="text-end">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // 7. Render vào Modal và hiển thị
        $("#orderDetailContent").html(detailContent);
        openModal("orderDetailModal");
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.error("API Error:", textStatus, errorThrown);
        alert(
          "Không thể tải dữ liệu chi tiết đơn hàng. Vui lòng kiểm tra console!"
        );
      });
  };

  // ==========================================
  // 6. CHỨC NĂNG: TẠO ĐƠN HÀNG (PHỨC TẠP)
  // ==========================================
  function loadDropdownData() {
    // 1. Load Nhân Viên
    $.ajax({
      url: EMPLOYEE_API_URL,
      method: "GET",
      success: function (response) {
        // Kiểm tra cấu trúc trả về (mảng trực tiếp hoặc response.data)
        const employees = Array.isArray(response)
          ? response
          : response.data || [];
        const employeeSelect = $('select[name="employee"]');

        // Giữ lại option đầu tiên, xóa các option cũ (trừ option đầu)
        employeeSelect.find("option:not(:first)").remove();

        employees.forEach((nv) => {
          // Giả sử API trả về MaNV và HoTen
          employeeSelect.append(
            `<option value="${nv.MaNV}">${nv.MaNV} - ${nv.HoTen}</option>`
          );
        });
      },
      error: function (err) {
        console.error("Lỗi tải nhân viên:", err);
      },
    });

    // 2. Load Khách Hàng
    $.ajax({
      url: CUSTOMER_API_URL,
      method: "GET",
      success: function (response) {
        const customers = Array.isArray(response)
          ? response
          : response.data || [];
        customersListCache = customers; // Lưu vào biến toàn cục để dùng sau

        const customerSelect = $('select[name="customer"]');
        // Xóa option cũ, giữ lại option "Chọn khách hàng" và "Thêm mới"
        customerSelect.find('option[value!=""][value!="new"]').remove();

        customers.forEach((kh) => {
          // Chèn trước option "Thêm khách hàng mới"
          $(
            `<option value="${kh.MaKH}">${kh.MaKH} - ${kh.HoTen}</option>`
          ).insertBefore(customerSelect.find('option[value="new"]'));
        });
      },
      error: function (err) {
        console.error("Lỗi tải khách hàng:", err);
      },
    });
  }

  // ==========================================
  // B. XỬ LÝ SỰ KIỆN CHỌN KHÁCH HÀNG (AUTOFILL)
  // ==========================================
  $('select[name="customer"]').change(function () {
    const selectedMaKH = $(this).val();

    // Reset form fields
    $('input[name="phone"]').val("");
    $('textarea[name="address"]').val("");

    if (selectedMaKH === "new") {
      // Logic mở modal thêm khách hàng mới (nếu có)
      alert("Vui lòng mở chức năng thêm khách hàng!");
      $(this).val(""); // Reset về rỗng
      return;
    }

    if (selectedMaKH) {
      // Tìm thông tin khách hàng trong mảng đã cache
      const customer = customersListCache.find((c) => c.MaKH === selectedMaKH);

      if (customer) {
        // Tự động điền SĐT và Địa chỉ
        $('input[name="phone"]').val(customer.SoDienThoai || "");
        $('textarea[name="address"]').val(customer.DiaChi || "");
      } else {
        // Trường hợp hiếm: data chưa load kịp, gọi API lấy chi tiết
        $.get(`${CUSTOMER_API_URL}/${selectedMaKH}`, function (kh) {
          $('input[name="phone"]').val(kh.SoDienThoai || "");
          $('textarea[name="address"]').val(kh.DiaChi || "");
        });
      }
    }
  });

  // ==========================================
  // C. SỬA LỖI TÌM KIẾM SẢN PHẨM
  // ==========================================
  let productSearchTimeout = null;

  // ==========================================
  // 4. TÌM KIẾM SẢN PHẨM (VIẾT KIỂU URL QUERY STRING)
  // ==========================================
  $("#productSearchInput").on("input", function () {
    const keyword = $(this).val().trim();
    const $results = $("#productSearchResults");

    clearTimeout(productSearchTimeout);

    if (keyword.length < 1) {
      $results.empty();
      $results.hide();
      return;
    }

    $results.show();
    $results.html(
      '<div class="p-2 text-muted text-center"><i class="fas fa-spinner fa-spin"></i> Đang tìm...</div>'
    );

    productSearchTimeout = setTimeout(function () {
      // --- SỬA LẠI URL THEO YÊU CẦU CỦA BẠN ---
      // Viết tham số trực tiếp vào URL: ?TenSanPham=...
      const searchUrl = `${PRODUCT_API_URL}/SearchAdvanced?ten=${encodeURIComponent(
        keyword
      )}`;

      $.ajax({
        url: searchUrl,
        method: "GET",
        // Bỏ dòng data: { ... } vì đã đưa vào URL rồi
        success: function (response) {
          $results.empty();
          let products = Array.isArray(response)
            ? response
            : response.data || [];

          if (products.length > 0) {
            products.forEach((p) => {
              const price = new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(p.GiaBan);

              const itemHtml = `
                                <div class="search-result-item" onclick="addProductToOrder('${
                                  p.MaSP
                                }', '${p.TenSanPham}', ${p.GiaBan})">
                                    <div class="d-flex justify-content-between">
                                        <span class="fw-bold">${
                                          p.TenSanPham
                                        }</span>
                                        <span class="text-primary">${price}</span>
                                    </div>
                                    <div class="small text-muted">Mã: ${
                                      p.MaSP
                                    } | Tồn: ${p.SoLuongTon || 0}</div>
                                </div>
                            `;
              $results.append(itemHtml);
            });
          } else {
            $results.html(
              '<div class="p-2 text-center text-muted">Không tìm thấy sản phẩm nào</div>'
            );
          }
        },
        error: function (err) {
          console.error("Lỗi tìm kiếm:", err);
          $results.html(
            '<div class="p-2 text-center text-danger">Lỗi kết nối server!</div>'
          );
        },
      });
    }, 300);
  });

  // Ẩn khung tìm kiếm khi click ra ngoài
  $(document).on("click", function (e) {
    if (!$(e.target).closest(".product-search").length) {
      $("#productSearchResults").hide();
    }
  });

  // Hàm helper để thêm sản phẩm vào bảng (Giữ nguyên logic cũ của bạn hoặc cập nhật)
  window.addProductToOrder = function (id, name, price) {
    // Kiểm tra xem biến orderItems đã được khai báo ở scope ngoài chưa
    if (typeof orderItems === "undefined") {
      console.error("Biến orderItems chưa được khai báo!");
      return;
    }

    const existingItem = orderItems.find((item) => item.id === id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      orderItems.push({
        id: id,
        name: name,
        price: price,
        quantity: 1,
      });
    }
    updateOrderItemsTable();
  };
  // Tìm kiếm sản phẩm từ API
  function searchProductsFromApi(keyword) {
    $.ajax({
      url: `${PRODUCT_API_URL}/SearchAdvanced?tenSP=${keyword}`, // Dựa trên api.js
      method: "GET",
      success: function (products) {
        // Giả sử API trả về mảng products
        if (products && products.length > 0) {
          const html = products
            .slice(0, 5)
            .map(
              (p) => `
                        <div class="search-result-item" onclick="addProductToOrder('${
                          p.MaSP
                        }', '${p.TenSanPham}', ${p.GiaBan})">
                            <div class="result-name">${p.TenSanPham}</div>
                            <div class="result-price">${formatCurrency(
                              p.GiaBan
                            )}</div>
                        </div>
                    `
            )
            .join("");
          $("#productSearchResults").html(html);
        } else {
          $("#productSearchResults").html(
            '<div class="p-2 text-muted">Không tìm thấy sản phẩm</div>'
          );
        }
      },
    });
  }

  // Thêm sản phẩm vào mảng tạm (Global scope)
  window.addProductToOrder = function (id, name, price) {
    const existing = orderItems.find((i) => i.id === id);
    if (existing) {
      existing.quantity++;
    } else {
      orderItems.push({ id: id, name: name, price: price, quantity: 1 });
    }
    updateOrderItemsTable();
    $("#productSearchInput").val("");
    $("#productSearchResults").html("");
  };

  // Cập nhật bảng sản phẩm trong Modal
  window.updateOrderItemsTable = function () {
    const tbody = $("#orderItemsTable");
    tbody.empty();
    let total = 0;

    orderItems.forEach((item, index) => {
      let thanhtien = item.price * item.quantity;
      total += thanhtien;
      tbody.append(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>
                        <input type="number" class="form-control form-control-sm" style="width: 60px" value="${
                          item.quantity
                        }" min="1" onchange="updateItemQty(${index}, this.value)">
                    </td>
                    <td>${formatCurrency(thanhtien)}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removeOrderItem(${index})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `);
    });

    // Tính toán tổng cộng
    let shipping = parseInt($('input[name="shippingFee"]').val()) || 0;
    let discount = parseInt($('input[name="discount"]').val()) || 0;
    let finalTotal = total + shipping - discount;
    $("#orderTotal").text(formatCurrency(finalTotal));

    // Lưu giá trị số thực để submit
    window.currentOrderTotal = finalTotal;
  };

  window.updateItemQty = function (index, val) {
    if (val < 1) val = 1;
    orderItems[index].quantity = parseInt(val);
    updateOrderItemsTable();
  };

  window.removeOrderItem = function (index) {
    orderItems.splice(index, 1);
    updateOrderItemsTable();
  };

  // --- SUBMIT TẠO ĐƠN ---
  // ==========================================
  // 6. XỬ LÝ TẠO ĐƠN HÀNG (TỰ TĂNG MÃ HD)
  // ==========================================
  window.createOrder = function () {
    // 1. Validate dữ liệu đầu vào
    if (orderItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm!");
      return;
    }

    const form = document.getElementById("createOrderForm");
    const formData = new FormData(form);

    if (!formData.get("customer")) {
      alert("Vui lòng chọn Khách hàng!");
      return;
    }

    // Hiển thị loading nhẹ hoặc disable nút để tránh bấm nhiều lần
    const btnCreate = document.querySelector(
      '#createOrderForm button[onclick="createOrder()"]'
    );
    const originalText = btnCreate.innerHTML;
    btnCreate.disabled = true;
    btnCreate.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    // 2. Gọi API lấy danh sách đơn hàng mới nhất để tính Mã HD tiếp theo
    // Chúng ta gọi trang 1 để lấy các đơn mới nhất (do Backend sắp xếp NgayLap DESC)
    $.ajax({
      url: `${API_URL}/PhanTrang?page=1`,
      method: "GET",
      success: function (response) {
        const orders = response.data || [];
        let nextMaHD = "HD001"; // Mặc định nếu chưa có đơn nào

        if (orders.length > 0) {
          // Tìm đơn hàng có số ID lớn nhất trong danh sách tải về (đề phòng trường hợp sắp xếp lộn xộn)
          let maxId = 0;
          orders.forEach((order) => {
            // Tách phần số từ chuỗi "HD040" -> 40
            const match = order.MaHD.match(/\d+/);
            if (match) {
              const num = parseInt(match[0]);
              if (num > maxId) maxId = num;
            }
          });

          // Tăng lên 1 và format lại thành 3 chữ số (VD: 40 -> 41 -> "041")
          nextMaHD = "HD" + (maxId + 1).toString().padStart(3, "0");
        }
        const totalString = document.getElementById("orderTotal").innerText;
        const total = parseInt(totalString.replace(/\D/g, "")) || 0;
        // 3. Chuẩn bị dữ liệu gửi đi
        const orderData = {
          MaHD: nextMaHD,
          MaKH: formData.get("customer"),
          MaNV: formData.get("employee") || "NV001",
          NgayLap: new Date().toISOString().slice(0, 19).replace("T", " "),
          TongTien: total || 0,
          TrangThai: "ChoXuLy",
          PhuongThucThanhToan: formData.get("paymentMethod"),
          GhiChu: formData.get("orderNote"),
        };

        // 4. Gửi API Tạo Hóa Đơn (Header)
        $.ajax({
          url: API_URL,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(orderData),
          success: function (res) {
            const createdMaHD = res.MaHD || orderData.MaHD;

            // 5. Gửi API Tạo Chi Tiết Hóa Đơn (Items)
            const promises = orderItems.map((item) => {
              return $.ajax({
                url: DETAIL_API_URL, // /api/ChiTietHoaDons
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                  MaHD: createdMaHD,
                  MaSP: item.id,
                  SoLuong: item.quantity,
                  DonGia: item.price,
                  ThanhTien: item.price * item.quantity,
                }),
              });
            });

            // Đợi tất cả chi tiết được lưu xong
            Promise.all(promises)
              .then(() => {
                alert(`Tạo đơn hàng thành công! Mã đơn: ${createdMaHD}`);
                closeModal("createOrderModal");
                fetchData(1); // Tải lại bảng để thấy đơn mới
              })
              .catch((err) => {
                console.error(err);
                alert(
                  `Đơn hàng ${createdMaHD} đã tạo nhưng lỗi khi lưu sản phẩm!`
                );
              })
              .finally(() => {
                // Khôi phục nút bấm
                btnCreate.disabled = false;
                btnCreate.innerHTML = originalText;
              });
          },
          error: function (err) {
            // Khôi phục nút bấm nếu lỗi
            btnCreate.disabled = false;
            btnCreate.innerHTML = originalText;

            // Nếu lỗi trùng mã (Duplicate entry), gợi ý thử lại
            if (err.responseText && err.responseText.includes("Duplicate")) {
              alert(
                "Hệ thống vừa phát sinh đơn hàng mới trùng mã. Vui lòng thử lại!"
              );
            } else {
              alert(
                "Lỗi tạo đơn hàng: " +
                  (err.responseJSON?.message || "Lỗi server")
              );
            }
          },
        });
      },
      error: function () {
        alert("Không thể lấy dữ liệu đơn hàng cũ để sinh mã mới!");
        btnCreate.disabled = false;
        btnCreate.innerHTML = originalText;
      },
    });
  };

  // ==========================================
  // 7. CHỨC NĂNG: CẬP NHẬT TRẠNG THÁI & XÓA
  // ==========================================
  window.openUpdateStatusModal = function (maHD, currentStatus) {
    // Có thể cần map lại status từ text sang value nếu cần
    $("#updateOrderId").val(maHD);
    $("#newStatus").val(currentStatus); // Đảm bảo value option khớp với DB
    openModal("updateStatusModal");
  };

  window.saveOrderStatus = function () {
    const maHD = $("#updateOrderId").val();
    const newStatus = $("#newStatus").val();
    const note = $("#statusNote").val();

    if (!newStatus) {
      alert("Vui lòng chọn trạng thái");
      return;
    }

    $.ajax({
      url: `${API_URL}/${maHD}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({
        TrangThai: newStatus,
        GhiChu: note, // Nếu backend hỗ trợ update ghi chú
      }),
      success: function () {
        alert("Cập nhật trạng thái thành công!");
        closeModal("updateStatusModal");
        fetchData(currentPage);
        updateStats();
      },
      error: function (err) {
        alert("Lỗi cập nhật: " + err.responseJSON?.message);
      },
    });
  };

  window.deleteOrder = function (maHD) {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa đơn hàng ${maHD}? Hành động này không thể hoàn tác.`
      )
    ) {
      $.ajax({
        url: `${API_URL}/${maHD}`,
        method: "DELETE",
        success: function () {
          alert("Đã xóa đơn hàng!");
          fetchData(currentPage);
          updateStats();
        },
        error: function (err) {
          alert(
            "Không thể xóa đơn hàng: " +
              (err.responseJSON?.message || "Lỗi server")
          );
        },
      });
    }
  };

  // ==========================================
  // 8. HELPERS & EXCEL
  // ==========================================

  window.exportToExcel = async function () {
    if (!confirm("Xuất danh sách đơn hàng ra Excel?")) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn chưa đăng nhập!");
      return;
    }

    // Hiển thị trạng thái đang tải (UX)
    const btn = $(".page-actions .btn-primary"); // Hoặc ID nút của bạn
    const oldText = btn.html();
    btn.html('<i class="fas fa-spinner fa-spin"></i> Đang tải...');
    btn.prop("disabled", true);

    try {
      // Gọi API với Header chứa Token
      // Lưu ý: Đảm bảo đường dẫn API này đúng với Backend của bạn
      const response = await fetch(`${API_URL}/Export/Excel`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        alert("Phiên đăng nhập hết hạn!");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) throw new Error("Lỗi Server khi xuất file");

      // Xử lý File Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Đặt tên file kèm ngày giờ
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `DanhSach_DonHang_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      alert("Không thể xuất file. Vui lòng thử lại sau!");
    } finally {
      // Trả lại nút bấm bình thường
      btn.html(oldText);
      btn.prop("disabled", false);
    }
  };
  window.openModal = function (id) {
    $("#" + id).css("display", "flex");
  };
  window.closeModal = function (id) {
    $("#" + id).css("display", "none");
    if (id === "createOrderModal") {
      $("#createOrderForm")[0].reset();
      orderItems = [];
      updateOrderItemsTable();
    }
  };

  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  }

  // Helpers map status/payment sang class CSS
  function getStatusText(s) {
    const map = {
      ChoXuLy: "Chờ xử lý",
      HoanThanh: "Hoàn thành",
      DaHuy: "Đã hủy",
      DangGiao: "Đang giao",
    };
    return map[s] || s;
  }
  function getStatusClass(s) {
    const map = {
      ChoXuLy: "pending",
      HoanThanh: "completed",
      DaHuy: "cancelled",
      DangGiao: "shipping",
    };
    return map[s] || "pending";
  }
  function getPaymentText(p) {
    const map = {
      TienMat: "Tiền mặt",
      ChuyenKhoan: "Chuyển khoản",
      The: "Thẻ",
    };
    return map[p] || p;
  }
  function getPaymentClass(p) {
    const map = { TienMat: "cash", ChuyenKhoan: "banking", The: "card" };
    return map[p] || "cash";
  }

  // Hàm gọi từ nút "Xử lý tất cả" trên Dashboard
  window.processAllPendingOrders = function () {
    alert(
      "Tính năng này cần Backend hỗ trợ xử lý hàng loạt (Batch Processing). Hiện tại chưa khả dụng."
    );
  };

  window.resetFilters = function () {
    // 1. Reset giá trị của 2 ô select về rỗng
    $("#orderStatusFilter").val("");
    $("#paymentFilter").val("");

    // 2. Xóa ô tìm kiếm (nếu cần)
    $("#orderSearch").val("");

    $("#orderStatusFilter").trigger("change");
  };
});
