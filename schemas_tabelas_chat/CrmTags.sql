
  Smoke prod nos 6 surfaces afetados (eventos, fórum, /admin/cms/paginas, /admin/relatorios,
  comentários de notícias, dialog LGPD) fica sob seu critério — fluxos read-only não devem ter
  regressão pelo refactor; risco real é nos throws de POST/PATCH cujas mensagens viraram ApiError
  (mesmo texto, mesmo .message, só preserva .status).

claude n8n apikey	
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYTNiYWU2Yi0wMjI2LTRiNWItOWM3Mi0xOTNjYTBhZDJiNDAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzc4Nzk3OTY2LCJleHAiOjE3ODEzMTk2MDB9.mVZojGDtKWaGYesitNB8hJ4mMfTWqrt-M7NNumZmr1s


