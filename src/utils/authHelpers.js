/**
 * Cookie options untuk refresh token.
 *
 * PENTING:
 * - `secure: true` + `sameSite: 'None'` diperlukan agar cookie bisa dikirim
 *   cross-origin di production (FE dan BE beda domain).
 * - Di development (http://localhost), `secure: true` akan menyebabkan browser
 *   MENOLAK mengirim cookie karena koneksi bukan HTTPS.
 * - Solusi: Di development, gunakan `secure: false` + `sameSite: 'Lax'`.
 */
export const buildCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure:   isProduction,               // true di production (HTTPS), false di development (HTTP)
    sameSite: isProduction ? 'None' : 'Lax', // 'None' untuk cross-origin di production, 'Lax' untuk same-site dev
    maxAge:   30 * 24 * 60 * 60 * 1000,   // 30 hari
    path:     '/',
  };
};

export const setRefreshCookie = (res, token, req, cookieName) => {
  res.cookie(cookieName, token, buildCookieOptions(req));
};

export const clearRefreshCookie = (res, req, cookieName) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie(cookieName, {
    path:     '/',
    secure:   isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
  });
};

// Ambil SEMUA nilai cookie bernama `name` dari raw header.
// cookie-parser hanya mengembalikan satu nilai jika ada cookie duplikat
// (mis. orphan path lama + path=/), sehingga bisa membaca token basi.
// Dengan membaca semua kandidat, kita bisa coba tiap nilai ke DB.
export const getAllCookieValues = (req, name) => {
  const header = req.headers?.cookie || '';
  return header
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.startsWith(`${name}=`))
    .map((s) => {
      try { return decodeURIComponent(s.slice(name.length + 1)); }
      catch { return s.slice(name.length + 1); }
    })
    .filter(Boolean);
};