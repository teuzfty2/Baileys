# Usa uma imagem base do Node.js
FROM node:20-alpine

# Define o diretório de trabalho no container
WORKDIR /watools_app_api

# Habilita o pnpm dentro do container
RUN corepack enable

# Define variáveis de ambiente
ENV MONGODB_URL=mongodb://localhost:27017
ENV PORT=3003

# lockfiles primeiro (melhor cache)
COPY package.json pnpm-lock.yaml ./
COPY .npmrc* ./
RUN pnpm install --frozen-lockfile

# Restante do projeto e realiza o build
COPY . .
RUN pnpm build

EXPOSE 3003

CMD ["pnpm", "start"]