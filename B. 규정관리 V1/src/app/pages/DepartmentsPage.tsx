import React from "react";
import { DepartmentSection } from "../components/DepartmentSection";
import { SummaryCards } from "../components/SummaryCards";
import { FeedbackSection } from "../components/FeedbackSection";

export function DepartmentsPage() {
  return (
    <>
      <SummaryCards />
      <DepartmentSection />
      <FeedbackSection />
    </>
  );
}
