// function addToCart(item) {
//     // debugger;
//     updateCartIcon();
//     item.quantity = 1;
//     console.log(item.quantity);
//     var list;
//     if (localStorage.getItem('cart') == null) {
//         list = [item];
//     } else {
//         list = JSON.parse(localStorage.getItem('cart')) || [];
//         let ok = true;
//         for (let x of list) {
//             if (x.id == item.id) {
//                 x.quantity += 1;
//                 ok = false;
//                 break;
//             }
//         }
//         if (ok) {
//             list.push(item);
//         }
//     }
//     localStorage.setItem('cart', JSON.stringify(list));

//     alert("Đã thêm giỏ hàng thành công!");
//     LoadData();
// }
// var list = JSON.parse(localStorage.getItem('cart'));
// function LoadData() {
// //Tính toán tổng số lượng để hiện lên icon Header
//    updateCartIcon();

//     var str = "";
//     var t = 0;
//     for (x of list) {
//         t += x.price * x.quantity;
//         str += `<tr>
//                                     <td style="display: flex;align-items: center;" ><img 
//                                             src="`+ x.image + `" alt="iPhone">
//                                         `+ x.name + `
//                                     </td>
//                                     <td></td>
//                                     <td>
//                                         `+ x.price + `
//                                     </td>
//                                     <td>
//                                         <button onclick="Giam(`+ x.id + `)" style="margin-right: 0;border: none; background-color: #F3F4F6;cursor: pointer;">-</button>
//                                         <input id="q_`+ Number(x.id) + `" onchange="updateQuantity(` + x.id + `)" style="margin-right: 0;border: none; background-color: #F3F4F6;cursor: pointer;width: 30px;text-align: center;" type="text" value="` + x.quantity + `"  class="txtbox-count">
//                                         <button onclick="Tang(`+ x.id + `)" style="margin-right: 0;border: none; background-color: #F3F4F6;cursor: pointer;">+</button>

//                                     </td>

//                                     <td>`+ (x.price * x.quantity) + `</td>

//                                     <td>
//                                         <button onclick="Xoa(`+ x.id + `)" style="border: none;cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
//                                     </td>
//                                 </tr>
//                  `;
//     }
//     document.getElementById("listCart").innerHTML = str;
//     $("#spTong").text(t + "đ");
//     $("#tTong").text(t + "đ");


// }
// function XoaCart() {
//     if (confirm("Bạn muốn xóa tất cả sản phẩm khỏi giỏ hàng!")) {
//         localStorage.setItem('cart', null);
//         location.reload();
//     }
// }
// function Xoa(id) {
//     if (confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng!")) {
//         var index = list.findIndex(x => x.id == id);
//         if (index >= 0) {
//             list.splice(index, 1);
//         }
//         LoadData();
//     }
// }
// function updateCart() {
//     localStorage.setItem('cart', JSON.stringify(list));
//     alert("Đã cập nhật thông tin giỏ hàng thành công!");
// }
// function Tang(id) {
//     var index = list.findIndex(x => x.id == id);
//     if (index >= 0 ) {
//         list[index].quantity += 1;
//     }
//     LoadData();
// }
// function Giam(id) {
//     var index = list.findIndex(x => x.id == id);
//     if (index >= 0 && list[index].quantity >= 1) {
//         list[index].quantity -= 1;
//     }
//     LoadData();
// }
// function updateQuantity(id) {
//     var quantity = Number($('#q_' + id).val());
//     var index = list.findIndex(x => x.id == id);
//     if (index >= 0 && list[index].quantity >= 1) {
//         list[index].quantity = quantity;
//     }
//     LoadData();
// }
// function ThanhToan() {
//     const isLoggedIn = localStorage.getItem("isLoggedIn");
//     if(isLoggedIn){
        
//         window.location.href = "/thanhtoan";
        
//     }
//     else{
//         alert("Chưa đăng nhập.Vui lòng đăng nhập để thanh toán!");
//         window.location.href = "/dangnhap";
        
//     }
//     // window.location.href = "/thanhtoan";
// }
// function Sanpham() {
//     window.location.href = "/sanpham";
// }
// //Hàm cập nhật số lượng trên icon Header (Class .notice)
// function updateCartIcon() {
//     var totalQty = 0;
//     for (let x of list) {
//         totalQty += x.quantity;
//     }
    
//     // Tìm thẻ hiển thị số trên icon giỏ hàng
//     var noticeElement = document.querySelector(".notice");
//     if (noticeElement) {
//         noticeElement.innerText = totalQty;
//     }
// }

// LoadData();




// --- 1. KHỞI TẠO DỮ LIỆU TOÀN CỤC ---
// Lấy dữ liệu ngay từ đầu, thêm || [] để tránh lỗi null nếu giỏ hàng trống
var list = JSON.parse(localStorage.getItem('cart')) || [];

$(document).ready(function () {
    // Cập nhật icon ngay khi load trang bất kỳ
    updateCartIcon();
    // Vẽ bảng nếu đang ở trang giỏ hàng
    LoadData();
});

// --- 2. HÀM ADD TO CART ĐÃ SỬA ---
function addToCart(item) {
    // Đảm bảo item có số lượng mặc định
    item.quantity = 1;
    
    // Kiểm tra xem trong list global đã có sản phẩm chưa
    var index = list.findIndex(x => x.id == item.id);
    
    if (index >= 0) {
        // Nếu có rồi thì tăng số lượng
        list[index].quantity += 1;
    } else {
        // Nếu chưa có thì thêm mới
        list.push(item);
    }

    // Lưu vào LocalStorage
    localStorage.setItem('cart', JSON.stringify(list));

    alert("Đã thêm giỏ hàng thành công!");
    
    // Cập nhật lại Icon ngay lập tức
    updateCartIcon();
    
    // Nếu đang đứng ở trang giỏ hàng thì load lại bảng (không bắt buộc nếu đang ở trang chi tiết)
    LoadData();
}

// --- 3. HÀM LOAD DATA (VẼ BẢNG & UPDATE ICON) ---
function LoadData() {
    // Luôn cập nhật icon header mỗi khi gọi hàm này
    updateCartIcon();

    // KIỂM TRA QUAN TRỌNG: Nếu trang hiện tại không có bảng giỏ hàng (id="listCart")
    // thì dừng lại, không chạy code vẽ bảng để tránh lỗi
    var tableBody = document.getElementById("listCart");
    if (!tableBody) return;

    var str = "";
    var t = 0;
    
    // Kiểm tra list có dữ liệu không trước khi loop
    if (list && list.length > 0) {
        for (let x of list) {
            t += x.price * x.quantity;
            str += `<tr>
                        <td style="display: flex;align-items: center;" >
                            <img src="${x.image}" alt="${x.name}"> ${x.name}
                        </td>
                        <td></td>
                        <td>${formatMoney(x.price)}</td>
                        <td>
                            <button onclick="Giam('${x.id}')" style="margin-right: 0;border: none; background-color: #F3F4F6;cursor: pointer;">-</button>
                            <input id="q_${x.id}" onchange="updateQuantity('${x.id}')" style="margin-right: 0;border: none; background-color: #F3F4F6;cursor: pointer;width: 30px;text-align: center;" type="text" value="${x.quantity}" class="txtbox-count">
                            <button onclick="Tang('${x.id}')" style="margin-right: 0;border: none; background-color: #F3F4F6;cursor: pointer;">+</button>
                        </td>
                        <td>${formatMoney(x.price * x.quantity)}</td>
                        <td>
                            <button onclick="Xoa('${x.id}')" style="border: none;cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>`;
        }
    } else {
        str = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Giỏ hàng trống</td></tr>';
    }

    tableBody.innerHTML = str;
    
    // Cập nhật tổng tiền (Sử dụng jQuery an toàn hơn)
    $("#spTong").text(formatMoney(t));
    $("#tTong").text(formatMoney(t));
}

// --- 4. CÁC HÀM XỬ LÝ SỰ KIỆN ---

function XoaCart() {
    if (confirm("Bạn muốn xóa tất cả sản phẩm khỏi giỏ hàng!")) {
        localStorage.removeItem('cart'); // Dùng removeItem sạch hơn set null
        list = []; // Reset biến toàn cục
        location.reload();
    }
}

function Xoa(id) {
    if (confirm("Bạn muốn xóa sản phẩm này khỏi giỏ hàng!")) {
        var index = list.findIndex(x => x.id == id);
        if (index >= 0) {
            list.splice(index, 1);
            saveCart(); // Lưu lại thay đổi
        }
        LoadData(); // Vẽ lại bảng
    }
}

function updateCart() {
    saveCart();
    alert("Đã cập nhật thông tin giỏ hàng thành công!");
}

function Tang(id) {
    var index = list.findIndex(x => x.id == id);
    if (index >= 0 ) {
        list[index].quantity += 1;
        saveCart(); // Lưu thay đổi
    }
    LoadData();
}

function Giam(id) {
    var index = list.findIndex(x => x.id == id);
    if (index >= 0 && list[index].quantity > 1) { // Chỉ giảm khi > 1
        list[index].quantity -= 1;
        saveCart(); // Lưu thay đổi
    }
    LoadData();
}

function updateQuantity(id) {
    var quantity = Number($('#q_' + id).val());
    var index = list.findIndex(x => x.id == id);
    if (index >= 0 && quantity >= 1) {
        list[index].quantity = quantity;
        saveCart();
    }
    LoadData();
}

function ThanhToan() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    // Kiểm tra giỏ hàng trống trước khi thanh toán
    if (list.length === 0) {
        alert("Giỏ hàng trống, vui lòng mua thêm sản phẩm!");
        return;
    }

    if(isLoggedIn){
        window.location.href = "/thanhtoan";
    } else {
        alert("Chưa đăng nhập. Vui lòng đăng nhập để thanh toán!");
        window.location.href = "/dangnhap";
    }
}

function Sanpham() {
    window.location.href = "/sanpham";
}

// --- 5. CÁC HÀM TIỆN ÍCH ---

// Hàm lưu nhanh vào LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(list));
    updateCartIcon(); // Luôn update icon khi lưu
}

// Hàm tính tổng số lượng hiển thị lên Header
function updateCartIcon() {
    var totalQty = 0;
    if (list) {
        for (let x of list) {
            totalQty += Number(x.quantity); // Đảm bảo cộng số
        }
    }
    
    // Tìm thẻ hiển thị số trên icon giỏ hàng
    var noticeElement = document.querySelector(".notice");
    if (noticeElement) {
        noticeElement.innerText = totalQty;
    }
}

// Hàm định dạng tiền tệ (Ví dụ: 33.000.000 đ)
function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}