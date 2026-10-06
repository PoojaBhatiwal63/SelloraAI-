import { cn } from "@/lib/utils";
import { LayoutDashboard, UserRound, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import logo from "../../assets/logo.png";

export type PartnerTab = "dashboard" | "profile" | "product";

interface PartnerNavProps {
  activeTab: PartnerTab;
  onTabChange: (tab: PartnerTab) => void;
}

const TABS: {
  key: PartnerTab;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "profile",
    label: "Profile",
    icon: UserRound,
  },
  {
    key: "product",
    label: "Product",
    icon: Package,
  },
];

export default function PartnerNav({
  activeTab,
  onTabChange,
}: PartnerNavProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-2 flex items-center justify-between flex-wrap gap-3 h-16">

          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src={logo}
              alt="SelloraAI logo"
              className="h-7 w-7 rounded-sm object-contain"
            />

            <span className="text-lg font-semibold tracking-tight">
              SelloraAI
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {TABS.map((tab) => {
              const Icon = tab.icon;

              return (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.key)}
                  className={cn(
                    "gap-2",
                    activeTab === tab.key && "shadow-sm"
                  )}
                >
                  <Icon className="h-4 w-4" />

                  {tab.label}
                </Button>
              );
            })}
          </div>

        </div>
      </div>
    </header>
  );
}