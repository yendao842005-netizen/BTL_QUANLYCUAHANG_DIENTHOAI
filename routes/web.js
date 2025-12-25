import express from "express";

const router = express.Router();

router.get("/sanpham", (req, res) => {
  res.render('sanpham');
});


router.get("/trangchu", (req, res) => {
  res.render('trangchu');
});

router.get("/dangki", (req, res) => {
  res.render('dangki');
});

router.get("/dangnhap", (req, res) => {
  res.render('dangnhap');
});

router.get("/giohang", (req, res) => {
  res.render('giohang');
});
  router.get("/chitietsp", (req, res) => {
  res.render('chitietsp');
});

router.get("/thanhtoan", (req, res) => {
  res.render('thanhtoan');
});
export default router;
