FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Generate Prisma Client
# We need a dummy URL for the build step validation, it won't be used for connection
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

EXPOSE 4000

CMD ["npm", "start"]
