import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface LayerState {
  wardLayers: {
    [wardNumber: string]: {
      visible: boolean;
      areas: {
        [areaId: string]: boolean;
      };
    };
  };
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
    wardLayers: {},

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
            visible: false, // Changed from true to false
            areas: areaIds.reduce(
              (acc, id) => ({ ...acc, [id]: false }), // Changed from true to false
              {},
            ),
          },
        },
      })),
  })),
);
