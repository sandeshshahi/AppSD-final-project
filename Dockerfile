# Start with a clean computer that has Node installed
FROM node:lts-alpine

# Create a folder inside the container for our app
WORKDIR /app

# Copy your package files first (for faster caching)
COPY package*.json ./

# Install your dependencies
RUN npm install

# Copy the rest of your backend code in
COPY . .

# Compile the TypeScript into JavaScript!
RUN npm run build

# Expose the port your backend runs on (e.g., 4000)
EXPOSE 4000

# Tell the container how to start the app
CMD ["npm", "start"]