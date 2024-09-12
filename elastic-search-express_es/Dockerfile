# Use Node.js LTS version as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++

# Install dependencies
RUN npm install

# Rebuild sqlite3 to ensure it's built for the correct architecture
RUN npm rebuild sqlite3 --build-from-source

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the application
CMD ["node", "src/server.js"]