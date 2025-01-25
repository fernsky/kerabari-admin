import { family } from "@/server/db/schema";
import { buddhashantiAnimalProduct } from "@/server/db/schema/family/animal-products";
import { buddhashantiAnimal } from "@/server/db/schema/family/animals";
import { buddhashantiCrop } from "@/server/db/schema/family/crops";
import buddhashantiAgriculturalLand from "@/server/db/schema/family/agricultural-lands";
import { buddhashantiIndividual } from "@/server/db/schema/family/individual";

export type FamilyResult = typeof family.$inferSelect & {
  agriculturalLands: (typeof buddhashantiAgriculturalLand.$inferSelect)[];
  animals: (typeof buddhashantiAnimal.$inferSelect)[];
  animalProducts: (typeof buddhashantiAnimalProduct.$inferSelect)[];
  crops: (typeof buddhashantiCrop.$inferSelect)[];
  individuals: (typeof buddhashantiIndividual.$inferSelect)[];
};
