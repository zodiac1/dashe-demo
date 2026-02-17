# Use official Node.js image as the build environment
FROM node:20 AS build

# Accept VITE_API_BASE_URL as build arg and set as env
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

# Copy .env from project root into build context
COPY .env .env

# Copy only the frontend/web-app package.json and lock file
COPY frontend/web-app/package.json frontend/web-app/package-lock.json ./
RUN npm install --frozen-lockfile

# Copy only the frontend/web-app source files
COPY frontend/web-app/. .
RUN npm run build

# Use Nginx to serve the built app
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
