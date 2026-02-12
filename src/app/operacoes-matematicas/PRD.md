# PRD — Landing Page: Operações Matemáticas em Pixel Art (Divertidamente II)

> **Rota:** `/operacoes-matematicas`  
> **Produto:** Operações Matemáticas em Pixel Art — Divertidamente II  
> **Data:** 12/02/2026  
> **Status:** Aguardando aprovação  

---

## 1. Visão Geral

Criar a LP de conversão do produto **Operações Matemáticas em Pixel Art**, utilizando a **mesma estrutura de funil** validada no Desafio Literário, mas com **copy 100% original** focada na dor real do ensino de matemática.

### 1.1 Premissas Fundamentais

| Item | Detalhe |
|------|---------|
| **Plano Básico** | R$ 14 — recurso principal (PDF não editável) |
| **Plano Completo** | R$ 17 — recurso editável + Fábrica de Continhas |
| **Entrega** | Via E-mail |
| **Público** | Professoras do Fundamental I e II, psicopedagogas (25-45 anos) |
| **Tom de voz** | Prático, acolhedor, empolgante — trata a professora por "você" |
| **Objetivo principal** | Vender o **Plano Completo** (R$ 17) |

---

## 1.2 Pesquisa de Dor & Copy Strategy

### A Dor Real (não é sobre telas)

A matemática tem um problema que a leitura não tem: **a criança naturalmente resiste**. Ninguém precisa convencer uma criança a não gostar de matemática — ela já chega com medo, bloqueio ou tédio.

**Dados da pesquisa:**
- **30% dos estudantes brasileiros** relatam medo ou nervosismo com matemática (OCDE)
- A ansiedade matemática pode **reduzir o desempenho em até 40%** 
- Crianças com ansiedade dedicam parte da **memória de trabalho à própria reação de medo**, sobrando menos capacidade para o cálculo em si
- O erro em matemática é **punido e criticado** — diferente de outras matérias, existe resposta certa e errada, sem meio-termo
- **Pais transmitem** suas próprias experiências negativas — "eu também era péssima em matemática"
- O ciclo vicioso: ansiedade → desempenho ruim → mais ansiedade

### O Inimigo Comum

**O método tradicional de ensinar matemática.** Não é culpa da professora, não é culpa do aluno. É o método:
- "Resolva 50 continhas" sem contexto, sem diversão
- O exercício repetitivo que transforma matemática em **castigo**
- A folha branca com números que causa **pânico** antes mesmo de começar
- A pressão pelo acerto rápido que **trava** a criança

A professora já sabe que o método não funciona. Ela **sente no dia a dia** — olha pra turma e vê caras fechadas, crianças que simplesmente param de tentar. Mas não tem tempo nem recursos para inventar algo do zero.

### A Solução (nosso papel na narrativa)

Nós não vendemos uma folha de exercícios. Nós vendemos uma **distração inteligente**:
- A criança **não percebe** que está praticando matemática — ela está tentando descobrir qual personagem vai aparecer
- O Pixel Art funciona porque **esconde a matemática dentro de um jogo visual**
- Os personagens do Divertidamente II criam **conexão emocional** — a criança QUER resolver para ver o resultado
- A recompensa é imediata e visual: cada continha certa = mais uma parte do personagem revelada

### Estratégia de Preço: "Ela Leva Vantagem Sobre Mim"

O plano completo precisa parecer uma **loucura de preço**. A professora precisa pensar: "por R$ 3 a mais eu levo TUDO isso? É burrice não pegar o completo."

| Elemento de valor | Valor percebido | Custo real |
|-------------------|:-:|:-:|
| Material principal (18 folhinhas) | R$ 14 | R$ 14 |
| Versão Editável | R$ 18 | Incluso no completo |
| Fábrica de Continhas | R$ 37 | Incluso no completo |
| **Total percebido** | **R$ 69** | **R$ 17** |
| **"Economia" percebida** | **R$ 52** | — |

A sensação deve ser: "essa professora está saindo no lucro e eu estou perdendo dinheiro nessa oferta."

---

## 2. Estrutura de Seções (Funil)

Mesma ordem do Desafio Literário:

```
page.tsx
├── Hero                    → Atenção + Promessa
├── Problem                 → Agitação da dor
├── WhatsIncluded           → O que vem no produto
├── Solution                → Como funciona (3 passos)
├── Demo (Carrossel)        → Prova visual / amostra
├── Bonuses                 → Stack de valor (somente plano completo)
├── PlanBasic               → Oferta básica (R$ 14)
├── PlanFull                → Oferta completa (R$ 17) — DESTAQUE
├── Results (Prova Social)  → Depoimentos reais + CTA
├── Faq                     → Objeções + CTA final
└── Footer                  → Copyright
```

---

## 3. Dados Centralizados (page.tsx)

### 3.1 Links de Pagamento

```typescript
// TODO: Substituir pelos links reais de pagamento
const PAYMENT_LINK_BASIC = 'https://seguro.profdidatica.com.br/r/XXXXXXXX';
const PAYMENT_LINK_FULL = 'https://seguro.profdidatica.com.br/r/YYYYYYYY';
```

### 3.2 Dados dos Planos

```typescript
const plansData: PlansDataType = {
  basic: {
    originalPrice: 19,
    promotionalPrice: 14,
    discount: '26% OFF',
    paymentLink: PAYMENT_LINK_BASIC,
  },
  full: {
    originalPrice: 69,
    promotionalPrice: 17,
    discount: '75% OFF',
    paymentLink: PAYMENT_LINK_FULL,
  },
};
```

> **Nota:** O preço original do completo (R$ 69) é a soma dos valores percebidos: R$ 14 (recurso) + R$ 18 (editável) + R$ 37 (fábrica). Isso reforça a percepção de desconto absurdo.

### 3.3 Dados dos Bônus (Plano Completo)

```typescript
const bonusData: Bonus[] = [
  {
    title: 'Versão Editável do Pixel Art',
    description:
      'Arquivo editável para você personalizar as continhas e ajustar o nível de dificuldade para cada turma ou aluno individualmente.',
    value: 18,
    imagePath: '/images/products/operacoes-matematicas/bonus/versao-editavel.webp',
    // TODO: Thiago vai enviar imagem/gif
  },
  {
    title: 'Acesso à Fábrica de Continhas',
    description:
      'Plataforma exclusiva que gera flashcards personalizados das 4 operações, por nível de dificuldade. Você escolhe, a plataforma gera, você imprime e aplica.',
    value: 37,
    imagePath: '/images/products/operacoes-matematicas/bonus/fabrica-continhas.webp',
    // TODO: Thiago vai enviar imagem/gif/vídeo
  },
];
```

---

## 4. Detalhamento por Seção

---

### 4.1 HERO

**Objetivo:** Captar atenção e entregar a promessa principal em menos de 3 segundos.

#### Copy

| Elemento | Texto |
|----------|-------|
| **Badge** | `Indicado para Fundamental I e II` |
| **Título (pt. 1)** | `Seus alunos vão` |
| **Título (pt. 2 — destaque cor)** | `pedir para resolver continhas` |
| **Subtítulo** | `18 atividades em Pixel Art com os personagens do Divertidamente II que escondem a matemática dentro de uma brincadeira.` **Pronto para imprimir e aplicar na próxima aula.** |

#### Elementos Visuais
- Imagem: mockup do produto (`/images/products/operacoes-matematicas/lp/hero_mockup.webp`)
- **Sem selo de preço no hero**
- **Sem CTA no hero** (foco na imagem + promessa)

#### Estrutura do Componente
```
<section>
  <badge> Indicado para Fundamental I e II
  <h1> Seus alunos vão <span destaque>pedir para resolver continhas</span>
  <p> Subtítulo
  <Image> mockup do produto
</section>
```

---

### 4.2 PROBLEM (Agitação da Dor)

**Objetivo:** Fazer a professora se reconhecer no problema. Criar empatia. Nomear o inimigo.

#### Copy

**Título:** `A verdade que toda professora de matemática já sabe`

**Parágrafo 1:**
> Não adianta. Você pode explicar de novo, dar mais exemplos, mudar o tom de voz. Na hora de resolver as continhas, a reação é sempre a mesma: **caras fechadas, suspiros profundos e cadernos em branco.**

**Parágrafo 2:**
> O problema não é a criança. E não é você. **O problema é o método.** Aquela folhinha com 30 continhas soltas, sem sentido, que transforma a matemática em castigo. A criança olha pra aquilo e já trava — antes mesmo de tentar resolver a primeira.

**Imagem:** Professora frustrada com turma desatenta  
`/images/products/operacoes-matematicas/lp/prof.webp`

**Parágrafo 3:**
> Estudos mostram que **30% das crianças** já sentem ansiedade só de ouvir a palavra "matemática". E essa ansiedade pode **reduzir o desempenho em até 40%**. Não é falta de capacidade — é um bloqueio emocional que a gente precisa derrubar de um jeito diferente.

**Parágrafo 4:**
> Por isso criamos um material que faz a criança resolver operações **sem perceber que está praticando matemática**. Ela só quer descobrir qual personagem vai aparecer.

#### Background
`bg-dl-bg-warm-cream`

---

### 4.3 WHATS INCLUDED (O que Você Recebe)

**Objetivo:** Tangibilizar a entrega do produto principal.

**Título:** `O QUE VOCÊ RECEBE NO PIXEL ART MATEMÁTICO`

#### Itens (com ícone ✓)

| Item | Descrição |
|------|-----------|
| **18 Folhinhas em Pixel Art** | Com os 9 personagens do Divertidamente II: Alegria, Tristeza, Medo, Raiva, Nojinho, Inveja, Ansiedade, Tédio e Vergonha |
| **4 Operações Contempladas** | Adição, subtração, multiplicação e divisão — tudo em um só material |
| **Níveis Progressivos** | Das operações mais simples até desafios com números na casa dos milhares |
| **Gabarito Completo** | Arquivo separado para conferência rápida — você não perde tempo corrigindo |

---

### 4.4 SOLUTION (Como Funciona — 3 Passos)

**Objetivo:** Mostrar que é ridiculamente fácil de usar.

**Título:** `Como funciona?`

| Passo | Ícone | Título | Descrição |
|-------|-------|--------|-----------|
| 1 | `Mail` | **Chega no seu E-mail** | O material é 100% digital. Logo após a compra, você recebe tudo no E-mail, pronto para baixar e imprimir. |
| 2 | `Printer` | **Você imprime** | Imprima quantas cópias quiser. Dá pra usar com a turma inteira e reutilizar o ano todo. |
| 3 | `Sparkles` | **A magia acontece** | A criança resolve a continha, descobre a cor, pinta o pixel. Cada operação correta revela um pedacinho do personagem. Ela nem percebe que está praticando matemática. |

---

### 4.5 DEMO (Carrossel de Amostra)

**Objetivo:** Prova visual — mostrar o material real.

**Título:** `Veja o material que você vai receber`

#### Itens do Carrossel
*(imagens em `/images/products/operacoes-matematicas/carrossel/`)*

| Slot | Imagem | Legenda | Descrição |
|------|--------|---------|-----------|
| 1 | `1.webp` | Atividade — Alegria | Exercício com operações de adição que revela a personagem Alegria |
| 2 | `2.webp` | Atividade — Tristeza | Exercício com operações de subtração |
| 3 | `3.webp` | Atividade — Raiva | Exercício com operações de multiplicação |
| 4 | `4.webp` | Atividade — Ansiedade | Exercício com operações de divisão |
| 5 | `5.webp` | Gabarito do Professor | Gabarito com as respostas e cores corretas |
| 6 | `6.webp` | Resultado Final | Personagem revelado após a criança colorir todos os pixels |

> **Nota:** Ajustar conforme imagens disponíveis.

---

### 4.6 BONUSES (Bônus Exclusivos)

**Objetivo:** Empilhar valor absurdo. A professora precisa pensar: "isso vale muito mais do que R$ 17".

**Título:** `Você ainda recebe 2 BÔNUS EXCLUSIVOS`

**Subtítulo:**
> Além das 18 folhinhas de Pixel Art, eu separei 2 presentes que vão resolver sua aula de matemática pelo **ano inteiro**.  
> Se fossem vendidos separadamente **custariam R$ 55,00**, mas **hoje saem de graça no plano completo**.

#### Bônus 1 — Versão Editável

| Campo | Conteúdo |
|-------|----------|
| **Tag** | `BÔNUS` |
| **Título** | Versão Editável do Pixel Art |
| **Descrição** | Com esse arquivo, você altera qualquer continha do material. Quer facilitar para sua turma do 2º ano? Troca os números. Precisa desafiar o 5º ano com milhares? Ajusta em segundos. Você no controle total da dificuldade. |
| **Valor riscado** | ~~R$ 18,00~~ **GRÁTIS** |
| **Imagem** | TODO: Thiago vai enviar (gif mostrando edição) |

#### Bônus 2 — Fábrica de Continhas

| Campo | Conteúdo |
|-------|----------|
| **Tag** | `BÔNUS` |
| **Título** | Acesso à Fábrica de Continhas |
| **Descrição** | Uma plataforma completa para gerar folhas de exercícios das 4 operações, separadas por nível de dificuldade. Escolha a operação, o nível, e a plataforma gera flashcards prontos para imprimir. Perfeita para reforço na aula e treino em casa. |
| **Valor riscado** | ~~R$ 37,00~~ **GRÁTIS** |
| **Imagem** | TODO: Thiago vai enviar (gif/vídeo da plataforma) |

---

### 4.7 PLAN BASIC (Plano Básico — R$ 14)

**Objetivo:** Existe para criar contraste e empurrar para o completo. A professora precisa pensar: "por R$ 3 a mais eu levo tudo?"

#### Copy da Seção

| Elemento | Conteúdo |
|----------|----------|
| **Título da seção** | `Escolha o Plano Ideal` |
| **Subtítulo** | `Comece com o básico ou aproveite a oferta completa.` |

#### Card do Plano Básico

| Elemento | Conteúdo |
|----------|----------|
| **Ícone** | `Zap` |
| **Nome** | `Plano Básico` |
| **Gradiente header** | `from-[#457B9D] to-[#1D3557]` |
| **Imagem** | mockup do produto (`hero_mockup.webp`) |

#### O que está incluído:

- ✓ **18 folhinhas em Pixel Art** com personagens do Divertidamente II
- ✓ **4 operações matemáticas** — adição, subtração, multiplicação e divisão
- ✓ **Gabarito completo** para correção rápida
- ✓ **Acesso Vitalício** ao material

#### Preço

| Elemento | Valor |
|----------|-------|
| Original (riscado) | ~~R$ 19~~ |
| Promocional | **R$ 14** |
| Badge | `26% OFF` |

#### CTA
- Texto: `QUERO APENAS O BÁSICO`
- Classe: `!bg-emerald-600 hover:!bg-emerald-700`

#### Direcionamento para Plano Completo (Âncora!)

| Elemento | Conteúdo |
|----------|----------|
| **Texto** | `Por apenas R$ 3 a mais...` |
| **Sub-texto** | `Você leva R$ 55 em bônus GRÁTIS. Veja abaixo a oferta completa!` |
| **Seta animada** | `ChevronDown` em vermelho com `animate-bounce` |

> **Nota de copy:** O texto "por apenas R$ 3 a mais" é a âncora mais poderosa da LP. É aqui que a maioria vai decidir pelo completo.

---

### 4.8 PLAN FULL (Plano Completo — R$ 17) ⭐

**Objetivo:** Converter. A professora precisa sentir que é BURRICE não pegar esse plano.

#### Card do Plano Completo

| Elemento | Conteúdo |
|----------|----------|
| **Badge** | `MAIS VENDIDO` (faixa amarela rotacionada) |
| **Ícone** | `Gem` (amarelo) |
| **Nome** | `Plano Completo` |
| **Subtítulo header** | `Tudo do básico + bônus que valem R$ 55` |
| **Gradiente header** | `from-emerald-700 to-emerald-900` |
| **Borda** | `border-2 border-emerald-600` |
| **Imagem** | mockup completo (`mockup_full.webp`) |

#### O que está incluído:

- ✓ **18 folhinhas em Pixel Art** com personagens do Divertidamente II
- ✓ **4 operações matemáticas** — adição, subtração, multiplicação e divisão
- ✓ **Gabarito completo** para correção rápida
- ✓ **Acesso Vitalício** e atualizações do material
- 💎 **Bônus Exclusivos:**
  - ✓ **Versão Editável do Pixel Art** — ~~R$ 18~~ Grátis
  - ✓ **Acesso à Fábrica de Continhas** — ~~R$ 37~~ Grátis

#### Preço

| Elemento | Valor |
|----------|-------|
| Original (riscado) | ~~De R$ 69~~ |
| Promocional | **R$ 17** |
| Badge | `75% OFF` |
| "Você economiza" | **R$ 52** |
| Texto adicional | `Acesso imediato no E-mail` |

#### CTA
- Texto: `QUERO O PLANO COMPLETO`
- Classe: `!bg-emerald-700 hover:!bg-emerald-800 !py-6`

#### Elementos de Urgência (Countdown)
- Timer de 10 minutos (decrescente)
- Barra de estoque (começa em 5, desce gradualmente até 2)
- Copy: "Últimas X unidades no valor promocional"
- Copy: "Oferta acaba em HH:MM:SS"

#### Trust Elements
- Imagem `compra-segura.png`
- Selo de garantia: "Garantia de 7 dias — Se você não ficar satisfeita com o material, devolvemos seu dinheiro sem burocracia."

---

### 4.9 RESULTS (Prova Social)

**Objetivo:** Validação social + CTA de fechamento.

**Título:** `Resultados Comprovados`  
**Subtítulo:** `💬 Veja o que estão dizendo:`

#### Depoimentos
- Exibir **4 depoimentos aleatórios** (de um pool de N screenshots)
- Imagens de prints reais de WhatsApp/Instagram
- Caminho: `/images/products/operacoes-matematicas/depoimentos/01.webp` até `NN.webp`

> **TODO:** Thiago precisa fornecer os prints de depoimentos.

#### CTA de Fechamento (dentro do Results)

| Elemento | Conteúdo |
|----------|----------|
| **Texto** | `Chegou a sua vez de ver seus alunos` **pedindo para resolver mais continhas.** |
| **Seta** | Animação bounce |
| **Botão** | `QUERO O PLANO COMPLETO` → `PAYMENT_LINK_FULL` |

---

### 4.10 FAQ

**Objetivo:** Quebrar objeções. Cada resposta reforça o valor do plano completo.

**Título:** `Perguntas Frequentes (FAQ)`

#### Perguntas e Respostas

| # | Pergunta | Resposta |
|---|----------|----------|
| 1 | **Para qual faixa etária esse material é indicado?** | O material foi pensado para alunos do Ensino Fundamental (1º ao 7º ano). As atividades possuem diferentes níveis de dificuldade — desde operações simples até cálculos com números na casa dos milhares. No plano completo, você ainda consegue editar as continhas para ajustar exatamente ao nível da sua turma. |
| 2 | **O material é digital ou físico?** | 100% digital. Assim que a compra é confirmada, você recebe no E-mail o material pronto para baixar e imprimir quantas vezes quiser, com quantas turmas quiser. |
| 3 | **Como funciona o Pixel Art Matemático?** | A criança resolve as operações e cada resultado indica uma cor. Ela pinta o pixel correspondente e, ao terminar, descobre um personagem do Divertidamente II. É como um jogo de descoberta — ela nem percebe que está praticando matemática. |
| 4 | **Qual a diferença do Plano Básico para o Completo?** | O Básico traz as 18 folhinhas prontas em PDF (não editável). O Completo traz tudo do básico + a versão editável do material (você altera as continhas e ajusta a dificuldade) + acesso à Fábrica de Continhas, uma plataforma que gera exercícios infinitos das 4 operações. Por R$ 3 a mais, você leva R$ 55 em bônus grátis. |
| 5 | **O que é a Fábrica de Continhas?** | É uma plataforma exclusiva onde você escolhe a operação (adição, subtração, multiplicação ou divisão), seleciona o nível de dificuldade, e gera folhas de flashcards prontas para imprimir. Perfeita para reforço semanal, treino em casa e avaliação contínua. Você nunca mais vai precisar criar exercício de matemática do zero. |
| 6 | **Posso usar com todas as minhas turmas?** | Sim! O material é seu para sempre. Imprima quantas cópias quiser, use com quantas turmas precisar. Sem limite nenhum. |
| 7 | **E se eu não gostar do material?** | Você tem 7 dias de garantia incondicional. Se não ficar satisfeita por qualquer motivo, devolvemos 100% do valor. Sem perguntas, sem burocracia. O risco é todo nosso. |

#### CTA pós-FAQ

| Elemento | Conteúdo |
|----------|----------|
| **Título** | `Pronta para ver seus alunos sorrindo na aula de matemática?` |
| **Texto** | `Por R$ 17, você leva o material completo + R$ 55 em bônus grátis. Garantia de 7 dias.` |
| **Botão** | `QUERO O PLANO COMPLETO` → `PAYMENT_LINK_FULL` |

---

### 4.11 FOOTER

Fundo: `bg-[#2c4f71]`

```
© 2025 Prof Didática - Todos os direitos reservados
```

---

## 5. Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `dl-primary-800` | `#1D3557` | Títulos, headings |
| `dl-primary-500` | `#457B9D` | Textos secundários, ícones |
| `dl-primary-100` | `#A8DADC` | Borders, backgrounds suaves |
| `dl-primary-50` | `#f1faee` | Background principal |
| `dl-accent` | `emerald-600` | CTAs, preços, destaques |
| `dl-warning` | `#E63946` | Destaques de urgência, preços riscados |
| `bg-warm-cream` | tom creme | Seção Problem |
| `bg-lavender` | tom lavanda | Seções Results, Solution |

---

## 6. Assets Necessários

### 6.1 Imagens a Criar/Obter

| Asset | Caminho | Status |
|-------|---------|--------|
| Mockup Hero | `/images/products/operacoes-matematicas/lp/hero_mockup.webp` | ⏳ A criar |
| Mockup Full | `/images/products/operacoes-matematicas/lp/mockup_full.webp` | ⏳ A criar |
| Imagem Problem | `/images/products/operacoes-matematicas/lp/prof.webp` | ⏳ A criar (ou reusar DL) |
| Imagens Carrossel (6) | `/images/products/operacoes-matematicas/carrossel/1-6.webp` | ⏳ A criar |
| Bonus: Versão Editável | `/images/products/operacoes-matematicas/bonus/versao-editavel.webp` | ⏳ Thiago vai enviar |
| Bonus: Fábrica Continhas | `/images/products/operacoes-matematicas/bonus/fabrica-continhas.webp` | ⏳ Thiago vai enviar |
| Depoimentos (N prints) | `/images/products/operacoes-matematicas/depoimentos/01-NN.webp` | ⏳ Thiago vai fornecer |
| Compra Segura (reusar) | `/images/system/compra-segura.png` | ✅ Já existe |

### 6.2 Links de Pagamento

| Plano | Link | Status |
|-------|------|--------|
| Básico (R$ 14) | `PAYMENT_LINK_BASIC` | ⏳ A definir |
| Completo (R$ 17) | `PAYMENT_LINK_FULL` | ⏳ A definir |

---

## 7. Componentes a Implementar

Mesma estrutura de componentes do Desafio Literário, adaptando copy e dados:

| Componente | Herda estrutura do DL | Alterações |
|------------|:---:|----------|
| `Hero.tsx` | ✅ | Copy, imagem, badge |
| `Problem.tsx` | ✅ | Copy 100% nova (dor da matemática) |
| `WhatsIncluded.tsx` | ✅ | Itens da lista |
| `Solution.tsx` | ✅ | Textos dos 3 passos, ícones |
| `Demo.tsx` | ✅ | Itens do carrossel, imagens, legendas |
| `Bonuses.tsx` | ✅ | 2 bônus (vs 4 do DL), dados atualizados |
| `PlanBasic.tsx` | ✅ | Preços, itens, âncora "R$ 3 a mais" |
| `PlanFull.tsx` | ✅ | Preços, stack de valor, "você economiza R$ 52" |
| `Results.tsx` | ✅ | Depoimentos, link CTA para completo |
| `Faq.tsx` | ✅ | Perguntas originais, respostas que vendem o completo |
| `Footer.tsx` | ✅ | Sem alterações |
| `Carrossel.tsx` | ✅ | Reusar componente |
| `page-wrapper.css` | ✅ | Trocar classe se necessário |
| `layout.tsx` | ✅ | Metadata (título, description) |

---

## 8. SEO / Metadata

```typescript
export const metadata: Metadata = {
  title: 'Operações Matemáticas em Pixel Art — Divertidamente II | Prof Didática',
  description:
    '18 atividades de Pixel Art com personagens do Divertidamente II. A criança resolve as continhas e descobre os personagens. Material pronto para imprimir.',
};
```

---

## 9. Checklist de Implementação

- [ ] Criar/coletar todas as imagens (seção 6.1)
- [ ] Definir links de pagamento (seção 6.2)
- [ ] Receber de Thiago: imagem/gif do Bônus "Versão Editável"
- [ ] Receber de Thiago: imagem/gif/vídeo do Bônus "Fábrica de Continhas"
- [ ] Receber de Thiago: prints de depoimentos
- [ ] Adaptar `page.tsx` com dados centralizados
- [ ] Implementar cada componente com a copy deste PRD
- [ ] Criar `layout.tsx` com metadata SEO
- [ ] Criar `page-wrapper.css`
- [ ] Testar responsividade (mobile-first)
- [ ] Testar links de pagamento
- [ ] Testar carrossel com imagens reais
- [ ] Deploy e validação

---

## 10. Resumo Comparativo: Planos

| Recurso | Básico (R$ 14) | Completo (R$ 17) |
|---------|:-:|:-:|
| 18 Folhinhas em Pixel Art (PDF) | ✅ | ✅ |
| 4 Operações Matemáticas | ✅ | ✅ |
| Gabarito Completo | ✅ | ✅ |
| Acesso Vitalício | ✅ | ✅ |
| **Versão Editável** (personalizar continhas e dificuldade) | ❌ | ✅ |
| **Fábrica de Continhas** (plataforma de flashcards infinitos) | ❌ | ✅ |
| | | **↑ R$ 55 em bônus por R$ 3 a mais** |

---

## 11. Notas sobre Copy & Persuasão

### Narrativa de Dor (original — NÃO copiada do DL):
1. **A matemática é naturalmente difícil de gostar** — não é culpa das telas
2. **O inimigo é o método tradicional** — a folhinha de 30 continhas sem sentido
3. **30% das crianças têm ansiedade matemática** — dado real da OCDE
4. **O erro é punido** — diferente de outras matérias, na matemática tem certo e errado
5. **A criança trava antes de tentar** — bloqueio emocional, não cognitivo

### Gatilhos de conversão focados no Plano Completo:
1. **Âncora de R$ 3** — "por R$ 3 a mais, você leva R$ 55 em bônus"
2. **Preço original R$ 69 → R$ 17** — 75% de desconto percebido
3. **"Você economiza R$ 52"** — reforço numérico da vantagem
4. **Subtítulo do completo** — "Tudo do básico + bônus que valem R$ 55"
5. **FAQ vende o completo** — respostas que mencionam os bônus naturalmente
6. **Todos os CTAs apontam para o completo** — Results, FAQ, etc.
7. **Plano básico existe para criar contraste** — não para vender
8. **"O risco é todo nosso"** — garantia de 7 dias reforça a ausência de risco

### Tom de voz:
- Empatia real: "não é culpa sua, não é culpa do aluno"
- Conexão emocional: "ela nem percebe que está praticando"
- Urgência natural: "aplique na próxima aula"
- Sem agressividade: acolhimento, não pressão
