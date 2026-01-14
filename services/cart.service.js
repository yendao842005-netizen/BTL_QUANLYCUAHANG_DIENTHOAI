// services/cart.service.js
import { CartRepository } from "../repositories/cart.repository.js";
import { CartItemDTO } from "../dtos/cart/cart.dto.js"; // Import DTO
import { logger } from "../config/logger.js";

export const CartService = {
    getCart: async (userId) => {
        logger.info(`Service: Getting cart for User ${userId}`);
        const items = await CartRepository.getCartByUserId(userId);
        
        // [FIX LỖI MAP] Kiểm tra nếu items không tồn tại thì trả về mảng rỗng ngay
        if (!items) {
            return [];
        }
    
        return items.map(item => new CartItemDTO(item));
      },

  addToCart: async (userId, productId, quantity) => {
    logger.info(`Service: Adding to cart User ${userId} - SP ${productId}`);
    // [Có thể thêm logic check tồn kho ở đây nếu muốn]
    await CartRepository.upsertItem(userId, productId, quantity);
    return { message: "Added to cart successfully" };
  },

  updateItem: async (userId, productId, quantity) => {
    logger.info(`Service: Updating cart item User ${userId} - SP ${productId}`);
    if (quantity <= 0) {
      await CartRepository.removeItem(userId, productId);
    } else {
      await CartRepository.updateQuantity(userId, productId, quantity);
    }
    return { message: "Cart updated successfully" };
  },

  removeItem: async (userId, productId) => {
    logger.info(`Service: Removing cart item User ${userId} - SP ${productId}`);
    await CartRepository.removeItem(userId, productId);
    return { message: "Item removed successfully" };
  },

  clearCart: async (userId) => {
    logger.info(`Service: Clearing cart for User ${userId}`);
    await CartRepository.clearCart(userId);
    return { message: "Cart cleared successfully" };
  }
};