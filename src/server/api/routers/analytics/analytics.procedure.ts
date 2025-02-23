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

import {
  getAgriculturalLandStats,
  getIrrigationStats,
  getCropStats,
  getAnimalStats,
  getAnimalProductStats,
  getAgriculturalLandOverview,
  getAgricultureOverview
} from "./procedures/agricultural";

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
  getReligionDistribution,
  // Agricultural procedures
  getAgriculturalLandStats,
  getIrrigationStats,
  getCropStats,
  getAnimalStats,
  getAnimalProductStats,
  getAgriculturalLandOverview,
  getAgricultureOverview
});
