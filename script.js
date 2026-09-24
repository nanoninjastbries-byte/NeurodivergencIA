"use strict";

const API_URL = "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";

const TOTAL_QUESTOES = 24;
const QUESTOES_INICIAIS = 18;
const QUESTOES_ADAPTATIVAS = 6;

const ESTRATEGIAS = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];

let estado = novoEstado();

function novoEstado() {
    return {
        nome: "",
        idade: "",
        ano: "",
        materia: "",
        conteudo: "",
        observacoes: "",
        questoesIniciais: [],
        questoesAdaptativas: [],
        questoes: [],
        respostas: [],
        indiceAtual: 0,
        inicioQuestao: null,
        resultados: [],
        melhorEstrategia: "",
        notaGeral: 0,
        atividades: []
    };
}

function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(function(tela) {
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

async function chamarAPI(acao, dados) {
    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
            acao: acao,
            ...dados
        })
    });

    if (!resposta.ok) {
        throw new Error("Erro HTTP " + resposta.status);
    }

    const texto = await resposta.text();

    let resultado;

    try {
        resultado = JSON.parse(texto);
    } catch (erro) {
        throw new Error("A resposta do servidor não está em formato JSON.");
    }

    if (!resultado.sucesso) {
        throw new Error(
            resultado.erro || "O servidor retornou um erro."
        );
    }

    return resultado.dados;
}

async function iniciarAvaliacao() {
    const nome = document.getElementById("nome").value.trim();
    const idade = document.getElementById("idade").value.trim();
    const ano = document.getElementById("ano").value.trim();
    const materia = document.getElementById("materia").value.trim();
    const conteudo = document.getElementById("conteudo").value.trim();
    const observacoes = document.getElementById("observacoes").value.trim();

    if (!nome || !idade || !ano || !materia || !conteudo) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    if (Number(idade) <= 0) {
        alert("Informe uma idade válida.");
        return;
    }

    estado = novoEstado();

    estado.nome = nome;
    estado.idade = idade;
    estado.ano = ano;
    estado.materia = materia;
    estado.conteudo = conteudo;
    estado.observacoes = observacoes;

    const botao = document.getElementById("botaoIniciar");

    if (botao) {
        botao.disabled = true;
        botao.textContent = "Preparando atividades...";
    }

    try {
        mostrarTela("avaliacao");

        const dados = await chamarAPI("gerar_avaliacao", {
            aluno: {
                nome: estado.nome,
                idade: estado.idade,
                ano: estado.ano,
                materia: estado.materia,
                conteudo: estado.conteudo,
                observacoes: estado.observacoes
            }
        });

        if (
            !dados ||
            !Array.isArray(dados.questoes) ||
            dados.questoes.length !== QUESTOES_INICIAIS
        ) {
            throw new Error(
                "A IA não retornou as 18 questões esperadas."
            );
        }

        estado.questoesIniciais = dados.questoes;
        estado.questoes = [...dados.questoes];
        estado.indiceAtual = 0;

        mostrarQuestao();

    } catch (erro) {
        console.error(erro);

        mostrarTela("configuracao");

        alert(
            "Erro ao preparar as atividades:\n\n" +
            erro.message
        );

    } finally {
        if (botao) {
            botao.disabled = false;
            botao.textContent = "Iniciar avaliação";
        }
    }
}

function mostrarQuestao() {
    const questao = estado.questoes[estado.indiceAtual];

    if (!questao) {
        finalizarAvaliacao();
        return;
    }

    const numero = estado.indiceAtual + 1;

    const contador = document.getElementById("contador");
    const estrategia = document.getElementById("estrategia");
    const progresso = document.getElementById("progresso");
    const pergunta = document.getElementById("pergunta");
    const alternativas = document.getElementById("alternativas");
    const dificuldade = document.getElementById("dificuldade");
    const proxima = document.getElementById("proxima");

    if (contador) {
        contador.textContent =
            "Questão " + numero + " de " + TOTAL_QUESTOES;
    }

    if (estrategia) {
        estrategia.textContent =
            normalizarEstrategia(questao.estrategia);
    }

    if (progresso) {
        progresso.style.width =
            ((numero / TOTAL_QUESTOES) * 100) + "%";
    }

    if (pergunta) {
        pergunta.textContent = questao.pergunta || "";
    }

    if (alternativas) {
        alternativas.innerHTML = "";

        const lista = Array.isArray(questao.alternativas)
            ? questao.alternativas
            : [];

        lista.forEach(function(alternativa, indice) {
            const botao = document.createElement("button");

            botao.type = "button";
            botao.className = "alternativa";
            botao.textContent = alternativa;
            botao.dataset.indice = indice;

            botao.addEventListener("click", function() {
                selecionarAlternativa(indice);
            });

            alternativas.appendChild(botao);
        });
    }

    if (dificuldade) {
        dificuldade.value = 3;
    }

    if (proxima) {
        proxima.disabled = true;
    }

    estado.inicioQuestao = Date.now();
}

function selecionarAlternativa(indice) {
    const botoes = document.querySelectorAll(
        "#alternativas .alternativa"
    );

    botoes.forEach(function(botao) {
        botao.classList.remove("selecionada");
    });

    const selecionado = document.querySelector(
        '#alternativas .alternativa[data-indice="' +
        indice +
        '"]'
    );

    if (selecionado) {
        selecionado.classList.add("selecionada");
    }

    const proxima = document.getElementById("proxima");

    if (proxima) {
        proxima.disabled = false;
    }

    const questao = estado.questoes[estado.indiceAtual];

    if (questao) {
        questao._respostaSelecionada = indice;
    }
}

function obterIndiceCorreto(questao) {
    if (!questao) {
        return -1;
    }

    if (typeof questao.resposta_correta === "number") {
        return questao.resposta_correta;
    }

    if (typeof questao.resposta_correta === "string") {
        const valor = questao.resposta_correta.trim();
        const numero = Number(valor);

        if (!Number.isNaN(numero)) {
            return numero;
        }

        if (Array.isArray(questao.alternativas)) {
            return questao.alternativas.findIndex(function(item) {
                return String(item).trim() === valor;
            });
        }
    }

    if (typeof questao.correta === "number") {
        return questao.correta;
    }

    if (typeof questao.correta === "string") {
        const numero = Number(questao.correta);

        if (!Number.isNaN(numero)) {
            return numero;
        }

        if (Array.isArray(questao.alternativas)) {
            return questao.alternativas.findIndex(function(item) {
                return String(item).trim() ===
                    String(questao.correta).trim();
            });
        }
    }

    return -1;
}

async function proximaQuestao() {
    const questao = estado.questoes[estado.indiceAtual];

    if (!questao) {
        return;
    }

    const selecionada = questao._respostaSelecionada;

    if (typeof selecionada !== "number") {
        alert("Selecione uma alternativa antes de continuar.");
        return;
    }

    const dificuldade =
        document.getElementById("dificuldade")?.value || "3";

    const tempo = estado.inicioQuestao
        ? (Date.now() - estado.inicioQuestao) / 1000
        : 0;

    const correta = obterIndiceCorreto(questao);

    const acertou = selecionada === correta;

    estado.respostas.push({
        questaoNumero: estado.indiceAtual + 1,
        estrategia: normalizarEstrategia(questao.estrategia),
        respostaSelecionada: selecionada,
        respostaCorreta: correta,
        acertou: acertou,
        tempo: Number(tempo.toFixed(2)),
        dificuldade: dificuldade
    });

    estado.indiceAtual++;

    if (estado.indiceAtual < QUESTOES_INICIAIS) {
        mostrarQuestao();
        return;
    }

    if (estado.indiceAtual === QUESTOES_INICIAIS) {
        await gerarQuestoesAdaptativas();
        return;
    }

    if (estado.indiceAtual < TOTAL_QUESTOES) {
        mostrarQuestao();
        return;
    }

    await finalizarAvaliacao();
}

async function gerarQuestoesAdaptativas() {
    try {
        const resultadosParciais =
            calcularResultados(estado.respostas);

        const melhor =
            obterMelhorEstrategia(resultadosParciais);

        const dados = await chamarAPI(
            "gerar_adaptativas",
            {
                aluno: {
                    nome: estado.nome,
                    idade: estado.idade,
                    ano: estado.ano,
                    materia: estado.materia,
                    conteudo: estado.conteudo,
                    observacoes: estado.observacoes
                },
                estrategia: melhor,
                respostas: estado.respostas,
                questoes: estado.questoesIniciais
            }
        );

        if (
            !dados ||
            !Array.isArray(dados.questoes) ||
            dados.questoes.length !== QUESTOES_ADAPTATIVAS
        ) {
            throw new Error(
                "A IA não retornou as 6 questões adaptativas."
            );
        }

        estado.questoesAdaptativas =
            dados.questoes.map(function(questao) {
                return {
                    ...questao,
                    estrategia: "Repetição adaptativa"
                };
            });

        estado.questoes = [
            ...estado.questoesIniciais,
            ...estado.questoesAdaptativas
        ];

        estado.indiceAtual = QUESTOES_INICIAIS;

        mostrarQuestao();

    } catch (erro) {
        console.error(erro);

        mostrarTela("configuracao");

        alert(
            "Erro ao gerar as questões adaptativas:\n\n" +
            erro.message
        );
    }
}

function calcularResultados(respostas) {
    const grupos = {};

    ESTRATEGIAS.forEach(function(estrategia) {
        grupos[estrategia] = {
            acertos: 0,
            total: 0,
            tempos: []
        };
    });

    respostas.forEach(function(resposta) {
        const estrategia =
            normalizarEstrategia(resposta.estrategia);

        if (!grupos[estrategia]) {
            grupos[estrategia] = {
                acertos: 0,
                total: 0,
                tempos: []
            };
        }

        grupos[estrategia].total++;

        if (resposta.acertou) {
            grupos[estrategia].acertos++;
        }

        grupos[estrategia].tempos.push(
            Number(resposta.tempo) || 0
        );
    });

    return ESTRATEGIAS.map(function(estrategia) {
        const grupo = grupos[estrategia];

        const percentualAcertos =
            grupo.total > 0
                ? (grupo.acertos / grupo.total) * 100
                : 0;

        const tempoMedio =
            grupo.tempos.length > 0
                ? grupo.tempos.reduce(function(a, b) {
                    return a + b;
                }, 0) / grupo.tempos.length
                : 0;

        const eficienciaTempo = Math.min(
            100,
            (9 / Math.max(tempoMedio, 1)) * 100
        );

        const indice =
            percentualAcertos * 0.70 +
            eficienciaTempo * 0.30;

        return {
            estrategia: estrategia,
            acertos: grupo.acertos,
            total: grupo.total,
            tempoMedio: tempoMedio,
            indice: indice
        };
    });
}

function obterMelhorEstrategia(resultados) {
    if (!Array.isArray(resultados) || resultados.length === 0) {
        return ESTRATEGIAS[0];
    }

    let melhor = resultados[0];

    resultados.forEach(function(resultado) {
        if (resultado.indice > melhor.indice) {
            melhor = resultado;
        }
    });

    return melhor.estrategia;
}

function calcularNotaGeral(respostas) {
    if (!respostas || respostas.length === 0) {
        return 0;
    }

    const acertos = respostas.filter(function(item) {
        return item.acertou;
    }).length;

    return (acertos / respostas.length) * 100;
}

async function finalizarAvaliacao() {
    estado.resultados =
        calcularResultados(estado.respostas);

    estado.melhorEstrategia =
        obterMelhorEstrategia(estado.resultados);

    estado.notaGeral =
        calcularNotaGeral(estado.respostas);

    preencherInformacoesAluno();
    preencherTabela();
    preencherMelhorMetodo();

    mostrarTela("resultado");

    await gerarAtividades();
}

function preencherInformacoesAluno() {
    definirTexto("resultadoNome", estado.nome);
    definirTexto("resultadoIdade", estado.idade);
    definirTexto("resultadoAno", estado.ano);
    definirTexto("resultadoMateria", estado.materia);
    definirTexto("resultadoConteudo", estado.conteudo);
    definirTexto(
        "resultadoObservacoes",
        estado.observacoes || "Nenhuma"
    );
}

function preencherTabela() {
    const mapa = {
        "Divisão em etapas": [
            "acertos1",
            "tempo1",
            "indice1"
        ],
        "Apoio visual": [
            "acertos2",
            "tempo2",
            "indice2"
        ],
        "Instruções claras": [
            "acertos3",
            "tempo3",
            "indice3"
        ],
        "Repetição adaptativa": [
            "acertos4",
            "tempo4",
            "indice4"
        ]
    };

    estado.resultados.forEach(function(resultado) {
        const campos = mapa[resultado.estrategia];

        if (!campos) {
            return;
        }

        definirTexto(
            campos[0],
            resultado.acertos + "/" + resultado.total
        );

        definirTexto(
            campos[1],
            formatarNumero(resultado.tempoMedio) + " s"
        );

        definirTexto(
            campos[2],
            formatarNumero(resultado.indice) + "%"
        );
    });

    definirTexto(
        "notaGeral",
        formatarNumero(estado.notaGeral) + "%"
    );
}

function preencherMelhorMetodo() {
    definirTexto(
        "melhorMetodo",
        estado.melhorEstrategia
    );

    const explicacoes = {
        "Divisão em etapas":
            "Apresentar o conteúdo de forma organizada em etapas menores pode facilitar a compreensão e a realização da atividade.",

        "Apoio visual":
            "Utilizar elementos visuais pode auxiliar na compreensão e na organização das informações.",

        "Instruções claras":
            "Fornecer instruções objetivas e organizadas pode facilitar a interpretação e a execução das atividades.",

        "Repetição adaptativa":
            "Adaptar novas atividades a partir do desempenho anterior permite reforçar conteúdos de acordo com as necessidades observadas."
    };

    definirTexto(
        "explicacaoMetodo",
        explicacoes[estado.melhorEstrategia] ||
        "A estratégia apresentou o maior índice de desempenho na avaliação."
    );
}

async function gerarAtividades() {
    const botao =
        document.getElementById("botaoAtividades");

    const lista =
        document.getElementById("listaAtividades");

    const descricao =
        document.getElementById("descricaoAtividades");

    if (descricao) {
        descricao.textContent =
            "Preparando atividades adaptadas com base nos resultados da avaliação...";
    }

    if (botao) {
        botao.disabled = true;
        botao.style.display = "none";
    }

    if (lista) {
        lista.innerHTML =
            "<p>Gerando atividades...</p>";
    }

    try {
        const dados = await chamarAPI(
            "gerar_atividades",
            {
                aluno: {
                    nome: estado.nome,
                    idade: estado.idade,
                    ano: estado.ano,
                    materia: estado.materia,
                    conteudo: estado.conteudo,
                    observacoes: estado.observacoes
                },

                estrategia: estado.melhorEstrategia,

                resultados: estado.resultados,

                respostas: estado.respostas
            }
        );

        if (
            !dados ||
            !Array.isArray(dados.atividades)
        ) {
            throw new Error(
                "A IA não retornou as atividades."
            );
        }

        estado.atividades = dados.atividades;

        renderizarAtividades();

        if (descricao) {
            descricao.textContent =
                "Atividades adaptadas com base na estratégia: " +
                estado.melhorEstrategia +
                ".";
        }

    } catch (erro) {
        console.error(erro);

        if (lista) {
            lista.innerHTML =
                "<p>Não foi possível gerar as atividades: " +
                escapeHTML(erro.message) +
                "</p>";
        }

        if (descricao) {
            descricao.textContent =
                "Ocorreu um erro ao preparar as atividades adaptadas.";
        }

        if (botao) {
            botao.disabled = false;
            botao.style.display = "block";
        }
    }
}

function renderizarAtividades() {
    const lista =
        document.getElementById("listaAtividades");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    estado.atividades.forEach(function(atividade, indice) {
        const bloco =
            document.createElement("div");

        bloco.className = "atividade-gerada";

        const titulo =
            escapeHTML(
                atividade.titulo ||
                "Atividade " + (indice + 1)
            );

        const descricao =
            escapeHTML(
                atividade.descricao || ""
            );

        const pergunta =
            escapeHTML(
                atividade.pergunta || ""
            );

        let alternativasHTML = "";

        if (Array.isArray(atividade.alternativas)) {
            alternativasHTML =
                atividade.alternativas.map(
                    function(alternativa, indiceAlternativa) {
                        return (
                            "<div>" +
                            "<strong>" +
                            String.fromCharCode(
                                65 + indiceAlternativa
                            ) +
                            ".</strong> " +
                            escapeHTML(alternativa) +
                            "</div>"
                        );
                    }
                ).join("");
        }

        bloco.innerHTML =
            "<h4>" + titulo + "</h4>" +
            "<p>" + descricao + "</p>" +
            "<p>" + pergunta + "</p>" +
            "<div>" + alternativasHTML + "</div>";

        lista.appendChild(bloco);
    });
}

function definirTexto(id, texto) {
    const elemento =
        document.getElementById(id);

    if (elemento) {
        elemento.textContent = texto ?? "";
    }
}

function formatarNumero(numero) {
    const valor = Number(numero);

    if (Number.isNaN(valor)) {
        return "0,00";
    }

    return valor.toFixed(2).replace(".", ",");
}

function escapeHTML(texto) {
    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizarEstrategia(estrategia) {
    if (!estrategia) {
        return "";
    }

    const texto = String(estrategia).trim();

    const mapa = {
        "divisao em etapas": "Divisão em etapas",
        "divisão em etapas": "Divisão em etapas",
        "apoio visual": "Apoio visual",
        "instrucoes claras": "Instruções claras",
        "instruções claras": "Instruções claras",
        "repeticao adaptativa": "Repetição adaptativa",
        "repetição adaptativa": "Repetição adaptativa"
    };

    return mapa[texto.toLowerCase()] || texto;
}

document.addEventListener("DOMContentLoaded", function() {
    estado = novoEstado();
    mostrarTela("inicio");
});
