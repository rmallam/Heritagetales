'use client';

import { Item } from '@/lib/db';
import { toggleItemStock, toggleItemActive } from '@/lib/actions';
import { Package, ArchiveRestore, Trash2 } from 'lucide-react';
import { useTransition } from 'react';

export default function AdminItemsList({ items }: { items: Item[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
          <p className="text-neutral-500">No items found.</p>
        </div>
      ) : (
        items.map(item => (
          <div key={item.id} className={`flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 transition-opacity ${!item.is_active ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                {item.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover grayscale-0" style={{ filter: !item.is_active ? 'grayscale(100%)' : 'none' }} />
                ) : (
                  <Package className="w-full h-full p-4 text-neutral-300" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-500">${item.price.toFixed(2)}</p>
                <div className="flex gap-2 mt-1">
                  {!item.is_active ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Archived</span>
                  ) : item.in_stock ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">In Stock</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={isPending || !item.is_active}
                onClick={() => startTransition(() => toggleItemStock(item.id, item.in_stock))}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-50 transition-colors"
              >
                {item.in_stock ? 'Mark Out of Stock' : 'Mark In Stock'}
              </button>
              <button
                disabled={isPending}
                onClick={() => startTransition(() => toggleItemActive(item.id, item.is_active))}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${item.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                title={item.is_active ? "Archive Item" : "Restore Item"}
              >
                {item.is_active ? <Trash2 className="w-4 h-4" /> : <ArchiveRestore className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
