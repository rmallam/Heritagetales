'use client';

import { useState, useMemo } from 'react';
import { Package, X, Truck } from 'lucide-react';
import { fulfillOrder } from '@/lib/actions';

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

type Product = { id: number, title: string, image_url: string, price: number };

export default function AdminOrdersTable({ orders, itemsDict }: { orders: Order[], itemsDict: Record<number, Product> }) {
  const [filter, setFilter] = useState<'all' | 'unfulfilled' | 'shipped'>('all');
  const [sort, setSort] = useState<'date' | 'amount'>('date');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    if (filter === 'unfulfilled') {
      result = result.filter(o => o.status !== 'shipped');
    } else if (filter === 'shipped') {
      result = result.filter(o => o.status === 'shipped');
    }

    result.sort((a, b) => {
      if (sort === 'amount') {
        return b.amount_total - a.amount_total;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [orders, filter, sort]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col h-[800px]">
      {/* Header & Controls */}
      <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Orders Master View</h2>
          <p className="text-sm text-neutral-500 mt-1">{filteredAndSortedOrders.length} orders found</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as 'all' | 'unfulfilled' | 'shipped')}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
          >
            <option value="all">All Orders</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="shipped">Shipped</option>
          </select>
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value as 'date' | 'amount')}
            className="px-3 py-2 text-sm border border-neutral-300 rounded-lg outline-none focus:border-black bg-white"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Orders List Sidebar */}
        <div className={`w-full ${selectedOrder ? 'hidden md:block md:w-1/3 border-r border-neutral-200' : 'block'} overflow-y-auto bg-[#fcfcfc]`}>
          {filteredAndSortedOrders.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">No orders match the current filters.</div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredAndSortedOrders.map(order => {
                const isSelected = selectedOrder?.id === order.id;
                const items = JSON.parse(order.items_json);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const itemCount = items.reduce((acc: number, i: any) => acc + i.quantity, 0);

                return (
                  <button 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-4 hover:bg-neutral-50 transition-colors ${isSelected ? 'bg-neutral-100 border-l-4 border-l-black' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-neutral-500">#{order.stripe_session_id.slice(-6).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${order.status === 'shipped' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-bold text-neutral-900">${order.amount_total.toFixed(2)}</p>
                        <p className="text-xs text-neutral-500">{itemCount} items • {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Order Details Pane */}
        {selectedOrder ? (
          <div className="flex-1 overflow-y-auto bg-white flex flex-col relative">
            <div className="sticky top-0 bg-white/90 backdrop-blur border-b border-neutral-100 p-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold font-mono">Order #{selectedOrder.stripe_session_id.slice(-8).toUpperCase()}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-neutral-100 rounded-full md:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Customer / System ID</h4>
                  <p className="text-sm font-mono text-neutral-700 break-all">{selectedOrder.user_id}</p>
                  <p className="text-sm text-neutral-600 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                
                {selectedOrder.shipping_address && (
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      Shipping Details
                    </h4>
                    {(() => {
                      const addr = JSON.parse(selectedOrder.shipping_address);
                      return (
                        <div className="text-sm text-neutral-800">
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
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Purchased Items</h4>
                <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {JSON.parse(selectedOrder.items_json).map((cartItem: any) => {
                    const product = itemsDict[cartItem.id];
                    return (
                      <div key={cartItem.id} className="p-4 flex items-center justify-between bg-white hover:bg-neutral-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden">
                            {product?.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image_url} alt="Item" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-2 text-neutral-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-neutral-900">{product?.title || 'Unknown Product'}</p>
                            <p className="text-xs text-neutral-500">Qty: {cartItem.quantity} x ${cartItem.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="font-bold text-neutral-900">${(cartItem.quantity * cartItem.price).toFixed(2)}</p>
                      </div>
                    )
                  })}
                </div>
                <div className="text-right mt-4 pr-4">
                  <p className="text-sm text-neutral-500 font-medium">Total Paid</p>
                  <p className="text-2xl font-bold text-[#b5955b]">${selectedOrder.amount_total.toFixed(2)}</p>
                </div>
              </div>

              {/* Fulfillment */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Fulfillment Status</h4>
                {selectedOrder.status === 'shipped' ? (
                  <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200">
                    <p className="font-bold flex items-center mb-1">
                      Order Shipped
                    </p>
                    <p className="text-sm">
                      {selectedOrder.carrier}: <span className="font-mono bg-white px-1 py-0.5 rounded border border-green-200">{selectedOrder.tracking_number}</span>
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-800 font-bold mb-4">This order requires fulfillment.</p>
                    <form action={(formData) => { fulfillOrder(formData); setSelectedOrder(null); }} className="flex flex-col gap-3">
                      <input type="hidden" name="id" value={selectedOrder.id} />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          name="carrier" 
                          placeholder="Carrier (e.g. AusPost)" 
                          required 
                          className="px-4 py-2 rounded-lg border border-yellow-300 outline-none focus:border-yellow-600 bg-white"
                        />
                        <input 
                          type="text" 
                          name="tracking_number" 
                          placeholder="Tracking Number" 
                          required 
                          className="px-4 py-2 rounded-lg border border-yellow-300 outline-none focus:border-yellow-600 bg-white"
                        />
                      </div>
                      <button type="submit" className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-neutral-800 transition-colors">
                        Mark as Shipped
                      </button>
                    </form>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center text-neutral-400 bg-neutral-50/50">
            <Package className="w-16 h-16 opacity-20 mb-4" />
            <p>Select an order from the list to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
