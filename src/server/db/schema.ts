import {
  pgTableCreator,
  index,
  timestamp,
  varchar,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";
import { geometry } from "./geographical";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const rolesEnum = pgEnum("roles", ["enumerator", "supervisor"]);

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
});

export type Ward = typeof wards.$inferSelect;
export type NewWard = typeof wards.$inferInsert;
