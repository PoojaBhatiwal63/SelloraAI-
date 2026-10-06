FROM node

WORKDIR /app

# Root package.json
COPY package*.json ./

RUN npm install

# Auth package files
COPY services/product/package*.json ./services/product/

RUN cd services/product && npm install

# Auth source
COPY services/product ./services/product

# Shared folder
COPY shared ./shared

# Auth directory
WORKDIR /app/services/product

# TypeScript build
RUN npm run build

EXPOSE 8002

CMD ["npm", "start"]