FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Copy package files from scraper-service
COPY scraper-service/package*.json ./

# Install dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install chromium
RUN npx playwright install-deps

# Copy source code from scraper-service
COPY scraper-service/server.js ./

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
