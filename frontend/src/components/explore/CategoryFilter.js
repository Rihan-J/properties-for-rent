'use client';

import Link from 'next/link';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'home', label: 'Home' },
  { id: 'room', label: 'Room' },
  { id: 'shop', label: 'Shop' },
  { id: 'pg', label: 'PG' },
  { id: 'lodge', label: 'Lodge' },
  { id: 'site', label: 'Site / Plot' },
];

export default function CategoryFilter({ selectedCategory, onSelectCategory }) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 py-2">
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <Link
            key={cat.id}
            href={`/?category=${cat.id}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory(cat.id);
            }}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
              ${isActive 
                ? 'bg-[#1a1815] text-white border-[#1a1815] shadow-md shadow-[#1a1815]/20' 
                : 'bg-white text-[#1a1815] border-[#e8e2db] hover:border-[#b5936b] hover:bg-[#faf9f7]'
              }
            `}
          >
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
