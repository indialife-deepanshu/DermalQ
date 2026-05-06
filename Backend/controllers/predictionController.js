import { getSkinPrediction } from "../services/prediction.services.js";


export const predictImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "Please upload an image." });
        }

        // console.log("File",req.file.buffer);
        // Call the service with the image buffer provided by Multer
        // Extract metadata from the request body
        const { age, gender, localization, model_choice } = req.body;

        // Basic validation to ensure metadata is present for Model 2/3
        if (!age || !gender || !localization) {
            return res.status(400).json({ 
                success: false, 
                error: "Missing patient metadata (age, gender, or localization)." 
            });
        }

        // Pass image and metadata to the service
        const predictionData = await getSkinPrediction(
            req.file.buffer, 
            age, 
            gender, 
            localization,
            model_choice
        );

        res.status(200).json({
            success: true,
            data: predictionData
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

