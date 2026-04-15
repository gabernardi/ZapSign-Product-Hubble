# Design System — ZapSign Product Guidelines

> **Este documento é a referência obrigatória para qualquer prompt de desenvolvimento nesta plataforma.**
> Antes de gerar código, leia e siga estas diretrizes.

---

## Princípios de Design

1. **Clean acima de tudo.** Cada elemento na tela deve ter uma razão para existir. Se remover algo não prejudica a compreensão, remova.
2. **White-space é um componente.** Espaçamento generoso entre seções, dentro de cards, ao redor de textos. Nunca comprima o layout.
3. **Hierarquia clara.** O olho do usuário deve percorrer a página sem esforço: título > descrição > conteúdo > ação.
4. **Google-style.** Estética inspirada nos produtos Google: fundo claro, cards com bordas leves, tipografia limpa, cores funcionais (não decorativas).
5. **Premium sem peso.** Refinamento vem de detalhes sutis — sombras delicadas, transições suaves, espaçamento preciso — não de ornamentos.
6. **Acessível.** Todo texto deve atender WCAG AA de contraste. Elementos interativos devem ter estados visíveis de hover e focus.

---

## Paleta de Cores

### Neutros (uso primário)
| Token           | Hex       | Uso                                  |
|-----------------|-----------|--------------------------------------|
| `--white`       | `#FFFFFF` | Superfícies, cards                   |
| `--bg`          | `#F8F9FA` | Fundo principal                      |
| `--bg-2`        | `#F1F3F4` | Fundo secundário, chips              |
| `--bg-3`        | `#E8EAED` | Fundo terciário                      |
| `--ink`         | `#1A1A1A` | Texto primário, títulos              |
| `--ink-2`       | `#3C3C3C` | Texto secundário forte               |
| `--ink-3`       | `#5F6368` | Texto secundário (corpo, descrições) |
| `--ink-4`       | `#9AA0A6` | Texto terciário (labels, captions)   |
| `--border`      | `#DADCE0` | Bordas visíveis                      |
| `--border-lt`   | `#E8EAED` | Bordas sutis                         |

### Cores Semânticas
| Grupo   | Principal   | Light       | Mid         | Uso                          |
|---------|-------------|-------------|-------------|------------------------------|
| Blue    | `#1A73E8`   | `#E8F0FE`   | `#AECBFA`   | Ações, links, seleção ativa  |
| Green   | `#137333`   | `#E6F4EA`   | `#A8DAB5`   | Sucesso, outputs, validação  |
| Amber   | `#B06000`   | `#FEF7E0`   | `#FDD663`   | Alerta, atenção, iteração    |
| Purple  | `#6B3FA0`   | `#F3E8FD`   | `#D4C2ED`   | Categorias, obrigações       |
| Teal    | `#0D7A6A`   | `#E4F7F4`   | `#A1DED2`   | Oportunidades, alternativas  |
| Red     | `#C5221F`   | `#FCE8E6`   | `#F5C8C6`   | Erro, remoção, perigo        |

### Regras de Uso
- **Fundo de card**: sempre `--white` sobre `--bg`.
- **Texto em card**: `--ink` para títulos, `--ink-3` para corpo.
- **Chips/Pills**: fundo `-lt` com texto da cor principal (ex: `--blue-lt` + `--blue`).
- **Bordas**: usar `--border-lt` por padrão, `--border` para separações mais visíveis.
- **Nunca usar cor como único indicador.** Sempre acompanhar com ícone ou texto.

---

## Tipografia

### Fontes
- **Display** (títulos, números de passo): `'Google Sans', sans-serif` — weight 700
- **Body** (texto, labels): `'Google Sans Text', 'Google Sans', sans-serif` — weight 400, 500

### Escala
| Nível         | Tamanho          | Weight | Line-height | Letter-spacing | Uso                        |
|---------------|------------------|--------|-------------|----------------|----------------------------|
| Display XL    | `clamp(26-38px)` | 700    | 1.1         | -0.025em       | Títulos de guia            |
| Display L     | `22-24px`        | 700    | 1.2         | -0.02em        | Títulos de fase/seção      |
| Display M     | `18px`           | 700    | 1.25        | -0.015em       | Títulos de step card       |
| Body L        | `15px`           | 400    | 1.7         | 0              | Texto principal            |
| Body M        | `14-14.5px`      | 400    | 1.6-1.7     | 0              | Descrições                 |
| Body S        | `13-13.5px`      | 400-600| 1.5-1.55    | 0              | Texto em cards, listas     |
| Caption       | `11-12px`        | 600-700| 1.3-1.5     | 0.04-0.1em     | Labels, tags, chips        |

### Regras
- **Nunca usar mais de 3 tamanhos de fonte na mesma seção.**
- **Labels e tags são sempre uppercase, letter-spacing 0.06em+, weight 600-700.**
- **Títulos de display usam `font-family: var(--font-display)`.** Corpo usa `var(--font-body)`.

---

## Espaçamento

Sistema baseado em grid de 4px. Usar exclusivamente os tokens CSS:

| Token      | Valor | Uso típico                         |
|------------|-------|------------------------------------|
| `--sp-1`   | 4px   | Micro ajustes                      |
| `--sp-2`   | 8px   | Gap entre elementos inline         |
| `--sp-3`   | 12px  | Gap entre itens de lista           |
| `--sp-4`   | 16px  | Padding interno de cards pequenos  |
| `--sp-5`   | 20px  | Padding interno de cards médios    |
| `--sp-6`   | 24px  | Padding interno de cards grandes   |
| `--sp-8`   | 32px  | Separação entre blocos             |
| `--sp-10`  | 40px  | Margem entre seções                |
| `--sp-12`  | 48px  | Margem entre fases                 |
| `--sp-16`  | 64px  | Margem entre áreas principais      |

### Regras
- **Nunca usar valores fora da escala.** Se 12px é pouco e 16px é muito, use 12px.
- **Padding interno de cards segue a fórmula**: 16-28px dependendo do tamanho.
- **Margem entre seções de guia**: mínimo 48px (var(--sp-12)).

---

## Border Radius

| Token      | Valor | Uso                                |
|------------|-------|------------------------------------|
| `--r-sm`   | 8px   | Inputs, badges pequenos            |
| `--r-md`   | 12px  | Cards internos, template boxes     |
| `--r-lg`   | 16px  | Cards de princípio, starting point |
| `--r-xl`   | 20px  | Step cards, containers principais  |
| `--r-2xl`  | 28px  | Cards hero, deliverables           |
| `--r-full` | 9999px| Pills, chips, avatares             |

---

## Sombras

| Token         | Uso                                          |
|---------------|----------------------------------------------|
| `--shadow-xs` | Estado padrão de cards de conteúdo           |
| `--shadow-sm` | Hover em cards, step cards padrão            |
| `--shadow-md` | Hover em step cards, elementos em destaque   |
| `--shadow-lg` | Dropdowns, modais, menus                     |
| `--shadow-xl` | Deliverables (bloco escuro), hero elements   |

### Regra
- **Cards começam com `--shadow-xs` e sobem para `--shadow-sm` ou `--shadow-md` no hover.**
- **Nunca usar `--shadow-lg` ou `--shadow-xl` em elementos inline.**

---

## Animações e Transições

### Micro-interações (hover, focus)
- **Duração**: `120ms` (var(--duration-fast))
- **Easing**: `var(--ease-out)` — cubic-bezier(0, 0, 0.2, 1)
- **Propriedades**: `box-shadow`, `border-color`, `background`, `color`, `transform`

### Animações de entrada
- **Duração**: `300ms` (var(--duration-slow))
- **Easing**: `var(--ease-out)`
- **Pattern**: fade-up (opacity 0→1, translateY 12px→0)
- **Stagger**: incrementos de 60ms entre elementos consecutivos

### Regras
- **Máximo 200ms para micro-interações.** O usuário não deve perceber espera.
- **Animações de entrada só na primeira renderização.** Nunca em navegação interna.
- **Transform no hover: translateY(-1px) no máximo.** Sutil, não chamativo.
- **Nunca animar cor de texto diretamente.** Animar `color` via transition em links/botões é ok.

---

## Componentes — Referência

### Card (base)
```
background: var(--white)
border: 1px solid var(--border-lt)
border-radius: var(--r-lg) ou var(--r-xl)
box-shadow: var(--shadow-xs)
padding: 18-28px
hover: box-shadow var(--shadow-sm), translateY(-1px)
```

### Chip/Pill
```
background: var(--[color]-lt)
color: var(--[color])
font-size: 10.5-11px
font-weight: 600-700
letter-spacing: 0.04-0.08em
padding: 3-4px 10-12px
border-radius: var(--r-full)
```

### Section Label
```
font-size: 11px
font-weight: 700
color: var(--ink-4)
letter-spacing: 0.1em
text-transform: uppercase
+ linha horizontal (::after, 1px, var(--border-lt))
```

### Step Number (timeline)
```
width: 34px, height: 34px
border-radius: 50%
border: 1.5px solid var(--border)
font-size: 13px, weight 700
color: var(--ink-3)
hover: border-color var(--blue), color var(--blue), box-shadow 0 0 0 3px var(--blue-lt)
```

### Note/Callout
```
background: var(--blue-lt)
border: 1px solid var(--blue-mid)
border-radius: var(--r-md)
padding: 14px 16px
font-size: 13.5px
color: #174EA6
```

---

## Layout

### Estrutura Principal
- **Sidebar**: 260px fixo à esquerda, fundo branco, borda direita `--border-lt`
- **Header**: 64px de altura, sticky top, fundo `--bg`
- **Conteúdo**: max-width 880px, padding horizontal 48px (32px mobile)

### Responsividade
- **768px**: sidebar esconde, layout full-width
- **640px**: padding reduz para 20px, grids colapsam para 2 colunas
- **480px**: grids colapsam para 1 coluna

---

## Heurísticas de Revisão

Antes de finalizar qualquer tela ou componente, verificar:

1. [ ] Todo texto secundário tem contraste mínimo de 4.5:1?
2. [ ] Há pelo menos 24px de espaço entre blocos distintos?
3. [ ] Cards têm hover state com transição?
4. [ ] Nenhum elemento puramente decorativo (sem ícone sem função, cor sem significado)?
5. [ ] A hierarquia visual guia o olho do usuário do topo ao fundo?
6. [ ] Em mobile, o conteúdo ainda é legível e navegável?
7. [ ] Animações são sutis (max 300ms) e não bloqueiam interação?
8. [ ] Labels/chips seguem o padrão uppercase + letter-spacing?
9. [ ] As cores usadas pertencem à paleta definida neste documento?
10. [ ] O componente funciona isolado e composto com outros?
