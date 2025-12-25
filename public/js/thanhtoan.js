


function addToCart(item) {
    // debugger;
    item.quantity = 1;
    console.log(item.quantity);
    var list;
    if (localStorage.getItem('cart') == null) {
        list = [item];
    } else {
        list = JSON.parse(localStorage.getItem('cart')) || [];
        let ok = true;
        for (let x of list) {
            if (x.id == item.id) {
                x.quantity += 1;
                ok = false;
                break;
            }
        }
        if (ok) {
            list.push(item);
        }
    }
    localStorage.setItem('cart', JSON.stringify(list));
    
    alert("Đã thêm giỏ hàng thành công!");
    LoadData();
}
var list = JSON.parse(localStorage.getItem('cart'));
function LoadData() {
    var str = "";
    var t = 0;
    var sl = 0;
    for (x of list) {
        t += x.price * x.quantity;
        sl+=x.quantity;
        str += `<tr>
                                            <td><img width="70px" src="`+ x.image + `" alt=""></td>
                                            <td>`+ x.name + `</td>
                                            <td>x` + x.quantity + `</td>
                                            <td>`+ x.price + `đ</td>
                                        </tr>
                 `;
    }
    document.getElementById("listsp").innerHTML = str;
    $("#spTong").text(t + "đ");
    $("#tTong").text(t + "đ");
    


 
}
function Thanhtoan(){
    let isValid = true;
     // Lấy giá trị các trường nhập
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const tel = document.getElementById("sdt").value.trim();
    const diachi = document.getElementById("diachi").value.trim();

    // Xóa lỗi cũ

    document.getElementById("nameError").innerText = "";
    document.getElementById("emailError").innerText = "";
    document.getElementById("sdtError").innerText = "";
    document.getElementById("diachiError").innerText = "";

    //kiểm tra từng th
    if (email === "" || !email.includes("@")) {
        document.getElementById("emailError").innerText = "Email không hợp lệ.";
        isValid = false;
    }

    if (name === "" ) {
        document.getElementById("nameError").innerText = "Họ tên không hợp lệ.";
        isValid = false;
    }
    if (tel === "" || tel.length > 10 || !/^0\d{9}$/.test(tel)) {
        document.getElementById("sdtError").innerText = "Sdt không hợp lệ.";
        isValid = false;
    }
    if (diachi === "" ) {
        document.getElementById("diachiError").innerText = "Địa chỉ không hợp lệ.";
        isValid = false;
    }
    var cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Giỏ hàng trống! Vui lòng thêm sản phẩm vào giỏ hàng.");
        return; 
    }
    else if (isValid) {
        alert("Thanhh toán thành công");
        localStorage.setItem('cart', null);
        location.reload();
        window.location.href="/index.html";
    }

}
LoadData();