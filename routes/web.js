import express from "express";

const router = express.Router();

router.get("/sanpham", (req, res) => {
  res.render('sanpham');
});



export default router;
