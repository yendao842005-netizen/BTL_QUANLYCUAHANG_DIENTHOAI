$(document).ready(function () {
    // 1. Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        initInterface();
        return;
    }

    // 2. Gọi API lấy chi tiết sản phẩm
    $.ajax({
        url: `/api/SanPhams/${productId}`,
        method: 'GET',
        success: function (product) {
            if (product) {
                fillProductData(product);
                
                // Sau khi có thông tin sản phẩm, mới gọi hàm tìm sản phẩm tương tự
                loadRelatedProducts(product.TenSanPham, product.MaSP);
            }
        },
        error: function (err) {
            console.error("Lỗi tải chi tiết:", err);
            initInterface();
        }
    });
});

function fillProductData(p) {
    // --- 1. Điền thông tin cơ bản ---
    if (p.TenSanPham) {
        $('#breadcrumb-name').text(p.TenSanPham);
        $('#product-name').text(p.TenSanPham);
        document.title = p.TenSanPham;
    }

    if (p.MaSP) {
        $('#product-code').html(`Mã: <strong>${p.MaSP}</strong>`);
    }

    if (p.GiaBan) {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.GiaBan);
        $('#product-price').text(`Giá: ${price}`);
    }

    if (p.SoLuongTon !== undefined) {
        if(p.SoLuongTon > 0){
             $('#product-stock').text(`Tồn kho: ${p.SoLuongTon} sản phẩm`).css('color', 'green');
        } else {
             $('#product-stock').text(`Tạm hết hàng`).css('color', 'red');
             // Nếu hết hàng thì disable nút mua luôn
             $('#btn-buy-now').prop('disabled', true).css('background', '#ccc').text('Hết hàng');
        }
    }

    // --- 2. Xử lý Ảnh ---
    const basePath = "img/img trang sp/";
    if (p.HinhAnh) {
        const fullImgPath = p.HinhAnh.startsWith('http') ? p.HinhAnh : (basePath + p.HinhAnh);
        const sliderContainer = $('#slider-container');
        sliderContainer.empty();
        
        // Nhân bản ảnh 4 lần để slider chạy (demo)
        for(let i=0; i<4; i++){
            sliderContainer.append(`<img class="img_chitietsp" src="${fullImgPath}" alt="${p.TenSanPham}" onerror="this.src='img/no-image.png'">`);
        }
    }

    // --- 3. Cập nhật nút Mua (QUAN TRỌNG: ĐÃ SỬA ĐOẠN NÀY) ---
    const btnBuy = $('#btn-buy-now');
    if(btnBuy.length > 0) {
        // Clone để xóa các event cũ nếu có
        btnBuy.replaceWith(btnBuy.clone());
        
        // Gán sự kiện click mới
        $('#btn-buy-now').on('click', function() {
            if (typeof addToCart === "function") {
                // SỬA LẠI: Chỉ truyền ID và Số lượng (1)
                // Backend sẽ tự lấy giá, tên, ảnh từ DB dựa trên ID này
                addToCart(p.MaSP, 1); 
            } else {
                alert("Lỗi: Không tìm thấy chức năng giỏ hàng (kiểm tra file giohang.js)");
            }
        });
    }

    // Khởi động giao diện (Slider, button chọn màu...)
    initInterface();
}

// --- HÀM TẢI SẢN PHẨM TƯƠNG TỰ THEO TÊN (GIỮ NGUYÊN) ---
function loadRelatedProducts(currentName, currentId) {
    if (!currentName) return;

    // 1. Lấy từ khóa (VD: "iPhone")
    const brandKeyword = currentName.split(' ')[0]; 

    $.ajax({
        // Lấy 10 sản phẩm để lọc
        url: `/api/SanPhams/SearchAdvanced?ten=${brandKeyword}&page=1`, 
        method: 'GET',
        success: function(response) {
            let products = response.data || response || [];
            
            // 2. Lọc bỏ sản phẩm đang xem
            products = products.filter(p => String(p.MaSP) !== String(currentId));

            // 3. Lấy đúng 5 sản phẩm
            products = products.slice(0, 5);

            const container = $('#similar-products-list');
            container.empty();

            if (products.length === 0) {
                container.html('<p style="padding: 10px; width:100%; text-align:center;">Không có sản phẩm tương tự.</p>');
                return;
            }

            products.forEach(sp => {
                const imgSrc = sp.HinhAnh ? (sp.HinhAnh.startsWith('http') ? sp.HinhAnh : `img/img trang sp/${sp.HinhAnh}`) : 'img/no-image.png';
                const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.GiaBan);
                const fakeOldPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(sp.GiaBan * 1.1);
                const detailLink = `/chitietsp?id=${sp.MaSP}`;

                const html = `
                <div class="spmr1" style="width: 19%; min-width: 180px; background: white; border-radius: 8px; border: 1px solid #eee; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="img_spmr1" style="position: relative; margin-bottom: 10px;">
                        <div class="img1" style="text-align: center; z-index: 2; position: relative;">
                            <a href="${detailLink}">
                                <img src="${imgSrc}" style="width: 100%; height: 160px; object-fit: contain;" onerror="this.src='img/no-image.png'">
                            </a>
                        </div>
                        <div class="img2" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; opacity: 0.1;">
                             <img src="img/img trang chu/ip161.png" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
                        </div>
                    </div>

                    <div class="thongtin_spmr1">
                        <div class="tragop" style="font-size: 10px; background: #f1f1f1; display: inline-block; padding: 2px 6px; border-radius: 4px; margin-bottom: 8px; color: #333;">Trả góp 0%</div>
                        <div class="tt">
                            <p style="margin-bottom: 2px; text-decoration: line-through; font-size: 12px; color: #999;">${fakeOldPrice}</p>
                            <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #d70018;">${price}</h3>
                            <p style="margin: 0 0 8px 0; font-size: 11px; color: #059568; border: 1px solid #059568; display: inline-block; padding: 1px 4px; border-radius: 2px;">Giảm ngay 10%</p>
                            <h3 style="font-size: 14px; line-height: 1.4; height: 40px; overflow: hidden; margin-bottom: 10px;">
                                <a href="${detailLink}" style="color: #333; text-decoration: none; font-weight: 600;">
                                    ${sp.TenSanPham}
                                </a>
                            </h3>
                        </div>
                         <div class="color-options" style="display: flex; gap: 5px; margin-bottom: 8px;">
                            <div style="width: 15px; height: 15px; background: #ddd; border-radius: 50%;"></div>
                            <div style="width: 15px; height: 15px; background: #333; border-radius: 50%;"></div>
                            <div style="width: 15px; height: 15px; background: #f5cd4b; border-radius: 50%;"></div>
                        </div>
                        <div class="storage-options" style="display: flex; gap: 5px;">
                            <span style="border: 1px solid #ddd; padding: 2px 5px; font-size: 10px; border-radius: 3px; color: #666;">256GB</span>
                        </div>
                    </div>
                </div>`;
                
                container.append(html);
            });
        },
        error: function(err) {
            console.error("Lỗi tải sản phẩm tương tự", err);
        }
    });
}

// --- LOGIC GIAO DIỆN CŨ (GIỮ NGUYÊN) ---
function initInterface() {
  initSlider();
  initOptionButtons();
}

function initSlider() {
  const slides = document.querySelector('.slide_list');
  const img = document.querySelectorAll('.slide_list .img_chitietsp');
  const next_btn = document.querySelector('.next_btn');
  const pre_btn = document.querySelector('.pre_btn');
  
  if (!slides || img.length === 0) return;

  let index = 0;
  
  function showSlider(idx) {
      if(img[0]){
        const width = img[0].clientWidth;
        slides.style.transform = `translateX(${-idx * width}px)`;
      }
  }

  // Clone node để xóa event cũ nếu hàm này bị gọi nhiều lần
  if(next_btn) {
      const newNext = next_btn.cloneNode(true);
      next_btn.parentNode.replaceChild(newNext, next_btn);
      newNext.addEventListener('click', () => {
          index++;
          if (index >= img.length) index = 0;
          showSlider(index);
      });
  }

  if(pre_btn) {
      const newPre = pre_btn.cloneNode(true);
      pre_btn.parentNode.replaceChild(newPre, pre_btn);
      newPre.addEventListener('click', () => {
          index--;
          if (index < 0) index = img.length - 1;
          showSlider(index);
      });
  }
}

function initOptionButtons() {
  const optionButtons = document.querySelectorAll('.option'); 
  optionButtons.forEach((button) => {
      button.onclick = function() {
          const siblings = this.parentElement.children;
          for (let sibling of siblings) {
              sibling.classList.remove('selected');
              sibling.style.backgroundColor = ""; 
              sibling.style.color = "";
          }
          this.classList.add('selected');
          this.style.backgroundColor = "#000";
          this.style.color = "#fff";
      };
  });
}