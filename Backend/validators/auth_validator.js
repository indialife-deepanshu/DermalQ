import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Users, Sessions, Feedback } from "../drizzle/schema.js"


// --- User Validators ---

export const insertUserSchema = createInsertSchema(Users, {
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name must be no more than 255 characters." ),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().trim().min(8, "Password must be at least 8 characters").max(255, "Password must be no more than 255 characters.")
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isAdmin: true,
});


export const publicUserSchema = createSelectSchema(Users).omit({
  password: true,   // Never send the hash!
  isAdmin: true     // Maybe hide internal roles
});

// Schema for login

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8, "Password must be at least 8 characters").max(255, "Password must be no more than 255 characters.")
});

// --- Session Validators ---

export const insertSessionSchema = createInsertSchema(Sessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// --- Feedback Validators ---

export const insertFeedbackSchema = createInsertSchema(Feedback, {
  message: z.string().trim().min(5, "Feedback is too short").max(1000),
}).omit({
  id: true,
  userId: true, 
  createdAt: true,
});







// // --- Prediction Validators ---

// export const predictionRequestSchema = z.object({
//   // If you want to track where on the body the disease is located
//   bodyPart: z.enum(['head', 'neck', 'arm', 'leg', 'torso', 'back']).optional(),
//   // Any additional notes from the user
//   notes: z.string().max(500).optional(),
// });