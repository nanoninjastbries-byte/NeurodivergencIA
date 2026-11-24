
"use strict";

// ============================================================
// NEURODIVERGÊNCIA — JAVASCRIPT DO SITE
// 18 QUESTÕES INICIAIS
// 6 QUESTÕES DE REPETIÇÃO ADAPTATIVA
// 10 ATIVIDADES ADAPTADAS
// TOTAL: 3 CHAMADAS À GEMINI POR AVALIAÇÃO
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";

const ESTRATEGIAS_INICIAIS = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras"
];

const ESTRATEGIA_ADAPTATIVA = "Repetição adaptativa";

let dadosAluno = {};
let questoesIniciais = [];
let questoesAdaptativas = [];
let atividadesAdaptadas = [];
let questoes = [];
let respostas = [];

let questaoAtual = 0;
let inicioQuestao = null;
let alternativaSelecionada = null;

let estrategiaEscolhida = "";
let avaliacaoFinalizada = false;
let carregandoAdaptativas = false;
let carregandoAtividadesAdaptadas = false;

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const eventos = [
        ["btnComecar", "click", function () {
            mostrarTela("configuracao");
        }],

        ["formAvaliacao", "submit", iniciarAvaliacao],

        ["btnIniciarExercicios", "click", iniciarExercicios],

        ["registrarResposta", "click", registrarResposta],

        ["proxima", "click", proximaQuestao],

        ["btnAtividades", "click", mostrarAtividades],

        ["btnReiniciar", "click", reiniciar],

        ["btnNovaAvaliacao", "click", reiniciar]
    ];

    eventos.forEach(function (item) {
        const elemento = document.getElementById(item[0]);

        if (elemento) {
            elemento.addEventListener(item[1], item[2]);
        }
    });

});

// ============================================================
// NAVEGAÇÃO ENTRE TELAS
// ============================================================

function mostrarTela(id) {

    document.querySelectorAll(".tela").forEach(function (tela) {
        tela.classList.remove("ativa");
    });

    const tela = document.getElementById(id);

    if (tela) {
        tela.classList.add("ativa");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================================
// INICIAR AVALIAÇÃO
// ============================================================

async function iniciarAvaliacao(event) {

    if (event) {
        event.preventDefault();
    }

    const nome = obterValor("nome");
    const idade = obterValor("idade");
    const ano = obterValor("ano");
    const materia = obterValor("materia");
    const conteudo = obterValor("conteudo");
    const observacoes = obterValor("observacoes");

    const erro = document.getElementById("erroConfiguracao");

    if (!nome || !idade || !ano || !materia || !conteudo) {

        exibirErro(
            erro,
            "Preencha todos os campos obrigatórios."
        );

        return;
    }

    if (!Number.isFinite(Number(idade)) || Number(idade) <= 0) {

        exibirErro(
            erro,
            "Informe uma idade válida."
        );

        return;
    }

    dadosAluno = {
        nome: nome,
        idade: Number(idade),
        ano: ano,
        materia: materia,
        conteudo: conteudo,
        observacoes: observacoes
    };

    limparDadosAvaliacao();

    mostrarTela("preparacao");

    const status = document.getElementById("statusPreparacao");

    if (status) {
        status.textContent =
            "A IA está preparando as 18 questões iniciais...";
    }

    const botao = document.getElementById("btnIniciarExercicios");

    if (botao) {
        botao.hidden = true;
        botao.disabled = true;
        botao.classList.add("oculto");
    }

    try {

        await gerarQuestoesIniciais();

    } catch (erroGeracao) {

        if (status) {
            status.textContent =
                "Não foi possível preparar a avaliação: " +
                erroGeracao.message;
        }

        console.error(erroGeracao);
    }
}

function obterValor(id) {

    const elemento = document.getElementById(id);

    return elemento
        ? elemento.value.trim()
        : "";
}

function exibirErro(elemento, mensagem) {

    if (!elemento) {
        alert(mensagem);
        return;
    }

    elemento.textContent = mensagem;
    elemento.classList.remove("oculto");
    elemento.hidden = false;
}

function limparDadosAvaliacao() {

    questoesIniciais = [];
    questoesAdaptativas = [];
    atividadesAdaptadas = [];

    questoes = [];
    respostas = [];

    questaoAtual = 0;
    inicioQuestao = null;
    alternativaSelecionada = null;

    estrategiaEscolhida = "";

    avaliacaoFinalizada = false;
    carregandoAdaptativas = false;
    carregandoAtividadesAdaptadas = false;
}

// ============================================================
// PRIMEIRA CHAMADA À GEMINI
// GERAÇÃO DAS 18 QUESTÕES INICIAIS
// ============================================================

async function gerarQuestoesIniciais() {

    const resultado = await fazerRequisicao({

        action: "gerar_questoes",

        aluno: dadosAluno,

        quantidade_total: 18,

        estrategias: [
            {
                nome: "Divisão em etapas",
                quantidade: 6
            },
            {
                nome: "Apoio visual",
                quantidade: 6
            },
            {
                nome: "Instruções claras",
                quantidade: 6
            }
        ]

    });

    if (!Array.isArray(resultado.questoes)) {
        throw new Error("A IA não retornou uma lista válida de questões.");
    }

    if (resultado.questoes.length !== 18) {
        throw new Error(
            "Foram recebidas " +
            resultado.questoes.length +
            " questões. Eram esperadas 18."
        );
    }

    questoesIniciais = organizarQuestoesIniciais(
        resultado.questoes
    );

    questoes = questoesIniciais.slice();

    const status = document.getElementById("statusPreparacao");

    if (status) {
        status.textContent =
            "As 18 questões foram preparadas. Você já pode iniciar a avaliação.";
    }

    atualizarContador();

    const botao = document.getElementById("btnIniciarExercicios");

    if (botao) {
        botao.hidden = false;
        botao.disabled = false;
        botao.classList.remove("oculto");
        botao.style.display = "block";
    }
}

// ============================================================
// ORGANIZAÇÃO DAS QUESTÕES INICIAIS
// ============================================================

function organizarQuestoesIniciais(lista) {

    const grupos = {};

    ESTRATEGIAS_INICIAIS.forEach(function (nome) {
        grupos[nome] = [];
    });

    lista.forEach(function (questao) {

        const normalizada = normalizarQuestao(questao);
        const estrategia = normalizada.estrategia;

        if (!grupos[estrategia]) {
            throw new Error(
                "A IA retornou uma estratégia inválida: " + estrategia
            );
        }

        grupos[estrategia].push(normalizada);
    });

    const resultado = [];

    ESTRATEGIAS_INICIAIS.forEach(function (nome) {

        if (grupos[nome].length !== 6) {
            throw new Error(
                "A estratégia " + nome +
                " recebeu " + grupos[nome].length +
                " questões. Eram esperadas 6."
            );
        }

        resultado.push.apply(resultado, grupos[nome]);
    });

    return resultado;
}

// ============================================================
// INICIAR QUESTÕES
// ============================================================

function iniciarExercicios() {

    if (questoesIniciais.length !== 18) {
        alert("As 18 questões iniciais ainda não foram preparadas.");
        return;
    }

    questoes = questoesIniciais.slice();
    questaoAtual = 0;
    respostas = [];

    mostrarTela("avaliacao");
    mostrarQuestao();
}

// ============================================================
// NORMALIZAÇÃO DAS QUESTÕES
// ============================================================

function normalizarQuestao(q) {

    if (!q || typeof q !== "object") {
        throw new Error("A IA retornou uma questão inválida.");
    }

    const alternativas = Array.isArray(q.alternativas)
        ? q.alternativas
        : [
            q.alternativa_a,
            q.alternativa_b,
            q.alternativa_c,
            q.alternativa_d
        ];

    if (alternativas.length !== 4) {
        throw new Error("Uma questão não possui quatro alternativas.");
    }

    let correta = q.resposta_correta;

    if (correta === undefined || correta === null) {
        correta = q.correta;
    }

    if (typeof correta === "string") {

        const letras = {
            A: 0,
            B: 1,
            C: 2,
            D: 3
        };

        const letra = correta.trim().toUpperCase();

        if (Object.prototype.hasOwnProperty.call(letras, letra)) {
            correta = letras[letra];
        } else {
            correta = Number(correta);
        }
    }

    correta = Number(correta);

    if (!Number.isInteger(correta) || correta < 0 || correta > 3) {
        throw new Error("A resposta correta de uma questão é inválida.");
    }

    return {

        pergunta: String(q.pergunta || q.enunciado || ""),

        alternativas: alternativas.map(function (alternativa) {
            return String(alternativa || "");
        }),

        correta: correta,

        explicacao: String(q.explicacao || ""),

        estrategia: String(q.estrategia || ""),

        passos: Array.isArray(q.passos) ? q.passos : [],

        visual: String(q.visual || "")
    };
}

// ============================================================
// EXIBIR QUESTÃO
// ============================================================

function mostrarQuestao() {

    const q = questoes[questaoAtual];

    if (!q) {
        return;
    }

    alternativaSelecionada = null;

    const feedback = document.getElementById("feedback");

    if (feedback) {
        feedback.textContent = "";
        feedback.classList.add("oculto");
        feedback.hidden = true;
    }

    const registrar = document.getElementById("registrarResposta");

    if (registrar) {
        registrar.classList.remove("oculto");
        registrar.disabled = false;
    }

    const proxima = document.getElementById("proxima");

    if (proxima) {
        proxima.classList.add("oculto");
    }

    const dificuldade = document.getElementById("dificuldade");

    if (dificuldade) {
        dificuldade.value = 2;
    }

    const pergunta = document.getElementById("pergunta");

    if (pergunta) {
        pergunta.textContent = q.pergunta;
    }

    const estrategia = document.getElementById("estrategia");

    if (estrategia) {
        estrategia.textContent = q.estrategia;
    }

    atualizarContador();

    renderizarPassos(q.passos);
    renderizarVisual(q.visual);
    renderizarAlternativas(q.alternativas);

    inicioQuestao = Date.now();
}

// ============================================================
// CONTADOR E PROGRESSO
// ============================================================

function atualizarContador() {

    const contador = document.getElementById("contador");
    const progresso = document.getElementById("progresso");

    if (contador) {
        contador.textContent =
            (questaoAtual + 1) + " / " + questoes.length;
    }

    if (progresso && questoes.length > 0) {

        const porcentagem = Math.round(
            ((questaoAtual + 1) / questoes.length) * 100
        );

        progresso.style.width = porcentagem + "%";
    }
}

// ============================================================
// ALTERNATIVAS
// ============================================================

function renderizarAlternativas(alternativas) {

    const container = document.getElementById("alternativas");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    alternativas.forEach(function (alternativa, indice) {

        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "alternativa";
        botao.textContent = alternativa;

        botao.addEventListener("click", function () {

            container.querySelectorAll(".alternativa").forEach(function (item) {
                item.classList.remove("selecionada");
            });

            botao.classList.add("selecionada");

            alternativaSelecionada = indice;
        });

        container.appendChild(botao);
    });
}

// ============================================================
// PASSOS DA DIVISÃO EM ETAPAS
// ============================================================

function renderizarPassos(passos) {

    const bloco = document.getElementById("passos");
    const lista = document.getElementById("listaPassos");

    if (!bloco || !lista) {
        return;
    }

    lista.innerHTML = "";

    bloco.classList.add("oculto");
    bloco.hidden = true;

    if (!Array.isArray(passos) || passos.length === 0) {
        return;
    }

    passos.forEach(function (passo) {

        const item = document.createElement("li");

        item.textContent = String(passo);

        lista.appendChild(item);
    });

    bloco.classList.remove("oculto");
    bloco.hidden = false;
}

// ============================================================
// APOIO VISUAL
// ============================================================

function renderizarVisual(visual) {

    const bloco = document.getElementById("visual");
    const lista = document.getElementById("listaVisual");

    if (!bloco || !lista) {
        return;
    }

    lista.innerHTML = "";

    bloco.classList.add("oculto");
    bloco.hidden = true;

    if (!visual) {
        return;
    }

    const texto = document.createElement("div");

    texto.className = "visual-texto";
    texto.textContent = visual;

    lista.appendChild(texto);

    bloco.classList.remove("oculto");
    bloco.hidden = false;
}

// ============================================================
// REGISTRAR RESPOSTA
// ============================================================

function registrarResposta() {

    if (alternativaSelecionada === null) {

        mostrarFeedback(
            "Selecione uma alternativa antes de continuar.",
            false
        );

        return;
    }

    const q = questoes[questaoAtual];

    const dificuldadeElemento = document.getElementById("dificuldade");

    const dificuldade = dificuldadeElemento
        ? Number(dificuldadeElemento.value)
        : 2;

    const tempo = inicioQuestao
        ? Math.round((Date.now() - inicioQuestao) / 1000)
        : 0;

    const correta = alternativaSelecionada === q.correta;

    respostas.push({

        questao: questaoAtual + 1,

        estrategia: q.estrategia,

        resposta: alternativaSelecionada,

        correta: correta,

        dificuldade: dificuldade,

        tempo: tempo
    });

    mostrarFeedback(
        correta
            ? "Resposta correta. " + q.explicacao
            : "Resposta registrada. " + q.explicacao,
        correta
    );

    const registrar = document.getElementById("registrarResposta");
    const proxima = document.getElementById("proxima");

    if (registrar) {
        registrar.classList.add("oculto");
        registrar.disabled = true;
    }

    if (proxima) {
        proxima.classList.remove("oculto");
    }
}

// ============================================================
// FEEDBACK
// ============================================================

function mostrarFeedback(mensagem, correta) {

    const feedback = document.getElementById("feedback");

    if (!feedback) {
        return;
    }

    feedback.textContent = mensagem;

    feedback.classList.remove(
        "oculto",
        "correta",
        "incorreta"
    );

    feedback.classList.add(
        correta ? "correta" : "incorreta"
    );

    feedback.hidden = false;
}

// ============================================================
// PRÓXIMA QUESTÃO
// ============================================================

async function proximaQuestao() {

    questaoAtual++;

    if (questaoAtual < questoes.length) {
        mostrarQuestao();
        return;
    }

    // Terminou as 18 iniciais: gerar as 6 adaptativas.
    if (questoesAdaptativas.length === 0) {

        await prepararAdaptativas();

        return;
    }

    // Terminou as 6 adaptativas.
    finalizarAvaliacao();
}

// ============================================================
// SEGUNDA CHAMADA À GEMINI
// REPETIÇÃO ADAPTATIVA
// ============================================================

async function prepararAdaptativas() {

    if (carregandoAdaptativas) {
        return;
    }

    carregandoAdaptativas = true;

    mostrarTela("adaptacao");

    const status = document.getElementById("statusAdaptacao");

    if (status) {
        status.textContent =
            "A IA está analisando as respostas e preparando 6 questões de repetição adaptativa...";
    }

    try {

        const desempenho = calcularDesempenho();

        estrategiaEscolhida = escolherEstrategia(desempenho);

        const resultado = await fazerRequisicao({

            action: "gerar_adaptativas",

            aluno: dadosAluno,

            estrategiaSelecionada: estrategiaEscolhida,

            desempenho: desempenho,

            respostas: respostas,

            quantidade: 6

        });

        if (!Array.isArray(resultado.questoes)) {
            throw new Error("A IA não retornou as questões adaptativas.");
        }

        if (resultado.questoes.length !== 6) {
            throw new Error(
                "Foram recebidas " +
                resultado.questoes.length +
                " questões adaptativas. Eram esperadas 6."
            );
        }

        questoesAdaptativas = resultado.questoes.map(function (q) {

            const normalizada = normalizarQuestao(q);

            normalizada.estrategia = ESTRATEGIA_ADAPTATIVA;

            return normalizada;
        });

        // A repetição adaptativa é adicionada à avaliação.
        questoes = questoesIniciais.concat(questoesAdaptativas);

        if (status) {
            status.textContent =
                "As 6 questões de repetição adaptativa foram preparadas.";
        }

        await esperar(700);

        questaoAtual = 18;

        mostrarTela("avaliacao");

        mostrarQuestao();

    } catch (erro) {

        if (status) {
            status.textContent =
                "Erro ao preparar a repetição adaptativa: " +
                erro.message;
        }

        console.error(erro);

    } finally {

        carregandoAdaptativas = false;
    }
}

// ============================================================
// CÁLCULO DE DESEMPENHO DAS TRÊS ESTRATÉGIAS INICIAIS
// ============================================================

function calcularDesempenho() {

    const resultado = {};

    ESTRATEGIAS_INICIAIS.forEach(function (estrategia) {

        const lista = respostas.filter(function (resposta) {
            return resposta.estrategia === estrategia;
        });

        if (lista.length === 0) {

            resultado[estrategia] = {
                acertos: 0,
                total: 0,
                percentual: 0,
                tempo_medio: 0,
                dificuldade_media: 0
            };

            return;
        }

        const acertos = lista.filter(function (resposta) {
            return resposta.correta;
        }).length;

        const tempoTotal = lista.reduce(function (soma, resposta) {
            return soma + Number(resposta.tempo || 0);
        }, 0);

        const dificuldadeTotal = lista.reduce(function (soma, resposta) {
            return soma + Number(resposta.dificuldade || 0);
        }, 0);

        resultado[estrategia] = {

            acertos: acertos,

            total: lista.length,

            percentual: Math.round(
                (acertos / lista.length) * 100
            ),

            tempo_medio: Number(
                (tempoTotal / lista.length).toFixed(2)
            ),

            dificuldade_media: Number(
                (dificuldadeTotal / lista.length).toFixed(2)
            )
        };
    });

    return resultado;
}

// ============================================================
// ESCOLHER ESTRATÉGIA COM MELHOR RESULTADO
// ============================================================

function escolherEstrategia(desempenho) {

    let melhor = ESTRATEGIAS_INICIAIS[0];
    let maior = -1;

    ESTRATEGIAS_INICIAIS.forEach(function (estrategia) {

        const dados = desempenho[estrategia];

        if (dados && dados.percentual > maior) {

            maior = dados.percentual;
            melhor = estrategia;
        }
    });

    return melhor;
}

// ============================================================
// FINALIZAR A AVALIAÇÃO
// ============================================================

function finalizarAvaliacao() {

    if (avaliacaoFinalizada) {
        return;
    }

    avaliacaoFinalizada = true;

    const desempenho = calcularDesempenho();

    mostrarTela("resultado");

    preencherResultados(desempenho);
}

// ============================================================
// EXIBIR RESULTADOS
// ============================================================

function preencherResultados(desempenho) {

    ESTRATEGIAS_INICIAIS.forEach(function (nome, indice) {

        const dados = desempenho[nome];

        const elemento = document.getElementById(
            "resultado" + (indice + 1)
        );

        if (!elemento) {
            return;
        }

        elemento.textContent =
            nome + " — " + dados.percentual + "% de acertos";
    });

    const respostasAdaptativas = respostas.filter(function (resposta) {
        return resposta.estrategia === ESTRATEGIA_ADAPTATIVA;
    });

    let percentualAdaptativo = 0;

    if (respostasAdaptativas.length > 0) {

        const acertos = respostasAdaptativas.filter(function (resposta) {
            return resposta.correta;
        }).length;

        percentualAdaptativo = Math.round(
            (acertos / respostasAdaptativas.length) * 100
        );
    }

    const resultado4 = document.getElementById("resultado4");

    if (resultado4) {
        resultado4.textContent =
            "Repetição adaptativa — " +
            percentualAdaptativo +
            "% de acertos";
    }

    const mensagem = document.getElementById("mensagemResultado");

    if (mensagem) {

        mensagem.textContent =
            "A estratégia com maior percentual de acertos na avaliação inicial foi " +
            estrategiaEscolhida +
            ". A repetição adaptativa foi gerada separadamente, considerando o desempenho registrado.";
    }
}

// ============================================================
// TERCEIRA CHAMADA À GEMINI
// GERAÇÃO DAS 10 ATIVIDADES ADAPTADAS
// ============================================================

async function mostrarAtividades() {

    if (carregandoAtividadesAdaptadas) {
        return;
    }

    const lista = document.getElementById("listaAtividades");

    if (!lista) {
        console.error("Elemento listaAtividades não encontrado.");
        return;
    }

    // Evita gerar novamente quando as atividades já existem.
    if (atividadesAdaptadas.length === 0) {

        carregandoAtividadesAdaptadas = true;

        lista.textContent =
            "A IA está preparando as 10 atividades adaptadas...";

        try {

            const desempenho = calcularDesempenho();

            const resultado = await fazerRequisicao({

                action: "gerar_atividades_adaptadas",

                aluno: dadosAluno,

                estrategiaSelecionada: estrategiaEscolhida,

                desempenho: desempenho,

                respostas: respostas,

                questoesIniciais: questoesIniciais.map(function (q) {
                    return {
                        pergunta: q.pergunta,
                        estrategia: q.estrategia
                    };
                }),

                questoesRepeticao: questoesAdaptativas.map(function (q) {
                    return {
                        pergunta: q.pergunta,
                        estrategia: q.estrategia
                    };
                }),

                quantidade: 10
            });

            if (!Array.isArray(resultado.atividades)) {
                throw new Error("A IA não retornou uma lista de atividades.");
            }

            if (resultado.atividades.length !== 10) {
                throw new Error(
                    "Foram recebidas " +
                    resultado.atividades.length +
                    " atividades. Eram esperadas 10."
                );
            }

            validarAtividadesAdaptadas(resultado.atividades);

            atividadesAdaptadas = resultado.atividades;

        } catch (erro) {

            lista.textContent =
                "Não foi possível gerar as atividades adaptadas: " +
                erro.message;

            console.error(erro);

            carregandoAtividadesAdaptadas = false;

            return;
        }

        carregandoAtividadesAdaptadas = false;
    }

    renderizarAtividadesAdaptadas();

    mostrarTela("atividades");
}

// ============================================================
// VALIDAR AS 10 ATIVIDADES ADAPTADAS
// ============================================================

function validarAtividadesAdaptadas(atividades) {

    if (atividades.length !== 10) {
        throw new Error("A quantidade de atividades é inválida.");
    }

    const multiplaEscolha = atividades.filter(function (atividade) {
        return atividade.tipo === "multipla_escolha";
    });

    if (multiplaEscolha.length !== 5) {
        throw new Error(
            "A IA deve retornar exatamente 5 atividades de múltipla escolha."
        );
    }

    const tiposObrigatorios = [
        "completar",
        "relacionar",
        "interpretacao",
        "resposta_aberta",
        "resolucao"
    ];

    tiposObrigatorios.forEach(function (tipo) {

        const quantidade = atividades.filter(function (atividade) {
            return atividade.tipo === tipo;
        }).length;

        if (quantidade !== 1) {
            throw new Error(
                "A IA deve retornar exatamente uma atividade do tipo " +
                tipo +
                "."
            );
        }
    });

    atividades.forEach(function (atividade, indice) {

        if (!atividade.enunciado) {
            throw new Error(
                "A atividade " + (indice + 1) + " está sem enunciado."
            );
        }

        if (atividade.tipo === "multipla_escolha") {

            if (
                !Array.isArray(atividade.alternativas) ||
                atividade.alternativas.length !== 4
            ) {
                throw new Error(
                    "A atividade de múltipla escolha " +
                    (indice + 1) +
                    " deve possuir quatro alternativas."
                );
            }

            const correta = Number(atividade.resposta_correta);

            if (
                !Number.isInteger(correta) ||
                correta < 0 ||
                correta > 3
            ) {
                throw new Error(
                    "A resposta correta da atividade " +
                    (indice + 1) +
                    " é inválida."
                );
            }
        }
    });
}

// ============================================================
// EXIBIR AS 10 ATIVIDADES ADAPTADAS
// ============================================================

function renderizarAtividadesAdaptadas() {

    const lista = document.getElementById("listaAtividades");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    atividadesAdaptadas.forEach(function (atividade, indice) {

        const card = document.createElement("div");
        card.className = "atividade";

        const titulo = document.createElement("h3");

        titulo.textContent =
            "Atividade " +
            (indice + 1) +
            " — " +
            rotuloTipoAtividade(atividade.tipo);

        card.appendChild(titulo);

        if (atividade.texto_base) {

            const textoBase = document.createElement("p");

            textoBase.textContent = atividade.texto_base;

            card.appendChild(textoBase);
        }

        const enunciado = document.createElement("p");

        enunciado.textContent = atividade.enunciado;

        card.appendChild(enunciado);

        const tipo = atividade.tipo;

        if (tipo === "multipla_escolha") {

            atividade.alternativas.forEach(function (alternativa, i) {

                const item = document.createElement("p");

                item.textContent =
                    String.fromCharCode(65 + i) +
                    ") " +
                    alternativa;

                card.appendChild(item);
            });

        } else if (tipo === "completar") {

            if (atividade.frase_com_lacunas) {

                const frase = document.createElement("p");

                frase.textContent = atividade.frase_com_lacunas;

                card.appendChild(frase);
            }

            if (
                Array.isArray(atividade.opcoes_palavras) &&
                atividade.opcoes_palavras.length > 0
            ) {

                const opcoes = document.createElement("p");

                opcoes.textContent =
                    "Banco de palavras: " +
                    atividade.opcoes_palavras.join(" | ");

                card.appendChild(opcoes);
            }

        } else if (tipo === "relacionar") {

            const colunaA = document.createElement("p");
            const colunaB = document.createElement("p");

            colunaA.textContent =
                "Coluna A: " +
                (Array.isArray(atividade.coluna_a)
                    ? atividade.coluna_a.join("; ")
                    : "");

            colunaB.textContent =
                "Coluna B: " +
                (Array.isArray(atividade.coluna_b)
                    ? atividade.coluna_b.join("; ")
                    : "");

            card.appendChild(colunaA);
            card.appendChild(colunaB);
        }

        if (atividade.orientacao) {

            const orientacao = document.createElement("p");

            orientacao.className = "atividade-orientacao";

            orientacao.textContent =
                "Orientação: " + atividade.orientacao;

            card.appendChild(orientacao);
        }

        lista.appendChild(card);
    });
}

// ============================================================
// NOMES DOS TIPOS DE ATIVIDADE
// ============================================================

function rotuloTipoAtividade(tipo) {

    const rotulos = {

        multipla_escolha: "Múltipla escolha",

        completar: "Complete",

        relacionar: "Relacione",

        interpretacao: "Interpretação",

        resposta_aberta: "Resposta aberta",

        resolucao: "Resolução de exercício"
    };

    return rotulos[tipo] || "Atividade adaptada";
}

// ============================================================
// REINICIAR A AVALIAÇÃO
// ============================================================

function reiniciar() {

    dadosAluno = {};

    limparDadosAvaliacao();

    const form = document.getElementById("formAvaliacao");

    if (form) {
        form.reset();
    }

    const botao = document.getElementById("btnIniciarExercicios");

    if (botao) {
        botao.hidden = true;
        botao.disabled = true;
        botao.classList.add("oculto");
    }

    const erro = document.getElementById("erroConfiguracao");

    if (erro) {
        erro.textContent = "";
        erro.classList.add("oculto");
        erro.hidden = true;
    }

    mostrarTela("inicio");
}

// ============================================================
// COMUNICAÇÃO COM O GOOGLE APPS SCRIPT
// ============================================================

async function fazerRequisicao(payload) {

    let resposta;

    try {

        resposta = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(payload),

            redirect: "follow"
        });

    } catch (erro) {

        throw new Error(
            "Não foi possível conectar ao servidor. Verifique a internet e a implantação do Apps Script."
        );
    }

    const texto = await resposta.text();

    if (!texto || !texto.trim()) {
        throw new Error("O servidor não retornou nenhum conteúdo.");
    }

    let dados;

    try {

        dados = JSON.parse(texto);

    } catch (erro) {

        console.error("Resposta recebida:", texto);

        throw new Error(
            "O Apps Script não retornou JSON válido. Verifique se a implantação está atualizada."
        );
    }

    if (!dados || typeof dados !== "object") {
        throw new Error("O servidor retornou dados inválidos.");
    }

    if (dados.ok === false) {
        throw new Error(
            dados.erro || "Ocorreu um erro no servidor."
        );
    }

    return dados;
}

// ============================================================
// UTILITÁRIOS
// ============================================================

function esperar(ms) {

    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
