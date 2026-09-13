import { CategoryDTO } from '@/lib/types';

export function CategoryBadge({ category, size = 'md' }: { category: CategoryDTO; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-12 w-12 text-2xl' : size === 'sm' ? 'h-8 w-8 text-base' : 'h-10 w-10 text-xl';
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-2xl`}
      style={{ backgroundColor: `${category.color}1f` }}
      aria-hidden
    >
      {category.icon}
    </div>
  );
}
