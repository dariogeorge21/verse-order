"use client";

import { Fragment } from "@/utils/fragmentSplitter";

interface FragmentDraggableProps {
  fragment: Fragment;
  isSelected: boolean;
  onClick: () => void;
  isInOrder: boolean;
}

export function FragmentDraggable({
  fragment,
  isSelected,
  onClick,
  isInOrder,
}: FragmentDraggableProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-3 rounded-lg border-2 transition-all touch-target
        ${
          isSelected
            ? "border-church-blue bg-blue-100 shadow-lg scale-105"
            : "border-gray-300 bg-white hover:border-church-blue hover:bg-blue-50"
        }
        ${isInOrder ? "ring-2 ring-green-400" : ""}
      `}
    >
      <span className="text-lg font-medium text-gray-800">{fragment.text}</span>
    </button>
  );
}

