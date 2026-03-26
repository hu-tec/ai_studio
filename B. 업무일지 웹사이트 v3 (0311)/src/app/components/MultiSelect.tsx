import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  grouped?: Record<string, string[]>;
}

export function MultiSelect({ label, options, selected, onChange, grouped }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeTag = (option: string) => {
    onChange(selected.filter(s => s !== option));
  };

  return (
    <div className="relative">
      <label className="block mb-0.5 text-muted-foreground">{label}</label>
      <div
        className="border border-border rounded p-1.5 min-h-[32px] cursor-pointer flex items-center gap-0.5 flex-wrap bg-card"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 && (
          <span className="text-muted-foreground px-0.5">선택</span>
        )}
        {selected.map(s => (
          <span key={s} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5">
            {s}
            <X className="w-3 h-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); removeTag(s); }} />
          </span>
        ))}
        <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground shrink-0" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-0.5 bg-card border border-border rounded shadow-lg z-50 max-h-48 overflow-y-auto">
            {grouped ? (
              Object.entries(grouped).map(([group, subs]) => (
                <div key={group}>
                  <div
                    className="px-2 py-1 hover:bg-accent cursor-pointer flex items-center gap-1.5 text-xs"
                    onClick={() => toggle(group)}
                  >
                    <div className={`w-3 h-3 rounded border flex items-center justify-center ${selected.includes(group) ? 'bg-primary border-primary' : 'border-border'}`}>
                      {selected.includes(group) && <Check className="w-2 h-2 text-primary-foreground" />}
                    </div>
                    <span>{group}</span>
                  </div>
                  {subs.map(sub => (
                    <div
                      key={sub}
                      className="px-2 py-1 pl-6 hover:bg-accent cursor-pointer flex items-center gap-1.5 text-xs"
                      onClick={() => toggle(sub)}
                    >
                      <div className={`w-3 h-3 rounded border flex items-center justify-center ${selected.includes(sub) ? 'bg-primary border-primary' : 'border-border'}`}>
                        {selected.includes(sub) && <Check className="w-2 h-2 text-primary-foreground" />}
                      </div>
                      <span className="text-muted-foreground">{sub}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              options.map(option => (
                <div
                  key={option}
                  className="px-2 py-1 hover:bg-accent cursor-pointer flex items-center gap-1.5 text-xs"
                  onClick={() => toggle(option)}
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center ${selected.includes(option) ? 'bg-primary border-primary' : 'border-border'}`}>
                    {selected.includes(option) && <Check className="w-2 h-2 text-primary-foreground" />}
                  </div>
                  <span>{option}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}