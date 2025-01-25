import { family } from "@/server/db/schema";
import { kerabariAnimalProduct } from "@/server/db/schema/family/animal-products";
import { kerabariAnimal } from "@/server/db/schema/family/animals";
import { kerabariCrop } from "@/server/db/schema/family/crops";
import kerabariAgriculturalLand from "@/server/db/schema/family/agricultural-lands";
import { kerabariIndividual } from "@/server/db/schema/family/individual";

export type FamilyResult = typeof family.$inferSelect & {
  agriculturalLands: (typeof kerabariAgriculturalLand.$inferSelect)[];
  animals: (typeof kerabariAnimal.$inferSelect)[];
  animalProducts: (typeof kerabariAnimalProduct.$inferSelect)[];
  crops: (typeof kerabariCrop.$inferSelect)[];
  individuals: (typeof kerabariIndividual.$inferSelect)[];
};
