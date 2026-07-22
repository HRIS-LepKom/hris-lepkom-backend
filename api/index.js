import app from '../src/app.js';

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[DEV] Server berjalan di http://localhost:${PORT}`);
  });
}

export default app;
