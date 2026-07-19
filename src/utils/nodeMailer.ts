import nodemailer, { Transporter } from "nodemailer";
import dotenv from "dotenv";


const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });


// Define transporter with Mailtrap SMTP settings
const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "wpalerts0@gmail.com",
    pass: "uixwbvsppkbbhxpo",
  },
});


// Define the function with proper TypeScript types
export default async function sendEmail(
  to: string,
  subject: string,
  text: string,
): Promise<boolean> {
  try {

    await transporter.sendMail({
      from: "wpalerts0@gmail.com",
      to,
      subject,
      text
    });

    return true; // Email sent successfully
  } catch (error) {
    console.error("Error sending email:", error);
    return false; // Email sending failed
  }
}




export async function orderConfirmation(
  to: string | any,
  subject: string,
  body: string,
  orderDetails: {
    customerName: string;
    orderId: string;
    totalAmount: number;
    orderDate: string;
    trackingLink: string;
    packageData: any
  }
): Promise<boolean> {
  try {
    const { customerName, orderId, totalAmount, orderDate, trackingLink, packageData } = orderDetails;


    const text = `
Hi ${customerName},

Thank you for your order!

🧾 Order ID: ${orderId}
📅 Order Date: ${orderDate}
💰 Total Amount: $ ${totalAmount}


${body}


📦 Tracking Link: ${process.env.BASE_URL + trackingLink}

   ${packageData?.map((item: any) => `Codes - ${item.name} = ${item.codes.join(", ")} \n Vendor's site Link - ${item.link || "N/A"}`).join("\n")}

Thank you for choosing choose well!

Best regards,  
choose well Team
    `;

    const mailOptions = {
      from: "choose well",
      to: [to],
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
