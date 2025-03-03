import { createTRPCRouter } from "@/server/api/trpc";
import { getUniqueEnumeratorsWardWise, buildingsRouter, getTotalBuildingsByEnumerator, getAllUniqueEnumerators, getBuildingsByAreaCode } from "./procedures/buildings";

export const enumwiseRouter = createTRPCRouter({
  getUniqueEnumeratorsWardWise,
  getTotalBuildingsByEnumerator,
  getAllUniqueEnumerators,
  getBuildingsByAreaCode
});
