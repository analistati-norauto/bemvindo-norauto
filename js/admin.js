let listaUsuarios = [];

document.addEventListener('DOMContentLoaded', async () => {
    await verificarAcessoAdmin();
    await carregarUsuarios();

    // Evento de pesquisa
    document.getElementById('input-pesquisa').addEventListener('input', (e) => {
        renderizarTabela(e.target.value);
    });

    // Evento de cadastro
    document.getElementById('form-cadastro').addEventListener('submit', cadastrarUsuario);
});

async function verificarAcessoAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('nome, tipo')
        .eq('id', session.user.id)
        .single();

    if (error || !data || data.tipo !== 'Administrador') {
        alert('Acesso negado. Apenas administradores podem acessar esta página.');
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    } else {
        document.getElementById('nome-admin').textContent = `Olá, ${data.nome}`;
    }
}

async function carregarUsuarios() {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
    }

    listaUsuarios = data;
    renderizarTabela();
}

function renderizarTabela(filtro = '') {
    const tbody = document.getElementById('tabela-usuarios');
    tbody.innerHTML = '';

    const usuariosFiltrados = listaUsuarios.filter(user => 
        user.nome.toLowerCase().includes(filtro.toLowerCase()) || 
        user.email.toLowerCase().includes(filtro.toLowerCase())
    );

    if (usuariosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum usuário encontrado.</td></tr>';
        return;
    }

    usuariosFiltrados.forEach(user => {
        let classeStatus = '';
        if (user.status_integracao === 'Não iniciado') classeStatus = 'status-nao-iniciado';
        if (user.status_integracao === 'Em andamento') classeStatus = 'status-em-andamento';
        if (user.status_integracao === 'Concluído') classeStatus = 'status-concluido';

        const dataFormatada = user.data_conclusao 
            ? new Date(user.data_conclusao).toLocaleDateString('pt-BR') + ' ' + new Date(user.data_conclusao).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
            : '-';

        const pontuacao = user.status_integracao === 'Concluído' ? `${user.pontuacao_quiz}%` : '-';

        const tr = document.createElement('tr');
        tr.style.opacity = user.ativo ? '1' : '0.5';

        tr.innerHTML = `
            <td>${user.nome}</td>
            <td>${user.email}</td>
            <td>${user.tipo}</td>
            <td><span class="status-badge ${classeStatus}">${user.status_integracao}</span></td>
            <td>${pontuacao}</td>
            <td>${dataFormatada}</td>
            <td>
                <button class="btn-small ${user.ativo ? 'btn-desativar' : 'btn-ativar'}" 
                        onclick="alternarStatusUsuario('${user.id}', ${user.ativo})">
                    ${user.ativo ? 'Desativar' : 'Ativar'}
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funções do Modal
function abrirModal() {
    document.getElementById('modal-cadastro').classList.remove('hidden');
    document.getElementById('form-cadastro').reset();
    ocultarMensagemModal();
}

function fecharModal() {
    document.getElementById('modal-cadastro').classList.add('hidden');
}

function mostrarMensagemModal(mensagem, isErro = true) {
    const msgDiv = document.getElementById('msg-modal');
    msgDiv.textContent = mensagem;
    msgDiv.classList.remove('hidden', 'alert-error', 'alert-success');
    
    if (isErro) {
        msgDiv.style.backgroundColor = '#FDEDED';
        msgDiv.style.color = 'var(--erro)';
        msgDiv.style.border = '1px solid #F3C3C3';
    } else {
        msgDiv.style.backgroundColor = '#E8F5E9';
        msgDiv.style.color = 'var(--sucesso)';
        msgDiv.style.border = '1px solid #C8E6C9';
    }
    msgDiv.style.display = 'block';
}

function ocultarMensagemModal() {
    document.getElementById('msg-modal').style.display = 'none';
}

// Cadastro do Usuário usando um cliente secundário para não deslogar o admin
async function cadastrarUsuario(e) {
    e.preventDefault();
    
    const btnSalvar = document.getElementById('btn-salvar-usuario');
    btnSalvar.disabled = true;
    btnSalvar.textContent = 'Salvando...';
    
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const senha = document.getElementById('cad-senha').value;
    const tipo = document.getElementById('cad-tipo').value;

    try {
        // Truque: Criar um client secundário para cadastrar sem alterar a sessão atual do admin
        const adminSupabase = window.SupabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: false }
        });

        // 1. Cria usuário no Auth
        const { data: authData, error: authError } = await adminSupabase.auth.signUp({
            email: email,
            password: senha
        });

        if (authError) throw new Error(authError.message);

        // 2. Insere dados na tabela pública
        const userId = authData.user.id;
        const { error: dbError } = await supabase
            .from('usuarios')
            .insert([
                { id: userId, nome: nome, email: email, tipo: tipo }
            ]);

        if (dbError) throw new Error('Erro ao salvar no banco de dados. Contate o suporte.');

        mostrarMensagemModal('Usuário cadastrado com sucesso!', false);
        
        setTimeout(() => {
            fecharModal();
            carregarUsuarios(); // Atualiza a tabela
        }, 1500);

    } catch (error) {
        mostrarMensagemModal('Erro: ' + error.message);
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = 'Cadastrar';
    }
}

async function alternarStatusUsuario(id, statusAtual) {
    const confirmacao = confirm(`Deseja realmente ${statusAtual ? 'desativar' : 'ativar'} este usuário?`);
    if (!confirmacao) return;

    const { error } = await supabase
        .from('usuarios')
        .update({ ativo: !statusAtual })
        .eq('id', id);

    if (error) {
        alert('Erro ao alterar status do usuário.');
    } else {
        await carregarUsuarios();
    }
}