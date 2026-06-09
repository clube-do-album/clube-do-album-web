# Clube do Album Web

Frontend da plataforma distribuida de ranking e rede social de albuns musicais.

## Responsabilidade

- Consumir o Gateway API como unica entrada do frontend.
- Permitir cadastro e login de usuarios.
- Buscar e importar albuns.
- Exibir ranking e feed.
- Enviar avaliacoes autenticadas.
- Seguir e deixar de seguir usuarios via Gateway.

## Tecnologias usadas

- React
- TypeScript
- Vite
- Lucide React
- React Router

## Variaveis de ambiente

Crie um arquivo local a partir do exemplo:

```bash
cp .env.example .env
```

Variavel esperada:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Como rodar localmente

Instale as dependencias:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Base URL local do Vite:

```text
http://localhost:5173
```

## Fluxo implementado

- Cadastro de usuario.
- Login com JWT.
- Persistencia da sessao no `localStorage`.
- Home autenticada com sugestoes vindas do ranking.
- Home com carrossel horizontal dos principais albuns e listagem paginada de todos os albuns importados.
- Menu lateral em drawer overlay, com abertura/fechamento por botao e transicao suave.
- Navegacao por rotas reais de URL.
- Estrutura separada em `app`, `features`, `layouts`, `components`, `services`, `hooks`, `utils` e `styles`.
- Rotas centralizadas em `src/app/routes.tsx`.
- Layout principal em `src/layouts/MainLayout`.
- Chamadas HTTP centralizadas em `src/services/api/apiClient.ts` e servicos por feature.
- Componentes comuns para capa de album, estados de tela e dialogo de confirmacao.
- Confirmacao visual para sair da conta e deixar de seguir usuarios.
- Busca de albuns pelo Catalog API via Gateway.
- Importacao de album autenticada.
- Tela de album com capa quadrada ampliada, status de importacao, metricas, avaliacao por slider/botoes e review opcional.
- Listagem de reviews escritas na tela do album com nome real do usuario quando disponivel.
- Consulta de ranking.
- Consulta de feed.
- Feed com exibicao diferenciada para `ALBUM_RATED` e `USER_FOLLOWED`.
- Tela de descoberta de pessoas em `/people`.
- Perfil do usuario logado.
- Perfil com albuns avaliados exibindo capa, titulo, artista, nota e review.
- Perfil publico de outro usuario com albuns avaliados, nota e review.
- Busca de usuarios por nome ou e-mail.
- Busca de usuarios por correspondencia parcial de nome/e-mail.
- Tela de outro perfil em `/profile/users/:userId`.
- Botao para seguir/deixar de seguir outro perfil.
- Listagem de seguidores e usuarios seguidos no perfil com nome/e-mail.
- Tela visual de edicao de perfil.
- Avaliacao de album autenticada enviando apenas `albumId` e `rating`.
- Tema escuro inspirado em apps de diario/ranking de filmes e musica.

## Estrutura principal

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    common/
    ui/
  features/
    albums/
      components/
      pages/
      services/
      types/
    rankings/
    social/
    users/
  hooks/
  layouts/
    MainLayout/
  pages/
  services/
    api/
  styles/
  types.ts
```

## Rotas

```text
/login
/
/ranking
/feed
/people
/profile
/profile/users/:userId
/profile/edit
/album/:albumId
```

O Docker usa `nginx.conf` com fallback para `index.html`, entao refresh direto nas rotas da SPA funciona.

## Docker

Build da imagem:

```bash
docker build -t clube-do-album-web .
```

Execucao local:

```bash
docker run --env-file .env -p 8080:80 clube-do-album-web
```
