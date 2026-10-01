import nodemailer from 'nodemailer';
import { handleContact } from '@/lib/contact.mjs';
export async function POST(request) {
  const sender=process.env.EMAIL_ADDRESS;
  const transport=sender&&process.env.GMAIL_PASSKEY ? nodemailer.createTransport({service:'gmail',host:'smtp.gmail.com',port:587,secure:false,auth:{user:sender,pass:process.env.GMAIL_PASSKEY},connectionTimeout:10000,socketTimeout:10000}) : null;
  return handleContact(request,{sender:transport?sender:null,sendMail:transport?mail=>transport.sendMail(mail):null});
}
