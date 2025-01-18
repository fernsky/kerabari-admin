import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ClipboardCheck, List, Plus } from "lucide-react";
import { AreaTabs } from "./area-tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const tabs = [
  {
    name: "Areas",
    icon: <List className="h-5 w-5" />,
    description: "View all areas and their current status",
    value: "areas",
  },
  {
    name: "Requests",
    icon: <MapPin className="h-5 w-5" />,
    description: "View and manage area access requests",
    value: "requests",
  },
  {
    name: "Actions",
    icon: <ClipboardCheck className="h-5 w-5" />,
    description: "Process area completion and withdrawal requests",
    value: "actions",
  },
];

export const AreaNavigation = () => {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Areas</h2>
        <Button
          onClick={() => router.push("/area/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Area</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-4">
        {tabs.map((tab, index) => (
          <Button
            key={tab.value}
            variant={activeTab === index ? "default" : "ghost"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab(index)}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.name}</span>
            <span className="sm:hidden">{tab.name.split(" ")[0]}</span>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <AreaTabs activeTab={activeTab} />
        </CardContent>
      </Card>
    </div>
  );
};
