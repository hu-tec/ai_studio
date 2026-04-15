import React from "react";
import { useRules, RANK_EMOJI } from "./RulesContext";
import { GroupSection } from "./GroupSection";

export function RankSection() {
  const { state } = useRules();
  return (
    <GroupSection
      section="ranks"
      title="직급별 업무 지침"
      icon="🥇"
      addLabel="직급 추가"
      unitLabel="직급"
      groups={state.ranks}
      emojiMap={RANK_EMOJI}
    />
  );
}
