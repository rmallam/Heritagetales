import { getDashboardStats } from '@/lib/actions';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8 border-b border-neutral-100 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Analytics Overview</h1>
        <p className="text-neutral-500 mt-2">Monitor your store&apos;s performance and recent activity.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-4xl font-bold text-neutral-900 font-serif">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-[#b5955b]/10 rounded-xl text-[#b5955b]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Total Orders</p>
            <p className="text-4xl font-bold text-neutral-900 font-serif">{stats.totalOrders}</p>
          </div>
          <div className="p-3 bg-neutral-100 rounded-xl text-neutral-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Avg. Order Value</p>
            <p className="text-4xl font-bold text-neutral-900 font-serif">${stats.averageOrderValue.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-neutral-100 rounded-xl text-neutral-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-xl font-bold text-neutral-900 font-serif">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-[#b5955b] hover:underline">
            View All &rarr;
          </Link>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {stats.recentOrders.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 font-medium">No orders yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Order ID</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Customer</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm">Date</th>
                  <th className="p-4 font-semibold text-neutral-600 text-sm text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-neutral-900">#{order.id}</td>
                    <td className="p-4 text-sm text-neutral-600">{order.customer_email || 'Guest'}</td>
                    <td className="p-4 text-sm text-neutral-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-neutral-900 text-right">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
