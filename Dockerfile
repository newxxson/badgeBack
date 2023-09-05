# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app


# Copy package.json to the working directory
COPY package.json ./

# Copy package-lock.json to the working directory
COPY package-lock.json ./


# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that your Express.js app will listen on
EXPOSE 3000
EXPOSE 443

# Command to run the app
CMD ["node", "./index.js"]
