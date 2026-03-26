import React from "react";
import { ModuleSection } from "./components/ModuleSection";
import { PluginSection } from "./components/PluginSection";
import { WizardSection } from "./components/WizardSection";
import { RoleSection } from "./components/RoleSection";
import { PreviewSection } from "./components/PreviewSection";
import { DashboardHeader } from "./components/DashboardHeader";

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white overflow-x-hidden">
      <main className="relative z-10 flex-1 w-full max-w-[1920px] mx-auto p-6 md:p-10 lg:p-14">
        <DashboardHeader />
        
        <div className="flex flex-col gap-6">
          {/* Row 1: Module Management (Full Width Header Style) */}
          <ModuleSection />

          {/* Row 2: Plugin Management (Full Width Header Style) */}
          <PluginSection />

          {/* Row 3: Three Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Column 1: Permissions/Roles (4/12) */}
            <div className="lg:col-span-4 h-full">
              <RoleSection />
            </div>

            {/* Column 2: Wizard/Form (5/12) */}
            <div className="lg:col-span-5 h-full">
              <WizardSection />
            </div>

            {/* Column 3: Preview (3/12) */}
            <div className="lg:col-span-3 h-full">
              <PreviewSection />
            </div>
          </div>
        </div>

        <footer className="mt-20 pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-black text-zinc-900 tracking-widest uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 shadow-lg shadow-zinc-400"></span>
              관리자 통합 시스템 v1.0.4 🛡️
            </p>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Integrated Multi-Tenant Management Hub
            </p>
          </div>
          <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-[0.2em] italic">
            Copyright © 2026 Admin Hub. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
