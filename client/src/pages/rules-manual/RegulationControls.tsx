import { clsx } from 'clsx';

interface ToggleProps {
  value: boolean;
  onChange?: (val: boolean) => void;
}

export function OnOFFToggle({ value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-full border border-gray-200 w-fit">
      <button
        onClick={() => onChange?.(true)}
        className={clsx(
          "px-2 py-1 rounded-full text-[9px] font-black transition-all",
          value ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
        )}
      >
        ON
      </button>
      <button
        onClick={() => onChange?.(false)}
        className={clsx(
          "px-2 py-1 rounded-full text-[9px] font-black transition-all",
          !value ? "bg-blue-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
        )}
      >
        OFF
      </button>
    </div>
  );
}

interface PillButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function PillButton({ label, isActive, onClick }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-2.5 py-1 rounded-full text-[9px] font-black flex items-center gap-2 transition-all border",
        isActive ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
      )}
    >
      <div className={clsx("w-1.5 h-1.5 rounded-full", isActive ? "bg-blue-500" : "bg-gray-200")} />
      {label}
    </button>
  );
}
