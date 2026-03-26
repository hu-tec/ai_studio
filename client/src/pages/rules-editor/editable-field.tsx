import type { FieldEntry } from "./rule-data";

interface EditableFieldProps {
  field: FieldEntry;
  onUpdate: (id: string, value: string) => void;
}

export function EditableField({ field, onUpdate }: EditableFieldProps) {
  if (field.type === "select" && field.options) {
    return (
      <div className="relative">
        <select
          value={field.value}
          onChange={(e) => onUpdate(field.id, e.target.value)}
          className="appearance-none w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-black text-[12px] py-0.5 px-1 rounded-none focus:outline-none cursor-pointer pr-4 transition-colors"
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 pointer-events-none">▼</span>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={field.value}
        onChange={(e) => onUpdate(field.id, e.target.value)}
        rows={1}
        className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-black text-[12px] py-0.5 px-1 rounded-none focus:outline-none resize-none transition-colors"
      />
    );
  }

  return (
    <input
      type="text"
      value={field.value}
      onChange={(e) => onUpdate(field.id, e.target.value)}
      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-black text-[12px] py-0.5 px-1 rounded-none focus:outline-none transition-colors"
    />
  );
}
