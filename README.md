# 🧪 Plano de Implementação: Sistema de A/B Testing com Next.js + Prisma + Nivo (MVP)

## 🔧 Tecnologias Utilizadas

- Prisma + SQLite
- Middleware (roteamento e split de tráfego)
- Nivo (gráficos)
- Cookies (persistência de variantes e visitante anônimo)

## 📂 Estrutura de Diretórios

```
src/
  ├── lib/                      # Biblioteca de utilitários e serviços
  │   ├── prisma.ts             # Cliente Prisma (singleton)
  │   ├── ab-testing/
  │       ├── abTests.ts         # Configuração dos testes A/B
  │       └── hooks.ts           # Hook useAbTracking
  │
  ├── app/
  │   ├── api/
  │   │   └── ab-event/
  │   │       └── route.ts       # API de tracking de eventos
  │   │
  │   ├── admin/
  │   │   └── ab-tests/
  │   │       └── page.tsx       # Dashboard administrativo
  │   │
  │   ├── (lp)/
  │       └── missao-literaria/
  │           ├── variant-a/
  │           │   └── page.tsx     # Variação A da landing page
  │           ├── variant-b/
  │           │   └── page.tsx     # Variação B da landing page
  │           └── variant-c/
  │               └── page.tsx     # Variação C da landing page
  │
  └── middleware.ts              # Middleware de roteamento A/B

prisma/
  └── schema.prisma             # Schema do banco de dados
```

---

## 🧩 Módulos do Sistema

### 1. Configuração de Testes (`abTests.ts`)
- Arquivo local com configuração hardcoded (adequado para MVP)
- Tipagem inline com:
  ```typescript
  export type AbTestVariant = 'a' | 'b' | 'c';
  export type AbEventType = 'view' | 'conversion';
  ```
- Estrutura do teste:
  ```typescript
  export const abTests = {
    lp: {
      slug: 'lp',
      cookieName: 'ab-lp-variant',
      variants: {
        a: { path: '/missao-literaria/variant-a' },
        b: { path: '/missao-literaria/variant-b' },
        c: { path: '/missao-literaria/variant-c' }
      },
      split: { a: 33.33, b: 33.33, c: 33.34 }
    }
  };
  ```

---

### 2. Middleware de Roteamento A/B
- Intercepta rotas definidas em `abTests`
- Verifica cookie da variante → redireciona
- Sorteia variação com base no split se não houver cookie
- Define cookie da variação e de `visitor-id` (UUID)
- Função simples para atribuição de variante:
  ```typescript
  function assignVariant(split: Record<string, number>) {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    
    for (const [variant, probability] of Object.entries(split)) {
      cumulativeProbability += probability;
      if (random <= cumulativeProbability) {
        return variant;
      }
    }
    
    return Object.keys(split)[0];
  }
  ```

---

### 3. Páginas de Variação
- Uma página Next.js por variação (ex: `/missao-literaria/variant-a`)
- Em cada página:
  - Evento de **view** disparado ao carregar
  - Evento de **conversion** disparado ao clicar (ou converter)
- Hook para envio de eventos:
  ```typescript
  function useAbTracking(testName: string, variant: string) {
    useEffect(() => {
      // Enviar evento view ao carregar
      fetch('/api/ab-event', {
        method: 'POST',
        body: JSON.stringify({
          testName,
          variant,
          event: 'view',
          visitorId: getCookie('visitor-id') || 'unknown'
        })
      });
    }, []);

    const trackConversion = () => {
      // Enviar evento conversion ao converter
      fetch('/api/ab-event', {
        method: 'POST',
        body: JSON.stringify({
          testName,
          variant,
          event: 'conversion',
          visitorId: getCookie('visitor-id') || 'unknown'
        })
      });
    };

    return { trackConversion };
  }
  ```

---

### 4. API de Tracking (`/api/ab-event/route.ts`)
- Recebe dados dos eventos
- Validação básica inline:
  ```typescript
  export async function POST(request: NextRequest) {
    const body = await request.json();
    
    // Validação simples
    if (!body.testName || !body.variant || !body.event || !body.visitorId) {
      return Response.json({ error: 'Dados incompletos' }, { status: 400 });
    }
    
    if (!['view', 'conversion'].includes(body.event)) {
      return Response.json({ error: 'Tipo de evento inválido' }, { status: 400 });
    }

    // Verificação básica de idempotência
    const existingEvent = await prisma.abResult.findFirst({
      where: {
        testName: body.testName,
        variant: body.variant,
        event: body.event,
        visitorId: body.visitorId,
        createdAt: {
          gt: new Date(Date.now() - 60000) // último minuto
        }
      }
    });

    if (existingEvent) {
      return Response.json({ status: 'already_processed' });
    }

    // Salvar no banco
    await prisma.abResult.create({
      data: {
        testName: body.testName,
        variant: body.variant,
        event: body.event,
        visitorId: body.visitorId,
        createdAt: new Date()
      }
    });

    return Response.json({ status: 'success' });
  }
  ```

---

### 5. Banco de Dados (Prisma + SQLite)
- Tabela única: `AbResult`
- Schema Prisma:
  ```prisma
  model AbResult {
    id         Int      @id @default(autoincrement())
    testName   String
    variant    String
    event      String
    visitorId  String
    createdAt  DateTime @default(now())

    @@index([testName, variant])
    @@index([visitorId])
  }
  ```

### 6. Dashboard Administrativo
- Rota: `/admin/ab-tests`
- Login simples com PIN code do .env
- Verificação básica:
  ```typescript
  const PIN_CODE = process.env.ADMIN_PIN || '1234';
  
  function verifyPin(inputPin: string) {
    return inputPin === PIN_CODE;
  }
  ```
- Consulta dados via Prisma
- Mostra:
  - Total de visualizações
  - Visitantes únicos
  - Conversões
  - Taxa de conversão por variação (%)
- Visualização:
  - Tabela com métricas
  - Gráficos (Bar ou Pie Chart via Nivo)

## 📈 Métricas Calculadas

- **Visualizações**: total de `view` por variação
- **Visitantes únicos**: `visitorId` únicos por variação
- **Conversões**: total de `conversion` por variação
- **Taxa de Conversão** = `conversions / unique visitors`

## 🛠️ Escalabilidade Futura (Pós-MVP)

- Migrar `abTests` para banco de dados
- Adicionar cache com Redis
- Implementar validações mais robustas com Zod
- Melhorar segurança do painel admin
- Suporte a filtros (por origem, dispositivo, etc)

---

## ⏱ Ordem Recomendada de Implementação

1. Criar estrutura base do Prisma com o modelo `AbResult` e índices
2. Definir `abTests.ts` com tipagem inline e teste para `missao-literaria`
3. Implementar `middleware.ts` com lógica de split e cookies
4. Criar páginas de variante `variant-a`, `variant-b`, `variant-c`
5. Implementar hook de tracking para eventos `view` e `conversion`
6. Criar API `/api/ab-event` com validação básica
7. Montar dashboard `/admin/ab-tests` com autenticação por PIN
8. Testar e validar fluxo completo

---

