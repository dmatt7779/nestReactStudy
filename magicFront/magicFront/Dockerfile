# Base stage for shared base image
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install
# Source is usually mounted via volume mapping for live reload, but we copy it for standalone usages
COPY . .
# React default port
EXPOSE 3000
CMD ["npm", "start"]

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm install
COPY . .
# Set the enviroment variable to production during build if needed
ENV NODE_ENV=production
RUN npm run build

# Production stage - Using NGINX
FROM nginx:alpine AS production
# Copy the built index.html and static assets from previous stage into Nginx
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose HTTP port for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
