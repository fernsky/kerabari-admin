import { createTRPCRouter } from "@/server/api/trpc";
import { getAll, getById, getStats } from "./procedures/query";
// import { update, deleteBuilding } from "./procedures/update";
import {
  approve,
  requestEdit,
  reject,
  getStatusHistory,
} from "./procedures/status";
import { assignToEnumerator } from "./procedures/assignment";

export const familyRouter = createTRPCRouter({
  getAll,
  getById,
  // update,
  // delete: deleteBuilding,
  getStats,
  approve,
  requestEdit,
  reject,
  getStatusHistory,
  assignToEnumerator,
});
