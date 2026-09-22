// ============================================================
// NEURODIVERGÊNCIA — FUNCIONAMENTO DA INTERFACE
// ============================================================

let questaoAtual = 0;
let respostas = [];

const estrategias = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];


// ============================================================
// QUESTÕES DE TESTE
// ============================================================

const questoes = [

    // DIVISÃO EM ETAPAS
    {
        estrategia: "Divisão em etapas",
        pergunta: "Qual é o resultado de 12 + 8?",
        alternativas: ["18", "20", "22", "24"],
        correta: 1
    },

    {
        estrategia: "Divisão em etapas",
        pergunta: "Se você tem 20 balas e divide igualmente entre 4 pessoas, quantas balas cada pessoa recebe?",
        alternativas: ["4", "5", "6", "8"],
        correta: 1
    },

    {
        estrategia: "Divisão em etapas",
        pergunta: "Qual é o primeiro passo para resolver uma operação matemática?",
        alternativas: [
            "Ler e compreender a questão",
            "Escolher qualquer resposta",
            "Ignorar os dados",
            "Pular para o final"
        ],
        correta: 0
    },

    {
        estrategia: "Divisão em etapas",
        pergunta: "Qual é o resultado de 5 × 6?",
        alternativas: ["20", "25", "30", "35"],
        correta: 2
    },

    {
        estrategia: "Divisão em etapas",
        pergunta: "Qual número vem depois de 39?",
        alternativas: ["38", "40", "41", "49"],
        correta: 1
    },

    {
        estrategia: "Divisão em etapas",
        pergunta: "Qual é a metade de 18?",
        alternativas: ["6", "8", "9", "12"],
        correta: 2
    },


    // APOIO VISUAL
    {
        estrategia: "Apoio visual",
        pergunta: "Observe mentalmente: ★ ★ ★ ★. Quantas estrelas aparecem?",
        alternativas: ["3", "4", "5", "6"],
        correta: 1
    },

    {
        estrategia: "Apoio visual",
        pergunta: "Imagine três grupos com 2 objetos em cada grupo. Quantos objetos existem ao todo?",
        alternativas: ["5", "6", "7", "8"],
        correta: 1
    },

    {
        estrategia: "Apoio visual",
        pergunta: "Qual forma possui três lados?",
        alternativas: ["Círculo", "Quadrado", "Triângulo", "Retângulo"],
        correta: 2
    },

    {
        estrategia: "Apoio visual",
        pergunta: "Imagine uma sequência: ● ▲ ● ▲ ●. Qual símbolo vem depois?",
        alternativas: ["●", "▲", "■", "◆"],
        correta: 1
    },

    {
        estrategia: "Apoio visual",
        pergunta: "Um semáforo possui três cores principais. Quantas são?",
        alternativas: ["2", "3", "4", "5"],
        correta: 1
    },

    {
        estrategia: "Apoio visual",
        pergunta: "Qual objeto geralmente possui formato circular?",
        alternativas: ["Bola", "Livro", "Régua", "Caixa"],
        correta: 0
    },


    // INSTRUÇÕES CLARAS
    {
        estrategia: "Instruções claras",
        pergunta: "Leia: 'Escolha o número maior entre 7 e 4.' Qual é a resposta?",
        alternativas: ["4", "7", "11", "3"],
        correta: 1
    },

    {
        estrategia: "Instruções claras",
        pergunta: "Leia: 'Some 10 e 5.' Qual é o resultado?",
        alternativas: ["10", "12", "15", "20"],
        correta: 2
    },

    {
        estrategia: "Instruções claras",
        pergunta: "Leia: 'Escolha a palavra que representa um animal.'",
        alternativas: ["Mesa", "Cachorro", "Caderno", "Janela"],
        correta: 1
    },

    {
        estrategia: "Instruções claras",
        pergunta: "Leia: 'Subtraia 3 de 10.' Qual é o resultado?",
        alternativas: ["5", "6", "7", "8"],
        correta: 2
    },

    {
        estrategia: "Instruções claras",
        pergunta: "Leia: 'Complete a sequência: 2, 4, 6, __.'",
        alternativas: ["7", "8", "9", "10"],
        correta: 1
    },

    {
        estrategia: "Instruções claras",
        pergunta: "Leia: 'Qual é a primeira letra da palavra CASA?'",
        alternativas: ["A", "C", "S", "T"],
        correta: 1
    },


    // REPETIÇÃO ADAPTATIVA
    {
        estrategia: "Repetição adaptativa",
        pergunta: "Qual é o resultado de 3 + 3?",
        alternativas: ["5", "6", "7", "8"],
        correta: 1
    },

    {
        estrategia: "Repetição adaptativa",
        pergunta: "Qual é o resultado de 4 + 4?",
        alternativas: ["6", "7", "8", "9"],
        correta: 2
    },

    {
        estrategia: "Repetição adaptativa",
        pergunta: "Qual é o resultado de 5 + 5?",
        alternativas: ["8", "9", "10", "11"],
        correta: 2
    },

    {
        estrategia: "Repetição adaptativa",
        pergunta: "Qual é o resultado de 6 + 6?",
        alternativas: ["10", "11", "12", "13"],
        correta: 2
    },

    {
        estrategia: "Repetição adaptativa",
        pergunta: "Qual é o resultado de 7 + 7?",
        alternativas: ["12", "13", "14", "15"],
        correta: 2
    },

    {
        estrategia: "Repetição adaptativa",
        pergunta: "Qual é o resultado de 8 + 8?",
        alternativas: ["14", "15", "16", "18"],
        correta: 2
    }
];


// ============================================================
// TROCAR DE TELA
// ============================================================

function mostrarTela(id) {

    document.querySelectorAll(".tela").forEach(tela => {
        tela.classList.remove("ativa");
    });

    document.getElementById(id).classList.add("ativa");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// INICIAR AVALIAÇÃO
// ============================================================

function iniciarAvaliacao() {

    const nome = document.getElementById("nome").value.trim();
    const idade = document.getElementById("idade").value.trim();
    const ano = document.getElementById("ano").value.trim();
    const materia = document.getElementById("materia").value.trim();
    const conteudo = document.getElementById("conteudo").value.trim();

    if (!nome || !idade || !ano || !materia || !conteudo) {

        alert("Preencha todos os campos obrigatórios.");

        return;
    }

    questaoAtual = 0;
    respostas = [];

    mostrarTela("avaliacao");

    mostrarQuestao();
}


// ============================================================
// MOSTRAR QUESTÃO
// ============================================================

function mostrarQuestao() {

    const questao = questoes[questaoAtual];

    document.getElementById("contador").textContent =
        `Questão ${questaoAtual + 1} de ${questoes.length}`;

    document.getElementById("estrategia").textContent =
        questao.estrategia;

    document.getElementById("pergunta").textContent =
        questao.pergunta;

    const progresso =
        ((questaoAtual + 1) / questoes.length) * 100;

    document.getElementById("progresso").style.width =
        `${progresso}%`;

    const alternativas =
        document.getElementById("alternativas");

    alternativas.innerHTML = "";

    questao.alternativas.forEach((alternativa, indice) => {

        const botao = document.createElement("button");

        botao.className = "alternativa";

        botao.textContent = alternativa;

        botao.onclick = () => selecionarAlternativa(indice);

        alternativas.appendChild(botao);
    });

    document.getElementById("dificuldade").value = 3;

    document.getElementById("proxima").disabled = true;
}


// ============================================================
// SELECIONAR ALTERNATIVA
// ============================================================

function selecionarAlternativa(indice) {

    document.querySelectorAll(".alternativa").forEach(botao => {
        botao.classList.remove("selecionada");
    });

    const botoes =
        document.querySelectorAll(".alternativa");

    botoes[indice].classList.add("selecionada");

    document.getElementById("proxima").disabled = false;

    respostas[questaoAtual] = {

        estrategia: questoes[questaoAtual].estrategia,

        correta:
            indice === questoes[questaoAtual].correta,

        dificuldade:
            Number(document.getElementById("dificuldade").value)
    };
}


// ============================================================
// PRÓXIMA QUESTÃO
// ============================================================

function proximaQuestao() {

    if (!respostas[questaoAtual]) {

        alert("Escolha uma alternativa antes de continuar.");

        return;
    }

    questaoAtual++;

    if (questaoAtual < questoes.length) {

        mostrarQuestao();

    } else {

        mostrarResultado();
    }
}


// ============================================================
// RESULTADO
// ============================================================

function mostrarResultado() {

    mostrarTela("resultado");

    const resultados = {};

    estrategias.forEach(estrategia => {
        resultados[estrategia] = {
            total: 0,
            acertos: 0
        };
    });

    respostas.forEach(resposta => {

        resultados[resposta.estrategia].total++;

        if (resposta.correta) {
            resultados[resposta.estrategia].acertos++;
        }
    });

    const porcentagens = [];

    estrategias.forEach((estrategia, indice) => {

        const dados = resultados[estrategia];

        const porcentagem =
            dados.total > 0
                ? Math.round((dados.acertos / dados.total) * 100)
                : 0;

        porcentagens.push(porcentagem);

        document.getElementById(
            `resultado${indice + 1}`
        ).textContent = `${porcentagem}%`;
    });

    const maior = Math.max(...porcentagens);

    const melhorIndice =
        porcentagens.indexOf(maior);

    const melhorEstrategia =
        estrategias[melhorIndice];

    document.getElementById("mensagemResultado").innerHTML =
        `A avaliação foi concluída. A estratégia que apresentou o maior desempenho nesta avaliação foi <strong>${melhorEstrategia}</strong>, com ${maior}% de acertos.`;
}


// ============================================================
// ATIVIDADES ADAPTADAS
// ============================================================

function gerarAtividades() {

    const mensagem =
        document.getElementById("listaAtividades");

    mensagem.innerHTML = `
        <p>
            As atividades adaptadas serão geradas pela
            inteligência artificial após a conexão com a Gemini API.
        </p>

        <br>

        <p>
            Nesta versão inicial, a estrutura da plataforma já está
            preparada para receber essa função.
        </p>
    `;
}
