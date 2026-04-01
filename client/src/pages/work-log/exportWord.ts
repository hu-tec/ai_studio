import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  Packer,
  TableLayoutType,
  VerticalAlign,
  TabStopPosition,
  TabStopType,
  PageBreak,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { DailyLog } from './data';
import { employees, FRANKLIN_STATUS_CONFIG, FRANKLIN_PRIORITY_CONFIG } from './data';

// ── 폰트 / 사이즈 상수 ──
const FONT = '맑은 고딕';
const FONT_EN = 'Malgun Gothic';
const SZ_BODY = 18;       // 9pt
const SZ_HEADER = 20;     // 10pt
const SZ_TITLE = 32;      // 16pt
const SZ_SUBTITLE = 22;   // 11pt
const SZ_SMALL = 16;      // 8pt

// ── 색상 ──
const CLR_TITLE = '1B2A4A';       // 네이비
const CLR_HEADER_BG = 'D6E4F0';   // 연한 파란색 헤더 배경
const CLR_HEADER_BG2 = 'E8EFF7';  // 더 연한 서브헤더
const CLR_HEADER_TEXT = '1B2A4A'; // 헤더 텍스트
const CLR_BODY = '222222';
const CLR_BORDER = '8DB4E2';      // 테두리 파란 계열
const CLR_BORDER_OUTER = '4472C4'; // 외곽 테두리 진하게
const CLR_LIGHT_BG = 'F5F8FC';    // 교대행 배경
const CLR_MUTED = '888888';
const CLR_AI = '2563EB';
const CLR_SECTION_NUM = '4472C4'; // 섹션 번호 색

// ── 테두리 스타일 ──
const THIN_BORDER = { style: BorderStyle.SINGLE, size: 1, color: CLR_BORDER };
const MEDIUM_BORDER = { style: BorderStyle.SINGLE, size: 2, color: CLR_BORDER_OUTER };
const BOTTOM_THICK = { style: BorderStyle.SINGLE, size: 4, color: CLR_BORDER_OUTER };
const NONE_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

const CELL_BORDERS = {
  top: THIN_BORDER,
  bottom: THIN_BORDER,
  left: THIN_BORDER,
  right: THIN_BORDER,
};

const CELL_MARGIN = {
  top: 40,
  bottom: 40,
  left: 80,
  right: 80,
};

// ── 헬퍼 ──
function hCell(text: string, opts?: { width?: number; rowSpan?: number; columnSpan?: number; bg?: string }): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, font: FONT, size: SZ_HEADER, bold: true, color: CLR_HEADER_TEXT }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, after: 20 },
      }),
    ],
    shading: { type: ShadingType.SOLID, color: opts?.bg || CLR_HEADER_BG, fill: opts?.bg || CLR_HEADER_BG },
    borders: CELL_BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGIN,
    ...(opts?.width ? { width: { size: opts.width, type: WidthType.PERCENTAGE } } : {}),
    ...(opts?.rowSpan ? { rowSpan: opts.rowSpan } : {}),
    ...(opts?.columnSpan ? { columnSpan: opts.columnSpan } : {}),
  });
}

function dCell(text: string, opts?: {
  width?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  bold?: boolean; color?: string; bg?: string; columnSpan?: number;
}): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || ' ',
            font: FONT,
            size: SZ_BODY,
            bold: opts?.bold,
            color: opts?.color || CLR_BODY,
          }),
        ],
        alignment: opts?.alignment || AlignmentType.LEFT,
        spacing: { before: 20, after: 20 },
      }),
    ],
    borders: CELL_BORDERS,
    verticalAlign: VerticalAlign.CENTER,
    margins: CELL_MARGIN,
    ...(opts?.width ? { width: { size: opts.width, type: WidthType.PERCENTAGE } } : {}),
    ...(opts?.bg ? { shading: { type: ShadingType.SOLID, color: opts.bg, fill: opts.bg } } : {}),
    ...(opts?.columnSpan ? { columnSpan: opts.columnSpan } : {}),
  });
}

function eCell(text: string, opts?: { width?: number; lines?: number; columnSpan?: number }): TableCell {
  const lines = opts?.lines || 3;
  const paragraphs: Paragraph[] = [];

  if (text) {
    const textLines = text.split('\n');
    for (const line of textLines) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: line, font: FONT, size: SZ_BODY, color: CLR_BODY }),
          ],
          spacing: { before: 10, after: 10 },
        })
      );
    }
  } else {
    for (let i = 0; i < lines; i++) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: '', font: FONT, size: SZ_BODY })],
          spacing: { before: 10, after: 10 },
        })
      );
    }
  }

  return new TableCell({
    children: paragraphs,
    borders: CELL_BORDERS,
    verticalAlign: VerticalAlign.TOP,
    margins: CELL_MARGIN,
    ...(opts?.width ? { width: { size: opts.width, type: WidthType.PERCENTAGE } } : {}),
    ...(opts?.columnSpan ? { columnSpan: opts.columnSpan } : {}),
  });
}

function sectionTitle(num: string, text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}. `, font: FONT, size: SZ_SUBTITLE, bold: true, color: CLR_SECTION_NUM }),
      new TextRun({ text, font: FONT, size: SZ_SUBTITLE, bold: true, color: CLR_TITLE }),
    ],
    spacing: { before: 280, after: 80 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: CLR_BORDER, space: 4 },
    },
  });
}

function emptyRow(): Paragraph {
  return new Paragraph({ spacing: { before: 60, after: 60 } });
}

// ── 메인 내보내기 함수 ──
export async function exportDailyLogToWord(log: DailyLog, date: Date) {
  const emp = employees.find(e => e.id === log.employeeId);
  const dateFormatted = format(date, 'yyyy년 M월 d일 (EEE)', { locale: ko });
  const dateFile = format(date, 'yyyyMMdd');
  const empName = emp?.name || '';
  const empDept = emp?.department || '';

  // ═══════════════════════════════════════════
  // 결재란
  // ═══════════════════════════════════════════
  const approvalTable = new Table({
    rows: [
      new TableRow({
        children: [
          hCell('구분', { width: 20 }),
          hCell('담당', { width: 27 }),
          hCell('검토', { width: 27 }),
          hCell('승인', { width: 26 }),
        ],
      }),
      new TableRow({
        children: [
          hCell('서명', { width: 20, bg: CLR_HEADER_BG2 }),
          eCell('', { width: 27, lines: 3 }),
          eCell('', { width: 27, lines: 3 }),
          eCell('', { width: 26, lines: 3 }),
        ],
      }),
    ],
    width: { size: 40, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ═══════════════════════════════════════════
  // 문서 제목
  // ═══════════════════════════════════════════
  const titleParagraph = new Paragraph({
    children: [
      new TextRun({ text: '업 무 일 지', font: FONT, size: SZ_TITLE, bold: true, color: CLR_TITLE }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 60 },
    border: {
      bottom: { style: BorderStyle.DOUBLE, size: 3, color: CLR_BORDER_OUTER, space: 6 },
    },
  });

  const dateLine = new Paragraph({
    children: [
      new TextRun({ text: dateFormatted, font: FONT, size: SZ_HEADER, color: CLR_MUTED }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  });

  // ═══════════════════════════════════════════
  // 1. 작성 정보
  // ═══════════════════════════════════════════
  const infoTable = new Table({
    rows: [
      new TableRow({
        children: [
          hCell('작성일자', { width: 15 }),
          dCell(format(date, 'yyyy-MM-dd (EEE)', { locale: ko }), { width: 35 }),
          hCell('작성자', { width: 15 }),
          dCell(empName, { width: 35, bold: true }),
        ],
      }),
      new TableRow({
        children: [
          hCell('부서', { width: 15 }),
          dCell(empDept, { width: 35 }),
          hCell('직무직급', { width: 15 }),
          dCell(log.position, { width: 35 }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ═══════════════════════════════════════════
  // 2. 업무 분류
  // ═══════════════════════════════════════════
  const hpText = log.homepageCategories.length > 0 ? log.homepageCategories.join(' / ') : '';
  const deptText = log.departmentCategories.length > 0 ? log.departmentCategories.join(' / ') : '';

  const categoryTable = new Table({
    rows: [
      new TableRow({
        children: [
          hCell('홈페이지', { width: 15 }),
          eCell(hpText, { width: 85, lines: 1 }),
        ],
      }),
      new TableRow({
        children: [
          hCell('부서', { width: 15 }),
          eCell(deptText, { width: 85, lines: 1 }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ═══════════════════════════════════════════
  // 3. 시간대별 업무 내역
  // ═══════════════════════════════════════════
  const intervalLabel = log.timeInterval === '30min' ? '30분' : log.timeInterval === '1hour' ? '1시간' : '오전/오후';

  const intervalLine = new Paragraph({
    children: [
      new TextRun({ text: '입력 간격 : ', font: FONT, size: SZ_SMALL, color: CLR_MUTED }),
      new TextRun({ text: intervalLabel, font: FONT, size: SZ_SMALL, bold: true, color: CLR_TITLE }),
    ],
    alignment: AlignmentType.RIGHT,
    spacing: { before: 40, after: 60 },
  });

  const tsHeaderRow = new TableRow({
    children: [
      hCell('시간대', { width: 13 }),
      hCell('제목', { width: 20 }),
      hCell('업무 내용', { width: 27 }),
      hCell('AI 활용', { width: 10 }),
      hCell('예정 사항', { width: 22 }),
    ],
    tableHeader: true,
  });

  const tsRows = log.timeSlots.map((slot, idx) => {
    const aiText = slot.aiDetail
      ? (slot.aiDetail.aiTools.length > 0 ? slot.aiDetail.aiTools.join(', ') : 'O')
      : '';
    const altBg = idx % 2 === 1 ? CLR_LIGHT_BG : undefined;

    return new TableRow({
      children: [
        dCell(slot.timeSlot, { width: 13, alignment: AlignmentType.CENTER, bg: altBg }),
        eCell(slot.title, { width: 20, lines: 2 }),
        eCell(slot.content, { width: 27, lines: 2 }),
        dCell(aiText || ' ', { width: 10, alignment: AlignmentType.CENTER, color: aiText ? CLR_AI : CLR_MUTED, bg: altBg }),
        eCell(slot.planned, { width: 22, lines: 2 }),
      ],
    });
  });

  const timeSlotTable = new Table({
    rows: [tsHeaderRow, ...tsRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ═══════════════════════════════════════════
  // 3-B. 프랭클린 과업 (viewMode가 franklin일 때)
  // ═══════════════════════════════════════════
  const franklinChildren: (Paragraph | Table)[] = [];
  if (log.viewMode === 'franklin' && log.franklinTasks && log.franklinTasks.length > 0) {
    franklinChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '프랭클린 과업 목록', font: FONT, size: SZ_SUBTITLE, bold: true, color: CLR_TITLE }),
        ],
        spacing: { before: 200, after: 80 },
      })
    );

    const ftHeaderRow = new TableRow({
      children: [
        hCell('우선순위', { width: 10 }),
        hCell('번호', { width: 8 }),
        hCell('상태', { width: 10 }),
        hCell('과업', { width: 47 }),
        hCell('시간', { width: 15 }),
        hCell('비고', { width: 10 }),
      ],
      tableHeader: true,
    });

    const ftRows = log.franklinTasks.map((task, idx) => {
      const stCfg = FRANKLIN_STATUS_CONFIG[task.status];
      const pCfg = FRANKLIN_PRIORITY_CONFIG[task.priority];
      const linkedSlot = task.timeSlotId ? log.timeSlots.find(s => s.id === task.timeSlotId) : null;
      const altBg = idx % 2 === 1 ? CLR_LIGHT_BG : undefined;

      return new TableRow({
        children: [
          dCell(`${pCfg.label} (${pCfg.desc})`, { width: 10, alignment: AlignmentType.CENTER, bg: altBg }),
          dCell(`${task.priority}${task.number}`, { width: 8, alignment: AlignmentType.CENTER, bg: altBg }),
          dCell(`${stCfg.icon} ${stCfg.label}`, { width: 10, alignment: AlignmentType.CENTER, bg: altBg }),
          eCell(task.task, { width: 47, lines: 1 }),
          dCell(linkedSlot?.timeSlot || '—', { width: 15, alignment: AlignmentType.CENTER, bg: altBg }),
          dCell(task.note || '', { width: 10, bg: altBg }),
        ],
      });
    });

    franklinChildren.push(
      new Table({
        rows: [ftHeaderRow, ...ftRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
      })
    );
  }

  // ═══════════════════════════════════════════
  // 4. 세부 내용
  // ═══════════════════════════════════════════
  const detailTable = new Table({
    rows: [
      new TableRow({
        children: [
          hCell('세부 내용', { width: 15 }),
          eCell(log.detail || '', { width: 85, lines: 8 }),
        ],
      }),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
  });

  // ═══════════════════════════════════════════
  // 5. AI 활용 상세 (모든 슬롯, 페이지 나눔)
  // ═══════════════════════════════════════════
  const aiChildren: (Paragraph | Table)[] = [];

  aiChildren.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  aiChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'AI 활용 상세 보고', font: FONT, size: 28, bold: true, color: CLR_TITLE }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      border: {
        bottom: { style: BorderStyle.DOUBLE, size: 3, color: CLR_BORDER_OUTER, space: 6 },
      },
    })
  );

  aiChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${empName} | ${empDept} | ${dateFormatted}`, font: FONT, size: SZ_SMALL, color: CLR_MUTED }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  for (const slot of log.timeSlots) {
    const ai = slot.aiDetail;
    const hasAi = !!ai;

    // 슬롯 소제목
    aiChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: '■ ', font: FONT, size: SZ_HEADER, bold: true, color: hasAi ? CLR_AI : CLR_MUTED }),
          new TextRun({ text: `${slot.timeSlot}`, font: FONT, size: SZ_HEADER, bold: true, color: hasAi ? CLR_TITLE : CLR_MUTED }),
          new TextRun({ text: `  ${slot.title || '(미입력)'}`, font: FONT, size: SZ_HEADER, color: hasAi ? CLR_BODY : CLR_MUTED }),
        ],
        spacing: { before: 200, after: 80 },
      })
    );

    const addRow = (label: string, value: string, lines?: number): TableRow => {
      return new TableRow({
        children: [
          hCell(label, { width: 20, bg: CLR_HEADER_BG2 }),
          eCell(value, { width: 80, lines: lines || 2 }),
        ],
      });
    };

    const promptGrid1Text = ai?.promptGrid1?.map((r, i) => `${i + 1}. ${r.content}${r.note ? ` (${r.note})` : ''}`).join('\n') || '';
    const promptGrid2Text = ai?.promptGrid2?.map((r, i) => `${i + 1}. ${r.content}${r.note ? ` (${r.note})` : ''}`).join('\n') || '';

    const aiTable = new Table({
      rows: [
        addRow('업무 유형', ai?.workTypes.join(', ') || ''),
        addRow('AI 도구', ai?.aiTools.join(', ') || ''),
        addRow('지시사항', ai?.instructions || '', 3),
        addRow('지시사항 메모', ai?.instructionNote || '', 3),
        addRow('중요 참고사항', ai?.importantNotes || '', 3),
        addRow('1차 프롬프트', promptGrid1Text, 5),
        addRow('2차 프롬프트', promptGrid2Text, 5),
        addRow('보안 프롬프트 1', ai?.securityPrompt1 || '', 3),
        addRow('보안 프롬프트 2', ai?.securityPrompt2 || '', 3),
        addRow('규정', ai?.regulations || '', 3),
        addRow('준규정', ai?.semiRegulations || '', 3),
        addRow('선택규정', ai?.optionalRegulations || '', 3),
        addRow('분야규정', ai?.fieldRegulations || '', 3),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
    });

    aiChildren.push(aiTable);
  }

  // ═══════════════════════════════════════════
  // 문서 조립
  // ═══════════════════════════════════════════
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SZ_BODY, color: CLR_BODY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children: [
          // 결재란 (우측 정렬 — 테이블 자체를 우측에 배치)
          new Paragraph({
            children: [
              new TextRun({ text: '결재', font: FONT, size: SZ_SMALL, bold: true, color: CLR_TITLE }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 40 },
          }),
          approvalTable,

          emptyRow(),
          titleParagraph,
          dateLine,

          sectionTitle('1', '작성 정보'),
          infoTable,

          sectionTitle('2', '업무 분류'),
          categoryTable,

          sectionTitle('3', '시간대별 업무 내역'),
          intervalLine,
          timeSlotTable,

          // 프랭클린 과업 (franklin 모드일 때만)
          ...franklinChildren,

          sectionTitle(franklinChildren.length > 0 ? '5' : '4', '세부 내용'),
          detailTable,

          // AI 상세는 새 페이지
          ...aiChildren,

          // 꼬리말
          emptyRow(),
          new Paragraph({
            children: [
              new TextRun({ text: '― 이상 ―', font: FONT, size: SZ_SMALL, color: CLR_MUTED }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `업무일지_${empName}_${dateFile}.docx`);
}
