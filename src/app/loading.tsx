import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-[#b5955b] animate-spin mb-4" />
        <p className="text-neutral-500 font-medium tracking-wide">Loading Heritage Tales...</p>
      </div>
    </div>
  );
}
