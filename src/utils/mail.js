import Mailgen from "mailgen";
import {SESClient, SendEmailCommand} from "@aws-sdk/client-ses"
import dotenv from "dotenv"

dotenv.config();

const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "clouddrive",
            link: "https://clouddrive.page"
        }
    })
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtml = mailGenerator.generate(options.mailgenContent)
    const command = new SendEmailCommand({
        Source: process.env.SES_FROM_EMAIL,
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