'use client';

import { DiscountRule } from '@/lib/db';
import { addDiscountRule, toggleDiscountRule, deleteDiscountRule } from '@/lib/actions';
import { Plus, Trash2, Power } from 'lucide-react';
import { useTransition, useState } from 'react';

export default function AdminDiscountRules({ rules }: { rules: DiscountRule[] }) {
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addDiscountRule(formData);
      (e.target as HTMLFormElement).reset();
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-4 items-end bg-neutral-50 p-6 rounded-xl border border-neutral-200">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-neutral-900 mb-2">Tag Name</label>
          <input type="text" name="tag" required placeholder="e.g. Urli" className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-black outline-none" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-neutral-900 mb-2">Discount (%)</label>
          <input type="number" name="discount_percentage" required min="1" max="100" placeholder="15" className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:border-black outline-none" />
        </div>
        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors h-[42px]">
          {isSubmitting ? 'Adding...' : <span className="flex items-center"><Plus className="w-4 h-4 mr-2" /> Add Rule</span>}
        </button>
      </form>

      <div className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-neutral-500 text-center py-6">No tag discounts created yet.</p>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className={`flex items-center justify-between p-4 bg-white rounded-xl border border-neutral-200 transition-opacity ${!rule.is_active ? 'opacity-60' : ''}`}>
              <div>
                <span className="font-bold text-lg text-neutral-900">{rule.tag}</span>
                <span className="ml-3 px-2 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-full uppercase tracking-wider">
                  {rule.discount_percentage}% OFF
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => toggleDiscountRule(rule.id, rule.is_active))}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center disabled:opacity-50 transition-colors ${rule.is_active ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                >
                  <Power className="w-4 h-4 mr-1" /> {rule.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteDiscountRule(rule.id))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
