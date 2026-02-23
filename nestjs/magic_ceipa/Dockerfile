# Base stage for shared base image
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Development stage
FROM base AS development
# Note: In development, package.json and code will be mounted from the host.
# We copy package files to ensure `npm install` runs effectively if volumes are not mounted yet.
COPY package*.json ./
RUN npm install
# Code is mapped via volume in docker-compose, but we can copy it in case we run it standalone
COPY . .
# Start the dev server
CMD ["npm", "run", "start:dev"]

# Build stage
FROM base AS build
COPY package*.json ./
# Install all dependencies (including devDependencies) to build the app
RUN npm install
COPY . .
# Build the NestJS application
RUN npm run build
# Now clean up and install ONLY production dependencies
# This creates a lean node_modules for the production image
RUN npm install --only=production && npm cache clean --force

# Production stage
FROM base AS production
ENV NODE_ENV=production
# Copy only the necessary files for production
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
# If you have other specific files needed at runtime, copy them here
# COPY package.json ./

# The port is documented/exposed here (can be re-mapped in docker-compose)
EXPOSE 3001

CMD ["node", "dist/main"]
