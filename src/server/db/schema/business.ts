import { pgTable, timestamp, pgEnum, text, uuid } from "drizzle-orm/pg-core";

export const stagingBusiness = pgTable("staging_buddhashanti_business", {
  id: uuid("id").primaryKey(),
});

export const businessStatusEnum = pgEnum("business_status_enum", [
  "approved",
  "pending",
  "requested_for_edit",
  "rejected",
]);

export const business = pgTable("buddhashanti_business", {
  id: uuid("id").primaryKey(),
});

// Table for building edit requests
export const businessEditRequests = pgTable(
  "buddhashanti_business_edit_requests",
  {
    id: uuid("id").primaryKey(),
    businessId: uuid("business_id").references(() => business.id),
    message: text("message").notNull(),
    requestedAt: timestamp("requested_at").defaultNow(),
  },
);

export type BusinessEditRequest = typeof businessEditRequests.$inferSelect;

export type StagingBusiness = typeof stagingBusiness.$inferSelect;
export type BusinessSchema = typeof business.$inferSelect;
