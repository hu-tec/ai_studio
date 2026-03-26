import React from "react";
import { RankSection } from "../RankSection";
import { SummaryCards } from "../SummaryCards";
import { FeedbackSection } from "../FeedbackSection";

export function RanksPage() {
  return (
    <>
      <SummaryCards />
      <RankSection />
      <FeedbackSection />
    </>
  );
}
