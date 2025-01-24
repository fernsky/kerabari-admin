import { createTRPCRouter } from "@/server/api/trpc";
import { create } from "./procedures/create";
import { getAll, getById, getStats } from "./procedures/query";
import { update, deleteBuilding } from "./procedures/update";
import {
  approve,
  requestEdit,
  reject,
  getStatusHistory,
} from "./procedures/status";
import { assignToEnumerator } from "./procedures/assignment";
import * as assign from "./procedures/assign";

export const buildingRouter = createTRPCRouter({
  create,
  getAll,
  getById,
  update,
  delete: deleteBuilding,
  getStats,
  approve,
  requestEdit,
  reject,
  getStatusHistory,
  assignToEnumerator,
  assignWard: assign.assignWard,
  assignArea: assign.assignArea,
  assignEnumerator: assign.assignEnumerator,
  assignBuildingToken: assign.assignBuildingToken,
  getInvalidBuildings: assign.getInvalidBuildings,
});
