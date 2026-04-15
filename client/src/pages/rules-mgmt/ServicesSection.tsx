import React from "react";
import { useRules, SERVICE_EMOJI } from "./RulesContext";
import { GroupSection } from "./GroupSection";

export function ServicesSection() {
  const { state } = useRules();
  return (
    <GroupSection
      section="services"
      title="홈페이지 서비스 지침"
      icon="🌐"
      addLabel="서비스 추가"
      unitLabel="서비스"
      groups={state.services}
      emojiMap={SERVICE_EMOJI}
    />
  );
}
