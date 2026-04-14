import React from "react";
import { ServicesSection } from "../ServicesSection";
import { SummaryCards } from "../SummaryCards";
import { FeedbackSection } from "../FeedbackSection";

export function ServicesPage() {
  return (
    <>
      <SummaryCards />
      <ServicesSection />
      <FeedbackSection />
    </>
  );
}
