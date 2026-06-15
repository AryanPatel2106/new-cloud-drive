import Mailgen from "mailgen";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";

dotenv.config();

function getSesClient() {
    if (!process.env.AWS_REGION) {
        throw new Error(
            "AWS SES configuration is missing! Please set AWS_REGION and restart the server."
        );
    }

    const sesConfig = {
        region: process.env.AWS_REGION,
    };

    // Use explicit keys locally; in production the EC2 IAM role supplies credentials.
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        sesConfig.credentials = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            ...(process.env.AWS_SESSION_TOKEN && { sessionToken: process.env.AWS_SESSION_TOKEN }),
        };
    }

    return new SESClient(sesConfig);
}

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "clouddrive",
            link: process.env.CLIENT_URL || "https://clouddrive.page",
        },
    });

    const fromEmail = process.env.SES_FROM_EMAIL || "noreply@clouddrive.page";

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);
    const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
            ToAddresses: [options.email],
        },
        Message: {
            Subject: {
                Data: options.subject,
            },
            Body: {
                Text: {
                    Data: emailTextual,
                },
                Html: {
                    Data: emailHtml,
                },
            },
        },
    });

    try {
        const sesClient = getSesClient();
        await sesClient.send(command);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error("Email service failed:", {
            name: error.name,
            message: error.message,
            region: process.env.AWS_REGION,
            fromEmail,
            toEmail: options.email,
        });

        if (error.name === "MessageRejected") {
            console.error(
                "SES rejected the email. If your SES account is in sandbox mode, " +
                "recipient addresses must also be verified in the SES console."
            );
        }

        throw error;
    }
};

const emailVerificationMailgenContent = (username, otp) => {
    return {
        body: {
            name: username,
            intro: `Your verification code is: ${otp}`,
            outro: "This OTP expires in 5 minutes. If you didn't request this code, please ignore this email.",
        },
    };
};

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
                    link: passwordResetUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
    };
};

export { sendEmail, emailVerificationMailgenContent, forgotPasswordMailgenContent };
