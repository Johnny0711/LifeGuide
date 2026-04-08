# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We need environment variables for build time, so usually we pass them via build args
# But Vite natively injects them. When CI builds, CI must have secrets config.
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Add a default nginx config for React Router fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
