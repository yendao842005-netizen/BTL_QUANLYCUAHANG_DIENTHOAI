const main_slider = document.querySelector('.chitietsp');
const slides = document.querySelector('.slide_list');
const img = document.querySelectorAll('.slide_list .img_chitietsp');
const next_btn = document.querySelector('.next_btn');
const pre_btn = document.querySelector('.pre_btn');
let index = 0;
function showSlider (index) {
const width = img[0].clientWidth;
let x = index * width;
slides.style.transform = `translateX(${-x}px)`;
}
// img[0].clientWidth: Lấy chiều rộng của một hình ảnh (giả định tất cả các hình ảnh trong slider có cùng kích thước).
//x: Tính toán khoảng cách mà slider cần di chuyển để hiển thị hình ảnh tại vị trí index.
//slides.style.transform: Di chuyển slider theo chiều ngang bằng cách áp dụng CSS translateX để dịch chuyển theo giá trị tính toán -x (âm để di chuyển sang trái).
next_btn.addEventListener('click', () => {
index = (index + 1) % img.length;
showSlider(index);
});
/*
index = (index + 1) % img.length:
Tăng chỉ số index lên 1.
Nếu chỉ số vượt quá số lượng hình ảnh (img.length), quay lại hình ảnh đầu tiên (vòng lặp).
Gọi showSlider(index) để cập nhật slider với hình ảnh mới.*/
 
pre_btn.addEventListener('click', () => {
index = (index - 1 + img.length) % img.length;
showSlider(index);
});
setInterval(() => {
next_btn.click();
}, 10000);

//js doan bo loc tim kiem gia tien tu --> den
const priceFrom = document.getElementById('price-from');
const priceTo = document.getElementById('price-to');
const errorMessage = document.getElementById('error-message');

// Gán giá trị mặc định


// Xử lý khi người dùng nhập ngoài khoảng
function validateInput(input) {
  const min = parseInt(input.min, 10);
  const max = parseInt(input.max, 10);
  const value = parseInt(input.value, 10);

  if (value < min || value > max) {
    input.style.borderColor = 'red';
    errorMessage.style.display = 'block';
  } else {
    input.style.borderColor = '#ccc';
    errorMessage.style.display = 'none';
  }
}

// Lắng nghe sự kiện "input" cho cả hai trường
priceFrom.addEventListener('input', () => validateInput(priceFrom));
priceTo.addEventListener('input', () => validateInput(priceTo));