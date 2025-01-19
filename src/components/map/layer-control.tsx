"use client";

import { api } from "@/trpc/react";
import { useLayerStore } from "@/store/use-layer-store";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Layers, X, MapPin, Map, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const LayerControl = () => {
  const { data: wardsData, isLoading: isLoadingWards } =
    api.ward.getWards.useQuery();
  const { data: areasData, isLoading: isLoadingAreas } =
    api.area.getLayerAreas.useQuery();

  const {
    wards,
    areas,
    wardLayers,
    setWards,
    setAreas,
    setWardVisibility,
    setAreaVisibility,
    initializeWardLayer,
  } = useLayerStore();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleWardVisibility = (wardNumber: string, checked: boolean) => {
    setWardVisibility(wardNumber, checked);
    // Remove this if you want completely independent behavior
    // if (!checked) {
    //   const wardAreas = areas.filter((area) => area.wardNumber.toString() === wardNumber);
    //   wardAreas.forEach((area) => {
    //     setAreaVisibility(wardNumber, area.id, false);
    //   });
    // }
  };

  // Initialize store with data
  useEffect(() => {
    if (wardsData && areasData) {
      setWards(wardsData);
      setAreas(areasData);

      wardsData.forEach((ward) => {
        const wardAreas = areasData.filter(
          (area) => area.wardNumber === ward.wardNumber,
        );
        initializeWardLayer(
          ward.wardNumber.toString(),
          wardAreas.map((area) => area.id),
        );
      });
    }
  }, [wardsData, areasData, setWards, setAreas, initializeWardLayer]);

  if (isLoadingWards || isLoadingAreas) {
    return null;
  }

  return (
    <div className="absolute right-[8px] top-[80px] z-[1000] flex flex-col items-end">
      <Button
        variant="default"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }}
        className="mb-2 rounded-full bg-white p-2 shadow-xl hover:bg-gray-100 transition-all duration-300 ease-in-out transform hover:scale-105"
      >
        {isExpanded ? (
          <X className="h-4 w-4 text-gray-700 transition-transform duration-200" />
        ) : (
          <Layers className="h-4 w-4 text-gray-700 transition-transform duration-200" />
        )}
      </Button>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out transform",
          isExpanded
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full pointer-events-none",
        )}
      >
        <Card className="w-[260px] sm:w-[280px] bg-white/95 backdrop-blur-sm p-4 shadow-xl border-gray-200/50">
          <div className="flex items-center gap-2 mb-4">
            <Map className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">Map Layers</h3>
          </div>

          <Separator className="mb-4" />

          <ScrollArea className="h-[min(calc(100vh-400px),350px)] pr-4">
            <Accordion
              type="multiple"
              className="space-y-2 transition-all duration-200"
            >
              {wards?.map((ward) => (
                <AccordionItem
                  key={ward.wardNumber}
                  value={`ward-${ward.wardNumber}`}
                  className="border rounded-lg px-2 shadow-sm bg-white transition-all duration-200 hover:shadow-md"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 w-full">
                      <Checkbox
                        checked={wardLayers[ward.wardNumber]?.visible}
                        onCheckedChange={(checked) =>
                          handleWardVisibility(
                            ward.wardNumber.toString(),
                            checked as boolean,
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-2"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          Ward {ward.wardNumber}
                        </span>
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {
                            areas.filter(
                              (area) => area.wardNumber === ward.wardNumber,
                            ).length
                          }{" "}
                          areas
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3 transition-all duration-200">
                    <div className="ml-8 space-y-2 border-l-2 border-gray-100 pl-4">
                      {areas
                        .filter((area) => area.wardNumber === ward.wardNumber)
                        .map((area) => (
                          <div
                            key={area.id}
                            className="flex items-center gap-3 group hover:bg-gray-50 p-1 rounded-md transition-all duration-200 ease-in-out"
                          >
                            <Checkbox
                              checked={
                                wardLayers[ward.wardNumber]?.areas[area.id]
                              }
                              onCheckedChange={(checked) => {
                                setAreaVisibility(
                                  ward.wardNumber.toString(),
                                  area.id,
                                  checked as boolean,
                                );
                              }}
                              className="data-[state=checked]:bg-primary/80 border-2"
                            />
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                Area {area.code}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};
