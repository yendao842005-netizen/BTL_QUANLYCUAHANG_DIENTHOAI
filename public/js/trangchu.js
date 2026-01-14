$(document).ready(function () {
  const API_URL = "/api/SanPhams";

  // ĐƯỜNG DẪN ẢNH CHUNG
  const BASE_IMG_URL = "img/img trang sp/";

  // Ảnh mặc định
  const DEFAULT_IMG = "https://via.placeholder.com/300?text=No+Image";

  // Gọi API
  loadAllProducts();

  function loadAllProducts() {
      $.ajax({
          url: API_URL,
          method: "GET",
          success: function (products) {
              // 1. "Sản phẩm Giảm giá"
              renderDiscountProducts(products.slice(0, 5));

              // 2. "Món quà ý nghĩa"
              renderSpecialSection("#gift-list", products.slice(5, 9));

              // 3. "Sản phẩm mới ra"
              renderSpecialSection("#new-arrival-list", products.slice(9, 13));

              // 4. "Sản phẩm đã xem"
              renderSpecialSection("#viewed-list", products.slice(13, 17));
          },
          error: function (err) {
              console.error("Lỗi tải dữ liệu:", err);
          },
      });
  }

  // --- HÀM XỬ LÝ ĐƯỜNG DẪN ẢNH ---
  function getImageUrl(filename) {
      if (!filename) return DEFAULT_IMG;
      if (filename.startsWith("http")) return filename;
      return `${BASE_IMG_URL}${filename}`;
  }

  // --- 1. RENDER MỤC GIẢM GIÁ (Sửa nút Mua ngay thành Link) ---
  function renderDiscountProducts(products) {
    const container = $("#list-giam-gia");
    container.empty();

    products.forEach((sp) => {
      // Định dạng giá
      const price = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(sp.GiaBan);

      const fakeOldPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(sp.GiaBan * 1.1);

      const imgSrc = getImageUrl(sp.HinhAnh);

      // Link chi tiết
      const linkChiTiet = `/chitietsp?id=${sp.MaSP}`;

      const html = `
                <div class="sanpham_giamgia1">
                    <div class="anh_sanpham" style="padding: 10px;"> 
                        <a href="${linkChiTiet}" style="text-decoration: none; color: inherit;">
                            <img src="${imgSrc}" alt="${sp.TenSanPham}" 
                                 style="width: 100%; height: 160px; object-fit: contain; display: block; margin: 0 auto;"
                                 onerror="this.src='${DEFAULT_IMG}'">
                            
                            <p class="name_sanpham" 
                               style="margin-top: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 40px; color: #333; font-weight: 500; text-align: center; line-height: 20px;">
                               ${sp.TenSanPham}
                            </p>
                        </a>
                    </div>
                    <div class="thongtin_sp">
                        <div class="soluongban">
                            <p style="color: white; display: flex; justify-content: center; line-height: 22px;">
                                <i class="fa-solid fa-fire" style="color: #F47F26; font-size: 23px; position: absolute; left: 0;"></i> 
                                Đã bán ${Math.floor(Math.random() * 50)}/50 suất
                            </p>
                        </div>
                        <div class="gia_giamgia">
                            <div class="gia">
                                <p><h3 style="font-size: 16px;">${price}</h3></p>
                                <div style="color: #666; font-size: 13px;">
                                    <span style="text-decoration: line-through;padding-right: 5px;">${fakeOldPrice}</span>
                                    <span>-10%</span>
                                </div>
                            </div>
                            <a href="${linkChiTiet}" class="btn" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">Mua ngay</a>
                        </div>
                    </div>
                </div>`;
      container.append(html);
    });
  }

  // --- 2. RENDER CÁC MỤC KHÁC ---
  function renderSpecialSection(containerId, products) {
      const container = $(containerId);
      container.empty();

      products.forEach((sp) => {
          const price = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
          }).format(sp.GiaBan);
          
          const fakeOldPrice = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
          }).format(sp.GiaBan * 1.1);
          
          const discountAmount = new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
          }).format(sp.GiaBan * 0.1);
          
          const imgSrc = getImageUrl(sp.HinhAnh);

          // TẠO LINK CHI TIẾT
          const linkChiTiet = `/chitietsp?id=${sp.MaSP}`;

          const html = `
              <div class="spmr1">
                  <div class="img_spmr1">
                      <div class="img1" style="padding-top: 15px; padding-left: 5px">
                          <a href="${linkChiTiet}">
                              <img src="${imgSrc}" alt="${sp.TenSanPham}" 
                                   style="width: 100%; height: auto; object-fit: contain;"
                                   onerror="this.src='${DEFAULT_IMG}'"> 
                          </a>
                      </div>
                      <div class="img2">
                          <img style="height: 185px; padding-left: 8px; padding-top: 3px;" src="img/img trang chu/ip161.png" alt="">
                      </div>
                  </div>
                  <div class="thongtin_spmr1">
                      <div class="tragop">Trả góp 0%</div>
                      <div class="tt">
                          <p style="margin-bottom: 0; text-decoration: line-through; font-size: 13px; color: #6F7280;">${fakeOldPrice}</p>
                          <h3 style="margin-bottom: 8px; font-size: 18px; color: var(--text-color);">${price}</h3>
                          <p style="margin-top: 0px; color: #059568; font-size: 12px;">Giảm ${discountAmount}</p>
                          
                          <p>
                              <a href="${linkChiTiet}" style="color: var(--text-color); font-weight:bold; text-decoration: none;">
                                  ${sp.TenSanPham}
                              </a>
                          </p>
                      </div>
                      
                      <div class="color-options">
                          <div class="color1"></div><div class="color2"></div><div class="color3"></div>
                      </div>
                      <div class="storage-options">
                          <button class="selected">128GB</button><button>256GB</button>
                      </div>
                  </div>
              </div>
          `;
          container.append(html);
      });
  }
});