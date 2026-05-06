// frontend/src/layout/AppSidebar.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  GridIcon,
  UserCircleIcon,
  ListIcon,
  PageIcon,
  PieChartIcon,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

// Items shown to candidates (job seekers)
const candidateNavItems: NavItem[] = [
  { icon: <GridIcon />,       name: "Dashboard",        path: "/" },
  { icon: <ListIcon />,       name: "Browse Jobs",      path: "/jobs" },
  { icon: <PieChartIcon />,   name: "Recommended Jobs", path: "/candidate/recommendations" },
  { icon: <PageIcon />,       name: "Resume Builder",   path: "/candidate/resume" },
  { icon: <ListIcon />,       name: "My Applications",  path: "/candidate/applications" },
];

// Items shown to employers
const employerNavItems: NavItem[] = [
  { icon: <GridIcon />,       name: "Dashboard",              path: "/" },
  { icon: <UserCircleIcon />, name: "Company Profile",        path: "/employer/profile" },
  {
    icon: <PageIcon />,
    name: "Job Postings",
    subItems: [
      { name: "All Postings",  path: "/employer/jobs" },
      { name: "Post a Job",    path: "/employer/jobs/new" },
      { name: "Applications",  path: "/employer/applications" },
    ],
  },
  { icon: <ListIcon />,       name: "Browse Candidates",      path: "/candidates" },
  { icon: <PieChartIcon />,   name: "AI Recommendations",     path: "/employer/recommendations" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, setIsMobileOpen } = useSidebar();
  const { isCandidate, isEmployer } = useAuth();
  const location = useLocation();

  const navItems = isCandidate ? candidateNavItems : isEmployer ? employerNavItems : [];

  useEffect(() => {
    if (isMobileOpen) setIsMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<number, number>>({});
  const subMenuRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let matched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems?.some((sub) => isActive(sub.path))) {
        setOpenSubmenu(index);
        matched = true;
      }
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prev) => ({
        ...prev,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev === index ? null : index));
  };

  const sidebarExpanded = isExpanded || isHovered || isMobileOpen;

  return (
    <aside
      className={`fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        xl:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-8 flex ${!sidebarExpanded ? "xl:justify-center" : "justify-start"}`}>
        <Link to="/">
          {sidebarExpanded ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
              !sidebarExpanded ? "xl:justify-center" : "justify-start"
            }`}
          >
            {sidebarExpanded ? "Menu" : <HorizontaLDots className="size-6" />}
          </h2>

          <ul className="flex flex-col gap-1">
            {navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => handleSubmenuToggle(index)}
                      className={`menu-item group ${
                        openSubmenu === index ? "menu-item-active" : "menu-item-inactive"
                      } cursor-pointer ${!sidebarExpanded ? "xl:justify-center" : "xl:justify-start"}`}
                    >
                      <span className={`menu-item-icon-size ${openSubmenu === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                        {nav.icon}
                      </span>
                      {sidebarExpanded && <span className="menu-item-text">{nav.name}</span>}
                      {sidebarExpanded && (
                        <ChevronDownIcon
                          className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu === index ? "rotate-180 text-brand-500" : ""}`}
                        />
                      )}
                    </button>
                    {sidebarExpanded && (
                      <div
                        ref={(el) => { subMenuRefs.current[index] = el; }}
                        className="overflow-hidden transition-all duration-300"
                        style={{ height: openSubmenu === index ? `${subMenuHeight[index]}px` : "0px" }}
                      >
                        <ul className="mt-2 space-y-1 ml-9">
                          {nav.subItems.map((sub) => (
                            <li key={sub.name}>
                              <Link
                                to={sub.path}
                                className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  nav.path && (
                    <Link
                      to={nav.path}
                      className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                    >
                      <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                        {nav.icon}
                      </span>
                      {sidebarExpanded && <span className="menu-item-text">{nav.name}</span>}
                    </Link>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
