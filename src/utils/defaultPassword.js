export const getDefaultPassword = () => {
  const defaultPassword = process.env.DEFAULT_PASSWORD;

  if (!defaultPassword) {
    throw new Error('DEFAULT_PASSWORD belum diset di environment variable');
  }

  return defaultPassword;
};