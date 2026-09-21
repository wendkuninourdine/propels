// Fonction serverless Vercel : reçoit les données du formulaire de contact
// et envoie un email à Propelssarl@gmail.com via l'API Resend.
//
// Nécessite une variable d'environnement RESEND_API_KEY (voir README.md).

export default async function handler(req, res) {
  // On n'accepte que les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { name, phone, email, services, service, message, website } = req.body || {};

  // Honeypot anti-spam : si ce champ caché est rempli, c'est un bot.
  // On répond "succès" pour ne pas alerter le bot, mais on n'envoie rien.
  if (website) {
    return res.status(200).json({ success: true });
  }

  // Validation basique des champs obligatoires (Nom, Téléphone, Message)
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  // Nettoyage simple pour éviter l'injection HTML dans l'email
  const escapeHtml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // Traitement des services (tableau ou chaîne unique)
  let servicesFormatted = 'Non précisé';
  if (Array.isArray(services) && services.length > 0) {
    servicesFormatted = services.map(s => escapeHtml(s)).join(', ');
  } else if (typeof services === 'string' && services.trim() !== '') {
    servicesFormatted = escapeHtml(services);
  } else if (typeof service === 'string' && service.trim() !== '') {
    servicesFormatted = escapeHtml(service);
  }

  // Validation facultative de l'email
  const validEmail = email && typeof email === 'string' && email.trim() !== '' ? email.trim() : null;

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Doit correspondre à un domaine vérifié dans Resend (voir README.md)
        from: 'Site Propels <site@votredomaine.com>',
        to: ['Propelssarl@gmail.com'],
        // On n'indique 'reply_to' que si l'utilisateur a renseigné un e-mail
        reply_to: validEmail || undefined,
        subject: `Nouveau message du site - ${escapeHtml(name)}`,
        html: `
          <h2>Nouveau message depuis le site Propels</h2>
          <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
          <p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p>
          <p><strong>Adresse e-mail :</strong> ${validEmail ? escapeHtml(validEmail) : '<em>Non renseignée</em>'}</p>
          <p><strong>Service(s) sélectionné(s) :</strong> ${servicesFormatted}</p>
          <p><strong>Message :</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      console.error('Erreur Resend:', errorBody);
      return res.status(502).json({ error: "Échec de l'envoi de l'email" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}