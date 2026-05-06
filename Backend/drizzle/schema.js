import { relations } from "drizzle-orm";
import { 
    mysqlTable,
    int,
    timestamp,
    varchar,
    boolean,
    text,
    json, 
} from "drizzle-orm/mysql-core";

import { nanoid } from "nanoid";


const idField = (name) => varchar(name || "id", { length: 21 });


export const Users = mysqlTable("users", {
    id: idField().primaryKey().$defaultFn(() => nanoid()),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(), 
    isAdmin: boolean().default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const Sessions = mysqlTable("sessions", {
    id: idField().primaryKey().$defaultFn(() => nanoid()),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => Users.id, { onDelete: "cascade" }),
    valid: boolean().default(true).notNull(),
    userAgent: text("user_agent"),
    ip: varchar({ length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const Feedback = mysqlTable("feedback", {
    id: idField().primaryKey().$defaultFn(() => nanoid()),
    userId: varchar("user_id", { length: 21 }).notNull().references(() => Users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});



export const SkinReports = mysqlTable("skin_reports", {
    id: varchar("id", { length: 21 }).primaryKey().$defaultFn(() => nanoid()),
    // Link to the user if applicable
    userId: varchar("user_id", { length: 21 }).notNull().references(() => Users.id, { onDelete: "cascade" }), 
    
    age: int("age"),
    gender: varchar("gender", { length: 20 }),
    localization: varchar("localization", { length: 30 }),
    imageUrl: varchar("image_url", { length: 512 }).notNull(),
    
    modelId: varchar("model_id", { length: 50 }),
    modelName: varchar("model_name", { length: 100 }),
    
    // MySQL JSON column for the enriched results
    analysisResult: json("analysis_result").notNull(), 
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});




// Relations
export const userRelation = relations(Users, ({ many }) => ({
    sessions: many(Sessions),
    feedback: many(Feedback),
    skinReports: many(SkinReports),
}));

export const sessionsRelation = relations(Sessions, ({ one }) => ({
    user: one(Users, {
        fields: [Sessions.userId],
        references: [Users.id]
    })
}));

export const feedbackRelation = relations(Feedback, ({ one }) => ({
    user: one(Users, {
        fields: [Feedback.userId],
        references: [Users.id]
    })
}));

export const SkinReportsRelation = relations(SkinReports, ({ one }) => ({
    user: one(Users, {
        fields: [SkinReports.userId],
        references: [Users.id]
    })
}));