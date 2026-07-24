export const isHttps = (req) =>
  req.secure ||
  req.headers['x-forwarded-proto'] === 'https' ||
  process.env.NODE_ENV === 'production';

export const buildCookieOptions = (req) => ({
  httpOnly: true,
  secure:   isHttps(req),
  sameSite: isHttps(req) ? 'None' : 'Lax',
  maxAge:   30 * 24 * 60 * 60 * 1000, // 30 hari
  path:     '/',
});

export const setRefreshCookie = (res, token, req, cookieName) => {
  res.cookie(cookieName, token, buildCookieOptions(req));
};

export const clearRefreshCookie = (res, req, cookieName) => {
  res.clearCookie(cookieName, {
    path:     '/',
    secure:   isHttps(req),
    sameSite: isHttps(req) ? 'None' : 'Lax',
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