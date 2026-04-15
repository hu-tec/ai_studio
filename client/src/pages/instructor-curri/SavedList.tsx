import type { SavedCurriculum } from "./types";

interface SavedListProps {
  items: SavedCurriculum[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SavedList({ items, onEdit, onDelete }: SavedListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-1 text-neutral-300">
        <span className="text-[2rem] opacity-30 mb-1">📭</span>
        <p className="text-[0.75rem]">저장된 항목 없음</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => {
        const kw = item.keywords ?? {
          common: [],
          prompt: [],
          ethics: [],
          translation: [],
        };
        const totalKw =
          kw.common.length + kw.prompt.length + kw.ethics.length + kw.translation.length;

        return (
          <div
            key={item.id}
            className="border border-neutral-200 rounded-md p-2 hover:bg-[#f4f4f5] transition-colors cursor-pointer group"
            onClick={() => onEdit(item.id)}
          >
            {/* Row 1: Category + Actions */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-[0.625rem] text-neutral-500">
                📂 {item.category.large} › {item.category.medium}
                {item.category.small && <> › {item.category.small}</>}
              </span>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  className="text-[0.75rem] px-1 py-0.5 rounded-md hover:bg-neutral-200"
                  onClick={(e) => { e.stopPropagation(); onEdit(item.id); }}
                  title="수정"
                >
                  ✏️
                </button>
                <button
                  className="text-[0.75rem] px-1 py-0.5 rounded-md hover:bg-red-50 text-red-500"
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  title="삭제"
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Row 2: Grade + Targets */}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[0.625rem] border border-neutral-300 rounded-md px-1 py-0">
                {item.instructor_grade.field}
              </span>
              <span className="text-[0.625rem] border border-neutral-300 rounded-md px-1 py-0">
                {item.instructor_grade.mid}
              </span>
              <span className="text-[0.625rem] bg-black text-white rounded-md px-1 py-0">
                {item.instructor_grade.level}
              </span>
              {item.targets && item.targets.length > 0 && (
                <>
                  <span className="text-neutral-300 text-[0.5rem]">│</span>
                  <span className="text-[0.625rem]">👥</span>
                  {item.targets.map((t) => (
                    <span
                      key={t}
                      className="text-[0.625rem] border border-neutral-300 rounded-md px-1 py-0"
                    >
                      {t}
                    </span>
                  ))}
                </>
              )}
            </div>

            {/* Row 3: Keywords */}
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-[0.625rem] text-neutral-500">🏷️ {totalKw}</span>
              {kw.common.length > 0 && (
                <span className="text-[0.625rem] border border-neutral-200 rounded-md px-1 py-0">공통 {kw.common.length}</span>
              )}
              {kw.prompt.length > 0 && (
                <span className="text-[0.625rem] border border-neutral-200 rounded-md px-1 py-0">✨{kw.prompt.length}</span>
              )}
              {kw.ethics.length > 0 && (
                <span className="text-[0.625rem] border border-neutral-200 rounded-md px-1 py-0">⚖️{kw.ethics.length}</span>
              )}
              {kw.translation.length > 0 && (
                <span className="text-[0.625rem] border border-neutral-200 rounded-md px-1 py-0">🌐{kw.translation.length}</span>
              )}
              <span className="text-neutral-300 text-[0.5rem]">│</span>
              <span className="text-[0.625rem] text-neutral-400">📅 {item.created_at}</span>
            </div>

            {/* Row 4: Preview */}
            <div className="flex flex-wrap gap-0.5 mt-1">
              {[...kw.common, ...kw.prompt, ...kw.ethics, ...kw.translation]
                .slice(0, 5)
                .map((k) => (
                  <span
                    key={k}
                    className="text-[0.625rem] border border-neutral-200 rounded-md px-1 py-0 text-neutral-500"
                  >
                    {k}
                  </span>
                ))}
              {totalKw > 5 && (
                <span className="text-[0.625rem] text-neutral-400">+{totalKw - 5}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
