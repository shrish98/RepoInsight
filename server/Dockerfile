FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (using legacy-peer-deps for LangChain/Groq resolution)
RUN npm install --legacy-peer-deps

# Copy the rest of the backend code
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "index.js"]
