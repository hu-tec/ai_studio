import { useState } from "react";
import { FIELD_A_CATEGORIES, DEPT_D_CATEGORIES } from "../data/categories";
import { Search, ChevronDown, RefreshCw } from "lucide-react";

interface FilterProps {
  onFilterChange: (filters: {
    field: { large: string; middle: string; small: string };
    dept: { large: string; middle: string };
    searchTerm: string;
  }) => void;
}

export function FilterSystem({ onFilterChange }: FilterProps) {
  const [selectedField, setSelectedField] = useState({ large: "", middle: "", small: "" });
  const [selectedDept, setSelectedDept] = useState({ large: "", middle: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const handleFieldChange = (key: "large" | "middle" | "small", value: string) => {
    const newField = { ...selectedField, [key]: value };
    if (key === "large") {
      newField.middle = "";
      newField.small = "";
    } else if (key === "middle") {
      newField.small = "";
    }
    setSelectedField(newField);
    onFilterChange({ field: newField, dept: selectedDept, searchTerm });
  };

  const handleDeptChange = (key: "large" | "middle", value: string) => {
    const newDept = { ...selectedDept, [key]: value };
    if (key === "large") {
      newDept.middle = "";
    }
    setSelectedDept(newDept);
    onFilterChange({ field: selectedField, dept: newDept, searchTerm });
  };

  const handleReset = () => {
    setSelectedField({ large: "", middle: "", small: "" });
    setSelectedDept({ large: "", middle: "" });
    setSearchTerm("");
    onFilterChange({ field: { large: "", middle: "", small: "" }, dept: { large: "", middle: "" }, searchTerm: "" });
  };

  const currentFieldLarge = FIELD_A_CATEGORIES.find(f => f.large === selectedField.large);
  const currentFieldMiddle = currentFieldLarge?.middle.find(m => m.name === selectedField.middle);

  const currentDeptLarge = DEPT_D_CATEGORIES.find(d => d.large === selectedDept.large);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col gap-6">
        {/* Search and Reset */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="전문가 이름 또는 이메일 검색"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all text-sm font-medium border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
            초기화
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Field A Filter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">A. 분야 필터</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400 ml-1">대분류</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    value={selectedField.large}
                    onChange={(e) => handleFieldChange("large", e.target.value)}
                  >
                    <option value="">전체</option>
                    {FIELD_A_CATEGORIES.map((f) => (
                      <option key={f.large} value={f.large}>{f.large}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400 ml-1">중분류</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={selectedField.middle}
                    onChange={(e) => handleFieldChange("middle", e.target.value)}
                    disabled={!selectedField.large || !currentFieldLarge?.middle.length}
                  >
                    <option value="">전체</option>
                    {currentFieldLarge?.middle.map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400 ml-1">소분류</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={selectedField.small}
                    onChange={(e) => handleFieldChange("small", e.target.value)}
                    disabled={!selectedField.middle || !currentFieldMiddle?.small.length}
                  >
                    <option value="">전체</option>
                    {currentFieldMiddle?.small.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Dept D Filter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">D. 부서 필터</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400 ml-1">대분류 (부서)</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    value={selectedDept.large}
                    onChange={(e) => handleDeptChange("large", e.target.value)}
                  >
                    <option value="">전체</option>
                    {DEPT_D_CATEGORIES.map((d) => (
                      <option key={d.large} value={d.large}>{d.large}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-400 ml-1">중분류 (팀)</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    value={selectedDept.middle}
                    onChange={(e) => handleDeptChange("middle", e.target.value)}
                    disabled={!selectedDept.large || !currentDeptLarge?.middle.length}
                  >
                    <option value="">전체</option>
                    {currentDeptLarge?.middle.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
