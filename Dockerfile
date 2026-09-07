FROM node:22-slim AS base

# Instalar dependencias nativas para compilación
RUN apt-get update && apt-get install -y openssl python3 make g++ git && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@latest

WORKDIR /app

# Copiar manifiestos
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY prisma ./prisma/

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copiar el código fuente completo
COPY . .

# Generar cliente de Prisma y compilar la app
RUN npx prisma generate
RUN pnpm run build

EXPOSE 4000

CMD ["pnpm", "exec", "tsx", "server.ts"]
