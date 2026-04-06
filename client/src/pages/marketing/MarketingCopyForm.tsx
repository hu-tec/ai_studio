import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface MarketingCopy {
  headline: string;
  subcopy: string;
  hook: string;
  ai_prompt: string;
  points: {
    surveillance: string;
    evaluation: string;
    approval: string;
  };
}

interface MarketingCopyFormProps {
  copy: MarketingCopy;
  onChange: (copy: MarketingCopy) => void;
}

export function MarketingCopyForm({ copy, onChange }: MarketingCopyFormProps) {
  const updateField = (field: keyof Omit<MarketingCopy, "points">, value: string) => {
    onChange({ ...copy, [field]: value });
  };

  const updatePoint = (field: keyof MarketingCopy["points"], value: string) => {
    onChange({ ...copy, points: { ...copy.points, [field]: value } });
  };

  return (
    <div className="space-y-2">
      {/* Row 1: Headline + Hook -- 2칼럼 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
            헤드라인
          </div>
          <div className="p-2">
            <Input
              value={copy.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              placeholder={'"AI 활용 실력, 검증으로 증명하세요."'}
              className="h-8 text-xs border-gray-200 rounded-md"
            />
          </div>
        </div>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
            후킹 문구
          </div>
          <div className="p-2">
            <Input
              value={copy.hook}
              onChange={(e) => updateField("hook", e.target.value)}
              placeholder={'"AI로 썼는데 왜 감점이죠?"'}
              className="h-8 text-xs border-gray-200 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Subcopy */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
          서브카피
        </div>
        <div className="p-2">
          <Textarea
            value={copy.subcopy}
            onChange={(e) => updateField("subcopy", e.target.value)}
            placeholder="오류/환각을 먼저 걸러내고, 전문가 기준으로 평가받으세요."
            rows={2}
            className="text-xs min-h-0 resize-none border-gray-200 rounded-md"
          />
        </div>
      </div>

      {/* Row 3: AI Prompt */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
          AI 지시문 (Prompt)
        </div>
        <div className="p-2">
          <Textarea
            value={copy.ai_prompt}
            onChange={(e) => updateField("ai_prompt", e.target.value)}
            placeholder="바로 복붙 가능한 AI 명령어를 입력하세요."
            rows={2}
            className="text-xs min-h-0 resize-none border-gray-200 rounded-md"
          />
        </div>
      </div>

      {/* Row 4: SEA Framework -- 3칼럼 */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="px-2.5 py-1 bg-[#f4f4f5] border-b border-gray-200 text-[10px] text-gray-500">
          핵심 포인트 (S / E / A)
        </div>
        <div className="p-2 grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-gray-500">감시 Surveillance</span>
            <Input
              value={copy.points.surveillance}
              onChange={(e) => updatePoint("surveillance", e.target.value)}
              placeholder="오류탐지, 환각감지"
              className="h-8 text-xs mt-0.5 border-gray-200 rounded-md"
            />
          </div>
          <div>
            <span className="text-[10px] text-gray-500">평가 Evaluation</span>
            <Input
              value={copy.points.evaluation}
              onChange={(e) => updatePoint("evaluation", e.target.value)}
              placeholder="루브릭 평가, 전문가 감수"
              className="h-8 text-xs mt-0.5 border-gray-200 rounded-md"
            />
          </div>
          <div>
            <span className="text-[10px] text-gray-500">승인 Approval</span>
            <Input
              value={copy.points.approval}
              onChange={(e) => updatePoint("approval", e.target.value)}
              placeholder="최종본 확정, 책임 승인"
              className="h-8 text-xs mt-0.5 border-gray-200 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
