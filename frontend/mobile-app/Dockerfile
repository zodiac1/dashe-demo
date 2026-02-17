# Use the official Node.js image as the base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose Expo default port
EXPOSE 8081

# Install Expo CLI globally
RUN npm install -g expo

# Start Expo in web mode by default (can be overridden)
CMD ["expo", "start", "--tunnel", "--web"]
