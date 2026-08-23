import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';
import { Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

  // Fetch orders for this user
  let orders: Order[] = [];
  try {
    const { rows } = await sql<Order>`
      SELECT * FROM orders 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
    orders = rows;
  } catch (err) {
    console.error('Error fetching orders:', err);
  }

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
            <p className="text-neutral-500 max-w-md mx-auto mb-8">You haven't placed any orders yet. Explore our premium brassware collection to find your next heirloom.</p>
            <Link href="/" className="bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-neutral-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const items = JSON.parse(order.items_json);
              const itemCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);
              
              return (
                <div key={order.id} className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
                  <div className="border-b border-neutral-100 bg-neutral-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Order Placed</p>
                      <p className="text-sm font-bold text-neutral-900">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Total Amount</p>
                      <p className="text-sm font-bold text-neutral-900">${order.amount_total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-500">Order ID</p>
                      <p className="text-xs font-mono text-neutral-600 bg-white px-2 py-1 rounded border border-neutral-200 mt-1">
                        #{order.stripe_session_id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f8f8f8] rounded-lg flex items-center justify-center border border-neutral-200">
                        <Package className="w-6 h-6 text-[#b5955b]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900">{itemCount} item{itemCount !== 1 ? 's' : ''} ordered</h4>
                        <p className="text-sm text-[#b5955b] font-medium capitalize flex items-center mt-1">
                          <span className="w-2 h-2 rounded-full bg-[#b5955b] mr-2"></span>
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <button className="text-sm font-semibold text-neutral-600 hover:text-black hover:underline transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
