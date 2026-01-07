# Use Node.js LTS
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Set development mode
ENV NODE_ENV=development

# Expose the server port
EXPOSE 3001

# Run in development mode
CMD ["npm", "run", "dev"]
