import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import OrderCard from '@/components/OrderCard';

type Order = {
  id: number;
  user_id: string;
  stripe_session_id: string;
  amount_total: number;
  status: string;
  items_json: string;
  created_at: Date;
};

export default async function OrdersPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/');
  }

  let orders: Order[] = [];
  type Product = { id: number, title: string, image_url: string, price: number };
  let allItems: Product[] = [];
  try {
    const { rows } = await sql<Order>`
      SELECT * FROM orders 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
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
    <div className="min-h-screen bg-[#fcfcfc] py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-[#b5955b] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>

        <h1 className="text-4xl font-bold text-[#222222] font-serif tracking-tight mb-2">Your Orders</h1>
        <p className="text-neutral-500 mb-12">View and track your previous purchases from Heritage Tales.</p>

        {orders.length === 0 ? (
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-neutral-300" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No orders found</h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-8">You haven&apos;t placed any orders yet. Explore our premium brassware collection to find your next heirloom.</p>
            <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-neutral-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} itemsDict={itemsDict} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
