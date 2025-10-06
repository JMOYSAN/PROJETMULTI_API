# Use official Node.js image
FROM node:20-alpine

# Create and set working directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install 

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]
