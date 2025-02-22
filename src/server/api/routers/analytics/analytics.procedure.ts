import { createTRPCRouter } from "@/server/api/trpc";
import {
  getSubmissionStats,
  getAreaStats,
  getEnumeratorStats,
  getWardStats,
  getAgeDistribution,
  getAncestorLanguageDistribution,
  getGenderDistribution,
  getCasteDistribution,
  getDisabilityDistribution,
  getMaritalStatusDistribution,
  getMarriageAgeDistribution,
  getMotherTongueDistribution,
  getReligionDistribution
  
} from "./procedures/basic";

export const analyticsRouter = createTRPCRouter({
  getSubmissionStats,
  getAreaStats,
  getEnumeratorStats,
  getWardStats,
  getAgeDistribution,
  getAncestorLanguageDistribution,
  getGenderDistribution,
  getCasteDistribution,
  getDisabilityDistribution,
  getMaritalStatusDistribution,
  getMarriageAgeDistribution,
  getMotherTongueDistribution,
  getReligionDistribution
});
