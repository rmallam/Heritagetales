import { sql } from '@vercel/postgres';
import AdminOrdersTable from '@/components/AdminOrdersTable';

export const dynamic = 'force-dynamic';

type Order = {
  id: number;
  user_id: string;
  stripe_session_id: string;
  amount_total: number;
  status: string;
  items_json: string;
  created_at: Date;
  carrier?: string;
  tracking_number?: string;
  shipping_address?: string;
};

export default async function AdminOrdersPage() {
  let orders: Order[] = [];
  type Product = { id: number, title: string, image_url: string, price: number };
  let allItems: Product[] = [];
  try {
    const { rows } = await sql<Order>`SELECT * FROM orders ORDER BY created_at DESC`;
    orders = rows;
    const itemsRes = await sql<Product>`SELECT id, title, image_url, price FROM items`;
    allItems = itemsRes.rows;
  } catch (err) {
    console.error('Error fetching orders:', err);
  }

  const itemsDict = allItems.reduce((acc: Record<number, Product>, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Order Management</h1>
        <p className="text-neutral-500 mt-2">View, filter, and fulfill all customer orders.</p>
      </div>
      <AdminOrdersTable orders={orders} itemsDict={itemsDict} />
    </div>
  );
}
