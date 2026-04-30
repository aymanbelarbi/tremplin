<!DOCTYPE html>
<html lang="fr">
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#faf9f5; padding:32px; color:#0f1411;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:20px;padding:40px;box-shadow:0 10px 32px -24px rgba(15,20,17,0.2);">
    <p style="color:#0A7A3B;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;">Bienvenue sur Tremplin</p>
    <h1 style="font-size:28px;margin:12px 0 8px;">Bonjour {{ $user->full_name }},</h1>
    <p style="color:#4b5450;line-height:1.6;">
      Votre compte stagiaire a bien été créé. Prochaine étape : déclarer votre diplôme et téléverser vos documents pour que l'administration puisse vérifier votre profil.
    </p>
    <div style="margin:28px 0;">
      <a href="{{ config('app.frontend_url') }}/inscription/diplome" style="display:inline-block;background:#0f1411;color:#faf9f5;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;">Continuer mon inscription</a>
    </div>
    <p style="color:#7a847f;font-size:13px;">À bientôt,<br/>L'équipe ISTA Khemisset</p>
  </div>
</body>
</html>
