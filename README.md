# bemvindo-norauto

# 🚗 Plataforma de Integração de Motoristas - NORAUTO RENT A CAR

Bem-vindo ao repositório da Plataforma de Integração de Motoristas da **NORAUTO RENT A CAR**. 
Este sistema foi desenvolvido para modernizar e digitalizar o processo de *onboarding* (integração) de novos motoristas, garantindo que eles compreendam os valores, as regras de segurança e o padrão de atendimento da empresa antes de iniciarem suas jornadas.

---

## 🎯 Objetivo do Projeto
Fornecer uma aplicação web rápida, responsiva e segura, onde os administradores possam gerenciar os acessos dos motoristas, e os motoristas possam assistir ao conteúdo institucional e responder a um questionário de avaliação de forma intuitiva.

---

## ✨ Funcionalidades

### 🔐 Para Administradores
* **Gestão Centralizada:** Acesso exclusivo via login administrativo.
* **Controle de Usuários:** Cadastro de novos motoristas (sem necessidade de e-mail de confirmação).
* **Acompanhamento em Tempo Real:** Visualização do status de integração de cada motorista (Não iniciado, Em andamento, Concluído).
* **Desempenho:** Registro automático da nota (porcentagem de acertos no quiz) e data/hora de conclusão.
* **Segurança:** Opção para ativar ou desativar temporariamente o acesso de um motorista.

### 🚙 Para Motoristas
* **Acesso Simplificado:** Login direto com credenciais fornecidas pela empresa.
* **Boas-vindas:** Interface limpa com reprodução de vídeo institucional via YouTube.
* **Quiz Dinâmico:** Questionário de 5 perguntas com paginação, focado em segurança, atendimento e responsabilidade.
* **Feedback Imediato:** Tela de resultado exibindo a pontuação final de aprovação.

---

## 🛠️ Tecnologias Utilizadas
O projeto foi construído priorizando a leveza, compatibilidade e facilidade de hospedagem, sem uso de dependências complexas no lado do cliente.

* **HTML5:** Estruturação semântica.
* **CSS3:** Estilização própria baseada nas cores da marca (Azul-escuro e Amarelo), totalmente responsivo (Mobile-First).
* **JavaScript (Vanilla):** Lógica de negócios, manipulação do DOM e comunicação com a API.
* **Supabase:** Plataforma Backend-as-a-Service (BaaS) utilizada para:
  * Autenticação de usuários (Auth).
  * Banco de Dados relacional (PostgreSQL).
  * Segurança em Nível de Linha (Row Level Security - RLS).

---

## 📂 Estrutura de Arquivos

\`\`\`text
integracao-motoristas/
│
├── index.html           # Tela de Login
├── admin.html           # Painel Administrativo
├── boas-vindas.html     # Tela inicial do motorista (Vídeo)
├── quiz.html            # Questionário de integração
├── resultado.html       # Tela de nota e conclusão
│
├── css/
│   └── style.css        # Estilos globais e variáveis de cores
│
├── js/
│   ├── config.js        # Configurações do Supabase e URL do Vídeo
│   ├── auth.js          # Lógica de login, logout e roteamento
│   ├── admin.js         # Lógica do painel de administração
│   ├── integracao.js    # Lógica da tela de boas-vindas e vídeo
│   ├── perguntas.js     # Arquivo editável com as perguntas do quiz
│   └── quiz.js          # Controle de paginação e cálculo de nota
│
├── assets/
│   └── logo/
│       └── PNG Logo Norauto.png # Identidade visual da marca
│
└── README.md            # Documentação do projeto
\`\`\`

---

## 🔒 Licença e Direitos Autorais

**© 2024-2026 NORAUTO RENT A CAR. Todos os direitos reservados.**

Este é um software proprietário desenvolvido exclusivamente para uso interno da **NORAUTO RENT A CAR**. Não é permitida a cópia, reprodução, distribuição, publicação, modificação ou uso comercial/não-comercial deste código-fonte por terceiros sem autorização prévia e expressa.
