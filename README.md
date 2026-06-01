# Clube do Album Web

Frontend da plataforma distribuida de ranking e rede social de albuns musicais.

## Responsabilidade futura

- Exibir albuns, rankings, perfis e feed social.
- Integrar com as APIs do ecossistema Clube do Album.
- Oferecer a experiencia principal para usuarios finais.

## Tecnologias usadas

- React
- TypeScript
- Vite

## Como rodar localmente

```bash
npm install
npm run dev
```

Status atual: projeto inicial criado apenas com estrutura base. As funcionalidades serão implementadas nas próximas etapas.

## Docker

Crie um arquivo local de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

Build da imagem:

```bash
docker build -t clube-do-album-web .
```

Execucao local:

```bash
docker run --env-file .env -p 8080:80 clube-do-album-web
```
