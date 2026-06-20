import db from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      deliveryType,
      province,
      city,
      address,
      postalCode,
      company,
      observations,
      subtotal,
      shipping = 0,
      total,
      items = [],
    } = body;

    const orderId = randomUUID();

    const insertOrder = db.prepare(`
      INSERT INTO Orders (id, fullName, phone, deliveryType, province, city, address, postalCode, company, observations, subtotal, shipping, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertOrder.run(orderId, fullName, phone, deliveryType, province, city, address, postalCode, company, observations, subtotal, shipping, total);

    const insertItem = db.prepare(`
      INSERT INTO OrderItems (id, orderId, productId, name, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const it of items) {
      const itemId = randomUUID();
      insertItem.run(itemId, orderId, it.id || null, it.name, it.price, it.quantity);
    }

    return new Response(JSON.stringify({ orderId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Order API error', err);
    return new Response(JSON.stringify({ error: 'failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
