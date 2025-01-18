import { createTRPCRouter } from "@/server/api/trpc";
import { getTokenStatsByAreaId, getAreaTokens } from "./procedures/tokens";
import {
  assignAreaToEnumerator,
  getUnassignedWardAreasofEnumerator,
  getAreaDetails,
} from "./procedures/assignment";
import {
  createArea,
  getAreas,
  getAreaById,
  updateArea,
} from "./procedures/basic";
import {
  requestArea,
  getUserAreaRequests,
  getAllAreaRequests,
  updateAreaRequestStatus,
} from "./procedures/requests";

export const areaRouter = createTRPCRouter({
  createArea,
  getAreas,
  getAreaById,
  updateArea,
  requestArea,
  getUserAreaRequests,
  getAllAreaRequests,
  updateAreaRequestStatus,
  getTokenStatsByAreaId,
  getAreaTokens,
  assignAreaToEnumerator,
  getUnassignedWardAreasofEnumerator,
  getAreaDetails,
});
