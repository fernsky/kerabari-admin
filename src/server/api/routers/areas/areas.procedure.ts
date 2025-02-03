import { createTRPCRouter } from "@/server/api/trpc";
import { getTokenStatsByAreaId, getAreaTokens } from "./procedures/tokens";
import {
  assignAreaToEnumerator,
  getUnassignedWardAreasofEnumerator,
  getAreaDetails,
  getAreasByWardforRequest,
} from "./procedures/assignment";
import {
  createArea,
  getAreas,
  getAreaById,
  updateArea,
  getAvailableAreaCodes,
  getLayerAreas,
  getAreaBoundaryByCode,
  getAreasWithSubmissionCounts
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
  getLayerAreas,
  getAreaById,
  updateArea,
  requestArea,
  getUserAreaRequests,
  getAreaBoundaryByCode,
  getAllAreaRequests,
  getAreasWithSubmissionCounts,
  updateAreaRequestStatus,
  getTokenStatsByAreaId,
  getAreaTokens,
  assignAreaToEnumerator,
  getAvailableAreaCodes,
  getUnassignedWardAreasofEnumerator,
  getAreaDetails,
  getAreasByWardforRequest,
});
