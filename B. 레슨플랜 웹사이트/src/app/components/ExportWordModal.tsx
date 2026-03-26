import { useState } from "react";
import { X, Download, FileDown, Check } from "lucide-react";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { CategoryItem, StepItem } from "./mockData";

/* ─── Types ─── */
export interface ExportData {
  /* 기본 정보 */
  tags: string;
  author: string;
  cohort: string;
  cohortLabel: string;
  instructorName: string;
  gender: string;
  /* 수업 정보 */
  level: string;
  dateFrom: string;
  dateTo: string;
  topics: string[];
  groups: string[];
  timeLength: string;
  customTime: string;
  targetLevels: string[];
  detailGrades: string[];
  units: number[];
  aiTools: string[];
  mediaTypes: string[];
  teachingAids: string[];
  mainTextbook: string;
  subTextbook: string;
  /* 범주 / 단계 */
  categories: CategoryItem[];
  steps: StepItem[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: ExportData;
}

/* ─── Section definitions ─── */
const sectionDefs = [
  { key: "basic", label: "기본 정보", desc: "태그, 작성자, 기수, 강사명, 성별" },
  { key: "class", label: "수업 정보", desc: "레벨, 기간, 학습영역, 그룹, 시간 등" },
  { key: "categories", label: "범주형 상세 내용", desc: "선택한 범주 항목의 내용, 비고, 시간" },
  { key: "steps", label: "단계별 활동 내용", desc: "각 단계의 시간, 수업 형태, 활동 내용" },
] as const;

type SectionKey = (typeof sectionDefs)[number]["key"];

/* ─── Colour constants ─── */
const BLUE = "2563EB";
const BLUE_LIGHT = "EFF6FF";
const GRAY_LIGHT = "F9FAFB";
const BORDER_COLOR = "D1D5DB";
const WHITE = "FFFFFF";

/* ─── Helper builders ─── */
const thinBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
  right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
};

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { type: ShadingType.CLEAR, fill: BLUE_LIGHT, color: "auto" },
    borders: thinBorders,
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, bold: true, size: 18, font: "Pretendard" })],
      }),
    ],
  });
}

function valueCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    borders: thinBorders,
    children: [
      new Paragraph({
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: text || "-", size: 18, font: "Pretendard" })],
      }),
    ],
  });
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Pretendard", color: BLUE })],
  });
}

/* ─── Document generator ─── */
function buildDocument(data: ExportData, sections: Set<SectionKey>): Document {
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Lesson Plan", bold: true, size: 32, font: "Pretendard", color: BLUE })],
    })
  );

  /* ── 기본 정보 ── */
  if (sections.has("basic")) {
    children.push(sectionTitle("1. 기본 정보"));
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("태그", 2000), valueCell(data.tags, 3000), headerCell("작성자", 1600), valueCell(data.author, 3000)] }),
          new TableRow({ children: [headerCell("기수", 2000), valueCell(data.cohortLabel || data.cohort, 3000), headerCell("강사명", 1600), valueCell(data.instructorName, 3000)] }),
          new TableRow({ children: [headerCell("성별", 2000), valueCell(data.gender, 7600)] }),
        ],
      })
    );
  }

  /* ── 수업 정보 ── */
  if (sections.has("class")) {
    children.push(sectionTitle("2. 수업 정보"));
    const time = data.timeLength === "직접입력" ? data.customTime : data.timeLength;
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [headerCell("레벨", 2000), valueCell(data.level, 3000), headerCell("기간", 1600), valueCell(data.dateFrom && data.dateTo ? `${data.dateFrom} ~ ${data.dateTo}` : "-", 3000)] }),
          new TableRow({ children: [headerCell("학습영역", 2000), valueCell(data.topics.join(", "), 3000), headerCell("그룹", 1600), valueCell(data.groups.join(", "), 3000)] }),
          new TableRow({ children: [headerCell("총 수업시간", 2000), valueCell(time, 3000), headerCell("대상", 1600), valueCell(data.targetLevels.join(", "), 3000)] }),
          new TableRow({ children: [headerCell("세부학년", 2000), valueCell(data.detailGrades.join(", "), 3000), headerCell("단원", 1600), valueCell(data.units.length ? data.units.join(", ") : "-", 3000)] }),
          new TableRow({ children: [headerCell("활용 AI", 2000), valueCell(data.aiTools.join(", "), 7600)] }),
          new TableRow({ children: [headerCell("활용 미디어", 2000), valueCell(data.mediaTypes.join(", "), 7600)] }),
          new TableRow({ children: [headerCell("교구", 2000), valueCell(data.teachingAids.join(", "), 7600)] }),
          new TableRow({ children: [headerCell("주교재", 2000), valueCell(data.mainTextbook, 3000), headerCell("부교재", 1600), valueCell(data.subTextbook, 3000)] }),
        ],
      })
    );
  }

  /* ── 범주형 상세 ── */
  if (sections.has("categories") && data.categories.length > 0) {
    children.push(sectionTitle("3. 범주형 상세 내용"));

    // Header row
    const headerRow = new TableRow({
      children: [
        headerCell("범주", 2200),
        headerCell("내용", 3600),
        headerCell("비고", 1800),
        headerCell("시간(분)", 900),
        headerCell("미디어", 1600),
        headerCell("교구", 1600),
      ],
    });

    const dataRows = data.categories.map(
      (cat) =>
        new TableRow({
          children: [
            valueCell(cat.title, 2200),
            valueCell(cat.contents, 3600),
            valueCell(cat.remark, 1800),
            valueCell(cat.timeLength, 900),
            valueCell(cat.mediaTypes.join(", "), 1600),
            valueCell(cat.teachingAids.join(", "), 1600),
          ],
        })
    );

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      })
    );
  }

  /* ── 단계별 활동 ── */
  if (sections.has("steps") && data.steps.length > 0) {
    children.push(sectionTitle("4. 단계별 활동 내용"));

    const headerRow = new TableRow({
      children: [
        headerCell("#", 500),
        headerCell("단계명", 1600),
        headerCell("시간", 800),
        headerCell("수업 형태", 1400),
        headerCell("활동 내용", 3400),
        headerCell("비고", 1200),
        headerCell("미디어", 1200),
        headerCell("교구", 1200),
      ],
    });

    const dataRows = data.steps.map(
      (step, idx) =>
        new TableRow({
          children: [
            valueCell(String(idx + 1), 500),
            valueCell(step.title, 1600),
            valueCell(step.time, 800),
            valueCell(step.setUp, 1400),
            valueCell(step.description, 3400),
            valueCell(step.remark, 1200),
            valueCell(step.mediaTypes.join(", "), 1200),
            valueCell(step.teachingAids.join(", "), 1200),
          ],
        })
    );

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      })
    );
  }

  // Footer
  children.push(
    new Paragraph({
      spacing: { before: 400 },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `생성일: ${new Date().toLocaleDateString("ko-KR")}`,
          size: 16,
          font: "Pretendard",
          color: "999999",
          italics: true,
        }),
      ],
    })
  );

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "Pretendard", size: 20 },
        },
      },
    },
    sections: [{ children }],
  });
}

/* ─── Modal Component ─── */
export function ExportWordModal({ open, onClose, data }: Props) {
  const [selected, setSelected] = useState<Set<SectionKey>>(
    new Set(sectionDefs.map((s) => s.key))
  );
  const [exporting, setExporting] = useState(false);

  if (!open) return null;

  const toggle = (key: SectionKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(sectionDefs.map((s) => s.key)));
  const selectNone = () => setSelected(new Set());

  const handleExport = async () => {
    if (selected.size === 0) return;
    setExporting(true);
    try {
      const doc = buildDocument(data, selected);
      const blob = await Packer.toBlob(doc);
      const fileName = `LessonPlan_${data.author || "export"}_${new Date().toISOString().slice(0, 10)}.docx`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileDown className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm">Word 문서 다운로드</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* body */}
        <div className="px-4 py-3">
          <p className="text-sm text-muted-foreground mb-3">
            다운로드할 섹션을 선택하세요.
          </p>

          {/* 전체선택 / 해제 */}
          <div className="flex items-center gap-2 mb-2">
            <button onClick={selectAll}
              className="text-xs px-2 py-0.5 rounded border border-border hover:bg-gray-50 transition-colors text-muted-foreground">
              전체 선택
            </button>
            <button onClick={selectNone}
              className="text-xs px-2 py-0.5 rounded border border-border hover:bg-gray-50 transition-colors text-muted-foreground">
              전체 해제
            </button>
          </div>

          {/* section list */}
          <div className="space-y-1">
            {sectionDefs.map((sec) => {
              const checked = selected.has(sec.key);
              const isEmpty =
                (sec.key === "categories" && data.categories.length === 0) ||
                (sec.key === "steps" && data.steps.length === 0);
              return (
                <label
                  key={sec.key}
                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    checked
                      ? "border-blue-400 bg-blue-50/60"
                      : "border-border hover:bg-gray-50"
                  } ${isEmpty ? "opacity-50" : ""}`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    checked ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                  }`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(sec.key)}
                    className="sr-only"
                  />
                  <div className="min-w-0">
                    <div className="text-sm flex items-center gap-1.5">
                      {sec.label}
                      {isEmpty && (
                        <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-px rounded">비어있음</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{sec.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-gray-50/50">
          <button onClick={onClose}
            className="px-3 py-1.5 text-sm rounded border border-border hover:bg-gray-100 transition-colors">
            취소
          </button>
          <button
            onClick={handleExport}
            disabled={selected.size === 0 || exporting}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "생성 중..." : `다운로드 (${selected.size}개 섹션)`}
          </button>
        </div>
      </div>
    </div>
  );
}
