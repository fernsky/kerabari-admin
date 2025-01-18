import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ClipboardCheck, Users, List, ArrowRight } from "lucide-react";
import { AreaTabs } from "./area-tabs";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "react-responsive";

const tabs = [
  {
    name: "Areas",
    shortName: "Areas", // Added short names for mobile
    icon: <List className="h-5 w-5" />,
    description: "View all areas and their current status",
    value: "areas",
  },
  {
    name: "New Area Requests",
    shortName: "Requests",
    icon: <MapPin className="h-5 w-5" />,
    description: "View and manage area access requests",
    value: "requests",
  },
  {
    name: "Area Actions",
    shortName: "Actions",
    icon: <ClipboardCheck className="h-5 w-5" />,
    description: "Process area completion and withdrawal requests",
    value: "actions",
  },
];

export const AreaSidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 1024 });

  if (isMobile) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Area Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs
              defaultValue={tabs[0].value}
              onValueChange={(value) =>
                setActiveTab(tabs.findIndex((tab) => tab.value === value))
              }
              className="w-full h-fit"
            >
              <TabsList className="flex min-h-[40px] flex-wrap gap-2 bg-transparent p-0">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex-1 items-center gap-2 px-3 py-2 sm:flex-none sm:min-w-[120px]"
                  >
                    <span className="sm:hidden flex items-center justify-center">
                      {tab.icon}
                      <span className="ml-2 text-xs">{tab.shortName}</span>
                    </span>
                    <span className="hidden sm:flex sm:items-center sm:gap-2">
                      {tab.icon}
                      <span>{tab.name}</span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card">
          <div className="p-4">
            <AreaTabs activeTab={activeTab} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      {/* Sidebar */}
      <Card className="lg:col-span-1 h-[calc(100vh-13rem)] flex flex-col">
        <CardHeader className="border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Navigation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-1 overflow-auto">
          <nav className="space-y-2 h-full">
            {tabs.map((tab, index) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(index)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-all hover:bg-muted",
                  activeTab === index
                    ? "border-primary/50 bg-primary/5 shadow-sm"
                    : "border-transparent",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-md p-2",
                        activeTab === index
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {tab.icon}
                    </div>
                    <div className="space-y-0.5">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          activeTab === index
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {tab.name}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={cn(
                      "h-5 w-5",
                      activeTab === index
                        ? "text-primary"
                        : "text-muted-foreground/40",
                    )}
                  />
                </div>
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* Content Area */}
      <Card className="lg:col-span-3 h-[calc(100vh-13rem)] overflow-auto">
        <CardContent className="p-6">
          <AreaTabs activeTab={activeTab} />
        </CardContent>
      </Card>
    </div>
  );
};
