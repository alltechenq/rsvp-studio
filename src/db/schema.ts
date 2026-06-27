import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  time,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const guestStatusEnum = pgEnum("guest_status", [
  "Pending",
  "Sent",
  "Responded",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const admin = pgTable("admin", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  venue: text("venue").notNull(),
  rsvpDeadline: date("rsvp_deadline").notNull(),
  emailSubject: varchar("email_subject", { length: 255 }),
  emailBody: text("email_body"),
  saveDateMessage: text("save_date_message"),
  rsvpMessage: text("rsvp_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guestGroups = pgTable("guest_groups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  groupName: varchar("group_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 30 }),
  email: varchar("email", { length: 255 }),
  totalAllowed: integer("total_allowed").notNull().default(1),
  uniqueToken: varchar("unique_token", { length: 64 }).notNull().unique(),
  status: guestStatusEnum("status").notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .notNull()
    .references(() => guestGroups.id, { onDelete: "cascade" }),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  isAttending: boolean("is_attending").notNull(),
  respondedAt: timestamp("responded_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const eventsRelations = relations(events, ({ many }) => ({
  guestGroups: many(guestGroups),
}));

export const guestGroupsRelations = relations(guestGroups, ({ one, many }) => ({
  event: one(events, {
    fields: [guestGroups.eventId],
    references: [events.id],
  }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  group: one(guestGroups, {
    fields: [responses.groupId],
    references: [guestGroups.id],
  }),
}));
