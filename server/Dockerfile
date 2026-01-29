FROM node:20-slim

# Install OpenSSL + curl (rates updater)
RUN apt-get update -y && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Generate Prisma Client
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "start"]
