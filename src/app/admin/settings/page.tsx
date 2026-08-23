import { getStoreSettings, updateStoreSettings } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="p-6 md:p-12 max-w-3xl">
      <div className="mb-8 border-b border-neutral-100 pb-6">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Store Settings</h1>
        <p className="text-neutral-500 mt-2">Configure site-wide discounts and other store operations.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight mb-6">Global Sale Details</h2>
        <form action={updateStoreSettings} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <div>
              <label htmlFor="is_sale_active" className="text-sm font-bold text-neutral-900 block">Enable Global Sale</label>
              <span className="text-xs text-neutral-500">Turn this on to apply the discount site-wide.</span>
            </div>
            <input type="checkbox" id="is_sale_active" name="is_sale_active" value="true" defaultChecked={settings.is_sale_active} className="w-6 h-6 text-black border-neutral-300 rounded focus:ring-black" />
          </div>
          <div>
            <label htmlFor="global_discount" className="block text-sm font-semibold text-neutral-900 mb-2">Discount Percentage (%)</label>
            <input type="number" id="global_discount" name="global_discount" min="0" max="100" defaultValue={settings.global_discount} required className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition-all" />
            <p className="text-xs text-neutral-500 mt-2">This percentage will be dynamically subtracted from all cart totals at checkout.</p>
          </div>
          <button type="submit" className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
