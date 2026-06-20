"use server";

import db from "@/lib/db";
import { uploadDbToBlob } from "@/lib/db-persistence";
import { reloadDb } from "@/lib/db";

export async function createOrder(data: any) {
  try {
    const orderId = `ord-${Date.now()}`;
    const { 
      fullName, phone, deliveryType, province, city, 
      address, postalCode, company, observations, 
      subtotal, shipping, total, items 
    } = data;

    db.prepare(`
      INSERT INTO Orders (id, fullName, phone, deliveryType, province, city, address, postalCode, company, observations, subtotal, shipping, total, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, fullName, phone, deliveryType, province, city, address, postalCode, company, observations, subtotal, shipping, total, 'PENDIENTE');

    const insertItem = db.prepare(`
      INSERT INTO OrderItems (id, orderId, productId, name, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const itemId = `oi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      insertItem.run(itemId, orderId, item.id, item.name, item.price, item.quantity);
    }

    await uploadDbToBlob(); await reloadDb();
    return { success: true, orderId };
  } catch (error: any) {
    console.error("Error creating order:", error);
    return { success: false, error: error.message };
  }
}

export async function getOrders() {
  try {
    const orders = db.prepare("SELECT * FROM Orders ORDER BY createdAt DESC").all() as any[];
    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    db.prepare("UPDATE Orders SET status = ? WHERE id = ?").run(status, orderId);
    await uploadDbToBlob(); await reloadDb();
    return { success: true };
  } catch (error: any) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
}
