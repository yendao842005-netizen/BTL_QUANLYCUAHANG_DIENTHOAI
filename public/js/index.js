// var dsanh=
// [
//    "/assets/img/img trang chu/muaf le hoi.png",
//    "/assets/img/img trang chu/desk_header_c7ad8b92b8.png"
// ]   
// stt=1
// function left()
// {
//     stt--;
//     if(stt<0) stt=dsanh.length-1;
//     var anh=document.getElementById("img-jpg");
//     anh.src=dsanh[stt];
// }
// function right()
// {
//     stt++;
//     if(stt > dsanh.length - 1) stt=0;
//     var anh=document.getElementById("img-jpg");
//     anh.src=dsanh[stt];
// }




// var dsanh1=
// [
//    "/assets/img/img trang chu/iphone16.png",
//    "/assets/img/img trang chu/sámung.png",
//    "/assets/img/img trang chu/dt.png",
//    "/assets/img/img trang chu/dt (3).png",
//    "/assets/img/img trang chu/dt (2).png",
// ]   
// stt1=1
// stt2=2
// function left1()
// {
//     stt1--;
//     stt2--;
//     if(stt1<0) stt1=dsanh1.length-1;
//     if(stt2<0) stt2=dsanh1.length-1;
//     var anh=document.getElementById("img_iphone");
//     var anh1=document.getElementById("img_samsung");
//     anh.src=dsanh1[stt1];
//     anh1.src=dsanh1[stt2];
// }
// function right1()
// {
//     stt1++;
//     stt2++;
//     if(stt1 > dsanh1.length - 1) stt1=0;
//     if(stt2 > dsanh1.length - 1) stt2=0;
//     var anh=document.getElementById("img_iphone");
//     var anh1=document.getElementById("img_samsung");
//     anh.src=dsanh1[stt1];
//     anh1.src=dsanh1[stt2];
// }
// // js cho language
// Danh sách ảnh
const dsanh = [
    "/assets/img/img trang chu/muaf le hoi.png",
    "/assets/img/img trang chu/desk_header_c7ad8b92b8.png"
];

const dsanh1 = [
    "/assets/img/img trang chu/iphone16.png",
    "/assets/img/img trang chu/sámung.png",
    "/assets/img/img trang chu/dt.png",
    "/assets/img/img trang chu/dt (3).png",
    "/assets/img/img trang chu/dt (2).png",
];

let stt = 0;
let stt1 = 0;
let stt2 = 1;

/**
 * Hàm thực hiện hiệu ứng trượt cho 1 phần tử
 * @param {string} id - ID của thẻ img
 * @param {string} newSrc - Link ảnh mới
 * @param {string} direction - 'next' hoặc 'prev'
 */
function applySlideEffect(id, newSrc, direction) {
    const el = document.getElementById(id);
    if (!el) return;

    // 1. Xác định class dựa trên hướng bấm
    const outClass = (direction === 'next') ? 'slide-out-left' : 'slide-out-right';
    const inClass = (direction === 'next') ? 'slide-in-right' : 'slide-in-left';

    // 2. Chạy hiệu ứng trượt ra
    el.classList.remove('slide-in-left', 'slide-in-right', 'slide-out-left', 'slide-out-right');
    el.classList.add(outClass);

    // 3. Đợi ảnh cũ trượt ra (0.2s) rồi đổi src và trượt vào
    setTimeout(() => {
        el.src = newSrc;
        el.classList.remove(outClass);
        el.classList.add(inClass);
    }, 200); 
}

// --- Điều khiển Banner chính ---
function right() {
    stt = (stt + 1) % dsanh.length;
    applySlideEffect("img-jpg", dsanh[stt], 'next');
}

function left() {
    stt = (stt - 1 + dsanh.length) % dsanh.length;
    applySlideEffect("img-jpg", dsanh[stt], 'prev');
}

// --- Điều khiển Slider phụ (iPhone & Samsung) ---
function right1() {
    stt1 = (stt1 + 1) % dsanh1.length;
    stt2 = (stt1 + 1) % dsanh1.length; // Luôn hiển thị ảnh kế tiếp cho máy thứ 2
    
    applySlideEffect("img_iphone", dsanh1[stt1], 'next');
    applySlideEffect("img_samsung", dsanh1[stt2], 'next');
}

function left1() {
    stt1 = (stt1 - 1 + dsanh1.length) % dsanh1.length;
    stt2 = (stt1 + 1) % dsanh1.length;
    
    applySlideEffect("img_iphone", dsanh1[stt1], 'prev');
    applySlideEffect("img_samsung", dsanh1[stt2], 'prev');
}

// Tự động chạy banner chính mỗi 10 giây (như mẫu bạn gửi)
setInterval(right, 10000);