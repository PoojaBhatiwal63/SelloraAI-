FROM node

WORKDIR /app

# Root package.json
COPY package*.json ./

RUN npm install

# Gateway package files
COPY gateway/package*.json ./gateway/

RUN cd gateway && npm install

# Gateway source
COPY gateway ./gateway

# Shared folder
COPY shared ./shared

# Gateway directory
WORKDIR /app/gateway

# TypeScript → JavaScript
RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]