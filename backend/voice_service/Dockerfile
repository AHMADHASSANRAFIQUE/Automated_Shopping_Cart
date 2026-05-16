FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all source files
COPY . .

# Expose port 7860 (Hugging Face default)
ENV PORT=7860
EXPOSE 7860

# Start server
CMD ["npm", "start"]
