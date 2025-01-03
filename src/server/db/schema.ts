import { relations } from "drizzle-orm";
import { pgTableCreator, index, timestamp, varchar, json, pgEnum } from "drizzle-orm/pg-core";
import { DATABASE_PREFIX as prefix } from "@/lib/constants";

export const pgTable = pgTableCreator((name) => `${prefix}_${name}`);

export const roleEnum = pgEnum("role", ["admin", "editor", "viewer"]);
export const domainEnum = pgEnum("domain", ["municipality", "ward"]);

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 21 }).primaryKey(),
    userName: varchar("user_name", { length: 255 }).notNull(),
    hashedPassword: varchar("hashed_password", { length: 255 }),
    avatar: varchar("avatar", { length: 255 }),
    role: roleEnum("role").default("viewer").notNull(),
    domain: domainEnum("domain").default("municipality").notNull(),
    wardNumber: varchar("ward_number", { length: 2 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
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
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (t) => ({
    userIdx: index("session_user_idx").on(t.userId),
  }),
);

export const parts = pgTable("parts", {
  id: varchar("id", { length: 15 }).primaryKey(),
  title_en: varchar("title_en", { length: 255 }).notNull(),
  title_ne: varchar("title_ne", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

export const chapters = pgTable("chapters", {
  id: varchar("id", { length: 15 }).primaryKey(),
  title_en: varchar("title_en", { length: 255 }).notNull(),
  title_ne: varchar("title_ne", { length: 255 }).notNull(),

  part_id: varchar("part_id", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

export const chapterRelations = relations(chapters, ({ one }) => ({
  part: one(parts, {
    fields: [chapters.part_id],
    references: [parts.id],
  }),
}));

export const sections = pgTable("sections", {
  id: varchar("id", { length: 15 }).primaryKey(),
  title_en: varchar("title_en", { length: 255 }).notNull(),
  title_ne: varchar("title_ne", { length: 255 }).notNull(),

  displaySchema: json("display_schema").notNull().default({}),
  chapter_id: varchar("chapter_id", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

export const sectionRelations = relations(sections, ({ one }) => ({
  chapter: one(chapters, {
    fields: [sections.chapter_id],
    references: [chapters.id],
  }),
}));

export const paragraphs = pgTable("paragraphs", {
  id: varchar("id", { length: 15 }).primaryKey(),
  content_en: varchar("content_en", { length: 255 }).notNull(),
  content_ne: varchar("content_ne", { length: 255 }).notNull(),

  section_id: varchar("section_id", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

export const paragraphRelations = relations(paragraphs, ({ one }) => ({
  section: one(sections, {
    fields: [paragraphs.section_id],
    references: [sections.id],
  }),
}));

export const tables = pgTable("tables", {
  id: varchar("id", { length: 15 }).primaryKey(),
  title_en: varchar("title_en", { length: 255 }).notNull(),
  title_ne: varchar("title_ne", { length: 255 }).notNull(),
  data_ne: json("data").array().notNull(),
  data_en: json("data").array().notNull(),

  section_id: varchar("section_id", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).$onUpdate(() => new Date()),
});

export const tableRelations = relations(tables, ({ one }) => ({
  section: one(sections, {
    fields: [tables.section_id],
    references: [sections.id],
  }),
}));

export type Part = typeof parts.$inferSelect;
export type NewPart = typeof parts.$inferInsert;

export type Chapter = typeof chapters.$inferSelect;
export type NewChapter = typeof chapters.$inferInsert;

export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;

export type Paragraph = typeof paragraphs.$inferSelect;
export type NewParagraph = typeof paragraphs.$inferInsert;

export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;
