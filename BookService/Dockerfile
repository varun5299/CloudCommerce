# Use the official Node.js 14 image as the base image
FROM node:14-alpine

# Set the working directory for the application
WORKDIR /app

# Copy the package.json file from the host machine to the container
COPY package.json ./

# Install dependencies using npm
RUN npm install

# Copy the entire application code to the container
COPY . .

# Expose port 3002 for the application
EXPOSE 3002

# Start the application using npm
CMD ["npm", "start"]
