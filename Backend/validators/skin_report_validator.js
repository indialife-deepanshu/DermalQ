import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { SkinReports } from "../drizzle/schema.js";


// 1. Define the internal structure of the JSON analysis
const PredictionSchema = z.object({
    label: z.string(),
    confidence: z.number(),
    name: z.string(),
    severity: z.string().optional(),
    description: z.string().optional(),
    treatment: z.string().optional(),
});

const AnalysisResultSchema = z.object({
    topMatch: PredictionSchema,
    fullList: z.array(PredictionSchema),
});

// 2. Create the main Insert Schema
export const insertSkinReportSchema = createInsertSchema(SkinReports, {
    // // Validate the JSON object specifically
    // analysisResult: AnalysisResultSchema,
    // 1. Transform string to JSON if it arrives as a string (from FormData)
    analysisResult: z.preprocess((val) => {
        if (typeof val === 'string') return JSON.parse(val);
        return val;
    }, AnalysisResultSchema),
    
    // Add additional constraints for the form fields
    age: z.coerce.number().min(0, "age should be greater than 0").max(120),
    gender: z.enum(["male", "female", "unknown"]),
    localization: z.string().min(1),
    imageUrl: z.string().url(),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

