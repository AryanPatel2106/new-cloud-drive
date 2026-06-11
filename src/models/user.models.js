import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        fullName: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        forgotPasswordToken: {
            type: String
        },
        forgotPasswordExpiry: {
            type: Date
        },
        emailVerificationToken: {
            type: String
        },
        emailVerificationExpiry: {
            type: Date
        }
    },{
        timestamps: true
    }
)

// pree hook to hash the password and save
userSchema.pre("save", async function(){
    if(!this.isModified("password")) return; // proceed only if password change 

    this.password = await bcrypt.hash(this.password, 10)

})

// checking if the password is correct using the methods
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// generate token to stay loged in
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            // payloads
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

// generate token to verify user by email
userSchema.methods.generateTemporaryToken = function(){
    const unHashedToken = crypto.randomBytes(6).toString("hex")

    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex")

    const tokenExpiry = Date.now() + (5*60*1000)  // 5 min

    return {unHashedToken, hashedToken, tokenExpiry}
}

export const User = mongoose.model("User",userSchema)