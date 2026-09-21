# Site Propels — Déploiement

Le site est statique (`index.html`) + une petite fonction backend (`api/contact.js`)
qui envoie les messages du formulaire par email via [Resend](https://resend.com).

## 1. Créer un compte Resend (gratuit)

1. Va sur https://resend.com et crée un compte.
2. Dans **API Keys**, crée une clé et copie-la (tu en auras besoin à l'étape 3).
3. Dans **Domains**, ajoute et vérifie ton nom de domaine (ex. `propels-sarl.com`)
   en suivant les instructions DNS de Resend. C'est nécessaire pour que
   l'adresse `from` (l'expéditeur) soit acceptée.
   - Si tu n'as pas encore de domaine vérifié, Resend permet d'envoyer depuis
     `onboarding@resend.dev` en attendant — pratique pour tester rapidement.

## 2. Adapter l'adresse d'envoi

Dans `api/contact.js`, remplace :
```js
from: 'Site Propels <site@votredomaine.com>',
```
par ton propre domaine vérifié (ou `onboarding@resend.dev` pour tester).

## 3. Déployer sur Vercel (gratuit)

1. Crée un compte sur https://vercel.com (tu peux te connecter avec GitHub).
2. Mets ce dossier dans un dépôt GitHub, puis clique **Add New Project** dans
   Vercel et importe ce dépôt. (Ou utilise la CLI : `npx vercel` depuis ce dossier.)
3. Dans les réglages du projet Vercel → **Environment Variables**, ajoute :
   - `RESEND_API_KEY` = la clé copiée à l'étape 1
4. Déploie. Vercel détecte automatiquement `index.html` et `api/contact.js`
   (aucune configuration supplémentaire n'est nécessaire).

## 4. Tester

Une fois déployé, remplis le formulaire de contact sur le site en ligne.
Tu devrais recevoir un email à `Propelssarl@gmail.com` en quelques secondes.

## Notes

- Le champ caché "website" dans le formulaire est un piège à robots (honeypot) :
  s'il est rempli, la fonction ignore silencieusement la demande.
- Les messages ne sont pas stockés en base de données pour l'instant — ils
  arrivent uniquement par email. Si tu veux garder un historique (par exemple
  pour un futur CRM), on peut ajouter une base de données plus tard.
