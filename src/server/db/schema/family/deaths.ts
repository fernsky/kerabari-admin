import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { geometry } from "../../geographical";

const buddhashantiDeath = pgTable("buddhashanti_death", {
  id: varchar("id", { length: 48 }).primaryKey().notNull(),
  parentId: varchar("parent_id", { length: 48 }).notNull(),
  wardNo: integer("ward_no").notNull(),
  tenantId: varchar("tenant_id", { length: 48 }).default("buddhashanti"),
  deviceId: varchar("device_id", { length: 48 }).notNull(),
  deceasedName: varchar("deceased_name", { length: 100 }),
  deceasedFamilyRole: varchar("deceased_family_role", { length: 100 }),
  deceasedAge: integer("deceased_age"),
  deceasedDeathCause: varchar("deceased_death_cause", { length: 100 }),
  deceasedGender: varchar("deceased_gender", { length: 100 }),
  deceasedFertilityDeathCondition: varchar(
    "deceased_fertility_death_condition",
    { length: 100 },
  ),
  deceasedHasDeathCertificate: varchar("deceased_has_death_certificate", {
    length: 100,
  }),
  geom: geometry("geom", { type: "Point" }),
});

export default buddhashantiDeath;
