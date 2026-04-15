import React from "react";
import { useRules, DEPT_EMOJI } from "./RulesContext";
import { GroupSection } from "./GroupSection";

export function DepartmentSection() {
  const { state } = useRules();
  return (
    <GroupSection
      section="departments"
      title="부서별 업무 지침"
      icon="👥"
      addLabel="부서 추가"
      unitLabel="부서"
      groups={state.departments}
      emojiMap={DEPT_EMOJI}
    />
  );
}
