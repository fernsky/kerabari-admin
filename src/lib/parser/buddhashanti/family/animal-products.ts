import { RawFamily } from "./types";
import { jsonToPostgres } from "@/lib/utils";
import { sql } from "drizzle-orm";

export async function parseAnimalProducts(r: RawFamily, ctx: any) {
  for (const i of r.agri.aprod_details) {
    const animalProduct = {
      id: i.__id,
      household_id: r.__id,
      ward_no: r.id.ward_no,
      product_name: i.aprod,
      product_name_other: i.apo.aprod_oth,
      unit: i.apon.aprod_unit,
      unit_other: i.apon.aprod_unit_oth,
      production: i.apon.aprod_prod,
    };

    const animalProductStatement = jsonToPostgres(
      "staging_buddhashanti_animal_product",
      animalProduct,
      "ON CONFLICT(id) DO UPDATE SET",
    );

    if (animalProductStatement) {
      await ctx.db.execute(sql.raw(animalProductStatement));
    }
  }
}
