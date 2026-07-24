export const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const getOptionalEnvVar = (name: string, fallback: string = ''): string => {
  const value = process.env[name]?.trim();
  return value !== undefined ? value : fallback;
};
