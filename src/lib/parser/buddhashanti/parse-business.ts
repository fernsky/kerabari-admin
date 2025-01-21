import { jsonToPostgres } from "@/lib/utils";
import { sql } from "drizzle-orm";
import { RawBusiness } from "./business/types";
import { processGPSData } from "../utils";

/**
 * Parses raw building survey data into normalized database structure
 *
 * @param r - Raw building data from ODK
 * @returns Normalized building data matching database schema
 */
export async function parseAndInsertInStaging(r: RawBusiness, ctx: any) {
  // Process GPS data using the new function
  const gpsData = processGPSData(r.b_location);

  const mainBusinessTable = {
    // Unique Identifier
    id: r.__id,

    // Enumerator Information
    enumerator_name: r.enumerator_introduction.enumerator_name,
    enumerator_id: r.enumerator_introduction.enumerator_id,
    phone: r.enumerator_introduction.enumerator_phone,
    building_token: r.enumerator_introduction.building_token_number,

    // Business Basic Information
    business_name: r.business_name,
    ward_no: r.b_addr.ward_no,
    area_code: r.b_addr.area_code,
    business_no: r.b_addr.biz_no,
    locality: r.b_addr.locality,

    // Operator Details
    operator_name: r.b.op_name,
    operator_phone: r.b.opph,
    operator_age: r.b.op_age,
    operator_gender: r.b.op_gender,
    operator_education: r.b.op_edu_lvl,

    // Business Classification
    business_nature: r.business_nature,
    business_nature_other: r.business_nature_other,
    business_type: r.business_type,
    business_type_other: r.business_type_other,

    // Registration and Legal Information
    registration_status: r.is_registered,
    registered_bodies: r.registered_bodies,
    registered_bodies_other: r.registered_bodies_other,
    statutory_status: r.statutory_status,
    statutory_status_other: r.statutory_status_other,
    pan_status: r.has_pan,
    pan_number: r.pan_no,

    // Location Data
    gps: gpsData.gps,
    altitude: gpsData.altitude,
    gps_accuracy: gpsData.gpsAccuracy,

    // Financial and Property Information
    investment_amount: r.investment,
    business_location_ownership: r.business_location_ownership,
    business_location_ownership_other: r.business_location_ownership_oth,

    // Hotel Information
    hotel_accommodation_type: r.hotel.accomodation_type,
    hotel_room_count: r.hotel.room_no,
    hotel_bed_count: r.hotel.bed_no,
    hotel_room_type: r.hotel.room_type,
    hotel_has_hall: r.hotel.has_hall,
    hotel_hall_capacity: r.hotel.hcpcty,

    // Employee Information
    has_partners: r.emp.has_partners,
    total_partners: r.emp.prt.total_partners,
    nepali_male_partners: r.emp.prt.nepali_male_partners,
    nepali_female_partners: r.emp.prt.nepali_female_partners,
    has_foreign_partners: r.emp.prt.has_foreign_partners,
    foreign_male_partners: r.emp.prt.foreign_male_partners,
    foreign_female_partners: r.emp.prt.foreign_female_partners,

    has_involved_family: r.emp.has_involved_family,
    total_involved_family: r.emp.efam.total_involved_family,
    male_involved_family: r.emp.efam.male_involved_family,
    female_involved_family: r.emp.efam.female_involved_family,

    has_permanent_employees: r.emp.has_perm_employees,
    total_permanent_employees: r.emp.etemp.total_perm_employees,
    nepali_male_permanent_employees: r.emp.etemp.nepali_male_perm_employees,
    nepali_female_permanent_employees: r.emp.etemp.nepali_female_perm_employees,
    has_foreign_permanent_employees: r.emp.etemp.has_foreign_perm_employees,
    foreign_male_permanent_employees: r.emp.etemp.foreign_male_perm_employees,
    foreign_female_permanent_employees:
      r.emp.etemp.foreign_female_perm_employees,

    has_temporary_employees: r.emp.has_temp_employees,
    total_temporary_employees: r.emp.eperm.total_temp_employees,
    nepali_male_temporary_employees: r.emp.eperm.nepali_male_temp_employees,
    nepali_female_temporary_employees: r.emp.eperm.nepali_female_temp_employees,
    has_foreign_temporary_employees: r.emp.eperm.has_foreign_temp_employees,
    foreign_male_temporary_employees: r.emp.eperm.foreign_male_temp_employees,
    foreign_female_temporary_employees:
      r.emp.eperm.foreign_female_temp_employees,
  };

  const foodCrops = [];

  if (r.bag.bagd.fcrop_details.length > 0) {
    for (const fcrop of r.bag.bagd.fcrop_details) {
      foodCrops.push({
        crop_type: "अन्नबाली",
        crop_name: fcrop.fcrop,
        crop_area:
          (fcrop.fcrop_land.fbigha ?? 0) * 6772.63 +
          (fcrop.fcrop_land.fkattha ?? 0) * 338.63 +
          (fcrop.fcrop_land.fdhur ?? 0) * 16.93,
        crop_production: fcrop.fp.fcrop_prod,
        crop_sales: fcrop.fs.fcrop_sales,
      });
    }
  }

  const pulses = [];
  if (r.bag.bagd.pulse_details.length > 0) {
    for (const pulse of r.bag.bagd.pulse_details) {
      pulses.push({
        crop_type: "दलहन",
        crop_name: pulse.pulse,
        crop_area:
          (pulse.pl.pulse_bigha ?? 0) * 6772.63 +
          (pulse.pl.pulse_kattha ?? 0) * 338.63 +
          (pulse.pl.pulse_dhur ?? 0) * 16.93,
        crop_production: pulse.pp.pulse_prod,
        crop_sales: pulse.ps.pulse_sales,
      });
    }
  }

  const oilSeeds = [];
  if (r.bag.bagd.oseed_details.length > 0) {
    for (const oseed of r.bag.bagd.oseed_details) {
      oilSeeds.push({
        crop_type: "तेलहन",
        crop_name: oseed.oseed,
        crop_area:
          (oseed.osl.os_bigha ?? 0) * 6772.63 +
          (oseed.osl.os_kattha ?? 0) * 338.63 +
          (oseed.osl.os_dhur ?? 0) * 16.93,
        crop_production: oseed.oslp.oseed_prod,
        crop_sales: oseed.osls.oseed_sales,
      });
    }
  }

  const vegetables = [];
  if (r.bag.bagd.vtable_details.length > 0) {
    for (const veg of r.bag.bagd.vtable_details) {
      vegetables.push({
        crop_type: "तरकारी",
        crop_name: veg.vtable,
        crop_area:
          (veg.vl.vt_bigha ?? 0) * 6772.63 +
          (veg.vl.vt_kattha ?? 0) * 338.63 +
          (veg.vl.vt_dhur ?? 0) * 16.93,
        crop_production: veg.vp.vtable_prod,
        crop_sales: veg.vs.vtable_sales,
      });
    }
  }

  const fruits = [];
  if (r.bag.bagd.fruit_details.length > 0) {
    for (const fruit of r.bag.bagd.fruit_details) {
      fruits.push({
        crop_type: "फलफूल",
        crop_name: fruit.fruit,
        crop_area:
          (fruit.frl.fruit_bigha ?? 0) * 6772.63 +
          (fruit.frl.fruit_kattha ?? 0) * 338.63 +
          (fruit.frl.fruit_dhur ?? 0) * 16.93,
        crop_production: fruit.frp.fruit_prod,
        crop_count: fruit.frl.fruit_trees_count,
        crop_sales: fruit.frs.fruit_sales,
      });
    }
  }

  const spices = [];
  if (r.bag.bagd.spice_details.length > 0) {
    for (const spice of r.bag.bagd.spice_details) {
      spices.push({
        crop_type: "मसला",
        crop_name: spice.spice,
        crop_area:
          (spice.sl.spice_bigha ?? 0) * 6772.63 +
          (spice.sl.spice_kattha ?? 0) * 338.63 +
          (spice.sl.spice_dhur ?? 0) * 16.93,
        crop_production: spice.sp.spice_prod,
        crop_sales: spice.ss.spice_sales,
      });
    }
  }

  const cashCrops = [];
  if (r.bag.bagd.ccrop_details.length > 0) {
    for (const ccrop of r.bag.bagd.ccrop_details) {
      cashCrops.push({
        crop_type: "नगदेबाली",
        crop_name: ccrop.ccrop,
        crop_area:
          (ccrop.cl.cash_bigha ?? 0) * 6772.63 +
          (ccrop.cl.cash_kattha ?? 0) * 338.63 +
          (ccrop.cl.cash_dhur ?? 0) * 16.93,
        crop_production: ccrop.cp.ccrop_prod,
        crop_count: ccrop.cl.betet_trees_count,
        crop_sales: ccrop.cs.ccrop_sales,
      });
    }
  }

  const animals = [];

  if (r.bag.b_animals.length > 0) {
    for (const animal of r.bag.b_animals) {
      if (animal.banim?.b_animal_oth) {
        // Handle other animal types
        animals.push({
          animal_name: animal.banim.b_animal_oth,
          animal_ward: animal.animal_ward_no,
          total_count: animal.banim.othtotal_b_animals,
          sales_count: animal.banim.othb_animal_sales,
          revenue: animal.banim.othb_animal_revenue,
        });
      } else {
        // Handle normal animal types
        animals.push({
          animal_name: animal.b_animal,
          animal_ward: animal.animal_ward_no,
          total_count: animal.banimn.total_b_animals,
          sales_count: animal.banimn.b_animal_sales,
          revenue: animal.banimn.b_animal_revenue,
        });
      }
    }
  }
  const animalProducts = [];
  if (r.bag.b_aprods.length > 0) {
    for (const product of r.bag.b_aprods) {
      if (product.baprd?.baprod_oth) {
        // Handle other animal product types
        animalProducts.push({
          product_name: product.baprd.baprod_oth,
          ward_no: product.aprod_ward_no,
          unit: product.baprd.oth_baprod_unit,
          production_amount: product.baprd.oth_b_aprod_prod,
          sales_amount: product.baprd.oth_aprod_sales,
          monthly_production: product.baprd.oth_b_month_aprod,
          revenue: product.baprd.oth_aprod_revenue,
        });
      } else {
        // Handle normal animal product types
        animalProducts.push({
          product_name: product.b_aprod,
          ward_no: product.aprod_ward_no,
          unit: product.baprdn.baprod_unit || product.baprdn.aprod_unit_oth,
          production_amount: product.baprdn.b_aprod_prod,
          sales_amount: product.baprdn.approd_sales,
          monthly_production: product.baprdn.b_month_aprod,
          revenue: product.baprdn.approd_revenue,
        });
      }
    }
  }

  const aquacultureDetails = r.bag.aquaculture_details
    ? {
        ward_no: r.bag.aquaculture_details.aquaculture_ward_no,
        pond_count: r.bag.aquaculture_details.pond_no,
        pond_area: r.bag.aquaculture_details.pond_area,
        fish_production: r.bag.aquaculture_details.fish_prod,
        fingerling_number: r.bag.aquaculture_details.BC01_3,
        total_investment: r.bag.aquaculture_details.BC01_5,
        annual_income: r.bag.aquaculture_details.BC01_7,
        employment_count: r.bag.aquaculture_details.BC01_9,
      }
    : {};

  const apicultureDetails = r.bag.apiculture_details
    ? {
        ward_no: r.bag.apiculture_details.apiculture_ward_no,
        hive_count: r.bag.apiculture_details.hive_no,
        honey_production: r.bag.apiculture_details.honey_prod,
        has_apiculture: r.bag.apiculture_details.dapi,
      }
    : {};

  // if (r.bag.b > 0) {
  // }

  const payload = {
    ...r,
    ...gpsData,
  };
  const statement = jsonToPostgres("staging_buddhashanti_buildings", payload);

  if (statement) {
    await ctx.db.execute(sql.raw(statement));
  }
}
