import SupportForm from '@/components/SupportForm';

export const metadata = {
  title: 'Support & FAQ - Heritage Tales',
  description: 'Customer support, contact information, and frequently asked questions about our premium brassware.',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] py-16 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#222222] font-serif tracking-tight mb-4 text-center">Support & FAQ</h1>
        <p className="text-neutral-500 text-center max-w-2xl mx-auto mb-16">
          Have a question about our authentic brassware, shipping, or need assistance with an order? We are here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* FAQ Side */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 font-serif mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                <h3 className="font-bold text-neutral-900 mb-2">How long does shipping take?</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  We process all orders within 1-2 business days. Delivery within Australia typically takes 3-7 business days depending on your location.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                <h3 className="font-bold text-neutral-900 mb-2">How do I care for my brassware?</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Brass naturally tarnishes over time. To restore its shine, you can use a mixture of lemon juice and baking soda, or a specialized brass polish like Brasso. Avoid abrasive scrubbers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                <h3 className="font-bold text-neutral-900 mb-2">Do you accept returns?</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Yes, we offer a 14-day return policy for unused items in their original condition. Please note that return shipping costs are the responsibility of the customer unless the item arrived damaged.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
                <h3 className="font-bold text-neutral-900 mb-2">Are these items handcrafted?</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Yes, all our brass artifacts are sourced directly from traditional artisans in India. Minor variations in weight, size, and finish are a hallmark of genuine hand-crafted production.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Side */}
          <div>
            <div className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200">
              <h2 className="text-2xl font-bold text-neutral-900 font-serif mb-2">Contact Us</h2>
              <p className="text-sm text-neutral-500 mb-8">
                You can reach us directly at <a href="mailto:reach@heritagetales.com.au" className="font-bold text-[#b5955b] hover:underline">reach@heritagetales.com.au</a> or by filling out the form below.
              </p>
              
              <SupportForm />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
