import { Order } from "src/crud/order/order.schema";
import { ServiceDetail } from "./snapshotTypes";

export type EmailObject = {
  subject: string;
  html: string;
  to?: string;
  from?: string
}

export const createClientNewCommandeMail = (
  order: Order,
  email: string
): EmailObject => {
  const { packs, price, created_at, status } = order;

  // Traduction du statut
  let statusText = "";
  if (status === 0) statusText = "⏳ En attente de paiement";
  else if (status === 2) statusText = "✅ Payée avec succès";
  else statusText = "ℹ️ En cours de traitement";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px; border:1px solid #eee;">
      <h2 style="color:#4CAF50; text-align:center;">Confirmation de votre commande</h2>
      <p>Bonjour,</p>
      <p>Merci pour votre confiance. Voici les détails de votre commande :</p>

      <table style="width:100%; margin-top:15px; border-collapse:collapse;">
        <tr>
          <td style="padding:8px;"><strong>Statut :</strong></td>
          <td style="padding:8px;">${statusText}</td>
        </tr>
        <tr style="background:#f1f1f1;">
          <td style="padding:8px;"><strong>Date :</strong></td>
          <td style="padding:8px;">${new Date(created_at).toLocaleString()}</td>
        </tr>
      </table>

      <h3 style="margin-top:25px; color:#333;">📦 Détails des packs :</h3>
      ${packs
      .map(
        (p) => `
        <div style="background:#fff; padding:15px; margin-bottom:15px; border:1px solid #ddd; border-radius:6px;">
          <p style="margin:0; font-size:16px;">
            <strong>Nom du pack :</strong> ${p.name}
          </p>
          <p style="margin:5px 0 0;">
            <strong>Prix brut :</strong> ${p.price} DT<br>
            <strong>Réduction :</strong> ${p.reduction || 0} DT<br>
            <strong>Total pack :</strong> ${p.total} DT
          </p>

          <h4 style="margin-top:10px; font-size:15px;">🛠️ Services inclus :</h4>
          <table style="width:100%; border-collapse:collapse; margin-top:5px;">
            <thead>
              <tr style="background:#f1f1f1;">
                <th style="text-align:left; padding:6px;">Service</th>
                <th style="text-align:center; padding:6px;">Quantité</th>
                <th style="text-align:right; padding:6px;">Prix</th>
                <th style="text-align:right; padding:6px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${p.services
            ?.map(
              (s) => `
                <tr>
                  <td style="padding:6px;">${s.serviceName}</td>
                  <td style="text-align:center; padding:6px;">${s.qte}</td>
                  <td style="text-align:right; padding:6px;">${s.unitPrice} DT</td>
                  <td style="text-align:right; padding:6px;"><strong>${s.total} DT</strong></td>
                </tr>
              `
            )
            .join("")}
            </tbody>
          </table>
        </div>
      `
      )
      .join("")}

      <h3 style="color:#E91E63; text-align:right; margin-top:20px;">
        💰 Montant total de la commande : ${price} DT
      </h3>

      <p style="margin-top:25px;">Nous vous remercions pour votre confiance.</p>
      <p style="font-size:13px; color:#777;">Cet email est généré automatiquement, merci de ne pas y répondre.</p>
    </div>
  `;

  return {
    to: email,
    subject: "Détails de votre commande",
    html,
  };
};



export const createOwnerNewCommandeMail = (
  commande: Order,
  clientEmail: string
): EmailObject => {
  const { packs, price, created_at, status } = commande;


  let statusText = "";
  if (status === 0) statusText = "⏳ En attente de paiement";
  else if (status === 2) statusText = "✅ Payée avec succès";
  else statusText = "ℹ️ En cours de traitement";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px; border:1px solid #eee;">
      <h2 style="color:#2196F3; text-align:center;">Nouvelle commande reçue</h2>
      <p>Bonjour,</p>
      <p>Un client a passé une nouvelle commande. Voici les détails :</p>

      <table style="width:100%; margin-top:15px; border-collapse:collapse;">
        <tr>
          <td style="padding:8px;"><strong>Client :</strong></td>
          <td style="padding:8px;">${clientEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px;"><strong>Statut :</strong></td>
          <td style="padding:8px;">${statusText}</td>
        </tr>
        <tr style="background:#f1f1f1;">
          <td style="padding:8px;"><strong>Date :</strong></td>
          <td style="padding:8px;">${new Date(created_at).toLocaleString()}</td>
        </tr>
      </table>

      <h3 style="margin-top:25px; color:#333;">📦 Détails des packs commandés :</h3>
      ${packs
      .map(
        (p) => `
        <div style="background:#fff; padding:15px; margin-bottom:15px; border:1px solid #ddd; border-radius:6px;">
          <p style="margin:0; font-size:16px;">
            <strong>Nom du pack :</strong> ${p.name}
          </p>
          <p style="margin:5px 0 0;">
            <strong>Prix brut :</strong> ${p.price} DT<br>
            <strong>Réduction :</strong> ${p.reduction || 0} DT<br>
            <strong>Total pack :</strong> ${p.total} DT
          </p>

          <h4 style="margin-top:10px; font-size:15px;">🛠️ Services inclus :</h4>
          <table style="width:100%; border-collapse:collapse; margin-top:5px;">
            <thead>
              <tr style="background:#f1f1f1;">
                <th style="text-align:left; padding:6px;">Service</th>
                <th style="text-align:center; padding:6px;">Quantité</th>
                <th style="text-align:right; padding:6px;">Prix</th>
                <th style="text-align:right; padding:6px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${p.services
            ?.map(
              (s) => `
                <tr>
                  <td style="padding:6px;">${s.serviceName}</td>
                  <td style="text-align:center; padding:6px;">${s.qte}</td>
                  <td style="text-align:right; padding:6px;">${s.unitPrice} DT</td>
                  <td style="text-align:right; padding:6px;"><strong>${s.total} DT</strong></td>
                </tr>
              `
            )
            .join("")}
            </tbody>
          </table>
        </div>
      `
      )
      .join("")}

      <h3 style="color:#E91E63; text-align:right; margin-top:20px;">
        💰 Montant total de la commande : ${price} DT
      </h3>

      <p style="margin-top:25px;">Pensez à vérifier et traiter cette commande dans les plus brefs délais.</p>
      <p style="font-size:13px; color:#777;">Cet email est généré automatiquement.</p>
    </div>
  `;

  return {
    subject: "Nouvelle commande client",
    html,
  };
};



export const createForgetPwdEmail = (email: string, token: string): EmailObject => {
  const url = `${process.env.FRONTEND_API}/client/reset-password/${token}`;

  const subject = "Réinitialisation de votre mot de passe";

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      
      <div style="background-color: #0d6efd; padding: 20px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Réinitialisation du mot de passe</h1>
      </div>

      <div style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.5;">
        <p>Bonjour,</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte associé à <strong>${email}</strong>.</p>
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${url}" 
             style="background-color: #0d6efd; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; display: inline-block;">
            Réinitialiser mon mot de passe
          </a>
        </div>

        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
        <p>Merci,<br>L'équipe AutoEcole</p>
      </div>

      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777777;">
        &copy; ${new Date().getFullYear()} AutoEcole. Tous droits réservés.
      </div>
    </div>
  </div>
  `;
  return {
    html,
    subject,
    to: email
  }
}



export const createResetPasswordSuccessEmail = (email: string): EmailObject => {

  const subject = "Mot de passe réinitialisé avec succès";

  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      
      <div style="background-color: #28a745; padding: 20px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Mot de passe réinitialisé</h1>
      </div>

      <div style="padding: 30px; color: #333333; font-size: 16px; line-height: 1.5;">
        <p>Bonjour,</p>
        <p>Le mot de passe associé à votre compte <strong>${email}</strong> a été réinitialisé avec succès.</p>
        <p>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>

        <p>Si vous n'avez pas effectué cette modification, veuillez contacter notre support immédiatement.</p>
        
        <p>Merci,<br>L'équipe AutoEcole</p>
      </div>

      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777777;">
        &copy; ${new Date().getFullYear()} AutoEcole. Tous droits réservés.
      </div>
    </div>
  </div>
  `;

  return {
    html,
    subject,
    to: email
  }
}
