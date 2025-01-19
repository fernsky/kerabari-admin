"use client";

import { useState } from "react";
import { AreaTabs } from "./area-tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AreaNavigation() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" onClick={() => setActiveTab(0)}>
            Area List
          </TabsTrigger>
          <TabsTrigger value="requests" onClick={() => setActiveTab(1)}>
            Area Requests
          </TabsTrigger>
          <TabsTrigger value="actions" onClick={() => setActiveTab(2)}>
            Quick Actions
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <AreaTabs activeTab={activeTab} />
    </div>
  );
}
