import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api-response.js"
import { ApiError } from "../utils/api-error.js"
import { asyncHandler } from "../utils/async-handler.js"
import { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent } from "../utils/mail.js"
import crypto from "crypto"

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body
    
    const existingVerifiedUser = await User.findOne({
        $or: [{ username }, { email }],
        isEmailVerified: true
    })
    
    if (existingVerifiedUser) {
        throw new ApiError(409, "A verified user with this email or username already exists.")
    }
    
    // Clear out any previous abandoned/unverified registrations for these credentials
    await User.deleteMany({
        $or: [{ username }, { email }],
        isEmailVerified: false
    })
    
    // Create the temporary user instance
    const user = new User({
        email,
        username,
        password, // Your pre-save hook will hash this automatically
        fullName,
        isEmailVerified: false
    })

    // Generate the 5-minute temporary token
    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save()

    // Send the raw unHashedToken to the user's email
    await sendEmail({
        email: user.email,
        subject: "Your Registration Verification OTP",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `Your verification code is: ${unHashedToken}. It is valid for exactly 5 minutes.`
        )
    })
    
    // ✅ FIX: Returning the email back to the frontend makes it easier to pass to the next route
    return res.status(200).json(
        new ApiResponse(
            200, 
            { username: user.username, email: user.email }, 
            "OTP sent successfully. You have 5 minutes to verify."
        )
    )
})

const verifyOtpAndFinalizeRegister = asyncHandler(async (req, res) => {
    const { otp, email } = req.body 
    
    if (!otp || !email) {
        throw new ApiError(400, "Verification code and email are required")
    }

    // ✅ FIX: Find the pending unverified user by email first
    const user = await User.findOne({ email, isEmailVerified: false })

    if (!user) {
        throw new ApiError(404, "No pending registration found for this email.")
    }

    // ✅ FIX: Now the timeout check can correctly trigger and clean the DB if they took > 5 mins
    if (Date.now() > user.emailVerificationExpiry) {
        await User.findByIdAndDelete(user._id) 
        throw new ApiError(400, "Code has expired (5-minute window passed). Please register again.")
    }

    // Hash the incoming user-entered OTP to check against the DB
    const hashedToken = crypto.createHash("sha256").update(otp).digest("hex")

    if (user.emailVerificationToken !== hashedToken) {
        throw new ApiError(400, "Invalid verification code.")
    }

    // Finalize registration
    user.isEmailVerified = true
    user.emailVerificationToken = undefined 
    user.emailVerificationExpiry = undefined

    await user.save({ validateBeforeSave: false })

    const createdUser = await User.findById(user._id).select(
        "-password -emailVerificationToken -emailVerificationExpiry"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered and verified successfully!"
            )
        )
})

const resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body 

    if (!email) {
        throw new ApiError(400, "Email is required to resend verification code")
    }

    const user = await User.findOne({ email, isEmailVerified: false })

    if (!user) {
        throw new ApiError(404, "No pending registration found. Please fill the form again.")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })

    await sendEmail({
        email: user.email,
        subject: "Your New Verification OTP",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `Your new verification code is: ${unHashedToken}. Valid for 5 minutes.`
        )
    })

    return res.status(200).json(
        new ApiResponse(200, {}, "A new OTP has been dispatched to your email.")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    // AUTOMATED RESEND WORKFLOW: If unverified, refresh OTP and provide redirect payload
    if (!user.isEmailVerified) {
        const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()
        
        user.emailVerificationToken = hashedToken
        user.emailVerificationExpiry = tokenExpiry
        await user.save({ validateBeforeSave: false })

        await sendEmail({
            email: user.email,
            subject: "Verify your email to complete login",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `You attempted to login but your email isn't verified yet. Your verification code is: ${unHashedToken}. Valid for 5 minutes.`
            )
        })

        return res.status(200).json(
            new ApiResponse(
                200,
                { 
                    requiresVerification: true, 
                    email: user.email, 
                    username: user.username 
                },
                "Email unverified. A new OTP has been sent. Redirecting to verification..."
            )
        )
    }

    // Proceed with standard login if verified
    const accessToken = user.generateAccessToken()
    const loggedInUser = await User.findById(user._id).select("-password -emailVerificationToken -emailVerificationExpiry")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken },
                "User logged in successfully"
            )
        )
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "user does not exist", [])
    }

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    await sendEmail(
        {
            email: user?.email,
            subject: "Password reset request",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `http://localhost:5173/reset-password/${unHashedToken}`
            )
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Passowrd reset mail has been sent on your mail id"
            )
        )

})

const resetForgotPassword = asyncHandler(async (req, res) => {
    const {resetToken} = req.params
    const {newPassword} = req.body

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if(!user){
        throw new ApiError(489, "Token is invalid or expired")
    }

    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully"
            )
        )
    
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findById(req.user._id)
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken",options)
        .json(
            new ApiResponse(
                200,
                "user logged out"
            )
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current user fetched successfully"
            )
        )
})

export { registerUser, verifyOtpAndFinalizeRegister, resendOtp, loginUser, logoutUser, forgotPasswordRequest, resetForgotPassword, getCurrentUser }