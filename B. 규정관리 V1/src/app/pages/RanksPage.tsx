import React from "react";
import { RankSection } from "../components/RankSection";
import { SummaryCards } from "../components/SummaryCards";
import { FeedbackSection } from "../components/FeedbackSection";

export function RanksPage() {
  return (
    <>
      <SummaryCards />
      <RankSection />
      <FeedbackSection />
    </>
  );
}
