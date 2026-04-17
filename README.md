# Bank

App desktop (Windows) que eu fiz pra controlar minha grana. 100% local — sem servidor, sem login, sem propaganda, sem telemetria. Os dados ficam no meu PC e pronto.

Fiz porque cansei de planilha e porque todo app financeiro decente hoje quer cobrar mensalidade, pedir meu CPF ou te jogar propaganda.

## O que tem

- Contas (corrente, poupança, dinheiro, investimento) e cartões de crédito com limite, fechamento e vencimento
- Receitas, despesas e transferências entre contas
- Categorias com ícone e cor — dá pra criar quantas quiser
- Orçamentos mensais que avisam quando estouram (80% warn, 100% alert)
- Metas de economia com prazo
- Transações recorrentes (salário, aluguel, assinatura) aplicadas sozinhas todo mês
- Parcelamento em 2–48x (gera todas as parcelas de uma vez)
- Duplicar transação com 1 clique
- Calculadora inline no campo valor — dá pra digitar `12,50 + 7,80`
- Auto-complete nas descrições (puxa do histórico)
- Transações agrupadas por data (Hoje, Ontem, 3 dias atrás...)
- Projeção de saldo pro fim do mês considerando recorrentes pendentes
- Comparativo vs. mês anterior nos cards de resumo
- Desfazer delete (toast com botão "Desfazer" por 8s)
- Gráficos: evolução de 6 meses, por categoria, top categorias, por conta

## Personalização

12 temas de cor (Graphite é o padrão: preto + cinza + branco), cor de destaque customizável, escala de fonte (90–125%), densidade dos cards, raio dos cantos, brilho ambiente. Perfil do usuário com nome, título e 40 avatares.

## Como usar

Se só quer usar: baixa o `Bank-Portable-1.0.0.exe` em [Releases](../../releases) ou pega em `dist/` depois de clonar + buildar. Clica duas vezes no .exe e pronto. Na primeira vez o Windows SmartScreen avisa (não é assinado) — "Mais informações" → "Executar assim mesmo".

Pra compartilhar com alguém, é só mandar o .exe por WhatsApp/Drive/pendrive. Cada pessoa tem seus próprios dados locais.

## Rodar do código

Precisa de Node.js 18+.

```
npm install
npm start          # dev (abre a janela)
npm run build      # gera dist/Bank-Portable-1.0.0.exe
```

## Onde ficam meus dados

Tudo em `%APPDATA%\Bank\` (`C:\Users\<voce>\AppData\Roaming\Bank\`):

- `bank-data.json` — espelho do estado atual
- `backups/backup-YYYY-MM-DD.json` — 14 dias de backups rotacionados
- `window-state.json` — posição da janela

Dá pra abrir essas pastas direto em Configurações → Backup & Dados. Se quiser proteger, BitLocker na pasta resolve.

## Atalhos

| tecla | ação |
|---|---|
| `N` | nova transação |
| `T` | alterna claro/escuro rápido |
| `?` | mostra os atalhos todos |
| `Esc` | fecha modal |
| `G` + `D/T/A/C/B/M/P/R/S` | navega entre as views |
| `Ctrl+Shift+I` | DevTools |
| `F5` | recarrega |
| `F11` | fullscreen |

## Por dentro

Electron + HTML/CSS/JS puro, sem framework. Chart.js pros gráficos, Lucide pros ícones (ambos embarcados — offline de verdade). Foi proposital: app leve, fácil de ler o código e que não quebra quando uma dependência muda em 2 anos.

```
main.js        processo principal electron (janela, tray, ipc)
preload.js     ponte contextbridge
index.html     shell
app.js         toda a lógica (~2.3k linhas, 1 arquivo mesmo)
styles.css     estilos + 12 temas
build-icon.js  gera build/icon.ico do svg
```

## Licença

MIT. Faz o que quiser, só não me responsabiliza se perder a grana.
