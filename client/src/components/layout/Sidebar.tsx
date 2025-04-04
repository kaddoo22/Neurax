import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { CyberButton } from "@/components/ui/cyber-button";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onLogout: () => void;
  username: string;
}

const Sidebar = ({ open, setOpen, onLogout, username }: SidebarProps) => {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
    { href: "/ai-autonomous", icon: "fas fa-robot", label: "AI Autonomous" },
    { href: "/manual-post", icon: "fas fa-edit", label: "Manual Post" },
    { href: "/crypto-trading", icon: "fab fa-bitcoin", label: "Crypto Trading" },
    { href: "/analytics", icon: "fas fa-chart-pie", label: "Analytics" },
    { href: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-cyberDark border-r border-neonGreen/30 p-4 transition-all duration-300 z-30 transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-future text-2xl font-bold text-neonGreen glitch-text" data-text="NeuraX">
            NeuraX
          </h1>
          <button
            id="closeSidebar"
            className="lg:hidden text-techWhite hover:text-neonGreen text-xl"
            onClick={() => setOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="mb-8">
          <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-neonGreen/20 to-cyberBlue/20 flex items-center justify-center border border-neonGreen/40 animate-pulse-glow mb-3">
            <i className="fas fa-user-astronaut text-2xl text-neonGreen"></i>
          </div>
          <p className="text-center text-matrixGreen text-sm mb-1">
            User: {username}
          </p>
          <div className="text-center text-xs text-techWhite/60 flex justify-center gap-1">
            <div className="px-2 py-1 bg-neonGreen/10 rounded border border-neonGreen/20">
              PRO
            </div>
            <div className="px-2 py-1 bg-electricPurple/10 rounded border border-electricPurple/20">
              VERIFIED
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "nav-item flex items-center gap-3 p-3 rounded hover:bg-neonGreen/10 hover:text-neonGreen transition-all duration-200 border border-transparent hover:border-neonGreen/30 group",
                  location === item.href
                    ? "text-neonGreen bg-neonGreen/10 border-neonGreen/30"
                    : "text-matrixGreen"
                )}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                <span>{item.label}</span>
                <span
                  className={cn(
                    "h-1 w-1 rounded-full bg-neonGreen ml-auto",
                    location === item.href
                      ? "animate-pulse"
                      : "opacity-0 group-hover:animate-pulse"
                  )}
                ></span>
              </a>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <a
            href="#"
            className="text-xs text-center text-techWhite/60 hover:text-techWhite block mb-2"
          >
            <i className="fas fa-info-circle mr-1"></i> Help & Documentation
          </a>
          <CyberButton
            className="w-full"
            onClick={onLogout}
            iconLeft={<i className="fas fa-sign-out-alt"></i>}
          >
            DISCONNECT
          </CyberButton>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
