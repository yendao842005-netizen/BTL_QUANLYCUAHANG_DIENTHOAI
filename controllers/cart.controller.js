// controllers/cart.controller.js
import { CartService } from "../services/cart.service.js";
import { logger } from "../config/logger.js";

export const CartController = {
  // GET /api/Cart
  get: async (req, res) => {
    // Lấy ID từ token (đã qua middleware authenticate)
    const userId = req.user.MaTK || req.user.id; 
    logger.info(`Controller: GET /Cart for User ${userId}`);

    try {
      const cartItems = await CartService.getCart(userId);
      res.json({ data: cartItems }); // Trả về object có key data cho đồng bộ
    } catch (err) {
      logger.error(`Controller Error: get cart failed`, err);
      res.status(500).json({ message: "Lỗi lấy giỏ hàng" });
    }
  },

  // POST /api/Cart/Add
  add: async (req, res) => {
    const userId = req.user.MaTK || req.user.id;
    logger.info(`Controller: POST /Cart/Add for User ${userId}`);

    try {
      // Dữ liệu đã được validate qua Zod middleware ở route
      const { product_id, quantity } = req.body;
      const result = await CartService.addToCart(userId, product_id, quantity);
      res.status(200).json(result);
    } catch (err) {
      logger.error(`Controller Error: add to cart failed`, err);
      res.status(500).json({ message: "Lỗi thêm vào giỏ hàng" });
    }
  },

  // PUT /api/Cart/Update
  update: async (req, res) => {
    const userId = req.user.MaTK || req.user.id;
    logger.info(`Controller: PUT /Cart/Update`);

    try {
      const { product_id, quantity } = req.body;
      const result = await CartService.updateItem(userId, product_id, quantity);
      res.status(200).json(result);
    } catch (err) {
      logger.error(`Controller Error: update cart failed`, err);
      res.status(500).json({ message: "Lỗi cập nhật giỏ hàng" });
    }
  },

  // DELETE /api/Cart/Remove/:id
  remove: async (req, res) => {
    const userId = req.user.MaTK || req.user.id;
    const productId = req.params.id;
    logger.info(`Controller: DELETE /Cart/Remove/${productId}`);

    try {
      const result = await CartService.removeItem(userId, productId);
      res.status(200).json(result);
    } catch (err) {
      logger.error(`Controller Error: remove item failed`, err);
      res.status(500).json({ message: "Lỗi xóa sản phẩm" });
    }
  },

  // DELETE /api/Cart/Clear
  clear: async (req, res) => {
    const userId = req.user.MaTK || req.user.id;
    logger.info(`Controller: DELETE /Cart/Clear`);

    try {
      const result = await CartService.clearCart(userId);
      res.status(200).json(result);
    } catch (err) {
      logger.error(`Controller Error: clear cart failed`, err);
      res.status(500).json({ message: "Lỗi xóa giỏ hàng" });
    }
  }
};