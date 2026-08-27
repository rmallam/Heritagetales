import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[80vh] bg-[#fcfcfc] flex flex-col items-center justify-center pt-24">
      <Loader2 className="w-10 h-10 text-[#b5955b] animate-spin mb-4" />
      <p className="text-neutral-400 font-medium tracking-wider uppercase text-sm">Loading Product Details</p>
    </div>
  );
}
