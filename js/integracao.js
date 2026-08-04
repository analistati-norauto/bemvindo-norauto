document.addEventListener('DOMContentLoaded', async () => {
    await verificarAcessoMotorista();
    configurarVideo();
});

async function verificarAcessoMotorista() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const { data, error } = await supabase
        .from('usuarios')
        .select('nome, tipo, status_integracao')
        .eq('id', session.user.id)
        .single();

    if (error || !data || data.tipo !== 'Motorista') {
        alert('Acesso negado.');
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    } else {
        document.getElementById('nome-motorista').textContent = `Olá, ${data.nome}`;

        // Se o status for "Não iniciado", muda para "Em andamento"
        if (data.status_integracao === 'Não iniciado') {
            await supabase
                .from('usuarios')
                .update({ status_integracao: 'Em andamento' })
                .eq('id', session.user.id);
        }
        
        // Se já concluiu, avisa que já está pronto
        if (data.status_integracao === 'Concluído') {
            window.location.href = 'resultado.html';
        }
    }
}

function configurarVideo() {
    const container = document.getElementById('video-container');
    
    // VIDEO_URL vem do js/config.js
    if (VIDEO_URL && VIDEO_URL.trim() !== "") {
        container.innerHTML = `<iframe src="${VIDEO_URL}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
        container.innerHTML = `
            <div class="video-placeholder">
                <h3 style="color: var(--amarelo); margin-bottom: 10px;">Vídeo institucional</h3>
                <p>O vídeo será disponibilizado em breve.</p>
            </div>
        `;
    }
}
