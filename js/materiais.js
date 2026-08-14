// Configuração do PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

document.addEventListener('DOMContentLoaded', async () => {
    await verificarSessaoERegistrarAcesso();
    configurarBotaoDownload();
    carregarApresentacao();
});

async function verificarSessaoERegistrarAcesso() {
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
        await fazerLogout();
    } else {
        document.getElementById('nome-motorista').textContent = `Olá, ${data.nome}`;

        // Se já concluiu, manda pro resultado final
        if (data.status_integracao === 'Concluído') {
            window.location.href = 'resultado.html';
        } else {
            // Registra que ele acessou a página de materiais
            await supabase
                .from('usuarios')
                .update({ materiais_acessados: true })
                .eq('id', session.user.id);
        }
    }
}

function configurarBotaoDownload() {
    const btnDownload = document.getElementById('btn-download');
    btnDownload.href = DOCUMENTO_INTEGRACAO;
}

// ==========================================
// LÓGICA DO PDF.JS (APRESENTAÇÃO EM SLIDES)
// ==========================================

function carregarApresentacao() {
    pdfjsLib.getDocument(APRESENTACAO_PDF).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        renderizarPagina(pageNum);
    }).catch(function(error) {
        console.error('Erro ao carregar PDF: ', error);
        document.getElementById('pdf-wrapper').innerHTML = '<div class="alert alert-error" style="display:block;">Não foi possível carregar a apresentação. Verifique o arquivo configurado.</div>';
    });
}

function renderizarPagina(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(function(page) {
        // Responsividade: Calcula a escala baseada na largura do container (Mobile-friendly)
        const containerWidth = document.getElementById('pdf-container').clientWidth;
        const unscaledViewport = page.getViewport({ scale: 1 });
        
        // Define uma escala máxima para não ficar gigantesco no PC, e ajusta para celular
        const scale = Math.min(1.2, (containerWidth - 20) / unscaledViewport.width);
        const viewport = page.getViewport({ scale: scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        const renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderizarPagina(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('page-num').textContent = num;
    atualizarBotoesPDF();
}

function atualizarBotoesPDF() {
    document.getElementById('btn-prev').disabled = (pageNum <= 1);
    document.getElementById('btn-next').disabled = (pageNum >= pdfDoc.numPages);
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderizarPagina(num);
    }
}

document.getElementById('btn-prev').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
});

document.getElementById('btn-next').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
});

// Suporte opcional para setas do teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        document.getElementById('btn-next').click();
    } else if (e.key === 'ArrowLeft') {
        document.getElementById('btn-prev').click();
    }
});