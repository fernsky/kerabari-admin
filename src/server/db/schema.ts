import {
  pgTableCreator,
  index,
  timestamp,
  varchar,
  pgEnum,
  integer,
  json,
  text,
  customType,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { geometry } from "./geographical";

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
  },
  (t) => ({
    wardNumberIdx: index("ward_number_idx").on(t.wardNumber),
  }),
);

export const areas = pgTable("areas", {
  code: integer("code").primaryKey(),
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
});

export const surveyData = pgTable("odk_survey_data", {
  id: varchar("id", { length: 55 }).primaryKey(),
  formId: varchar("form_id", { length: 21 })
    .notNull()
    .references(() => surveyForms.id),
  data: json("data").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const attachmentTypesEnum = pgEnum("attachment", [
  "audio_monitoring",
  "survey_image",
]);

export const surveyAttachments = pgTable("odk_survey_attachments", {
  id: varchar("id", { length: 55 }).primaryKey(),
  dataId: varchar("data_id", { length: 21 })
    .notNull()
    .references(() => surveyData.id),
  type: attachmentTypesEnum("type").default("survey_image").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export type Ward = typeof wards.$inferSelect;
export type NewWard = typeof wards.$inferInsert;
