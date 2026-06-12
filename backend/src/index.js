const app = require('./app');
const logger = require('./middleware/logger');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`, { env: process.env.NODE_ENV });
});