'use client';

import { sendSupportEmail } from '@/lib/actions';
import { useState, useTransition } from 'react';

export default function SupportForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await sendSupportEmail(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  if (submitted) {
    return (
      <div className="bg-green-50 text-green-700 p-8 rounded-2xl text-center border border-green-200">
        <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
        <p className="mb-6">Thank you for reaching out. Our team will get back to you at the email provided as soon as possible.</p>
        <button onClick={() => setSubmitted(false)} className="px-6 py-2 bg-green-700 text-white rounded-full font-bold text-sm">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
      
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-neutral-900 mb-2">Full Name</label>
        <input type="text" id="name" name="name" required className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black outline-none bg-white" />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">Email Address</label>
        <input type="email" id="email" name="email" required className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black outline-none bg-white" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-neutral-900 mb-2">Message</label>
        <textarea id="message" name="message" required rows={6} className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-black outline-none bg-white resize-none"></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors mt-2"
      >
        {isPending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
