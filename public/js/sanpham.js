

// ==========================================
// 1. PHẦN SLIDER (GIỮ NGUYÊN)
// ==========================================
const main_slider = document.querySelector(".chitietsp");
const slides = document.querySelector(".slide_list");
const img = document.querySelectorAll(".slide_list .img_chitietsp");
const next_btn = document.querySelector(".next_btn");
const pre_btn = document.querySelector(".pre_btn");
let index = 0;

function showSlider(index) {
  if (img.length > 0) {
    const width = img[0].clientWidth;
    let x = index * width;
    slides.style.transform = `translateX(${-x}px)`;
  }
}

if (next_btn && pre_btn) {
  next_btn.addEventListener("click", () => {
    index = (index + 1) % img.length;
    showSlider(index);
  });

  pre_btn.addEventListener("click", () => {
    index = (index - 1 + img.length) % img.length;
    showSlider(index);
  });

  setInterval(() => {
    next_btn.click();
  }, 10000);
}

// ==========================================
// 2. PHẦN BỘ LỌC GIÁ (GIỮ NGUYÊN)
// ==========================================
const priceFrom = document.getElementById("price-from");
const priceTo = document.getElementById("price-to");
const errorMessage = document.getElementById("error-message");

function validateInput(input) {
  if (!input) return;
  const min = parseInt(input.min, 10);
  const max = parseInt(input.max, 10);
  const value = parseInt(input.value, 10);

  if (value < min || value > max) {
    input.style.borderColor = "red";
    if (errorMessage) errorMessage.style.display = "block";
  } else {
    input.style.borderColor = "#ccc";
    if (errorMessage) errorMessage.style.display = "none";
  }
}

if (priceFrom)
  priceFrom.addEventListener("input", () => validateInput(priceFrom));
if (priceTo) priceTo.addEventListener("input", () => validateInput(priceTo));

// ==========================================
// 3. PHẦN XỬ LÝ DỮ LIỆU & PHÂN TRANG (LÀM MỚI)
// ==========================================
$(document).ready(function () {
  // --- KHAI BÁO BIẾN TOÀN CỤC ---
  let currentPage = 1; // Trang hiện tại
  let currentKeyword = ""; // Từ khóa tìm kiếm (rỗng = đang xem tất cả)
  let currentSort = ""; // Biến lưu trạng thái sắp xếp
  // --- KHỞI TẠO: Load dữ liệu trang 1 khi mới vào web ---
  fetchData(1);

  // --- SỰ KIỆN TÌM KIẾM ---
  $("#searchBtn").click(function () {
    handleSearch();
  });

  $("#searchInput").keypress(function (event) {
    if (event.which == 13) handleSearch();
  });
  // ==========================================
  // ========================================================
  // 3. XỬ LÝ LỌC NHANH THEO HÃNG (SỬA LỖI MENU)
  // ========================================================

  // A. Bật/Tắt menu khi ấn vào nút "Hãng sản xuất"
  $(".hangsx").click(function (event) {
    event.stopPropagation(); // Ngăn không cho sự kiện lan ra ngoài
    $(".list_hangsx").toggleClass("show"); // Thêm/Xóa class .show để hiện/ẩn menu
  });

  // B. Xử lý khi chọn một hãng
  $(".hangsx_item1").click(function () {
    // 1. Lấy tên hãng
    let brandName = $(this).text().trim();

    // 2. Điền vào ô tìm kiếm
    $("#searchInput").val(brandName);

    // 3. Gọi hàm tìm kiếm
    handleSearch();

    // 4. Đóng menu sau khi chọn xong
    $(".list_hangsx").removeClass("show");

    // 5. Cuộn xuống danh sách
    $("html, body").animate(
      {
        scrollTop: $(".main3_2_listsp").offset().top - 150,
      },
      500
    );
  });
  // ========================================================
  // C. XỬ LÝ SẮP XẾP (MỚI THÊM - GIỮ NGUYÊN HTML)
  // ========================================================

  // 1. Bật/Tắt menu Sắp xếp khi ấn nút "Nổi bật"
  $(".noibat").click(function (event) {
    event.stopPropagation();
    $(".list_hangsx").removeClass("show"); // Đóng menu Hãng nếu đang mở
    $(".list_sx").toggleClass("show"); // Toggle class show để hiện/ẩn menu
  });

  // 2. Xử lý khi chọn mục trong danh sách
  $(".list_sx_item").click(function () {
    // Lấy nội dung chữ (Ví dụ: "Giá cao nhất")
    let text = $(this).text().trim();

    // Map từ tiếng Việt sang từ khóa cho Backend
    if (text === "Giá cao nhất") {
      currentSort = "price_desc";
    } else if (text === "Giá thấp nhất") {
      currentSort = "price_asc";
    } else if (text === "Nổi bật") {
      currentSort = "featured";
    } else {
      currentSort = ""; // Mặc định
    }

    // Cập nhật giao diện nút bấm (Thay chữ Nổi bật bằng chữ vừa chọn)
    $(".noibat").html(
      `${text} <i style="margin-left: 65px;" class="fa-solid fa-angle-down"></i>`
    );

    // Gọi hàm lấy dữ liệu lại (về trang 1)
    fetchData(1);

    // Đóng menu
    $(".list_sx").removeClass("show");
  });
  // C. Đóng menu khi click ra ngoài vùng menu
  $(document).click(function (event) {
    if (!$(event.target).closest(".locnhanh, .noibat").length) {
      $(".list_hangsx").removeClass("show");
      $(".list_sx").removeClass("show");
    }
  });
  // ========================================================
  // ========================================================
  // --- HÀM ĐIỀU PHỐI DỮ LIỆU ---
  // Quyết định gọi API danh sách thường hay API tìm kiếm dựa trên từ khóa
  function fetchData(page) {
    currentPage = page;

    if (currentKeyword === "" && currentSort === "") {
      // Không có từ khóa -> Gọi API Phân trang thường
      getNormalProductList(page);
    } else {
      // Có từ khóa -> Gọi API Tìm kiếm nâng cao
      getSearchProductList(page, currentKeyword, currentSort);
    }
  }

  // Xử lý logic khi bấm nút tìm kiếm
  function handleSearch() {
    let keyword = $("#searchInput").val().trim();

    if (keyword === "") {
      currentKeyword = ""; // Xóa từ khóa
      fetchData(1); // Load lại danh sách gốc
      return;
    }

    currentKeyword = keyword; // Lưu từ khóa
    fetchData(1); // Tìm kiếm luôn bắt đầu từ trang 1
  }

  // --- GỌI API ---

  // 1. API Lấy danh sách mặc định (16 sp/trang)
  function getNormalProductList(page) {
    $.ajax({
        url: `/api/SanPhams/PhanTrang?page=${page}`,
        method: "GET",
        success: function (response) {
            // --- SỬA LẠI ĐOẠN NÀY ---
            // Khi load trang thường, xóa trắng dòng thông báo "Tìm thấy..."
            $(".Sxtheo div:first-child").html("");

            if (response.data && response.data.length > 0) {
                renderProducts(response.data);
                renderPagination(response.pagination);
            } else {
                showNoResult();
            }
        },
        error: function (err) {
            console.error("Lỗi lấy danh sách:", err);
        },
    });
}

  // 2. API Tìm kiếm (Có phân trang)
  function getSearchProductList(page, keyword, sort) {
    // Tạo URL với các tham số
    // Ví dụ: /api/SanPhams/SearchAdvanced?ten=Samsung&sort=price_desc&page=1
    let url = `/api/SanPhams/SearchAdvanced?page=${page}`;

    if (keyword) url += `&ten=${keyword}`;
    if (sort) url += `&sort=${sort}`;

    $.ajax({
      url: url,
      method: "GET",
      success: function (response) {
        if (response.data && response.data.length > 0) {
          renderProducts(response.data);
          renderPagination(response.pagination);

          // Cập nhật dòng thông báo số lượng
          let msg = keyword ? `kết quả cho "${keyword}"` : `kết quả`;
          $(".Sxtheo div:first-child").html(
            `Tìm thấy <b>${response.data.length}</b> ${msg}`
          );
        } else {
          showNoResult();
        }
      },
      error: function (err) {
        console.error("Lỗi:", err);
      },
    });
  }

  // --- HÀM HIỂN THỊ (RENDER) ---

  function showNoResult() {
    // 1. Hiển thị thông báo không có sản phẩm vào khung chứa sản phẩm
    // Lưu ý: Dùng ID #product-list-container để không xóa mất khung phân trang
    $("#product-list-container").html(
        '<p style="text-align:center; width:100%; padding: 20px;">Không tìm thấy sản phẩm nào!</p>'
    );

    // 2. Xóa các nút phân trang (vì không có dữ liệu thì không cần phân trang)
    $(".pagination").empty();

    // 3. --- SỬA LẠI ĐOẠN NÀY ---
    // Cập nhật dòng thông báo kết quả về 0
    // Biến currentKeyword lấy từ scope toàn cục (đã khai báo ở đầu file js)
    if (typeof currentKeyword !== 'undefined' && currentKeyword !== "") {
        $(".Sxtheo div:first-child").html(`Tìm thấy <b>0</b> kết quả cho "${currentKeyword}"`);
    } else {
        $(".Sxtheo div:first-child").html(`Tìm thấy <b>0</b> kết quả`);
    }
}

function renderProducts(products) {
  let htmlContent = '';
  
  products.forEach(sp => {
      // Định dạng tiền tệ
      let giaBan = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.GiaBan);
      // Giả lập giá gốc
      let giaGoc = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.GiaBan * 1.1);

      // Xử lý ảnh (Dùng ảnh mặc định nếu không có trong DB)
      let hinhAnh = sp.HinhAnh ? `img/img trang sp/${sp.HinhAnh}` : 'img/img trang chu/iphone_16_pro_max_bda3030b4b.png';

      // Tạo link chi tiết
      let linkChiTiet = `/chitietsp?id=${sp.MaSP}`;

      // --- SỬA LỖI TẠI ĐÂY ---
      // Thêm style="width: 23%" để chia 4 cột (100% / 4 ~ 25%, trừ hao gap)
      htmlContent += `
       <div class="main3_2_sp" style="width: 23%; box-sizing: border-box;">
          <div class="sp1" style="padding: 6px; height: 100%;">
              <div class="img_sp1">
                  <div class="img_sp1" style="padding-top: 15px; padding-left: 5px; display: flex; justify-content: center;">
                      <a href="${linkChiTiet}">
                          <img style="width: 140px; height: 140px; object-fit: contain;" src="${hinhAnh}" alt="${sp.TenSanPham}">
                      </a>
                  </div>
                  <div class="img_sp2">
                       <img style="height: 180px;padding-left: 13px;padding-top: 3px;" src="img/img trang chu/ip161.png" alt="">
                  </div>
              </div>
              <div class="thongtin_spmr1">
                  <div class="tragop">Trả góp 0%</div>
                  <div class="tt">
                      <p style="margin-bottom: 0; text-decoration: line-through; font-size: 13px; color: #6F7280;">
                          ${giaGoc}
                      </p>
                      <h3 style="margin-bottom: 8px;font-size: 18px; color: var(--text-color);">
                          ${giaBan}
                      </h3>
                      <p style="margin-top: 0px; color: #059568; font-size: 12px;">
                          Giảm ngay 10%
                      </p>
                      <p>
                          <a href="${linkChiTiet}" style="color: var(--text-color);">
                              ${sp.TenSanPham}
                          </a>
                      </p>
                  </div>
                  <div class="color-options">
                      <div class="color1"></div>
                      <div class="color2"></div>
                      <div class="color3"></div>
                  </div>
              </div>
          </div>
      </div>
      `;
  });

  // --- RENDERING VÀO DOM ---
  // 1. Xóa nội dung cũ
  $('.main3_2_listsp').empty(); 
  
  // 2. Lấy container và điền nội dung mới
  let resultContainer = $('.main3_2_listsp').first();
  resultContainer.show();
  resultContainer.html(htmlContent);

  // 3. SET CSS CHO CONTAINER ĐỂ DÀN HÀNG NGANG
  resultContainer.css({
      "display": "flex",              // Bắt buộc dùng Flexbox
      "flex-wrap": "wrap",            // Cho phép xuống dòng
      "justify-content": "flex-start",// Căn trái
      "gap": "15px",                  // Khoảng cách giữa các ô (khoảng 2.5%)
      "width": "100%"
  });
  
  // Đảm bảo class con bên trong hiển thị block để nhận width
  $('.main3_2_sp').css({
       "display": "block" 
  });
}

  // --- HÀM VẼ THANH PHÂN TRANG (PAGINATION) ---
  function renderPagination(pagination) {
    let totalPages = pagination.totalPages;
    let curPage = parseInt(pagination.currentPage);
    let html = "";

    // Nếu chỉ có 1 trang thì không hiện thanh phân trang
    // if (totalPages <= 1) {
    //     $('.pagination').html('');
    //     return;
    // }

    // 1. Nút Previous (<)
    if (curPage > 1) {
      html += `<a href="javascript:void(0)" class="page-link" data-page="${
        curPage - 1
      }">&lt;</a>`;
    } else {
      html += `<a class="disabled" style="color:#ccc; cursor:not-allowed">&lt;</a>`;
    }

    // 2. Các số trang (Logic: Hiện trang đầu, cuối và trang xung quanh hiện tại)
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= curPage - 1 && i <= curPage + 1)
      ) {
        if (i === curPage) {
          // Trang đang active (Màu cam)
          html += `<span><a href="javascript:void(0)" style="background-color: #ff5733; color: #fff; border-color: #ff5733;">${i}</a></span>`;
        } else {
          html += `<a href="javascript:void(0)" class="page-link" data-page="${i}">${i}</a>`;
        }
      } else if (i === curPage - 2 || i === curPage + 2) {
        html += `<span class="dots">...</span>`;
      }
    }

    // 3. Nút Next (>)
    if (curPage < totalPages) {
      html += `<a href="javascript:void(0)" class="page-link" data-page="${
        curPage + 1
      }">&gt;</a>`;
    } else {
      html += `<a class="disabled" style="color:#ccc; cursor:not-allowed">&gt;</a>`;
    }

    // Gắn vào class .pagination trong HTML
    $(".pagination").html(html);

    // Gắn sự kiện click cho các nút vừa tạo
    $(".page-link")
      .unbind("click")
      .click(function () {
        let page = $(this).data("page");
        fetchData(page); // Gọi hàm lấy dữ liệu trang mới

        // Cuộn màn hình lên đầu danh sách sản phẩm
        $("html, body").animate(
          {
            scrollTop: $(".main3").offset().top - 100,
          },
          500
        );
      });
  }
});
