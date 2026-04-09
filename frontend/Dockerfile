# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_URL


RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
# Copy built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Add a default nginx config for React Router fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
