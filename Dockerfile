# Use an official Node.js Alpine-based image as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Set the PORT environment variable
ENV PORT=4200

# Copy the package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the application
RUN npm run build

# Expose the port that your application will run on
EXPOSE 4200

# Define the command to run on container start
CMD ["npm", "run", "server"]
