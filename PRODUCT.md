# Product

## Register

product

## Users

Três audiências, todas internas ao ecossistema multi-tenant do CRM/chat:

- **Gestores e donos das clínicas (tenant final)**: abrem o painel em momentos curtos do dia — entre consultas, antes de uma reunião — para responder "como estamos hoje?". Pouco apetite por exploração; alto apetite por sinais claros. Costumam abrir embutido (iframe) dentro do CRM que já usam.
- **Operadores de atendimento/CRM**: usam diariamente para acompanhar leads, médicos, conversões por origem. Contexto de trabalho focado; alternam entre o painel e a ferramenta de conversa.
- **Time interno CLIENTE_X (suporte, analytics, comercial)**: usa o mesmo painel para dar suporte aos clientes e diagnosticar contas (com destaque para `co=20`, a operação 100% IA da própria CLIENTE_X). Precisa de leitura rápida e de prestar contas externamente.

Job-to-be-done central: **decisão rápida ("como estamos hoje?")**. Exploração analítica e operação são secundárias.

## Product Purpose

Painel de relatórios consolidado para um produto multi-tenant de chat/CRM em saúde. Existe para transformar dados operacionais (atendimentos, conexões, pipeline, origens) em leitura de estado imediata — em segundos, não minutos.

Sucesso parece: o gestor abre o painel, capta o estado da operação em uma olhada, fecha. O operador encontra o subgrupo que precisa atacar sem precisar montar a pergunta. O analista interno mostra o painel numa reunião e o dado se defende sozinho.

## Brand Personality

Três palavras: **preciso, sóbrio, opinativo**.

- **Preciso** — Stripe Dashboard como referência: hierarquia de tabela, números legíveis, copy curta. Nada de aproximação visual; cada elemento tem motivo.
- **Sóbrio** — Notion/Figma como referência: claro, espacial, generoso. Baixa densidade decorativa; o dado é o herói.
- **Opinativo** — confiante o suficiente para afirmar o que importa primeiro. Não é "neutro" / "todo card igual" / "BI genérico". O painel toma partido sobre hierarquia.

Tom de voz textual: direto, em português, frases curtas, sem jargão de BI. Métricas têm nomes que um gestor de clínica reconhece, não rótulos técnicos do banco.

## Anti-references

Não pode parecer:

- **SaaS template Bootstrap/AdminLTE/Tabler**: sidebar azul-índigo padrão, cards com sombra clichê, ícones genéricos, badges coloridos sem propósito. É o "AI slop" mais comum desse domínio.
- **Clichê médico/clínico**: azul-claro + branco + acentos verde-saúde, ícones de cruz/estetoscópio, paleta hospitalar. O público é gestor, não paciente; tratar como saúde-cliché empurra para o lado errado.
- **BI corporativo genérico (Power BI/Tableau cru)**: grade de cards idênticos, gráficos competindo entre si, sensação de planilha pintada.
- **AI-hype marketing**: gradientes roxo/rosa, glassmorphism, glow neon, gradient text. Contradiz seriedade do dado clínico.

## Design Principles

1. **O dado fala — a interface se cala.** Subtração antes de adição. Em dúvida entre adicionar enfeite ou tirar peso, tira. Decoração que não comunica estado é ruído.
2. **Hierarquia opinativa.** Nada é igual a tudo. O painel afirma qual número importa mais nesta tela, e o resto se subordina por tamanho, peso, cor ou posição. Grades de cards idênticos são o sintoma a evitar.
3. **Glance-and-go em <5s.** Cada tela responde "como estamos?" antes de pedir qualquer interação do usuário. Filtros e drill-down vêm depois, nunca como porta de entrada.
4. **Rigor sóbrio, sem clichê de setor.** Pareça um Stripe para gestão clínica, não um hospital nem um SaaS-template. Quando a primeira ideia for "azul + branco + ícone médico", refazer.
5. **Multi-tenant honesto.** O contexto do tenant (qual operação, qual período) é sempre legível, nunca enterrado. Mas a marca do tenant não rouba o protagonismo do dado.

## Accessibility & Inclusion

- **WCAG 2.1 AA** como linha de base obrigatória.
  - Contraste mínimo 4.5:1 para texto corpo, 3:1 para texto grande e elementos não-textuais informativos.
  - Navegação completa por teclado; foco visível e nunca suprimido.
  - Estados (carregando, vazio, erro) anunciados a leitor de tela quando relevante.
- **Cor nunca é o único canal de significado.** Status (positivo/negativo/atenção) sempre acompanha forma, posição ou rótulo — daltonismo vermelho-verde é o caso mais comum no público gestor.
- **Iframe-embed friendly**: o painel é renderizado dentro de outros sistemas; tipografia e contraste precisam funcionar mesmo quando o host injeta um zoom ou tema externo.
- **Sem dependência exclusiva de hover**: tooltips/affordances também devem ser alcançáveis por foco/teclado, já que parte da audiência opera em touch (tablet em clínica).
