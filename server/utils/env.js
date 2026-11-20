export const getEnv = (...names) => {
  for (const name of names) {
    const value = process.env[name];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};
