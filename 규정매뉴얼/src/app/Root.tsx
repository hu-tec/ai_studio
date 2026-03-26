import { Outlet } from "react-router";

export function Root() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436]">
      <Outlet />
    </div>
  );
}
