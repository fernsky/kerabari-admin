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
import { ScrollArea } from "@/components/ui/scroll-area"; // Add this import
import { useEffect, useState } from "react";
import { Layers, X } from "lucide-react"; // Import icons

export const LayerControl = () => {
  const { data: wardsData, isLoading: isLoadingWards } =
    api.ward.getWards.useQuery();
  const { data: areasData, isLoading: isLoadingAreas } =
    api.area.getAreas.useQuery();

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
    <div className="absolute right-[50px] top-2 z-[1000] flex flex-col items-end sm:right-[50px]">
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }}
        className="mb-2 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
      >
        {isExpanded ? (
          <X className="h-4 w-4" />
        ) : (
          <Layers className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <Card className="w-[220px] bg-white p-4 shadow-lg sm:w-[220px] z-[10000]">
          <h3 className="mb-4 font-semibold">Layers</h3>
          <ScrollArea className="h-[200px] sm:h-[300px] md:h-[300px] pr-4">
            <Accordion type="multiple" className="w-full">
              {wards?.map((ward) => (
                <AccordionItem
                  key={ward.wardNumber}
                  value={`ward-${ward.wardNumber}`}
                >
                  <AccordionTrigger className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={wardLayers[ward.wardNumber]?.visible}
                        onCheckedChange={(checked) =>
                          handleWardVisibility(
                            ward.wardNumber.toString(),
                            checked as boolean,
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-gray-700">
                        Ward {ward.wardNumber}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-6 space-y-2">
                      {areas
                        .filter((area) => area.wardNumber === ward.wardNumber)
                        .map((area) => (
                          <div
                            key={area.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={
                                wardLayers[ward.wardNumber]?.areas[area.id]
                              }
                              onCheckedChange={(checked) =>
                                setAreaVisibility(
                                  ward.wardNumber.toString(),
                                  area.id,
                                  checked as boolean,
                                )
                              }
                            />
                            <span className="text-xs text-gray-700">
                              Area {area.code}
                            </span>
                          </div>
                        ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};
