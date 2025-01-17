export interface AreaAction {
  id: string;
  wardNumber: number;
  code: string;
  areaStatus: string;
  assignedTo?: {
    name: string;
  };
}

export interface ActionHandlerProps {
  data: AreaAction[];
  onAction: (
    areaId: string,
    type: string,
    action: "approve" | "reject",
  ) => void;
}
