export const registrationNotificationTemplate = ({
  namaCalas,
  idCalas,
  emailCalas,
  clientUrl,
  defaultPassword,
}) => {
  const subject = "Akun Rekrutmen LEPKOM Anda Telah Terdaftar! 🎉";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #F3F6FB; margin: 0; padding: 40px 20px; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border-top: 6px solid #156935; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .content { padding: 40px; color: #333; line-height: 1.6; }
    h1 { color: #156935; font-size: 22px; margin-top: 0; }
    .info-box { background-color: #F3F6FB; border: 1px solid #cbd5e1; border-left: 4px solid #156935; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .credential-row { margin-bottom: 10px; font-size: 14px; color: #334155; }
    .credential-row:last-child { margin-bottom: 0; }
    .credential-value { font-family: monospace, sans-serif; background: #e2e8f0; padding: 2px 8px; border-radius: 4px; color: #0f172a; font-weight: 600; word-break: break-all; }
    .warning-box { background-color: #fffbe5; border: 1px solid #fef08a; border-left: 4px solid #eab308; border-radius: 8px; padding: 15px 20px; margin: 20px 0; font-size: 14px; color: #854d0e; }
    .btn { display: inline-block; background-color: #156935; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-top: 10px; }
    .footer { padding: 20px 40px; text-align: center; color: #888; font-size: 13px; background: #fdfdfd; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="content">
      <h1>Selamat Datang, ${namaCalas}! 🎉</h1>
      <p>Akun kamu untuk <strong>Open Recruitment LEPKOM</strong> telah berhasil terdaftar oleh panitia rekrutmen.</p>
      <p>Kamu dapat masuk ke platform rekrutmen menggunakan kredensial akun berikut:</p>
      
      <div class="info-box">
        <div style="font-weight: 700; color: #23376c; margin-bottom: 12px; font-size: 16px;">Detail Kredensial Akun:</div>
        <div class="credential-row"><strong>ID Calas / Username:</strong> <span class="credential-value">${idCalas}</span></div>
        <div class="credential-row"><strong>Email:</strong> <span class="credential-value">${emailCalas}</span></div>
        <div class="credential-row"><strong>Password Default:</strong> <span class="credential-value">${defaultPassword}</span></div>
      </div>

      <div class="warning-box">
        <strong>⚠️ Perhatian Wajib:</strong> Demi menjaga keamanan akun kamu, kamu <strong>WAJIB mengubah password</strong> setelah pertama kali berhasil login.
      </div>

      <p>Silakan klik tombol di bawah untuk masuk ke dashboard rekrutmen:</p>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${clientUrl}" class="btn">Login ke Dashboard Rekrutmen</a>
      </div>

      <p style="margin-top: 40px; font-size: 14px;">Jika kamu mengalami kesulitan saat login, silakan hubungi panitia rekrutmen LEPKOM.</p>
      
      <p style="margin-top: 30px; font-weight: 500; color: #23376c;">Panitia Rekrutmen Asisten LEPKOM</p>
    </div>
    <div class="footer">
      LEPKOM Gunadarma &copy; ${new Date().getFullYear()}
    </div>
  </div>
</body>
</html>
  `;

  const text = `Halo ${namaCalas},\n\nAkun kamu untuk Open Recruitment LEPKOM telah berhasil terdaftar.\n\nDetail Kredensial Akun:\n- ID Calas / Username: ${idCalas}\n- Email: ${emailCalas}\n- Password Default: ${defaultPassword}\n- Link Login: ${clientUrl}\n\nPERHATIAN WAJIB: Kamu WAJIB mengubah password saat pertama kali login.\n\nPanitia Rekrutmen Asisten LEPKOM`;

  return { subject, html, text };
};
