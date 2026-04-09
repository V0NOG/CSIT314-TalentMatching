// AlternativeLayout.tsx — kept for potential future use, AI routes removed
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const AlternativeLayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "xl:ml-[290px]" : "xl:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AlternativeLayout: React.FC = () => (
  <SidebarProvider>
    <AlternativeLayoutContent />
  </SidebarProvider>
);

export default AlternativeLayout;
