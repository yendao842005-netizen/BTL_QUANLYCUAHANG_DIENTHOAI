const main_slider = document.querySelector('.chitietsp');
const slides = document.querySelector('.slide_list');
const img = document.querySelectorAll('.slide_list .img_chitietsp');
const next_btn = document.querySelector('.next_btn');
const pre_btn = document.querySelector('.pre_btn');
const optionButtons = document.querySelectorAll('.thaydoitheomau .option'); // Lấy tất cả các nút "option"
let index = 0;
function showSlider(index) {
    const width = img[0].clientWidth;
    let x = index * width;
    slides.style.transform = `translateX(${-x}px)`;
}
next_btn.addEventListener('click', () => {
    index = (index + 1) % img.length;
    showSlider(index);
});
pre_btn.addEventListener('click', () => {
    index = (index - 1 + img.length) % img.length;
    showSlider(index);
});
setInterval(() => {
    next_btn.click();
}, 10000);
// Xử lý khi nhấn vào các nút "option"
// Xử lý khi nhấn vào các nút "option"
optionButtons.forEach((button, btnIndex) => {
    button.addEventListener('click', () => {
        index = (btnIndex ) % img.length; // Cập nhật chỉ số slide hiện tại theo nút được nhấn
        showSlider(index); // Hiển thị slide tương ứng
    });
});

