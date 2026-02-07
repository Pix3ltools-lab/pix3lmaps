'use client';

import { useState } from 'react';
import TemplatePickerModal from './TemplatePickerModal';

interface CreateMapButtonProps {
  onCreated?: () => void;
  className?: string;
  label?: string;
}

export default function CreateMapButton({
  onCreated,
  className = '',
  label = 'New Map',
}: CreateMapButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="8" y1="2" x2="8" y2="14" />
          <line x1="2" y1="8" x2="14" y2="8" />
        </svg>
        {label}
      </button>

      <TemplatePickerModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={onCreated}
      />
    </>
  );
}
