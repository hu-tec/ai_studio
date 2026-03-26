import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { ClipboardCheck, LayoutDashboard } from "lucide-react";
import { Toaster } from "sonner";
import { StoreProvider } from "./interviewStore";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: "/", label: "면접 평가", icon: ClipboardCheck },
    { path: "/dashboard", label: "대시보드", icon: LayoutDashboard },
  ];

  return (
    <StoreProvider>
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 flex items-center justify-between h-[48px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-gray-900" style={{ fontSize: "1rem", fontWeight: 600 }}>면접 평가 시스템</span>
          </div>
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                  style={{ fontSize: "0.85rem", fontWeight: isActive ? 500 : 400 }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1920px] mx-auto px-4 py-3">
        <Outlet />
      </main>
    </div>
    </StoreProvider>
  );
}