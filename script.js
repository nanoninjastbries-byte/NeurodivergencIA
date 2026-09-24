/* ============================================================
   NEURODIVERGÊNCIA
   JavaScript da versão antiga
   ============================================================ */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";

const ESTRATEGIAS = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];

const ESTRATEGIAS_INICIAIS = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras"
];

let questaoAtual = 0;
let respostas = [];
let questoesIniciais = [];
let questoesAdaptativas = [];
let todasQuestões = [];
let dadosAluno = {};
let inicioQuestao = 0;
let estrategiaEscolhida = "";
let avaliacaoFinalizada = false;


/* ============================================================
   NAVEGAÇÃO ENTRE TELAS
   ============================================================ */

function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(tela => {
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


/* ============================================================
   INÍCIO
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const btnComecar =
        document.getElementById("btnComecar");

    const form =
        document.getElementById("formAvaliacao");

    const btnRegistrar =
        document.getElementById("registrarResposta");

    const btnProxima =
        document.getElementById("proxima");

    const btnAtividades =
        document.getElementById("btnAtividades");

    const btnReiniciar =
        document.getElementById("btnReiniciar");

    const btnNovaAvaliacao =
        document.getElementById("btnNovaAvaliacao");

    if (btnComecar) {
        btnComecar.addEventListener("click", () => {
            mostrarTela("configuracao");
        });
    }

    if (form) {
        form.addEventListener("submit", iniciarAvaliacao);
    }

    if (btnRegistrar) {
        btnRegistrar.addEventListener(
            "click",
            registrarResposta
        );
    }

    if (btnProxima) {
        btnProxima.addEventListener(
            "click",
            proximaQuestao
        );
    }

    if (btnAtividades) {
        btnAtividades.addEventListener(
            "click",
            mostrarAtividades
        );
    }

    if (btnReiniciar) {
        btnReiniciar.addEventListener(
            "click",
            reiniciar
        );
    }

    if (btnNovaAvaliacao) {
        btnNovaAvaliacao.addEventListener(
            "click",
            reiniciar
        );
    }

});


/* ============================================================
   INICIAR AVALIAÇÃO
   ============================================================ */

async function iniciarAvaliacao(event) {

    event.preventDefault();

    const nome =
        document.getElementById("nome").value.trim();

    const idade =
        document.getElementById("idade").value.trim();

    const ano =
        document.getElementById("ano").value.trim();

    const materia =
        document.getElementById("materia").value.trim();

    const conteudo =
        document.getElementById("conteudo").value.trim();

    const observacoes =
        document.getElementById("observacoes").value.trim();

    const erro =
        document.getElementById("erroConfiguracao");

    if (!nome || !idade || !ano || !materia || !conteudo) {

        if (erro) {
            erro.textContent =
                "Preencha todos os campos obrigatórios.";
            erro.hidden = false;
        }

        return;
    }

    if (erro) {
        erro.hidden = true;
    }

    dadosAluno = {
        nome,
        idade: Number(idade),
        ano,
        materia,
        conteudo,
        observacoes
    };

    questaoAtual = 0;
    respostas = [];
    questoesIniciais = [];
    questoesAdaptativas = [];
    todasQuestões = [];
    estrategiaEscolhida = "";
    avaliacaoFinalizada = false;

    mostrarTela("preparacao");

    atualizarPreparacao(
        "Criando atividades",
        "Gerando questões sobre o conteúdo."
    );

    try {

        const resposta =
            await chamarIAInicial();

        questoesIniciais =
            organizarQuestoesIniciais(
                resposta.questoes || resposta.questions || []
            );

        if (questoesIniciais.length !== 18) {
            throw new Error(
                `A IA retornou ${questoesIniciais.length} questões. Eram necessárias 18.`
            );
        }

        todasQuestões =
            [...questoesIniciais];

        atualizarPreparacao(
            "Organizando estratégias",
            "Separando as atividades por estratégia."
        );

        await esperar(500);

        atualizarPreparacao(
            "Preparando avaliação",
            "Finalizando a sequência de questões."
        );

        await esperar(500);

        const botao =
            document.getElementById(
                "btnIniciarExercicios"
            );

        const status =
            document.getElementById(
                "statusPreparacao"
            );

        if (status) {
            status.classList.remove("loading");
            status.innerHTML =
                "A avaliação está pronta.";
        }

        if (botao) {
            botao.hidden = false;
            botao.onclick = () => {
                questaoAtual = 0;
                mostrarTela("avaliacao");
                mostrarQuestao();
            };
        }

    } catch (erroIA) {

        console.error(erroIA);

        const status =
            document.getElementById(
                "statusPreparacao"
            );

        if (status) {
            status.classList.remove("loading");

            status.innerHTML = `
                <p>
                    Não foi possível preparar a avaliação.
                </p>
                <p style="margin-top:10px;">
                    ${escaparHTML(erroIA.message)}
                </p>
            `;
        }
    }
}


/* ============================================================
   CHAMADA PARA GERAR AS 18 QUESTÕES
   ============================================================ */

async function chamarIAInicial() {

    const payload = {

        action: "gerar_questoes",

        aluno: dadosAluno,

        estrategias: [
            {
                nome: "Divisão em etapas",
                quantidade: 6,
                instrucoes:
                    "Apresentar atividades que possam ser resolvidas por etapas, mantendo o conteúdo adequado ao ano escolar."
            },
            {
                nome: "Apoio visual",
                quantidade: 6,
                instrucoes:
                    "Apresentar atividades utilizando apoio visual quando isso ajudar na compreensão do conteúdo."
            },
            {
                nome: "Instruções claras",
                quantidade: 6,
                instrucoes:
                    "Apresentar atividades com instruções objetivas, diretas e organizadas."
            }
        ],

        quantidade_total: 18,

        contexto: {
            materia: dadosAluno.materia,
            conteudo: dadosAluno.conteudo,
            ano: dadosAluno.ano,
            idade: dadosAluno.idade,
            observacoes: dadosAluno.observacoes
        },

        instrucoes:
            `Criar atividades exclusivamente sobre a matéria "${dadosAluno.materia}" e o conteúdo "${dadosAluno.conteudo}". 
            Não criar questões genéricas de matemática ou de outra matéria.
            O conteúdo informado pelo estudante deve determinar o tema das questões.
            Criar exatamente 18 questões, sendo 6 para cada estratégia.
            Cada questão deve possuir quatro alternativas.
            A resposta correta deve estar entre as quatro alternativas.
            As questões devem ser adequadas ao ano escolar informado.`
    };

    return await fazerRequisicao(payload);
}


/* ============================================================
   ORGANIZAR QUESTÕES
   ============================================================ */

function organizarQuestoesIniciais(questoes) {

    const resultado = [];

    ESTRATEGIAS_INICIAIS.forEach(estrategia => {

        const encontradas =
            questoes.filter(q =>
                normalizarTexto(q.estrategia) ===
                normalizarTexto(estrategia)
            );

        encontradas
            .slice(0, 6)
            .forEach(q => {

                resultado.push(
                    normalizarQuestao(
                        q,
                        estrategia
                    )
                );

            });
    });

    return resultado;
}


/* ============================================================
   NORMALIZAR QUESTÃO
   ============================================================ */

function normalizarQuestao(questao, estrategia) {

    let alternativas =
        questao.alternativas || [];

    if (
        !Array.isArray(alternativas) ||
        alternativas.length !== 4
    ) {

        alternativas = [
            questao.alternativa_a,
            questao.alternativa_b,
            questao.alternativa_c,
            questao.alternativa_d
        ].filter(Boolean);

    }

    let correta =
        questao.resposta_correta ??
        questao.resposta ??
        questao.correta;

    if (typeof correta === "string") {

        correta =
            correta.trim().toUpperCase();

        if (
            correta === "A" ||
            correta === "B" ||
            correta === "C" ||
            correta === "D"
        ) {
            correta =
                ["A", "B", "C", "D"]
                    .indexOf(correta);
        } else {

            const indice =
                alternativas.findIndex(
                    alternativa =>
                        String(alternativa)
                            .trim()
                            .toLowerCase() ===
                        correta
                            .trim()
                            .toLowerCase()
                );

            correta =
                indice >= 0 ? indice : 0;
        }
    }

    if (
        typeof correta !== "number" ||
        correta < 0 ||
        correta > 3
    ) {
        correta = 0;
    }

    return {

        estrategia:
            questao.estrategia || estrategia,

        pergunta:
            questao.pergunta ||
            questao.enunciado ||
            "Questão",

        alternativas,

        correta,

        explicacao:
            questao.explicacao || "",

        passos:
            Array.isArray(questao.passos)
                ? questao.passos
                : [],

        visual:
            Array.isArray(questao.visual)
                ? questao.visual
                : []
    };
}


/* ============================================================
   MOSTRAR QUESTÃO
   ============================================================ */

function mostrarQuestao() {

    const questao =
        todasQuestões[questaoAtual];

    if (!questao) {
        return;
    }

    document.getElementById(
        "contador"
    ).textContent =
        `Questão ${questaoAtual + 1} de ${todasQuestões.length}`;

    document.getElementById(
        "estrategia"
    ).textContent =
        questao.estrategia;

    document.getElementById(
        "pergunta"
    ).textContent =
        questao.pergunta;

    const progresso =
        ((questaoAtual + 1) /
            todasQuestões.length) * 100;

    document.getElementById(
        "progresso"
    ).style.width =
        `${progresso}%`;

    const alternativas =
        document.getElementById(
            "alternativas"
        );

    alternativas.innerHTML = "";

    questao.alternativas.forEach(
        (alternativa, indice) => {

            const botao =
                document.createElement(
                    "button"
                );

            botao.type = "button";
            botao.className =
                "alternativa";

            botao.textContent =
                alternativa;

            botao.addEventListener(
                "click",
                () =>
                    selecionarAlternativa(
                        indice
                    )
            );

            alternativas.appendChild(
                botao
            );
        }
    );

    mostrarElementosDaEstrategia(
        questao
    );

    document.getElementById(
        "dificuldade"
    ).value = 2;

    document.getElementById(
        "registrarResposta"
    ).disabled = true;

    document.getElementById(
        "registrarResposta"
    ).classList.remove("oculto");

    document.getElementById(
        "proxima"
    ).classList.add("oculto");

    const feedback =
        document.getElementById(
            "feedback"
        );

    if (feedback) {
        feedback.hidden = true;
        feedback.innerHTML = "";
    }

    inicioQuestao =
        performance.now();
}


/* ============================================================
   ELEMENTOS ESPECÍFICOS DAS ESTRATÉGIAS
   ============================================================ */

function mostrarElementosDaEstrategia(
    questao
) {

    const passos =
        document.getElementById("passos");

    const listaPassos =
        document.getElementById("listaPassos");

    const visual =
        document.getElementById("visual");

    const listaVisual =
        document.getElementById("listaVisual");

    if (passos) {
        passos.hidden = true;
    }

    if (visual) {
        visual.hidden = true;
    }

    if (
        questao.estrategia ===
        "Divisão em etapas" &&
        questao.passos.length > 0
    ) {

        listaPassos.innerHTML = "";

        questao.passos.forEach(
            passo => {

                const li =
                    document.createElement(
                        "li"
                    );

                li.textContent = passo;

                listaPassos.appendChild(
                    li
                );
            }
        );

        passos.hidden = false;
    }

    if (
        questao.estrategia ===
        "Apoio visual" &&
        questao.visual.length > 0
    ) {

        listaVisual.innerHTML = "";

        questao.visual.forEach(
            item => {

                const p =
                    document.createElement(
                        "p"
                    );

                p.textContent = item;

                listaVisual.appendChild(
                    p
                );
            }
        );

        visual.hidden = false;
    }
}


/* ============================================================
   SELECIONAR ALTERNATIVA
   ============================================================ */

function selecionarAlternativa(indice) {

    document
        .querySelectorAll(".alternativa")
        .forEach(botao => {
            botao.classList.remove(
                "selecionada"
            );
        });

    const botoes =
        document.querySelectorAll(
            ".alternativa"
        );

    if (botoes[indice]) {
        botoes[indice]
            .classList.add(
                "selecionada"
            );
    }

    document.getElementById(
        "registrarResposta"
    ).disabled = false;

    window.alternativaSelecionada =
        indice;
}


/* ============================================================
   REGISTRAR RESPOSTA
   ============================================================ */

function registrarResposta() {

    if (
        typeof window
            .alternativaSelecionada !==
        "number"
    ) {
        alert(
            "Escolha uma alternativa antes de continuar."
        );
        return;
    }

    const questao =
        todasQuestões[questaoAtual];

    const indice =
        window.alternativaSelecionada;

    const dificuldade =
        Number(
            document.getElementById(
                "dificuldade"
            ).value
        );

    const tempo =
        Math.round(
            (performance.now() -
                inicioQuestao) / 1000
        );

    const correta =
        indice === questao.correta;

    respostas[questaoAtual] = {

        estrategia:
            questao.estrategia,

        pergunta:
            questao.pergunta,

        resposta:
            questao.alternativas[indice],

        respostaCorreta:
            questao.alternativas[
                questao.correta
            ],

        correta,

        dificuldade,

        tempo,

        questaoNumero:
            questaoAtual + 1
    };

    mostrarFeedback(
        questao,
        correta
    );

    document.getElementById(
        "registrarResposta"
    ).classList.add("oculto");

    document.getElementById(
        "proxima"
    ).classList.remove("oculto");

    window.alternativaSelecionada =
        undefined;
}


/* ============================================================
   FEEDBACK
   ============================================================ */

function mostrarFeedback(
    questao,
    correta
) {

    const feedback =
        document.getElementById(
            "feedback"
        );

    if (!feedback) {
        return;
    }

    feedback.hidden = false;

    if (correta) {

        feedback.className =
            "feedback correta";

        feedback.innerHTML =
            `<strong>Resposta correta.</strong>
             ${escaparHTML(
                 questao.explicacao
             )}`;

    } else {

        feedback.className =
            "feedback incorreta";

        feedback.innerHTML =
            `<strong>Resposta incorreta.</strong>
             ${escaparHTML(
                 questao.explicacao
             )}`;
    }
}


/* ============================================================
   PRÓXIMA QUESTÃO
   ============================================================ */

async function proximaQuestao() {

    questaoAtual++;

    if (
        questaoAtual <
        todasQuestões.length
    ) {

        mostrarQuestao();

        return;
    }

    /*
       Terminou as 18 questões iniciais.
       Agora a IA analisa o desempenho e
       cria as 6 questões adaptativas.
    */

    await prepararAdaptacao();
}


/* ============================================================
   ANÁLISE ADAPTATIVA
   ============================================================ */

async function prepararAdaptacao() {

    mostrarTela("adaptacao");

    const status =
        document.getElementById(
            "statusAdaptacao"
        );

    if (status) {
        status.textContent =
            "Analisando as respostas...";
    }

    try {

        estrategiaEscolhida =
            escolherEstrategia();

        if (status) {
            status.textContent =
                `A IA identificou a estratégia ${estrategiaEscolhida} como referência para a adaptação.`;
        }

        await esperar(700);

        if (status) {
            status.textContent =
                "Criando as atividades adaptativas...";
        }

        const resposta =
            await chamarIAAdaptativa();

        questoesAdaptativas =
            (resposta.questoes ||
                resposta.questions ||
                [])
                .slice(0, 6)
                .map(q =>
                    normalizarQuestao(
                        q,
                        "Repetição adaptativa"
                    )
                );

        if (
            questoesAdaptativas.length !== 6
        ) {
            throw new Error(
                `A IA retornou ${questoesAdaptativas.length} atividades adaptativas. Eram necessárias 6.`
            );
        }

        todasQuestões = [
            ...questoesIniciais,
            ...questoesAdaptativas
        ];

        questaoAtual =
            questoesIniciais.length;

        if (status) {
            status.textContent =
                "Avaliação adaptativa pronta.";
        }

        await esperar(700);

        mostrarTela("avaliacao");

        mostrarQuestao();

    } catch (erro) {

        console.error(erro);

        if (status) {

            status.classList.remove(
                "loading"
            );

            status.innerHTML =
                `<p>Não foi possível preparar as atividades adaptativas.</p>
                 <p style="margin-top:10px;">
                 ${escaparHTML(
                     erro.message
                 )}
                 </p>`;
        }
    }
}


/* ============================================================
   ESCOLHER ESTRATÉGIA
   ============================================================ */

function escolherEstrategia() {

    const resultados = {};

    ESTRATEGIAS_INICIAIS.forEach(
        estrategia => {

            resultados[estrategia] = {
                total: 0,
                acertos: 0,
                dificuldade: 0,
                tempo: 0
            };

        }
    );

    respostas.forEach(resposta => {

        if (
            !resultados[
                resposta.estrategia
            ]
        ) {
            return;
        }

        resultados[
            resposta.estrategia
        ].total++;

        if (resposta.correta) {
            resultados[
                resposta.estrategia
            ].acertos++;
        }

        resultados[
            resposta.estrategia
        ].dificuldade +=
            resposta.dificuldade;

        resultados[
            resposta.estrategia
        ].tempo +=
            resposta.tempo;
    });

    let melhor =
        ESTRATEGIAS_INICIAIS[0];

    let maiorPontuacao = -Infinity;

    ESTRATEGIAS_INICIAIS.forEach(
        estrategia => {

            const dados =
                resultados[estrategia];

            if (!dados.total) {
                return;
            }

            const acerto =
                dados.acertos /
                dados.total;

            const dificuldadeMedia =
                dados.dificuldade /
                dados.total;

            const tempoMedio =
                dados.tempo /
                dados.total;

            /*
              Índice usado apenas para orientar
              a adaptação da plataforma.

              Acerto: 50%
              Tempo: 20%
              Dificuldade: 15%
              Consistência: 15%
            */

            const notaAcerto =
                acerto * 50;

            const notaTempo =
                Math.max(
                    0,
                    20 -
                    Math.min(
                        tempoMedio,
                        20
                    )
                );

            const notaDificuldade =
                ((4 -
                    dificuldadeMedia) /
                    3) * 15;

            const consistencia =
                acerto * 15;

            const pontuacao =
                notaAcerto +
                notaTempo +
                notaDificuldade +
                consistencia;

            if (
                pontuacao >
                maiorPontuacao
            ) {

                maiorPontuacao =
                    pontuacao;

                melhor =
                    estrategia;
            }
        }
    );

    return melhor;
}


/* ============================================================
   CHAMAR IA PARA ADAPTAÇÃO
   ============================================================ */

async function chamarIAAdaptativa() {

    const desempenho =
        calcularDesempenho();

    const payload = {

        action:
            "gerar_adaptativas",

        aluno:
            dadosAluno,

        estrategiaSelecionada:
            estrategiaEscolhida,

        quantidade: 6,

        desempenho,

        respostas,

        questoes:
            questoesIniciais,

        instrucoes:
            `Criar exatamente 6 novas atividades de Repetição adaptativa.
            As atividades devem continuar sendo sobre a matéria "${dadosAluno.materia}" 
            e o conteúdo "${dadosAluno.conteudo}".
            Adaptar o nível e a forma de apresentação com base no desempenho do estudante.
            Não mudar a matéria.
            Não criar questões genéricas.
            Usar quatro alternativas por questão.
            As atividades devem ajudar o estudante a continuar aprendendo o conteúdo.`
    };

    return await fazerRequisicao(
        payload
    );
}


/* ============================================================
   CALCULAR DESEMPENHO
   ============================================================ */

function calcularDesempenho() {

    const desempenho = {};

    ESTRATEGIAS_INICIAIS.forEach(
        estrategia => {

            desempenho[estrategia] = {
                total: 0,
                acertos: 0,
                percentual: 0,
                dificuldadeMedia: 0,
                tempoMedio: 0
            };

        }
    );

    respostas.forEach(resposta => {

        if (
            !desempenho[
                resposta.estrategia
            ]
        ) {
            return;
        }

        const dados =
            desempenho[
                resposta.estrategia
            ];

        dados.total++;

        if (resposta.correta) {
            dados.acertos++;
        }

        dados.dificuldadeMedia +=
            resposta.dificuldade;

        dados.tempoMedio +=
            resposta.tempo;
    });

    Object.keys(desempenho)
        .forEach(estrategia => {

            const dados =
                desempenho[estrategia];

            if (dados.total > 0) {

                dados.percentual =
                    Math.round(
                        (dados.acertos /
                            dados.total) *
                        100
                    );

                dados.dificuldadeMedia =
                    Number(
                        (
                            dados.dificuldadeMedia /
                            dados.total
                        ).toFixed(2)
                    );

                dados.tempoMedio =
                    Number(
                        (
                            dados.tempoMedio /
                            dados.total
                        ).toFixed(2)
                    );
            }
        });

    return desempenho;
}


/* ============================================================
   REQUISIÇÃO PARA GOOGLE APPS SCRIPT
   ============================================================ */

async function fazerRequisicao(
    payload
) {

    const resposta =
        await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify(payload)
            }
        );

    if (!resposta.ok) {

        throw new Error(
            `Erro HTTP ${resposta.status}`
        );
    }

    const texto =
        await resposta.text();

    let dados;

    try {

        dados =
            JSON.parse(texto);

    } catch (erro) {

        throw new Error(
            "O servidor não retornou um JSON válido."
        );
    }

    /*
       Algumas versões do Apps Script
       podem devolver o JSON dentro de "body".
    */

    if (
        dados &&
        typeof dados.body === "string"
    ) {

        try {
            dados =
                JSON.parse(dados.body);
        } catch (erro) {
            // mantém o resultado original
        }
    }

    if (
        dados &&
        dados.ok === false
    ) {

        throw new Error(
            dados.erro ||
            dados.error ||
            "A IA não conseguiu gerar as atividades."
        );
    }

    return dados;
}


/* ============================================================
   RESULTADO
   ============================================================ */

function mostrarResultado() {

    avaliacaoFinalizada = true;

    const desempenho =
        calcularDesempenho();

    ESTRATEGIAS.forEach(
        (estrategia, indice) => {

            const elemento =
                document.getElementById(
                    `resultado${indice + 1}`
                );

            if (!elemento) {
                return;
            }

            if (
                estrategia ===
                "Repetição adaptativa"
            ) {

                const adaptativas =
                    respostas.filter(
                        resposta =>
                            resposta.estrategia ===
                            "Repetição adaptativa"
                    );

                if (
                    adaptativas.length > 0
                ) {

                    const acertos =
                        adaptativas.filter(
                            resposta =>
                                resposta.correta
                        ).length;

                    const porcentagem =
                        Math.round(
                            (acertos /
                                adaptativas.length) *
                            100
                        );

                    elemento.textContent =
                        `${porcentagem}%`;

                } else {

                    elemento.textContent =
                        "—";
                }

                return;
            }

            const dados =
                desempenho[estrategia];

            elemento.textContent =
                dados
                    ? `${dados.percentual}%`
                    : "0%";
        }
    );

    const mensagem =
        document.getElementById(
            "mensagemResultado"
        );

    if (mensagem) {

        mensagem.innerHTML = `
            <p>
                A avaliação foi concluída.
            </p>

            <p style="margin-top:10px;">
                A estratégia que apresentou o melhor
                desempenho inicial foi
                <strong>
                    ${escaparHTML(
                        estrategiaEscolhida
                    )}
                </strong>.
            </p>

            <p style="margin-top:10px;">
                As atividades adaptativas foram criadas
                considerando o desempenho observado
                durante a avaliação.
            </p>
        `;
    }

    mostrarTela("resultado");
}


/* ============================================================
   ATIVIDADES ADAPTADAS
   ============================================================ */

function mostrarAtividades() {

    mostrarTela("atividades");

    const lista =
        document.getElementById(
            "listaAtividades"
        );

    if (!lista) {
        return;
    }

    if (
        !questoesAdaptativas.length
    ) {

        lista.innerHTML =
            "<p>Não há atividades adaptativas disponíveis.</p>";

        return;
    }

    lista.innerHTML = "";

    questoesAdaptativas.forEach(
        (questao, indice) => {

            const atividade =
                document.createElement(
                    "div"
                );

            atividade.className =
                "atividade";

            const titulo =
                document.createElement(
                    "h3"
                );

            titulo.textContent =
                `Atividade ${indice + 1}`;

            const pergunta =
                document.createElement(
                    "p"
                );

            pergunta.textContent =
                questao.pergunta;

            atividade.appendChild(
                titulo
            );

            atividade.appendChild(
                pergunta
            );

            const listaAlternativas =
                document.createElement(
                    "div"
                );

            questao.alternativas
                .forEach(
                    alternativa => {

                        const p =
                            document.createElement(
                                "p"
                            );

                        p.style.marginTop =
                            "8px";

                        p.textContent =
                            alternativa;

                        listaAlternativas
                            .appendChild(p);
                    }
                );

            atividade.appendChild(
                listaAlternativas
            );

            lista.appendChild(
                atividade
            );
        }
    );
}


/* ============================================================
   PREPARAÇÃO
   ============================================================ */

function atualizarPreparacao(
    titulo,
    texto
) {

    const status =
        document.getElementById(
            "statusPreparacao"
        );

    if (!status) {
        return;
    }

    status.innerHTML = `
        <strong>${escaparHTML(
            titulo
        )}</strong>

        <p style="margin-top:8px;">
            ${escaparHTML(texto)}
        </p>
    `;
}


/* ============================================================
   REINICIAR
   ============================================================ */

function reiniciar() {

    questaoAtual = 0;
    respostas = [];
    questoesIniciais = [];
    questoesAdaptativas = [];
    todasQuestões = [];
    dadosAluno = {};
    estrategiaEscolhida = "";
    avaliacaoFinalizada = false;
    window.alternativaSelecionada =
        undefined;

    const form =
        document.getElementById(
            "formAvaliacao"
        );

    if (form) {
        form.reset();
    }

    const botao =
        document.getElementById(
            "btnIniciarExercicios"
        );

    if (botao) {
        botao.hidden = true;
    }

    mostrarTela("inicio");
}


/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function esperar(ms) {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


function normalizarTexto(texto) {

    return String(texto || "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase();
}


function escaparHTML(texto) {

    return String(texto || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
