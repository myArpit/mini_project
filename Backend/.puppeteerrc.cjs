const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Overrides the default root cache folder to survive Render's dynamic runtime pathing
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};