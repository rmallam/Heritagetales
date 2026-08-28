'use client';

import { UploadCloud, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { bulkCreateItems } from '@/lib/actions';

export default function BulkUploadButton() {
  const [isPending, startTransition] = useTransition();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('images', e.target.files[i]);
    }
    
    startTransition(async () => {
      try {
        await bulkCreateItems(formData);
        alert('Items created successfully! You can now edit their details.');
      } catch (err) {
        console.error(err);
        alert('Failed to upload some items.');
      }
    });
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={isPending}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
      />
      <button 
        disabled={isPending}
        className="flex items-center justify-center px-4 py-2 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2" />}
        {isPending ? 'Uploading...' : 'Bulk Upload Images'}
      </button>
    </div>
  );
}
