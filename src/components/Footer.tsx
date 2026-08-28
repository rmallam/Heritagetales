export default function Footer() {
  return (
    <footer className="bg-[#111111] text-[#a3a3a3] py-16 px-6 mt-20 border-t-4 border-[#b5955b]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-2xl font-bold text-[#f8f8f8] tracking-tighter font-serif mb-4">
            HERITAGE <span className="text-[#b5955b]">TALES</span>
          </h2>
          <p className="text-sm leading-relaxed max-w-sm">
            Curating the finest heavy-duty authentic brassware from traditional artisans in India. Bringing heritage to the Australian diaspora, designed to last for generations.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Shop</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">All Collections</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Pooja Essentials</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Kitchenware</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Home Decor</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Support</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="/support" className="hover:text-white transition-colors">Shipping Policy</a></li>
            <li><a href="/support" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
            <li><a href="/support" className="hover:text-white transition-colors">Care Instructions</a></li>
            <li><a href="/support" className="hover:text-white transition-colors">Contact Us</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-neutral-800 text-xs text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Heritage Tales. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
