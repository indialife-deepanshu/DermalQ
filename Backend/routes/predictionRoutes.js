import { Router } from 'express';
import multer from 'multer';
import { verifyAuthentication } from '../middlewares/verifyAuthMiddleware.js';
import { predictImage } from '../controllers/predictionController.js';
import { SkinReport } from '../controllers/authController.js';



const router = Router();

const upload = multer({ storage: multer.memoryStorage() //,
    // limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});


router
    .route("/predict")
    .post(verifyAuthentication, upload.single('image'), predictImage);


router
    .route('/reports')
    .post(verifyAuthentication, upload.single('image'),  SkinReport)

export const predictionRoutes = router;