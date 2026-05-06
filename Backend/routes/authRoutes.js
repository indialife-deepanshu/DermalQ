import { Router } from "express";
import { Feedbacks, Login, Register, User, CheckIsAdmin, getUserHistory, GetAdminDashboard } from "../controllers/authController.js";
import { verifyAuthentication } from "../middlewares/verifyAuthMiddleware.js";

const router = Router();


router
    .route("/register")
    .post(Register);

router   
    .route("/login")
    .post(Login);

router
    .route("/feedback")
    .post(verifyAuthentication, Feedbacks);

router
    .route("/user")
    .get(verifyAuthentication, User);

router
    .route("/isAdmin")
    .get(verifyAuthentication, CheckIsAdmin);

router
    .route('/getUserHistory')
    .get(verifyAuthentication, getUserHistory)

router
    .route("/admin/dashboard")
    .get(verifyAuthentication, GetAdminDashboard);


export const authRouter = router;