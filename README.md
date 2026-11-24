# SafeCash - sistema simples de tesouraria

Projeto original de exemplo para controlar entradas e saídas financeiras. A API usa Node.js, Express e Prisma. A tela usa React. O banco SQLite é criado localmente.

## Sobre a referência

O repositório indicado serviu como referência para entender o cenário e as necessidades do exercício. Esta solução foi escrita separadamente, com outra identidade visual, organização e escopo didático. Ela não copia o código do repositório. Para facilitar o aprendizado, mantém o foco no fluxo básico de lançamentos, saldo, validação e exclusão lógica.

## O que o sistema faz

- Cadastra receitas e despesas com descrição e valor positivo.
- Lista e edita lançamentos.
- Exclui de forma lógica: o lançamento fica marcado como excluído e continua salvo.
- Calcula o saldo somando receitas e subtraindo despesas ativas.
- Registra quem criou/alterou o lançamento e as datas dessas ações.

## Como iniciar

Requisitos: Node.js 22.18 ou mais novo e npm.

1. Abra um terminal na pasta `server` e execute:

   ```bash
   npm install
   npx prisma migrate dev --name inicio
   npm run dev
   ```

2. Em outro terminal, abra a pasta `client` e execute:

   ```bash
   npm install
   npm run dev
   ```

3. Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`. A tela se chama SafeCash.

A API fica em `http://localhost:3000`. Para este exemplo, o responsável padrão pelos lançamentos é `aluno`. Em um sistema real, esse valor viria do login.

## Rotas da API

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/api/transacoes` | Lista lançamentos ativos |
| GET | `/api/transacoes/saldo` | Retorna saldo e totais de receitas/despesas |
| POST | `/api/transacoes` | Cria lançamento |
| PUT | `/api/transacoes/:id` | Edita lançamento |
| DELETE | `/api/transacoes/:id` | Marca como excluído, sem apagar do banco |

Exemplo de corpo para criar ou editar:

```json
{
  "descricao": "Pagamento de aluguel",
  "valor": 2000,
  "tipo": "DESPESA"
}
```

Tipos aceitos: `RECEITA` e `DESPESA`. O valor deve ser maior que zero. A API rejeita dados inválidos.

## Como o Prisma ajuda

O arquivo `server/prisma/schema.prisma` descreve a tabela de transações. O valor fica guardado em centavos inteiros para evitar erros comuns de arredondamento. O Prisma transforma essa descrição em código JavaScript para ler e gravar os dados no SQLite. Assim, não precisamos escrever comandos SQL para cada operação.

O campo `excluidoEm` guarda a data da exclusão. Quando ele tem uma data, a transação não aparece nas consultas normais nem no cálculo do saldo, mas permanece no banco para auditoria. Os campos `criadoPor`, `atualizadoPor`, `criadoEm` e `atualizadoEm` ajudam a saber quem fez cada alteração e quando.

## Justificativa simples da tecnologia

JavaScript pode ser usado tanto no servidor quanto na interface, o que facilita o aprendizado e a integração. Node.js recebe as requisições; React mostra os dados e atualiza a tela; Prisma organiza o acesso ao banco relacional SQLite. SQLite é prático para aprender e executar localmente. Para uso real com vários clientes e usuários, seria indicado um banco servidor, autenticação, controle de acesso e auditoria mais completa.

## Sugestão de sprints

1. **Planejamento e dados:** definir regras, criar repositório e modelo Prisma.
2. **API:** implementar cadastro, listagem, edição, exclusão lógica e validações.
3. **Interface:** montar formulário, lista e painel de saldo.
4. **Revisão e apresentação:** verificar os fluxos, documentar e preparar demonstração.

## Limites deste exemplo

É uma base didática, sem login, permissões, testes automatizados ou integração com serviços bancários. A auditoria identifica um usuário de demonstração fixo. Não deve ser usada para movimentar dinheiro real.

## Publicação no Netlify

O Netlify publica a interface React da pasta `client`. Sem `VITE_API_URL`, o site usa um modo de demonstração que guarda os lançamentos no armazenamento local do navegador; cada navegador mantém seus próprios dados. Para apontar a interface a uma API hospedada, defina `VITE_API_URL` com a URL base dessa API no Netlify.
