export interface AreaAction {
  id: string;
  wardNumber: number;
  code: number;
  areaStatus: string;
  assignedTo: {
    id: string;
    name: string;
  } | null;
  geometry: any | null;
  centroid: any | null;
}

export interface ActionHandlerProps {
  data: AreaAction[];
  onAction: (
    areaId: string,
    type: string,
    action: "approve" | "reject",
  ) => void;
}
