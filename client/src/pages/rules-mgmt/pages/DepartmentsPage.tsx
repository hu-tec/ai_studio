import React from "react";
import { DepartmentSection } from "../DepartmentSection";
import { SummaryCards } from "../SummaryCards";
import { FeedbackSection } from "../FeedbackSection";

export function DepartmentsPage() {
  return (
    <>
      <SummaryCards />
      <DepartmentSection />
      <FeedbackSection />
    </>
  );
}
