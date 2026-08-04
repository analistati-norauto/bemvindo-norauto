let indiceAtual = 0;
let respostasUsuario = new Array(PERGUNTAS_QUIZ.length).fill(null);
let usuarioLogadoId = null;
let usuarioNome = '';

document.addEventListener('DOMContentLoaded', async () => {
    // A página de resultado também usa esse JS, então verificamos onde estamos
    const isResultado = window.location.pathname.includes('resultado.html');
    
    await verificarSessao(isResultado);

    if (!isResultado) {
        renderizarPergunta();
    } else {
        exibirResultadoFinal();
    }
});

async function verificarSessao(isResultado) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, tipo, status_integracao, pontuacao_quiz')
        .eq('id', session.user.id)
        .single();

    if (error || !data || data.tipo !== 'Motorista') {
        window.location.href = 'index.html';
        return;
    }

    usuarioLogadoId = data.id;
    usuarioNome = data.nome;
    document.getElementById('nome-motorista').textContent = `Olá, ${data.nome}`;

    // Se tentar acessar o quiz já tendo concluído
    if (!isResultado && data.status_integracao === 'Concluído') {
        window.location.href = 'resultado.html';
    }
}

// ---------------- LÓGICA DO QUIZ ----------------

function renderizarPergunta() {
    const perguntaAtual = PERGUNTAS_QUIZ[indiceAtual];
    const areaPergunta = document.getElementById('area-pergunta');
    
    document.getElementById('indicador-progresso').textContent = `Pergunta ${indiceAtual + 1} de ${PERGUNTAS_QUIZ.length}`;
    document.getElementById('mensagem-erro').classList.add('hidden');

    let html = `<div class="question-text">${perguntaAtual.pergunta}</div>`;
    html += `<div class="options-container">`;

    perguntaAtual.alternativas.forEach((alt, index) => {
        const checked = respostasUsuario[indiceAtual] === alt ? 'checked' : '';
        html += `
            <label class="option-label">
                <input type="radio" name="opcao" value="${alt}" ${checked}>
                ${alt}
            </label>
        `;
    });

    html += `</div>`;
    areaPergunta.innerHTML = html;

    atualizarBotoes();
}

function atualizarBotoes() {
    document.getElementById('btn-anterior').style.display = (indiceAtual > 0) ? 'block' : 'none';
    
    if (indiceAtual === PERGUNTAS_QUIZ.length - 1) {
        document.getElementById('btn-proxima').style.display = 'none';
        document.getElementById('btn-finalizar').style.display = 'block';
    } else {
        document.getElementById('btn-proxima').style.display = 'block';
        document.getElementById('btn-finalizar').style.display = 'none';
    }
}

function salvarRespostaAtual() {
    const selecionada = document.querySelector('input[name="opcao"]:checked');
    if (selecionada) {
        respostasUsuario[indiceAtual] = selecionada.value;
        return true;
    }
    return false;
}

function proximaPergunta() {
    if (!salvarRespostaAtual()) {
        document.getElementById('mensagem-erro').classList.remove('hidden');
        return;
    }
    indiceAtual++;
    renderizarPergunta();
}

function perguntaAnterior() {
    salvarRespostaAtual(); // Salva mesmo que não tenha marcado para manter o estado
    indiceAtual--;
    renderizarPergunta();
}

async function finalizarQuiz() {
    if (!salvarRespostaAtual()) {
        document.getElementById('mensagem-erro').classList.remove('hidden');
        return;
    }

    const btn = document.getElementById('btn-finalizar');
    btn.disabled = true;
    btn.textContent = 'Calculando...';

    // Calcula acertos
    let acertos = 0;
    for (let i = 0; i < PERGUNTAS_QUIZ.length; i++) {
        if (respostasUsuario[i] === PERGUNTAS_QUIZ[i].respostaCorreta) {
            acertos++;
        }
    }

    const porcentagem = Math.round((acertos / PERGUNTAS_QUIZ.length) * 100);
    const dataAtual = new Date().toISOString();

    // Salva no banco de dados
    const { error } = await supabase
        .from('usuarios')
        .update({ 
            status_integracao: 'Concluído',
            pontuacao_quiz: porcentagem,
            data_conclusao: dataAtual
        })
        .eq('id', usuarioLogadoId);

    if (error) {
        alert('Erro ao salvar resultado. Tente novamente.');
        btn.disabled = false;
        btn.textContent = 'Finalizar quiz';
    } else {
        // Guarda acertos temporariamente na sessão para exibir na tela final
        sessionStorage.setItem('acertosQuiz', acertos);
        window.location.href = 'resultado.html';
    }
}

// ---------------- LÓGICA DO RESULTADO ----------------
async function exibirResultadoFinal() {
    // Busca dados atualizados
    const { data } = await supabase
        .from('usuarios')
        .select('pontuacao_quiz')
        .eq('id', usuarioLogadoId)
        .single();

    const acertos = sessionStorage.getItem('acertosQuiz') || Math.round((data.pontuacao_quiz / 100) * PERGUNTAS_QUIZ.length);
    const total = PERGUNTAS_QUIZ.length;

    const divResultado = document.getElementById('resultado-texto');
    if(divResultado) {
        divResultado.innerHTML = `
            <h2 style="color: var(--azul-escuro); margin-bottom: 20px;">Parabéns, ${usuarioNome}!</h2>
            <p class="welcome-text">Você concluiu a integração da NORAUTO RENT A CAR.</p>
            
            <div style="background: var(--fundo); padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="font-size: 18px; margin-bottom: 10px;"><strong>Resultado:</strong> ${acertos} de ${total} respostas corretas.</p>
                <p style="font-size: 18px;"><strong>Pontuação:</strong> <span style="color: var(--sucesso); font-weight: bold; font-size: 24px;">${data.pontuacao_quiz}%</span></p>
            </div>
        `;
    }
}