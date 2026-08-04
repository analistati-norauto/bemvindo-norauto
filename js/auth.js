document.addEventListener('DOMContentLoaded', () => {
    
    const formLogin = document.getElementById('form-login');
    const msgErro = document.getElementById('mensagem-erro');
    const btnEntrar = document.getElementById('btn-entrar');

    // Verifica se já está logado ao carregar a página inicial
    verificarSessaoAtiva();

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const senha = document.getElementById('senha').value;
            
            mostrarCarregando(true);
            
            try {
                // Autenticação no Supabase
                const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: senha,
                });

                if (authError) {
                    throw new Error('E-mail ou senha incorretos.');
                }

                // Busca as informações do usuário no banco (tabela usuarios)
                const userId = authData.user.id;
                const { data: userData, error: userError } = await supabase
                    .from('usuarios')
                    .select('tipo, ativo')
                    .eq('id', userId)
                    .single();

                if (userError || !userData) {
                    // Caso o login exista no Auth mas não na tabela de usuários
                    await supabase.auth.signOut();
                    throw new Error('Perfil de usuário não encontrado no sistema.');
                }

                if (userData.ativo === false) {
                    await supabase.auth.signOut();
                    throw new Error('Sua conta foi desativada. Contate a administração.');
                }

                // Redirecionamento com base no tipo de usuário
                if (userData.tipo === 'Administrador') {
                    window.location.href = 'admin.html';
                } else if (userData.tipo === 'Motorista') {
                    window.location.href = 'boas-vindas.html';
                } else {
                    throw new Error('Tipo de usuário inválido.');
                }

            } catch (error) {
                exibirErro(error.message);
                mostrarCarregando(false);
            }
        });
    }

    // Funções auxiliares
    function exibirErro(mensagem) {
        msgErro.textContent = mensagem;
        msgErro.classList.remove('hidden');
    }

    function mostrarCarregando(carregando) {
        if (carregando) {
            btnEntrar.textContent = 'Aguarde...';
            btnEntrar.disabled = true;
        } else {
            btnEntrar.textContent = 'Entrar';
            btnEntrar.disabled = false;
        }
    }

    async function verificarSessaoAtiva() {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && window.location.pathname.includes('index.html')) {
            // Se já tem sessão, verifica o tipo e redireciona (evita ter que logar de novo)
            const { data } = await supabase
                .from('usuarios')
                .select('tipo')
                .eq('id', session.user.id)
                .single();
                
            if (data && data.tipo === 'Administrador') {
                window.location.href = 'admin.html';
            } else if (data && data.tipo === 'Motorista') {
                window.location.href = 'boas-vindas.html';
            }
        }
    }
});

// Função global para fazer logout (usada em outras telas)
async function fazerLogout() {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}