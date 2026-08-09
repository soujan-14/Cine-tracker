'use client';

import { ElementType } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  icon?: ElementType;
  iconColor?: string;
  label: string;
  title?: string;
  href?: string;
}

export function SectionHeader({ label, href }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between px-6 lg:px-12">
      <h2 className="text-lg font-bold text-white">{label}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-medium text-white/50 transition hover:text-white"
        >
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
