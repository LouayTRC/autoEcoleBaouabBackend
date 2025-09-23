import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as nodemailer from "nodemailer";
import { ServiceResponse } from 'src/common/types';
import { Email } from './email.schema';
import { Model } from 'mongoose';
@Injectable()
export class EmailService {

  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Email.name) private emailModel:Model<Email>
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT ?? '587', 10),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    })
  }

  async sendMail(subject: string, html: string, from?: string, to?: string): Promise<ServiceResponse<any>> {
    try {
      const info = await this.transporter.sendMail({
        from: from ? from : `"AutoEcole" <${process.env.MAIL_USER}>`,
        to: to ? to : process.env.MAIL_USER,
        subject,
        html
      })

      return {
        data: {},
        message: "Email envoyé avec succès !"
      };
    } catch (error) {
      throw new InternalServerErrorException("Problème dans l'envoi de l'email !")
    }
  }


  async sendContactEmail(
    fromEmail: string,
    subject: string,
    message: string
  ): Promise<ServiceResponse<any>> {
    try {
      const html = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #007bff; margin-bottom: 10px;">Nouveau message depuis le formulaire de contact</h2>
        
        <p><strong>Expéditeur :</strong> <a href="mailto:${fromEmail}">${fromEmail}</a></p>
        <p><strong>Sujet :</strong> ${subject}</p>
        
        <h3 style="margin-top:20px; color:#555;">Message :</h3>
        <div style="padding: 15px; background-color: #f9f9f9; border-radius: 6px; border: 1px solid #ddd;">
          <p style="margin:0;">${message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <hr style="margin:20px 0; border:0; border-top:1px solid #eee;">
        <p style="font-size:12px; color:#777;">Ceci est un email automatique envoyé par AutoEcole.</p>
      </div>
    `;

      const info = await this.transporter.sendMail({
        from: `"Website Contact Us" <${process.env.MAIL_USER}>`,
        replyTo: fromEmail,
        to: process.env.MAIL_USER,
        subject: `Contact Us : ${subject}`,
        html
      });

      await this.emailModel.create({
        email:fromEmail,
        subject:subject,
        message,
        status:0
      })

      return {
        message: 'Email envoyé avec succès !',
        data: {}
      };

    } catch (error) {
      throw new InternalServerErrorException("Erreur lors de l'envoi de l'email !");
    }
  }


  async getAllContactUsEmails():Promise<ServiceResponse<any[]>>{
    const emails=await this.emailModel.find();
    return {
      data:emails,
    }
  }


  async updateContactUsEmail(email_id:string,status:number):Promise<ServiceResponse<any[]>>{
    const email=await this.emailModel.find({id:email_id});

    if (!email) {
      throw new NotFoundException("Ce contact us Email est introuvable !!")
    }

    await this.emailModel.findOneAndUpdate({id:email_id,status});

    return {
      data:email,
      message:"Statut de contact us Email modifiée avec succès !"
    }
  }

}
