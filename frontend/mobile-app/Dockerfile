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
RUN npm install -g expo @expo/ngrok@^4.1.0

# Start Expo in web mode by default and clear cache
CMD ["expo", "start", "--tunnel", "--web", "-c"]
