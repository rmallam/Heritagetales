import { addItem, fulfillOrder, getStoreSettings, updateStoreSettings } from '@/lib/actions';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@vercel/postgres';

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

export default async function AdminPage() {
  const { userId } = auth();
  const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

  if (!ADMIN_USER_ID || userId !== ADMIN_USER_ID) {
    redirect('/');
  }

  // Fetch all orders
  let orders: Order[] = [];
  try {
    const { rows } = await sql<Order>`SELECT * FROM orders ORDER BY created_at DESC`;
    orders = rows;
  } catch (err) {
    console.error('Error fetching orders:', err);
  }

  const settings = await getStoreSettings();

  async function handleSubmit(formData: FormData) {
    'use server';
    await addItem(formData);
    redirect('/'); // Redirect back to storefront after adding
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Storefront
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {/* Store Settings Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 self-start">
              <div className="mb-6 border-b border-neutral-100 pb-4">
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Global Store Settings</h2>
                <p className="text-sm text-neutral-500 mt-1">Configure site-wide discounts.</p>
              </div>
              <form action={updateStoreSettings} className="space-y-6">
                <div className="flex items-center justify-between">
                  <label htmlFor="is_sale_active" className="text-sm font-semibold text-neutral-900">Enable Global Sale</label>
                  <input type="checkbox" id="is_sale_active" name="is_sale_active" value="true" defaultChecked={settings.is_sale_active} className="w-5 h-5 text-black border-neutral-300 rounded focus:ring-black" />
                </div>
                <div>
                  <label htmlFor="global_discount" className="block text-sm font-semibold text-neutral-900 mb-2">Discount Percentage (%)</label>
                  <input type="number" id="global_discount" name="global_discount" min="0" max="100" defaultValue={settings.global_discount} required className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
                </div>
                <button type="submit" className="w-full py-3 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors">
                  Save Settings
                </button>
              </form>
            </div>

            {/* Add Item Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 self-start">
              <div className="mb-8 border-b border-neutral-100 pb-6">
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Add New Item</h1>
              <p className="text-neutral-500 mt-2">Fill out the details below to instantly add a new brass item to your catalog.</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-neutral-900 mb-2">Item Title</label>
                <input type="text" id="title" name="title" required className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="e.g. Solid Brass Urli (12 inch)" />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-neutral-900 mb-2">Price (AUD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-neutral-500">$</span>
                  <input type="number" id="price" name="price" step="0.01" required className="w-full pl-8 pr-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="85.00" />
                </div>
              </div>
              <div>
                <label htmlFor="image_url" className="block text-sm font-semibold text-neutral-900 mb-2">Primary Image URL</label>
                <input type="url" id="image_url" name="image_url" className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label htmlFor="additional_images" className="block text-sm font-semibold text-neutral-900 mb-2">Additional Images (Comma Separated URLs)</label>
                <textarea id="additional_images" name="additional_images" rows={2} className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none" placeholder="https://img1.jpg, https://img2.jpg"></textarea>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-neutral-900 mb-2">Description</label>
                <textarea id="description" name="description" rows={4} className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all resize-none" placeholder="Describe the quality, weight, and usage..."></textarea>
              </div>
              <button type="submit" className="w-full flex items-center justify-center py-4 px-6 bg-black text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors active:scale-[0.98]">
                <Plus className="w-5 h-5 mr-2" />
                Publish Item
              </button>
            </form>
          </div>
          </div>

          {/* Orders View */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 self-start">
            <div className="mb-8 border-b border-neutral-100 pb-6">
              <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Recent Orders</h1>
              <p className="text-neutral-500 mt-2">All customer orders will appear here automatically.</p>
            </div>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">No orders have been placed yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-neutral-500 font-medium">#{order.stripe_session_id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm font-bold mt-1 text-neutral-900">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-neutral-900">${order.amount_total.toFixed(2)}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 mt-1 uppercase tracking-wider border border-green-200">
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-4">
                      <p className="text-xs text-neutral-500">Customer ID: <span className="font-mono text-neutral-700">{order.user_id}</span></p>
                      
                      {order.shipping_address && (
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                          <p className="text-xs text-neutral-500 font-medium mb-1">Shipping Details</p>
                          {(() => {
                            const addr = JSON.parse(order.shipping_address);
                            return (
                              <div className="text-xs text-neutral-800">
                                <p className="font-bold">{addr.name}</p>
                                <p>{addr.address?.line1}</p>
                                {addr.address?.line2 && <p>{addr.address.line2}</p>}
                                <p>{addr.address?.city}, {addr.address?.state} {addr.address?.postal_code}</p>
                                <p>{addr.address?.country}</p>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                      
                      {order.status === 'shipped' ? (
                        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                          <p className="text-xs text-neutral-500 font-medium">Tracking Information</p>
                          <p className="text-sm font-bold text-neutral-900 mt-1">
                            {order.carrier}: <span className="font-mono">{order.tracking_number}</span>
                          </p>
                        </div>
                      ) : (
                        <form action={fulfillOrder} className="flex gap-2">
                          <input type="hidden" name="id" value={order.id} />
                          <input 
                            type="text" 
                            name="carrier" 
                            placeholder="Carrier (e.g. AusPost)" 
                            required 
                            className="flex-1 text-xs px-3 py-2 rounded-md border border-neutral-300 outline-none focus:border-black"
                          />
                          <input 
                            type="text" 
                            name="tracking_number" 
                            placeholder="Tracking #" 
                            required 
                            className="flex-1 text-xs px-3 py-2 rounded-md border border-neutral-300 outline-none focus:border-black"
                          />
                          <button type="submit" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-md hover:bg-neutral-800">
                            Mark Shipped
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
