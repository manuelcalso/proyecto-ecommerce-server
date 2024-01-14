import dotenv from "dotenv";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
dotenv.config();

const sendEmail = async ({
  name,
  email,
  amount,
  dateCreated,
  receiptID,
  receiptURL,
}) => {
  console.log("entrando a sendEmail");
  console.log("name: ", name);
  console.log("clientEmail", email);
  //console.log("amount", amount);
  console.log("receiptURL", receiptURL);
  //console.log("dateCreated", dateCreated);

  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_PRODUCTION_API,
    });

    const senderEmail = "MS_y3rQK1@plasticbeach.shop";
    const senderName = "Plastic Beach";
    const clientEmail = email;
    const clientName = name;

    const sentForm = new Sender(senderEmail, senderName);
    const recipients = [new Recipient(clientEmail, clientName)];

    const emailParams = new EmailParams()
      .setFrom(sentForm)
      .setTo(recipients)
      .setReplyTo(["plasticbeachdnb@gmail.com"])
      .setSubject("Thank You for Your Purchase")
      .setHtml(
        `<html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Thank You for Your Purchase</title>
        </head>
        
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
               <header style="background-color: #f8f8f8; padding: 20px; text-align: center;">
                  <img src="https://res.cloudinary.com/dgzghl0ur/image/upload/v1700674111/products%20ecommerce/logos/nulogo3_waqxqh.png" alt="Logo" style="max-width: 30%; height: auto;">
                  <h1 style="color: #333;">Thank You for Your Purchase!</h1>
                </header>
        
                <section style="padding: 20px; border-bottom: 1px solid #ddd;">
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">Dear Client ${clientName},</p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">Thank you for choosing our services. We appreciate your business!</p>
                </section>
        
                <section style="padding: 20px; border-bottom: 1px solid #ddd;">
                    <h2 style="color: #333;">Purchase Details:</h2>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">Amount Paid: ${amount} USD</p>
                    <p style="font-size: 16px; line-height: 1.5; color: #555;">Receipt: <a href="${receiptURL}" style="color: #007bff; text-decoration: none;" target="_blank">View Receipt</a></p>
                </section>
        
                <footer style="background-color: #f8f8f8; padding: 20px; text-align: center; color: #777;">
                    <p style="font-size: 14px; line-height: 1.5;">If you have any questions or concerns, please contact our support team at plasticbeachdnb@gmail.com.</p>
                </footer>
            </div>
        </body>
        
        </html>`
      )
      .setText("This is the text content");

    await mailerSend.email.send(emailParams);

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

export default { sendEmail };
