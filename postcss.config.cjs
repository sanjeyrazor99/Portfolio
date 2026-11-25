let plugins = {};
try {
  require.resolve("tailwindcss");
  require.resolve("autoprefixer");
  plugins = {tailwindcss: {}, autoprefixer: {}};
} catch (error) {
  if (error.code !== "MODULE_NOT_FOUND") throw error;
}
module.exports = {plugins};
