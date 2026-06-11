import { Router } from "express";
import { 
    registerUser, 
    verifyOtpAndFinalizeRegister, 
    resendOtp, 
    loginUser, 
    logoutUser, 
    forgotPasswordRequest,
    resetForgotPassword,
    getCurrentUser
} from "../controllers/auth.controllers.js"; // Ensure this matches your path
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { userRegisterValidator, userLoginValidator, userForgotPasswordValidator, userResetForgotPasswordValidator } from "../validators/index.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

// 1. Initial form submission (Creates temporary instance + dispatches OTP)
router.route("/register").post(
    userRegisterValidator(), 
    validate, 
    registerUser
);

// 2. Process OTP submission (Finalizes account setup)
router.route("/verify-otp").post(
    verifyOtpAndFinalizeRegister
);

// 3. Fallback command if the client requests an explicit fresh token dispatch
router.route("/resend-otp").post(
    resendOtp
);

// 4. Session establishment (Blocks unverified emails and triggers auto-resend)
router.route("/login").post(
    userLoginValidator(), 
    validate, 
    loginUser
);

// this sends the reset-password url to the mail
router.route("/forgot-password").post(
    userForgotPasswordValidator(),
    validate,
    forgotPasswordRequest
)

// this route helps in reseting the password
router.route("/reset-password/:resetToken").post(
    userResetForgotPasswordValidator(),
    validate,
    resetForgotPassword
)

// PROTECTED ROUTES (Requires Active Access Token)

// 5. Destroys active session context and wipes authentication cookie
router.route("/logout").post(
    verifyJWT, 
    logoutUser
);

router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)

export default router;