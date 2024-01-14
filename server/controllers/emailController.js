import dotenv from "dotenv";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
dotenv.config();

const sendEmail = async ({
  email,
  amount,
  dateCreated,
  receiptID,
  receiptURL,
}) => {
  //console.log("entrando a sendEmail");
  //console.log("clientEmail", email);
  //console.log("amount", amount);
  //console.log("receiptURL", receiptURL);
  //console.log("dateCreated", dateCreated);

  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_PRODUCTION_API,
    });

    const senderEmail = "MS_y3rQK1@plasticbeach.shop";
    const senderName = "Plastic Beach";
    const clientEmail = email;
    const clientName = "Dear client";

    const sentForm = new Sender(senderEmail, senderName);
    const recipients = [new Recipient(clientEmail, clientName)];

    const emailParams = new EmailParams()
      .setFrom(sentForm)
      .setTo(recipients)
      .setReplyTo(sentForm)
      .setSubject("this is a subject")
      .setHtml(
        `<strong>This is the HTML content:
        ${receiptID}, 
        ${dateCreated}, 
        ${receiptURL}, 
        ${amount}</strong>`
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
