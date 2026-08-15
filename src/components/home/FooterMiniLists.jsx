import { FOOTER_MINI_LISTS } from '@/data/mockData';

export default function FooterMiniLists() {
  const categories = [
    { key: 'drinks', title: 'Drinks' },
    { key: 'cookingOil', title: 'Cooking Oil' },
    { key: 'confectionery', title: 'Confectioneries' },
    { key: 'bestsellersMini', title: 'Best Sellers' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((cat) => (
          <div key={cat.key}>
            <h3 className="font-fraunces text-xs font-black text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
              {cat.title}
            </h3>
            <div className="space-y-4">
              {FOOTER_MINI_LISTS[cat.key].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 group cursor-pointer">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-12 h-12 object-contain bg-gray-50 rounded border p-1"
                  />
                  <div>
                    <h4 className="font-fraunces text-xs font-bold text-gray-700 group-hover:text-[#6B0018] transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <span className="font-bricolage text-xs font-extrabold text-gray-900">{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}