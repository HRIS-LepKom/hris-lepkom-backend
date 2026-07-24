export const forgotPasswordCalasTemplate = ({ namaCalas, resetUrl }) => {
  const subject = 'Reset Password Akun Open Recruitment LEPKOM';

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #F3F6FB; }
    a { color: #156935; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F3F6FB;font-family:'Inter',Arial,Helvetica,sans-serif;">

  <!-- ── Outer wrapper ── -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#F3F6FB;padding:48px 16px;">
    <tr>
      <td align="center">

        <!-- ── Card ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;background:#ffffff;border-radius:16px;
                      border:1px solid #E5E7EB;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- ── Header bar ── -->
          <tr>
            <td style="background-color:#156935;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:600;color:rgba(255,255,255,0.65);
                        letter-spacing:0.12em;text-transform:uppercase;font-family:'Inter',Arial,sans-serif;">
                LEMBAGA PENGEMBANGAN KOMPUTERISASI
              </p>
              <p style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;
                        letter-spacing:-0.01em;font-family:'Inter',Arial,sans-serif;">
                LEPKOM
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.65);
                        font-family:'Inter',Arial,sans-serif;">
                Universitas Gunadarma
              </p>
            </td>
          </tr>

          <!-- ── Icon row ── -->
          <tr>
            <td align="center" style="padding:32px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#F0FDF4;border-radius:50%;width:64px;height:64px;
                              text-align:center;vertical-align:middle;
                              border:2px solid #BBF7D0;">
                    <span style="font-size:28px;line-height:64px;">🔑</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;
                         line-height:1.3;font-family:'Inter',Arial,sans-serif;">
                Reset Password Anda
              </h1>
              <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.6;
                         font-family:'Inter',Arial,sans-serif;">
                Hai, <strong style="color:#111827;font-weight:600;">${namaCalas}</strong> 👋
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 40px 0;">
              <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;
                         font-family:'Inter',Arial,sans-serif;">
                Kami menerima permintaan untuk mereset password akun
                <strong style="color:#111827;">Open Recruitment LEPKOM</strong> milik Anda.
                Klik tombol di bawah untuk membuat password baru.
              </p>
            </td>
          </tr>

          <!-- ── CTA Button ── -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#156935;border-radius:10px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:15px 36px;
                              font-size:14px;font-weight:600;color:#ffffff;
                              text-decoration:none;border-radius:10px;
                              letter-spacing:0.01em;font-family:'Inter',Arial,sans-serif;">
                      Reset Password Saya →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Divider ── -->
          <tr>
            <td style="padding:28px 40px 0;">
              <hr style="border:none;border-top:1px solid #E5E7EB;margin:0;" />
            </td>
          </tr>

          <!-- ── Security note ── -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                     style="background-color:#FFFBEB;border-radius:10px;
                            border:1px solid #FDE68A;overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#92400E;
                               text-transform:uppercase;letter-spacing:0.08em;
                               font-family:'Inter',Arial,sans-serif;">
                      ⚠&nbsp; Informasi Keamanan
                    </p>
                    <p style="margin:0;font-size:13px;color:#78350F;line-height:1.6;
                               font-family:'Inter',Arial,sans-serif;">
                      Link ini hanya berlaku selama
                      <strong style="color:#92400E;">1 jam</strong>
                      dan hanya dapat digunakan
                      <strong style="color:#92400E;">sekali</strong>.
                      Jika Anda tidak meminta reset password, abaikan email ini —
                      akun Anda tetap aman.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Bottom padding ── -->
          <tr><td style="height:36px;"></td></tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background-color:#23376c;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;font-weight:600;color:rgba(255,255,255,0.9);
                         font-family:'Inter',Arial,sans-serif;">
                LEPKOM · Universitas Gunadarma
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.45);
                         font-family:'Inter',Arial,sans-serif;">
                Email ini dikirim secara otomatis. Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>

        </table>

        <!-- ── Fallback link ── -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:560px;margin-top:20px;">
          <tr>
            <td style="text-align:center;padding:0 16px;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.7;
                         font-family:'Inter',Arial,sans-serif;">
                Tidak bisa klik tombol? Salin dan buka link berikut di browser Anda:<br/>
                <a href="${resetUrl}"
                   style="color:#156935;font-size:11px;word-break:break-all;
                          font-family:'Inter',Arial,sans-serif;">
                  ${resetUrl}
                </a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  const text = `Reset Password — LEPKOM Open Recruitment

Hai, ${namaCalas}.

Kami menerima permintaan untuk mereset password akun Open Recruitment LEPKOM milik Anda.

Klik link berikut untuk membuat password baru (berlaku 1 jam):
${resetUrl}

Jika Anda tidak meminta reset password, abaikan email ini.

---
LEPKOM · Universitas Gunadarma
Email ini dikirim secara otomatis, mohon tidak membalas email ini.`;

  return { subject, html, text };
};
