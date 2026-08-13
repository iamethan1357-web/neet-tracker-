import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  date,
  timestamp,
  real,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 200 }),
  className: varchar("class_name", { length: 100 }),
  targetScore: integer("target_score").default(720),
  weakSubjects: text("weak_subjects"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  physicsStudy: boolean("physics_study").default(false),
  chemistryStudy: boolean("chemistry_study").default(false),
  botanyStudy: boolean("botany_study").default(false),
  zoologyStudy: boolean("zoology_study").default(false),
  questionsPracticed: integer("questions_practiced").default(0),
  coachingHours: real("coaching_hours").default(6),
  waterIntake: real("water_intake").default(0),
  sleepHours: real("sleep_hours").default(0),
  physicsTime: real("physics_time").default(0),
  chemistryTime: real("chemistry_time").default(0),
  botanyTime: real("botany_time").default(0),
  zoologyTime: real("zoology_time").default(0),
  physicsQuestions: integer("physics_questions").default(0),
  chemistryQuestions: integer("chemistry_questions").default(0),
  botanyQuestions: integer("botany_questions").default(0),
  zoologyQuestions: integer("zoology_questions").default(0),
  focusMinutes: integer("focus_minutes").default(0),
  completed: boolean("completed").default(false),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull().default("daily"),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  pinned: boolean("pinned").default(false),
  completed: boolean("completed").default(false),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const revisionTopics = pgTable("revision_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: varchar("subject", { length: 50 }).notNull(),
  topic: varchar("topic", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("not_done"),
  nextReviewDate: date("next_review_date"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mockTests = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: date("date").notNull(),
  score: integer("score").notNull(),
  totalMarks: integer("total_marks").default(720),
  physicsScore: integer("physics_score").default(0),
  chemistryScore: integer("chemistry_score").default(0),
  botanyScore: integer("botany_score").default(0),
  zoologyScore: integer("zoology_score").default(0),
  mistakes: text("mistakes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: varchar("subject", { length: 50 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("daily"),
  targetValue: integer("target_value"),
  currentValue: integer("current_value").default(0),
  completed: boolean("completed").default(false),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});
