import { pgTable, timestamp, pgEnum, text, varchar } from "drizzle-orm/pg-core";

export const stagingBusiness = pgTable("staging_buddhashanti_business", {
  id: varchar("id", { length: 48 }).primaryKey(),
});

export const businessStatusEnum = pgEnum("business_status_enum", [
  "approved",
  "pending",
  "requested_for_edit",
  "rejected",
]);

export const business = pgTable("buddhashanti_business", {
  id: varchar("id", { length: 48 }).primaryKey(),
});

// Table for building edit requests
export const businessEditRequests = pgTable(
  "buddhashanti_business_edit_requests",
  {
    id: varchar("id", { length: 48 }).primaryKey(),
    businessId: varchar("business_id", { length: 48 }).references(
      () => business.id,
    ),
    message: text("message").notNull(),
    requestedAt: timestamp("requested_at").defaultNow(),
  },
);

export type BusinessEditRequest = typeof businessEditRequests.$inferSelect;

export type StagingBusiness = typeof stagingBusiness.$inferSelect;
export type BusinessSchema = typeof business.$inferSelect;
