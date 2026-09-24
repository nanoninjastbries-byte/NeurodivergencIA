/* ============================================================
   NEURODIVERGÊNC IA
   SCRIPT PRINCIPAL
   ============================================================ */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";


const ESTRATEGIAS_INICIAIS = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras"
];


const ESTRATEGIAS = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];


let questaoAtual = 0;
let questoesIniciais = [];
let questoesAdaptativas = [];
let todasQuestoes = [];
let respostas = [];

let dadosAluno = {};

let alternativaSelecionada = null;

let inicioQuestao = 0;

let estrategiaEscolhida = "";


/* ============================================================
   NAVEGAÇÃO
   ============================================================ */

function mostrarTela(id) {

    document.querySelectorAll(".tela").forEach(
        tela => {
            tela.classList.remove("ativa");
        }
    );


    const tela =
        document.getElementById(id);


    if (!tela) {
        console.error(
            "Tela não encontrada:",
            id
        );
        return;
    }


    tela.classList.add("ativa");


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        document
            .getElementById("btnComecar")
            ?.addEventListener(
                "click",
                function () {
                    mostrarTela(
                        "configuracao"
                    );
                }
            );


        document
            .getElementById("formAvaliacao")
            ?.addEventListener(
                "submit",
                iniciarAvaliacao
            );


        document
            .getElementById("registrarResposta")
            ?.addEventListener(
                "click",
                registrarResposta
            );


        document
            .getElementById("proxima")
            ?.addEventListener(
                "click",
                proximaQuestao
            );


        document
            .getElementById("btnAtividades")
            ?.addEventListener(
                "click",
                mostrarAtividades
            );


        document
            .getElementById("btnReiniciar")
            ?.addEventListener(
                "click",
                reiniciar
            );


        document
            .getElementById("btnNovaAvaliacao")
            ?.addEventListener(
                "click",
                reiniciar
            );

    }
);


/* ============================================================
   INICIAR AVALIAÇÃO
   ============================================================ */

async function iniciarAvaliacao(event) {

    /*
     * O event é opcional.
     * Isso evita o erro caso o HTML antigo
     * ainda chame iniciarAvaliacao().
     */

    if (event) {
        event.preventDefault();
    }


    const nome =
        document
            .getElementById("nome")
            .value
            .trim();


    const idade =
        document
            .getElementById("idade")
            .value
            .trim();


    const ano =
        document
            .getElementById("ano")
            .value
            .trim();


    const materia =
        document
            .getElementById("materia")
            .value
            .trim();


    const conteudo =
        document
            .getElementById("conteudo")
            .value
            .trim();


    const observacoes =
        document
            .getElementById("observacoes")
            .value
            .trim();


    const erro =
        document.getElementById(
            "erroConfiguracao"
        );


    if (
        !nome ||
        !idade ||
        !ano ||
        !materia ||
        !conteudo
    ) {

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

        nome: nome,

        idade: Number(idade),

        ano: ano,

        materia: materia,

        conteudo: conteudo,

        observacoes: observacoes

    };


    questaoAtual = 0;

    questoesIniciais = [];

    questoesAdaptativas = [];

    todasQuestoes = [];

    respostas = [];

    alternativaSelecionada = null;

    estrategiaEscolhida = "";


    mostrarTela(
        "preparacao"
    );


    atualizarPreparacao(
        "Criando atividades",
        "Gerando questões sobre o conteúdo."
    );


    try {

        const dados =
            await gerarQuestoesIniciais();


        questoesIniciais =
            organizarQuestoesIniciais(
                dados.questoes || []
            );


        if (
            questoesIniciais.length !==
            18
        ) {

            throw new Error(
                "A IA não retornou exatamente 18 questões."
            );

        }


        todasQuestoes =
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

            status.classList.remove(
                "loading"
            );

            status.innerHTML =
                "A avaliação está pronta.";

        }


        if (botao) {

            botao.hidden = false;

            botao.onclick =
                function () {

                    questaoAtual = 0;

                    mostrarTela(
                        "avaliacao"
                    );

                    mostrarQuestao();

                };

        }

    } catch (erroIA) {

        console.error(
            erroIA
        );


        const status =
            document.getElementById(
                "statusPreparacao"
            );


        if (status) {

            status.classList.remove(
                "loading"
            );


            status.innerHTML = `
                <p>
                    Não foi possível preparar a avaliação.
                </p>

                <p style="margin-top:10px;">
                    ${escaparHTML(
                        erroIA.message
                    )}
                </p>
            `;

        }

    }

}


/* ============================================================
   GERAR 18 QUESTÕES
   ============================================================ */

async function gerarQuestoesIniciais() {

    const payload = {

        action:
            "gerar_questoes",

        aluno:
            dadosAluno,

        quantidade_total:
            18,

        estrategias: [

            {
                nome:
                    "Divisão em etapas",

                quantidade:
                    6
            },

            {
                nome:
                    "Apoio visual",

                quantidade:
                    6
            },

            {
                nome:
                    "Instruções claras",

                quantidade:
                    6
            }

        ]

    };


    return await fazerRequisicao(
        payload
    );

}


/* ============================================================
   ORGANIZAR QUESTÕES
   ============================================================ */

function organizarQuestoesIniciais(
    questoes
) {

    const resultado = [];


    ESTRATEGIAS_INICIAIS.forEach(
        estrategia => {

            const grupo =
                questoes.filter(
                    questao =>
                        normalizarTexto(
                            questao.estrategia
                        ) ===
                        normalizarTexto(
                            estrategia
                        )
                );


            grupo
                .slice(0, 6)
                .forEach(
                    questao => {

                        resultado.push(
                            normalizarQuestao(
                                questao,
                                estrategia
                            )
                        );

                    }
                );

        }
    );


    return resultado;
}


/* ============================================================
   NORMALIZAR QUESTÃO
   ============================================================ */

function normalizarQuestao(
    questao,
    estrategia
) {

    let alternativas =
        questao.alternativas;


    if (
        !Array.isArray(
            alternativas
        )
    ) {

        alternativas = [

            questao.alternativa_a,

            questao.alternativa_b,

            questao.alternativa_c,

            questao.alternativa_d

        ];

    }


    let correta =
        questao.correta ??
        questao.resposta_correta ??
        questao.resposta;


    if (
        typeof correta ===
        "string"
    ) {

        const letra =
            correta
                .trim()
                .toUpperCase();


        if (
            ["A", "B", "C", "D"]
                .includes(letra)
        ) {

            correta =
                ["A", "B", "C", "D"]
                    .indexOf(letra);

        } else {

            const indice =
                alternativas.findIndex(
                    alternativa =>
                        String(
                            alternativa
                        )
                        .trim()
                        .toLowerCase() ===
                        correta
                            .trim()
                            .toLowerCase()
                );


            correta =
                indice >= 0
                    ? indice
                    : 0;

        }

    }


    if (
        typeof correta !==
        "number"
    ) {
        correta = 0;
    }


    return {

        estrategia:
            questao.estrategia ||
            estrategia,

        pergunta:
            questao.pergunta ||
            questao.enunciado ||
            "Questão",

        alternativas:
            alternativas.slice(0, 4),

        correta:
            correta,

        explicacao:
            questao.explicacao ||
            "",

        passos:
            Array.isArray(
                questao.passos
            )
                ? questao.passos
                : [],

        visual:
            Array.isArray(
                questao.visual
            )
                ? questao.visual
                : []

    };

}


/* ============================================================
   MOSTRAR QUESTÃO
   ============================================================ */

function mostrarQuestao() {

    const questao =
        todasQuestoes[
            questaoAtual
        ];


    if (!questao) {
        return;
    }


    document.getElementById(
        "contador"
    ).textContent =
        `Questão ${questaoAtual + 1} de ${todasQuestoes.length}`;


    document.getElementById(
        "estrategia"
    ).textContent =
        questao.estrategia;


    document.getElementById(
        "pergunta"
    ).textContent =
        questao.pergunta;


    const porcentagem =
        (
            (questaoAtual + 1) /
            todasQuestoes.length
        ) * 100;


    document.getElementById(
        "progresso"
    ).style.width =
        `${porcentagem}%`;


    const alternativas =
        document.getElementById(
            "alternativas"
        );


    alternativas.innerHTML =
        "";


    questao.alternativas.forEach(
        function (
            alternativa,
            indice
        ) {

            const botao =
                document.createElement(
                    "button"
                );


            botao.type =
                "button";


            botao.className =
                "alternativa";


            botao.textContent =
                alternativa;


            botao.addEventListener(
                "click",
                function () {

                    selecionarAlternativa(
                        indice
                    );

                }
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
    ).classList.remove(
        "oculto"
    );


    document.getElementById(
        "proxima"
    ).classList.add(
        "oculto"
    );


    const feedback =
        document.getElementById(
            "feedback"
        );


    if (feedback) {

        feedback.hidden =
            true;

        feedback.innerHTML =
            "";

    }


    alternativaSelecionada =
        null;


    inicioQuestao =
        performance.now();

}


/* ============================================================
   ELEMENTOS DA ESTRATÉGIA
   ============================================================ */

function mostrarElementosDaEstrategia(
    questao
) {

    const passos =
        document.getElementById(
            "passos"
        );


    const listaPassos =
        document.getElementById(
            "listaPassos"
        );


    const visual =
        document.getElementById(
            "visual"
        );


    const listaVisual =
        document.getElementById(
            "listaVisual"
        );


    if (passos) {
        passos.hidden = true;
    }


    if (visual) {
        visual.hidden = true;
    }


    if (
        questao.estrategia ===
        "Divisão em etapas" &&
        questao.passos.length
    ) {

        listaPassos.innerHTML =
            "";


        questao.passos.forEach(
            passo => {

                const li =
                    document.createElement(
                        "li"
                    );


                li.textContent =
                    passo;


                listaPassos.appendChild(
                    li
                );

            }
        );


        passos.hidden =
            false;

    }


    if (
        questao.estrategia ===
        "Apoio visual" &&
        questao.visual.length
    ) {

        listaVisual.innerHTML =
            "";


        questao.visual.forEach(
            item => {

                const p =
                    document.createElement(
                        "p"
                    );


                p.textContent =
                    item;


                listaVisual.appendChild(
                    p
                );

            }
        );


        visual.hidden =
            false;

    }

}


/* ============================================================
   SELECIONAR ALTERNATIVA
   ============================================================ */

function selecionarAlternativa(
    indice
) {

    document
        .querySelectorAll(
            ".alternativa"
        )
        .forEach(
            botao =>
                botao.classList.remove(
                    "selecionada"
                )
        );


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


    alternativaSelecionada =
        indice;


    document.getElementById(
        "registrarResposta"
    ).disabled = false;

}


/* ============================================================
   REGISTRAR RESPOSTA
   ============================================================ */

function registrarResposta() {

    if (
        alternativaSelecionada ===
        null
    ) {

        alert(
            "Escolha uma alternativa antes de continuar."
        );

        return;
    }


    const questao =
        todasQuestoes[
            questaoAtual
        ];


    const dificuldade =
        Number(
            document.getElementById(
                "dificuldade"
            ).value
        );


    const tempo =
        Math.round(
            (
                performance.now() -
                inicioQuestao
            ) / 1000
        );


    const correta =
        alternativaSelecionada ===
        questao.correta;


    respostas[
        questaoAtual
    ] = {

        estrategia:
            questao.estrategia,

        pergunta:
            questao.pergunta,

        resposta:
            questao.alternativas[
                alternativaSelecionada
            ],

        respostaCorreta:
            questao.alternativas[
                questao.correta
            ],

        correta:
            correta,

        dificuldade:
            dificuldade,

        tempo:
            tempo

    };


    mostrarFeedback(
        questao,
        correta
    );


    document.getElementById(
        "registrarResposta"
    ).classList.add(
        "oculto"
    );


    document.getElementById(
        "proxima"
    ).classList.remove(
        "oculto"
    );


    alternativaSelecionada =
        null;

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


    feedback.hidden =
        false;


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
        questoesIniciais.length
    ) {

        mostrarQuestao();

        return;

    }


    if (
        questaoAtual ===
        questoesIniciais.length
    ) {

        await prepararAdaptacao();

        return;

    }


    if (
        questaoAtual <
        todasQuestoes.length
    ) {

        mostrarQuestao();

        return;

    }


    mostrarResultado();

}


/* ============================================================
   PREPARAR ADAPTAÇÃO
   ============================================================ */

async function prepararAdaptacao() {

    mostrarTela(
        "adaptacao"
    );


    const status =
        document.getElementById(
            "statusAdaptacao"
        );


    try {

        status.textContent =
            "Analisando as respostas...";


        const desempenho =
            calcularDesempenho();


        estrategiaEscolhida =
            escolherEstrategia(
                desempenho
            );


        await esperar(500);


        status.textContent =
            "Criando as atividades adaptativas...";


        const resposta =
            await gerarQuestoesAdaptativas(
                desempenho
            );


        questoesAdaptativas =
            (resposta.questoes || [])
                .slice(0, 6)
                .map(
                    questao =>
                        normalizarQuestao(
                            questao,
                            "Repetição adaptativa"
                        )
                );


        if (
            questoesAdaptativas.length !==
            6
        ) {

            throw new Error(
                "A IA não retornou exatamente 6 questões adaptativas."
            );

        }


        todasQuestoes =
            questoesIniciais.concat(
                questoesAdaptativas
            );


        questaoAtual =
            questoesIniciais.length;


        status.textContent =
            "Avaliação adaptativa pronta.";


        await esperar(700);


        mostrarTela(
            "avaliacao"
        );


        mostrarQuestao();

    } catch (erro) {

        console.error(
            erro
        );


        status.innerHTML =
            `<p>
                Não foi possível preparar as atividades adaptativas.
            </p>
            <p style="margin-top:10px;">
                ${escaparHTML(
                    erro.message
                )}
            </p>`;

    }

}


/* ============================================================
   GERAR ADAPTATIVAS
   ============================================================ */

async function gerarQuestoesAdaptativas(
    desempenho
) {

    const payload = {

        action:
            "gerar_adaptativas",

        aluno:
            dadosAluno,

        estrategiaSelecionada:
            estrategiaEscolhida,

        desempenho:
            desempenho,

        respostas:
            respostas,

        quantidade:
            6

    };


    return await fazerRequisicao(
        payload
    );

}


/* ============================================================
   DESEMPENHO
   ============================================================ */

function calcularDesempenho() {

    const resultado = {};


    ESTRATEGIAS_INICIAIS.forEach(
        estrategia => {

            resultado[
                estrategia
            ] = {

                total: 0,

                acertos: 0,

                percentual: 0,

                dificuldade: 0,

                tempo: 0

            };

        }
    );


    respostas
        .slice(
            0,
            questoesIniciais.length
        )
        .forEach(
            resposta => {

                if (
                    !resultado[
                        resposta.estrategia
                    ]
                ) {
                    return;
                }


                resultado[
                    resposta.estrategia
                ].total++;


                if (
                    resposta.correta
                ) {

                    resultado[
                        resposta.estrategia
                    ].acertos++;

                }


                resultado[
                    resposta.estrategia
                ].dificuldade +=
                    resposta.dificuldade;


                resultado[
                    resposta.estrategia
                ].tempo +=
                    resposta.tempo;

            }
        );


    ESTRATEGIAS_INICIAIS.forEach(
        estrategia => {

            const dados =
                resultado[
                    estrategia
                ];


            if (
                dados.total > 0
            ) {

                dados.percentual =
                    Math.round(
                        (
                            dados.acertos /
                            dados.total
                        ) * 100
                    );


                dados.dificuldadeMedia =
                    Number(
                        (
                            dados.dificuldade /
                            dados.total
                        ).toFixed(2)
                    );


                dados.tempoMedio =
                    Number(
                        (
                            dados.tempo /
                            dados.total
                        ).toFixed(2)
                    );

            }

        }
    );


    return resultado;

}


/* ============================================================
   ESCOLHER ESTRATÉGIA
   ============================================================ */

function escolherEstrategia(
    desempenho
) {

    let melhor =
        ESTRATEGIAS_INICIAIS[0];


    let maior =
        -Infinity;


    ESTRATEGIAS_INICIAIS.forEach(
        estrategia => {

            const dados =
                desempenho[
                    estrategia
                ];


            if (!dados) {
                return;
            }


            const pontuacao =
                dados.percentual;


            if (
                pontuacao >
                maior
            ) {

                maior =
                    pontuacao;

                melhor =
                    estrategia;

            }

        }
    );


    return melhor;

}


/* ============================================================
   RESULTADO
   ============================================================ */

function mostrarResultado() {

    const desempenho =
        calcularDesempenho();


    document.getElementById(
        "resultado1"
    ).textContent =
        `${desempenho["Divisão em etapas"]?.percentual || 0}%`;


    document.getElementById(
        "resultado2"
    ).textContent =
        `${desempenho["Apoio visual"]?.percentual || 0}%`;


    document.getElementById(
        "resultado3"
    ).textContent =
        `${desempenho["Instruções claras"]?.percentual || 0}%`;


    const adaptativas =
        respostas.filter(
            resposta =>
                resposta.estrategia ===
                "Repetição adaptativa"
        );


    if (
        adaptativas.length
    ) {

        const acertos =
            adaptativas.filter(
                resposta =>
                    resposta.correta
            ).length;


        document.getElementById(
            "resultado4"
        ).textContent =
            `${Math.round(
                (
                    acertos /
                    adaptativas.length
                ) * 100
            )}%`;

    } else {

        document.getElementById(
            "resultado4"
        ).textContent =
            "—";

    }


    document.getElementById(
        "mensagemResultado"
    ).innerHTML = `

        <p>
            A avaliação foi concluída.
        </p>

        <p style="margin-top:10px;">
            A estratégia que apresentou o maior
            desempenho inicial foi
            <strong>
                ${escaparHTML(
                    estrategiaEscolhida
                )}
            </strong>.
        </p>

        <p style="margin-top:10px;">
            As atividades adaptativas foram
            criadas considerando o desempenho
            observado durante a avaliação.
        </p>

    `;


    mostrarTela(
        "resultado"
    );

}


/* ============================================================
   ATIVIDADES ADAPTADAS
   ============================================================ */

function mostrarAtividades() {

    mostrarTela(
        "atividades"
    );


    const lista =
        document.getElementById(
            "listaAtividades"
        );


    lista.innerHTML =
        "";


    questoesAdaptativas.forEach(
        function (
            questao,
            indice
        ) {

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


            const alternativas =
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


                        alternativas.appendChild(
                            p
                        );

                    }
                );


            atividade.appendChild(
                alternativas
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

        <strong>
            ${escaparHTML(
                titulo
            )}
        </strong>

        <p style="margin-top:8px;">
            ${escaparHTML(
                texto
            )}
        </p>

    `;

}


/* ============================================================
   REQUISIÇÃO PARA APPS SCRIPT
   ============================================================ */

async function fazerRequisicao(
    payload
) {

    const resposta =
        await fetch(
            API_URL,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body:
                    JSON.stringify(
                        payload
                    )

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
            JSON.parse(
                texto
            );

    } catch (erro) {

        console.error(
            texto
        );


        throw new Error(
            "O Apps Script não retornou um JSON válido."
        );

    }


    if (
        dados.ok === false
    ) {

        throw new Error(
            dados.erro ||
            "Erro retornado pelo Apps Script."
        );

    }


    return dados;

}


/* ============================================================
   REINICIAR
   ============================================================ */

function reiniciar() {

    questaoAtual = 0;

    questoesIniciais = [];

    questoesAdaptativas = [];

    todasQuestoes = [];

    respostas = [];

    dadosAluno = {};

    alternativaSelecionada =
        null;

    estrategiaEscolhida =
        "";


    document
        .getElementById(
            "formAvaliacao"
        )
        ?.reset();


    const botao =
        document.getElementById(
            "btnIniciarExercicios"
        );


    if (botao) {
        botao.hidden = true;
    }


    mostrarTela(
        "inicio"
    );

}


/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function esperar(
    milissegundos
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milissegundos
            )
    );

}


function normalizarTexto(
    texto
) {

    return String(
        texto || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase();

}


function escaparHTML(
    texto
) {

    return String(
        texto || ""
    )
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
