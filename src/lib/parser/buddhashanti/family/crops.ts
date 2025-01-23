import { RawFamily } from "./types";
import { jsonToPostgres } from "@/lib/utils";
import { sql } from "drizzle-orm";

export async function parseCrops(r: RawFamily, ctx: any) {
  const parseBaseCrop = (i: any, cropType: string) => ({
    id: i.__id,
    household_id: r.__id,
    ward_no: r.id.ward_no,
    crop_type: cropType,
    crop_name: i[cropType],
    area: calculateArea(i, cropType),
    production: i[`${cropType.charAt(0)}p`][`${cropType}_prod`],
    tree_count: getTreeCount(i, cropType),
  });

  const calculateArea = (item: any, type: string) => {
    const desc =
      item[`${type}_area_description`] || item[`${type}s_area_description`];
    return (
      (desc[`${type}_bigha`] ?? 0) * 6772.63 +
      (desc[`${type}_kattha`] ?? 0) * 338.63 +
      (desc[`${type}_dhur`] ?? 0) * 16.93
    );
  };

  const getTreeCount = (item: any, type: string) => {
    if (type === "fruit") {
      return item.fruits_trees_count ?? 0;
    }
    if (type === "ccrop" && item.isBetel === "1") {
      return item.betel_tree_count ?? 0;
    }
    return null;
  };

  const processCropType = async (items: any[], cropType: string) => {
    for (const i of items) {
      const crop = parseBaseCrop(i, cropType);
      const cropStatement = jsonToPostgres(
        "staging_buddhashanti_crop",
        crop,
        "ON CONFLICT(id) DO UPDATE SET",
      );
      if (cropStatement) {
        await ctx.db.execute(sql.raw(cropStatement));
      }
    }
  };

  if (r.agri.food) {
    const cropTypes = {
      fcrop: r.agri.food.fcrop_details,
      pulse: r.agri.food.pulse_details,
      vtable: r.agri.food.vtable_details,
      oseed: r.agri.food.oseed_details,
      fruit: r.agri.food.fruit_details,
      spice: r.agri.food.spice_details,
      ccrop: r.agri.food.ccrop_details,
    };

    for (const [type, items] of Object.entries(cropTypes)) {
      if (items?.length > 0) {
        await processCropType(items, type);
      }
    }
  }
}
