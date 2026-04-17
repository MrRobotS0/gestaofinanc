# Bank — Gestão Financeira Pessoal

Aplicativo **desktop** (Windows) para controle financeiro pessoal, **100% local** e **offline**. Sem servidor, sem nuvem, sem cadastro — seus dados ficam no seu PC.

![platform](https://img.shields.io/badge/platform-Windows-blue) ![offline](https://img.shields.io/badge/offline-100%25-green) ![stack](https://img.shields.io/badge/stack-Electron%20%2B%20Vanilla%20JS-purple) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Principais recursos

### Gestão financeira
- **Contas** (corrente, poupança, dinheiro, investimento) com saldo calculado
- **Cartões de crédito** com limite, fatura do mês, dia de fechamento e vencimento
- **Transações**: receitas, despesas e transferências entre contas
- **Categorias** customizáveis com ícone e cor (receita/despesa)
- **Orçamentos mensais** por categoria com progresso e alerta quando estoura
- **Metas de economia** com valor alvo, prazo e botão para adicionar valor rápido
- **Transações recorrentes** (salário, aluguel, assinaturas) aplicadas automaticamente todo mês
- **Parcelamento** de despesas em 2–48 vezes (cria todas as parcelas de uma vez)
- **Duplicar transação** com um clique
- **Calculadora inline** no campo valor — digite `12,50 + 7,80` e o app calcula

### Visualização
- **Dashboard** com saldo total, receitas/despesas/resultado do mês
- **Comparativo vs mês anterior** (% de variação)
- **Projeção de saldo** considerando recorrentes pendentes
- **Gráficos** (Chart.js): evolução de 6 meses, distribuição por categoria, top categorias, distribuição por conta
- **Transações agrupadas por data** (Hoje / Ontem / Esta semana / meses anteriores)
- **Auto-complete** de descrições baseado no histórico
- **Busca e filtros** por descrição, tipo, categoria, conta e intervalo de datas

### Personalização
- **12 temas de cores**: Midnight, Daylight, Ocean, Sunset, Forest, Candy, Cyberpunk, Royal, Dusk, Rose, Nord, Graphite
- **Cor de destaque customizável** (18 sugeridas + color picker)
- **Escala de fonte** (90% / 100% / 110% / 125%)
- **Densidade** (compacto / normal / confortável)
- **Arredondamento dos cantos** (reto / arredondado / pílula)
- **Brilho ambiente** (gradientes coloridos ao fundo) liga/desliga
- **Perfil do usuário** (nome, título, 40 avatares)

### Dados e backup
- **Persistência local** (arquivo JSON em `%APPDATA%\Bank\`)
- **Backup automático diário** rotacionado (últimos 14 dias)
- **Export JSON** (backup completo) e **CSV** (transações para Excel)
- **Import JSON** com validação de schema
- **Espelho em arquivo** para recuperação se o cache do navegador embutido for limpo

### Experiência desktop
- **Ícone customizado** na barra de tarefas e bandeja
- **Janela lembra tamanho e posição** entre aberturas
- **Minimiza para a bandeja** ao fechar (mantém rodando em segundo plano)
- **Ícone na tray** com menu rápido (Abrir, Pasta de dados, Sair)
- **Single-instance**: abrir o .exe de novo foca a janela existente
- **Atalhos de teclado** (pressione `?` para ver todos)
- **Undo** após excluir transação (toast "Desfazer" por 8 segundos)

---

## 📸 Screenshots

> (Adicionar screenshots aqui — capture `Bank-Portable-1.0.0.exe` em uso)

---

## 🚀 Como usar

### Opção 1: Baixar o `.exe` pronto
1. Baixe `Bank-Portable-1.0.0.exe` da seção de [Releases](../../releases) (ou da pasta `dist/` do projeto)
2. Duplo clique — o app abre
3. Seus dados são salvos localmente. Na próxima vez que abrir, tudo estará lá.

**Compartilhando com outra pessoa:** mande o `.exe` por WhatsApp/e-mail. Cada pessoa tem seus próprios dados locais, independentes.

### Opção 2: Rodar a partir do código

```bash
# 1. Clonar
git clone https://github.com/MrRobotS0/gestaofinanc.git
cd gestaofinanc

# 2. Instalar dependências
npm install

# 3. Rodar em dev
npm start

# 4. Gerar .exe portátil
npm run build
# → dist/Bank-Portable-1.0.0.exe

# (opcional) Gerar instalador .exe com atalho
npm run build:installer
```

---

## 📂 Onde os dados são salvos

| Item | Localização |
|------|-------------|
| Dados principais | `%APPDATA%\Bank\bank-data.json` (espelho) + localStorage embutido |
| Backups diários | `%APPDATA%\Bank\backups\backup-YYYY-MM-DD.json` |
| Estado da janela | `%APPDATA%\Bank\window-state.json` |

Você pode abrir qualquer uma dessas pastas direto pelo app em **Configurações → Backup & Dados**.

---

## ⌨️ Atalhos de teclado

| Tecla | Ação |
|-------|------|
| `N` | Nova transação |
| `T` | Alternar tema claro/escuro rápido |
| `?` | Mostrar todos os atalhos |
| `Esc` | Fechar modal/diálogo |
| `F5` | Recarregar |
| `F11` | Tela cheia |
| `Ctrl+Shift+I` | DevTools (debug) |
| `G` + `D` | Ir para Painel |
| `G` + `T` | Ir para Transações |
| `G` + `A` | Ir para Contas |
| `G` + `C` | Ir para Cartões |
| `G` + `B` | Ir para Orçamentos |
| `G` + `M` | Ir para Metas |
| `G` + `P` | Ir para Recorrentes |
| `G` + `R` | Ir para Relatórios |
| `G` + `S` | Ir para Configurações |

---

## 🛠 Stack técnica

- **Electron 31** — desktop wrapper para Windows
- **Vanilla JavaScript** — sem frameworks (leve e rápido)
- **Chart.js 4** — gráficos (empacotado localmente, funciona offline)
- **Lucide Icons** — 500+ ícones SVG (empacotado localmente)
- **electron-builder** — empacotamento do `.exe` portátil
- **sharp + png-to-ico** — geração do ícone do app
- **localStorage** (persistência imediata) + **arquivo JSON** (espelho + backup)

### Estrutura do projeto

```
gestaofinanc/
├── main.js              # Processo principal do Electron (janela, tray, IPC)
├── preload.js           # Ponte segura contextBridge
├── index.html           # Shell HTML (sidebar, topbar, área de views)
├── app.js               # Toda a lógica do app (~2200 linhas)
├── styles.css           # Estilos + 12 temas + componentes
├── build-icon.js        # Gera build/icon.ico, icon.png, tray.png
├── package.json         # Config Electron + electron-builder
├── build/               # Ícones gerados
├── assets/vendor/       # Chart.js e Lucide locais (offline)
└── dist/                # Saída do build (.exe)
```

---

## 🔒 Privacidade e segurança

- **100% local** — nenhum dado sai do seu PC
- **Sem telemetria, sem analytics, sem login**
- **Sem rede** — o app não faz nenhuma requisição HTTP depois de instalado
- **Código-fonte aberto** — você pode auditar tudo
- Dados em JSON legível (não criptografado) — se você quer criptografia, use o BitLocker/EFS do Windows na pasta `%APPDATA%\Bank\`

---

## 🗺 Roadmap / ideias futuras

- [ ] Ícone de bandeja com saldo visível ao passar o mouse
- [ ] Suporte a múltiplas moedas
- [ ] Relatório mensal exportado em PDF
- [ ] Tags livres nas transações (além de categoria)
- [ ] Reconciliação de transações (marcar como "conferidas")
- [ ] Notificações de vencimento de fatura/cartão
- [ ] Filtros salvos
- [ ] Build para macOS e Linux
- [ ] Modo "casal" com compartilhamento via arquivo sincronizado (OneDrive/Drive local)

---

## 📄 Licença

MIT — faça o que quiser com este código. Se melhorar, considere mandar um PR 💛

---

## 🤝 Contribuindo

Issues e pull requests são bem-vindos. Antes de abrir PR:
1. Rode `npm run build` e confirme que o `.exe` sobe sem erros
2. Teste o fluxo principal (criar conta, transação, orçamento, meta)
3. Verifique no mínimo os temas `midnight` e `daylight`

---

Feito com ☕ e muito CSS por **Guilherme** · [@MrRobotS0](https://github.com/MrRobotS0)
