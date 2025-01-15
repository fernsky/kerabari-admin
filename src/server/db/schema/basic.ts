import {
  pgTableCreator,
  index,
  timestamp,
  varchar,
  pgEnum,
  integer,
  json,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { geometry } from "../geographical";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const rolesEnum = pgEnum("roles", [
  "enumerator",
  "supervisor",
  "superadmin",
]);

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    userName: varchar("user_name", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    phoneNumber: varchar("phone_number", { length: 10 }),
    email: varchar("email", { length: 255 }),
    avatar: varchar("avatar", { length: 255 }),
    wardNumber: integer("ward_number"),
    role: rolesEnum("role").default("enumerator"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(
      () => new Date(),
    ),
  },
  (t) => ({
    usernameIdx: index("user_email_idx").on(t.userName),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 21 }).notNull(),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);

export const wards = pgTable(
  "wards",
  {
    wardNumber: integer("ward_number").primaryKey(),
    wardAreaCode: integer("ward_area_code").notNull(),
    geometry: geometry("geometry", { type: "Polygon" }),
  },
  (t) => ({
    wardNumberIdx: index("ward_number_idx").on(t.wardNumber),
  }),
);

export const areas = pgTable("areas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: integer("code").notNull(),
  wardNumber: integer("ward")
    .notNull()
    .references(() => wards.wardNumber),
  geometry: geometry("geometry", { type: "Polygon" }),
  assignedTo: varchar("assigned_to", { length: 21 }).references(() => users.id),
});

export const surveyForms = pgTable("odk_survey_forms", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  siteEndpoint: json("url"),
  odkProjectId: integer("odk_project_id").notNull(),
  odkFormId: varchar("odk_form_id", { length: 255 }).notNull(),
  userName: json("username"),
  password: json("password"),
  /*
  Form attachments
    {
      path: "double.underscored.path",
      type: "survey_image" 
    }
  */
  attachmentPaths: json("attachment_paths").array(),
  updateInterval: integer("update_interval").default(7200),
  lastFetched: timestamp("last_fetched").defaultNow(),
});

export const surveyData = pgTable("odk_survey_data", {
  id: varchar("id", { length: 55 }).primaryKey(),
  formId: varchar("form_id", { length: 255 })
    .notNull()
    .references(() => surveyForms.id),
  data: json("data").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const attachmentTypesEnum = pgEnum("attachment", [
  "audio_monitoring",
  "building_image",
  "building_selfie",
  "family_head_image",
  "family_head_selfie",
  "business_image",
  "business_selfie",
]);

export const surveyAttachments = pgTable(
  "odk_survey_attachments",
  {
    dataId: varchar("data_id", { length: 55 })
      .notNull()
      .references(() => surveyData.id),
    type: attachmentTypesEnum("type").default("building_image").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey(t.dataId, t.name),
  }),
);

export type Ward = typeof wards.$inferSelect;
export type NewWard = typeof wards.$inferInsert;

export const areaRequestsEnum = pgEnum("area_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const areaRequests = pgTable(
  "area_requests",
  {
    areaId: varchar("area_id")
      .notNull()
      .references(() => areas.id),
    userId: varchar("user_id", { length: 21 })
      .notNull()
      .references(() => users.id),
    status: areaRequestsEnum("status").default("pending"),
    message: varchar("message", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (t) => ({
    pk: primaryKey(t.areaId, t.userId),
  }),
);
