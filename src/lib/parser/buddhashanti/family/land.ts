import { RawFamily } from "./types";

import { jsonToPostgres } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { decodeSingleChoice } from "@/lib/resources/utils";
import { familyChoices } from "@/lib/resources/family";

export async function parseAgriculturalLand(r: RawFamily, ctx: any) {
  for (const i of r.agri.agricultural_land) {
    const agricultural_land = {
      id: i.__id,
      household_id: r.__id,
      ward_no: r.id.ward_no,
      land_ownernship_type: i.agland_oship,
      land_area:
        (i.land_area?.B02_3 ?? 0) * 6772.63 +
        (i.land_area?.B02_5 ?? 0) * 338.63 +
        (i.land_area?.B02_7 ?? 0) * 16.93,
      irrigation_source: decodeSingleChoice(
        i.irrigation_src,
        familyChoices.irrigation_source,
      ),
      irrigated_land_area:
        i.irrigation_src === "no_irrigation"
          ? null
          : i.irrigation?.irrigated_area,
    };

    const agricultureStatement = jsonToPostgres(
      "staging_buddhashanti_agricultural_land",
      agricultural_land,
      "ON CONFLICT(id) DO UPDATE SET",
    );

    if (agricultureStatement) {
      await ctx.db.execute(sql.raw(agricultureStatement));
    }
  }
}
