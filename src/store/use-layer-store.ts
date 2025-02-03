import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { produce } from "immer";
import { Area } from "@/server/api/routers/areas/area.schema";
import { Ward } from "@/server/api/routers/ward/ward.schema";

interface LayerState {
  wards: Ward[];
  areas: Area[];
  wardLayers: {
    [wardNumber: string]: {
      visible: boolean;
      areas: {
        [areaId: string]: boolean;
      };
    };
  };
  setWards: (wards: Ward[]) => void;
  setAreas: (areas: Area[]) => void;
  setWardVisibility: (wardNumber: string, visible: boolean) => void;
  setAreaVisibility: (
    wardNumber: string,
    areaId: string,
    visible: boolean,
  ) => void;
  initializeWardLayer: (wardNumber: string, areaIds: string[]) => void;
}

export const useLayerStore = create<LayerState>()(
  devtools((set) => ({
    wards: [],
    areas: [],
    wardLayers: {},

    setWards: (wards) => set({ wards }),
    setAreas: (areas) => set({ areas }),

    setWardVisibility: (wardNumber, visible) =>
      set((state) => ({
        wardLayers: {
          ...state.wardLayers,
          [wardNumber]: {
            ...state.wardLayers[wardNumber],
            visible,
          },
        },
      })),

    setAreaVisibility: (wardNumber, areaId, visible) =>
      set((state) => ({
        wardLayers: {
          ...state.wardLayers,
          [wardNumber]: {
            ...state.wardLayers[wardNumber],
            areas: {
              ...state.wardLayers[wardNumber]?.areas,
              [areaId]: visible,
            },
          },
        },
      })),

    initializeWardLayer: (wardNumber, areaIds) =>
      set((state) => ({
        wardLayers: {
          ...state.wardLayers,
          [wardNumber]: {
            visible: true,
            areas: Object.fromEntries(areaIds.map((id) => [id, true])),
          },
        },
      })),
  })),
);
