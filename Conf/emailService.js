const nodemailer = require("nodemailer");

exports.emailVerification  = async (email, name,link) => {

        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: "localhost",
            port: 1025,
            secure: false,
            ignoreTLS: true
        });

        let info = await transporter.sendMail({
            from: '"Majd Mimoun"<noreply@driveoo.com>',
            to: email ,
            subject: "Email Verification",
            text: "Please Verify your e-mail",
            html: "<b> click <a href="+link+">here</a> to verify</b>"
        });

        console.log("Message sent: %s", info.messageId);

        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }


