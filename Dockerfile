FROM node:24-slim

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build frontend production bundle into /app/dist
RUN npm run build

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start unified Node.js server (serves frontend SPA + SQLite REST API)
CMD ["node", "server/index.js"]
