'use client';

import { useState } from 'react';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

export default function OrderCard({ order, itemsDict }: { order: any, itemsDict: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const items = JSON.parse(order.items_json);
  const itemCount = items.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0);

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
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
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center text-sm font-semibold text-neutral-600 hover:text-black transition-colors"
        >
          {isOpen ? 'Hide Details' : 'View Details'}
          {isOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-neutral-100 bg-neutral-50/50 p-6 space-y-4">
          <h5 className="font-bold text-neutral-900 mb-4">Items in your order</h5>
          {items.map((item: any) => {
            const product = itemsDict[item.id];
            return (
              <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                    {product?.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">No Img</div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{product?.title || `Product #${item.id}`}</p>
                    <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</p>
                  {item.quantity > 1 && <p className="text-xs text-neutral-500">${item.price.toFixed(2)} each</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
