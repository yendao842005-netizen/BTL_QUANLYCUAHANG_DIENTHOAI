import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    product_id: z.string({ required_error: "Mã sản phẩm (product_id) là bắt buộc" }),
    quantity: z.number().int().positive("Số lượng phải là số nguyên dương").optional().default(1)
  })
});

export const updateCartSchema = z.object({
  body: z.object({
    product_id: z.string({ required_error: "Mã sản phẩm (product_id) là bắt buộc" }),
    quantity: z.number().int().nonnegative("Số lượng không được âm")
  })
});