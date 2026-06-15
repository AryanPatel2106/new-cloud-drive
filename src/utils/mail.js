import Mailgen from "mailgen";
import {SESClient, SendEmailCommand} from "@aws-sdk/client-ses"
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import dotenv from "dotenv"

dotenv.config();

const sesClient = new SESClient({
    region: process.env.AWS_REGION
})
const sts = new STSClient({
    region: process.env.AWS_REGION
});

const identity = await sts.send(
    new GetCallerIdentityCommand({})
);

console.log("AWS Account:", identity.Account);

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "clouddrive",
            link: "https://clouddrive.page"
        }
    })

    const fromEmail = process.env.SES_FROM_EMAIL || "noreply@clouddrive.page"
    
    // Log configuration for debugging
    console.log("SES Configuration:", {
        region: process.env.AWS_REGION,
        fromEmail,
        toEmail: options.email
    });
    
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)
    const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
            ToAddresses: [options.email]
        },
        Message: {
            Subject: {
                Data: options.subject
            },
            Body: {
                Text: {
                    Data: emailTextual
                },
                Html: {
                    Data: emailHtml
                }
            }
        }
    })
    try {
        await sesClient.send(command)
        console.log(`Email sent successfully to ${options.email}`)
    } catch (error) {
        console.error("Email service failed. Check your AWS SES credentials and verified identities.")
        console.error("Error:", error);
        throw error; // Re-throw so the caller knows it failed
    }
}

const emailVerificationMailgenContent = (username, otp) => {
    return {
        body: {
            name: username,
            intro: `Your verification code is: ${otp}`,
            outro: "This OTP expires in 5 minutes. If you didn't request this code, please ignore this email."
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of your account.",
            action: {
                instructions:
                    "To reset your password click on the following button or link",
                button: {
                    color: "#22BC66",
                    text: "Reset Password",
                    link: passwordResetUrl
                }
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    }
}

export {sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent}