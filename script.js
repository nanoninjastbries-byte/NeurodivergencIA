// ============================================================
// NEURODIVERGÊNCIA
// SCRIPT PRINCIPAL
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const TOTAL_QUESTOES = 24;

const QUESTOES_INICIAIS = 18;

const QUESTOES_ADAPTATIVAS = 6;

const estrategias = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];


// ============================================================
// ESTADO
// ============================================================

let questaoAtual = 0;

let questoes = [];

let respostas = [];

let inicioQuestao = 0;

let dadosAluno = {};


// ============================================================
// NAVEGAÇÃO
// ============================================================

function mostrarTela(id) {

    document.querySelectorAll(".tela").forEach(tela => {

        tela.classList.remove("ativa");

    });


    const tela =
        document.getElementById(id);


    if (tela) {

        tela.classList.add("ativa");

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });
}


// ============================================================
// API
// ============================================================

async function chamarAPI(payload) {

    try {

        const resposta = await fetch(

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

                `Servidor respondeu com HTTP ${resposta.status}.`

            );

        }


        const texto =
            await resposta.text();


        if (!texto) {

            throw new Error(

                "O servidor não retornou nenhuma resposta."

            );

        }


        let dados;


        try {

            dados =
                JSON.parse(texto);

        } catch (erro) {

            console.error(
                "Resposta recebida do servidor:",
                texto
            );

            throw new Error(

                "O servidor retornou uma resposta que não é JSON válido."

            );

        }


        if (!dados.sucesso) {

            throw new Error(

                dados.erro ||
                "O servidor informou um erro desconhecido."

            );

        }


        return dados.dados;


    } catch (erro) {

        console.error(

            "Erro na comunicação com o Apps Script:",

            erro

        );

        throw erro;

    }

}


// ============================================================
// INICIAR AVALIAÇÃO
// ============================================================

async function iniciarAvaliacao() {

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


    if (
        !nome ||
        !idade ||
        !ano ||
        !materia ||
        !conteudo
    ) {

        alert(
            "Preencha todos os campos obrigatórios."
        );

        return;

    }


    dadosAluno = {

        nome,
        idade,
        ano,
        materia,
        conteudo,
        observacoes

    };


    const botao =
        document.getElementById(
            "botaoIniciar"
        );


    botao.disabled = true;

    botao.textContent =
        "Preparando avaliação...";


    try {

        mostrarTela("avaliacao");


        document.getElementById(
            "contador"
        ).textContent =
            "Preparando avaliação...";


        document.getElementById(
            "estrategia"
        ).textContent =
            "Inteligência artificial";


        document.getElementById(
            "pergunta"
        ).textContent =
            "A inteligência artificial está preparando sua avaliação...";


        document.getElementById(
            "alternativas"
        ).innerHTML = "";


        document.getElementById(
            "proxima"
        ).disabled = true;


        const resultado =
            await chamarAPI({

                acao:
                    "gerar_avaliacao",

                ...dadosAluno

            });


        console.log(
            "Resposta da avaliação:",
            resultado
        );


        if (
            !resultado ||
            !Array.isArray(resultado.questoes)
        ) {

            throw new Error(

                "A IA não retornou uma lista de questões válida."

            );

        }


        if (
            resultado.questoes.length < QUESTOES_INICIAIS
        ) {

            throw new Error(

                `A IA retornou ${resultado.questoes.length} questões. Eram necessárias pelo menos ${QUESTOES_INICIAIS}.`

            );

        }


        questoes =
            resultado.questoes.slice(
                0,
                QUESTOES_INICIAIS
            );


        questaoAtual = 0;

        respostas = [];


        mostrarQuestao();


    } catch (erro) {

        console.error(
            "Erro ao iniciar avaliação:",
            erro
        );


        mostrarTela(
            "configuracao"
        );


        alert(

            "Não foi possível preparar a avaliação.\n\n" +
            erro.message

        );


    } finally {

        botao.disabled = false;

        botao.textContent =
            "Iniciar avaliação";

    }

}


// ============================================================
// MOSTRAR QUESTÃO
// ============================================================

function mostrarQuestao() {

    const questao =
        questoes[questaoAtual];


    if (!questao) {

        finalizarAvaliacao();

        return;

    }


    document.getElementById(
        "contador"
    ).textContent =

        `Questão ${questaoAtual + 1} de ${TOTAL_QUESTOES}`;


    document.getElementById(
        "estrategia"
    ).textContent =

        questao.estrategia ||
        "Estratégia";


    document.getElementById(
        "pergunta"
    ).textContent =

        questao.pergunta ||
        questao.enunciado ||
        "Pergunta não disponível.";


    const progresso =

        (
            (questaoAtual + 1) /
            TOTAL_QUESTOES
        ) * 100;


    document.getElementById(
        "progresso"
    ).style.width =

        `${progresso}%`;


    const alternativas =
        document.getElementById(
            "alternativas"
        );


    alternativas.innerHTML = "";


    if (
        !Array.isArray(
            questao.alternativas
        ) ||
        questao.alternativas.length === 0
    ) {

        alternativas.innerHTML =

            "<p>Não foi possível carregar as alternativas.</p>";

    } else {

        questao.alternativas.forEach(

            (alternativa, indice) => {

                const botao =
                    document.createElement(
                        "button"
                    );


                botao.className =
                    "alternativa";


                botao.type =
                    "button";


                botao.textContent =
                    alternativa;


                botao.onclick = () => {

                    selecionarAlternativa(
                        indice
                    );

                };


                alternativas.appendChild(
                    botao
                );

            }

        );

    }


    document.getElementById(
        "dificuldade"
    ).value = 3;


    document.getElementById(
        "proxima"
    ).disabled = true;


    inicioQuestao =
        Date.now();

}


// ============================================================
// SELECIONAR ALTERNATIVA
// ============================================================

function selecionarAlternativa(indice) {

    document
        .querySelectorAll(
            ".alternativa"
        )
        .forEach(botao => {

            botao.classList.remove(
                "selecionada"
            );

        });


    const botoes =
        document.querySelectorAll(
            ".alternativa"
        );


    if (!botoes[indice]) {

        return;

    }


    botoes[indice].classList.add(
        "selecionada"
    );


    const questao =
        questoes[questaoAtual];


    const tempo =

        Math.max(

            1,

            Math.round(

                (
                    Date.now() -
                    inicioQuestao
                ) / 1000

            )

        );


    const respostaCorreta =
        obterIndiceCorreto(questao);


    respostas[questaoAtual] = {

        estrategia:
            normalizarEstrategia(
                questao.estrategia
            ),

        correta:
            Number(indice) ===
            Number(respostaCorreta),

        dificuldade:
            Number(
                document.getElementById(
                    "dificuldade"
                ).value
            ),

        tempo:

            tempo,

        resposta:
            questao.alternativas[indice]

    };


    document.getElementById(
        "proxima"
    ).disabled = false;

}


// ============================================================
// OBTER RESPOSTA CORRETA
// ============================================================

function obterIndiceCorreto(questao) {

    if (
        questao.correta !== undefined &&
        questao.correta !== null
    ) {

        return Number(
            questao.correta
        );

    }


    if (
        questao.resposta_correta !== undefined &&
        Array.isArray(questao.alternativas)
    ) {

        const indice =
            questao.alternativas.indexOf(
                questao.resposta_correta
            );


        return indice;

    }


    if (
        typeof questao.resposta === "number"
    ) {

        return Number(
            questao.resposta
        );

    }


    return -1;

}


// ============================================================
// PRÓXIMA QUESTÃO
// ============================================================

async function proximaQuestao() {

    if (
        !respostas[questaoAtual]
    ) {

        alert(
            "Escolha uma alternativa antes de continuar."
        );

        return;

    }


    questaoAtual++;


    // --------------------------------------------------------
    // Ainda existem questões iniciais
    // --------------------------------------------------------

    if (
        questaoAtual < questoes.length
    ) {

        mostrarQuestao();

        return;

    }


    // --------------------------------------------------------
    // Terminou as 18 iniciais
    // --------------------------------------------------------

    if (
        questoes.length ===
        QUESTOES_INICIAIS
    ) {

        await gerarQuestoesAdaptativas();

        return;

    }


    // --------------------------------------------------------
    // Terminou as 24
    // --------------------------------------------------------

    finalizarAvaliacao();

}


// ============================================================
// GERAR QUESTÕES ADAPTATIVAS
// ============================================================

async function gerarQuestoesAdaptativas() {

    const botao =
        document.getElementById(
            "proxima"
        );


    botao.disabled = true;

    botao.textContent =
        "Analisando desempenho...";


    try {

        const resultados =
            calcularResultados();


        document.getElementById(
            "contador"
        ).textContent =
            "Analisando desempenho...";


        document.getElementById(
            "estrategia"
        ).textContent =
            "Repetição adaptativa";


        document.getElementById(
            "pergunta"
        ).textContent =
            "A inteligência artificial está analisando seu desempenho para criar as próximas questões...";


        document.getElementById(
            "alternativas"
        ).innerHTML = "";


        const resultado =
            await chamarAPI({

                acao:
                    "gerar_adaptativas",

                ...dadosAluno,

                resultados:
                    resultados

            });


        console.log(
            "Resposta adaptativa:",
            resultado
        );


        if (
            !resultado ||
            !Array.isArray(
                resultado.questoes
            )
        ) {

            throw new Error(

                "A IA não retornou as questões adaptativas corretamente."

            );

        }


        if (
            resultado.questoes.length <
            QUESTOES_ADAPTATIVAS
        ) {

            throw new Error(

                `A IA retornou ${resultado.questoes.length} questões adaptativas. Eram necessárias ${QUESTOES_ADAPTATIVAS}.`

            );

        }


        const novasQuestoes =
            resultado.questoes.slice(
                0,
                QUESTOES_ADAPTATIVAS
            );


        // Garantir que as questões adaptativas
        // sejam identificadas como repetição adaptativa
        novasQuestoes.forEach(
            questao => {

                if (
                    !questao.estrategia
                ) {

                    questao.estrategia =
                        "Repetição adaptativa";

                }

            }
        );


        questoes =
            questoes.concat(
                novasQuestoes
            );


        questaoAtual =
            QUESTOES_INICIAIS;


        mostrarQuestao();


    } catch (erro) {

        console.error(
            "Erro nas questões adaptativas:",
            erro
        );


        alert(

            "Erro ao gerar as questões adaptativas.\n\n" +
            erro.message

        );


        mostrarResultado();


    } finally {

        botao.disabled = false;

        botao.textContent =
            "Próxima questão";

    }

}


// ============================================================
// NORMALIZAR ESTRATÉGIA
// ============================================================

function normalizarEstrategia(estrategia) {

    if (!estrategia) {

        return null;

    }


    const texto =
        String(
            estrategia
        ).trim()
        .toLowerCase();


    if (
        texto.includes("etapa")
    ) {

        return "Divisão em etapas";

    }


    if (
        texto.includes("visual")
    ) {

        return "Apoio visual";

    }


    if (
        texto.includes("clara")
    ) {

        return "Instruções claras";

    }


    if (
        texto.includes("repet")
    ) {

        return "Repetição adaptativa";

    }


    return estrategia;

}


// ============================================================
// CALCULAR RESULTADOS
// ============================================================

function calcularResultados() {

    const resultados = {};


    estrategias.forEach(
        estrategia => {

            resultados[estrategia] = {

                total: 0,

                acertos: 0,

                tempoTotal: 0,

                dificuldadeTotal: 0,

                porcentagem: 0,

                tempoMedio: 0,

                dificuldadeMedia: 0,

                indice: 0

            };

        }
    );


    respostas.forEach(
        resposta => {

            if (!resposta) {

                return;

            }


            const estrategia =
                normalizarEstrategia(
                    resposta.estrategia
                );


            const dados =
                resultados[
                    estrategia
                ];


            if (!dados) {

                return;

            }


            dados.total++;


            if (
                resposta.correta
            ) {

                dados.acertos++;

            }


            dados.tempoTotal +=

                Number(
                    resposta.tempo
                ) || 0;


            dados.dificuldadeTotal +=

                Number(
                    resposta.dificuldade
                ) || 3;

        }
    );


    estrategias.forEach(
        estrategia => {

            const dados =
                resultados[
                    estrategia
                ];


            // ------------------------------------------------
            // Percentual de acertos
            // ------------------------------------------------

            dados.porcentagem =

                dados.total > 0

                    ? Math.round(

                        (
                            dados.acertos /
                            dados.total
                        ) * 100

                    )

                    : 0;


            // ------------------------------------------------
            // Tempo médio
            // ------------------------------------------------

            dados.tempoMedio =

                dados.total > 0

                    ? Math.round(

                        dados.tempoTotal /
                        dados.total

                    )

                    : 0;


            // ------------------------------------------------
            // Dificuldade média
            // ------------------------------------------------

            dados.dificuldadeMedia =

                dados.total > 0

                    ? Number(

                        (
                            dados.dificuldadeTotal /
                            dados.total
                        ).toFixed(1)

                    )

                    : 0;


            // ------------------------------------------------
            // Eficiência de tempo
            //
            // Quanto menor o tempo, maior a eficiência.
            // O cálculo é limitado a 0-100.
            // ------------------------------------------------

            let eficienciaTempo = 0;


            if (
                dados.tempoMedio > 0
            ) {

                eficienciaTempo =

                    Math.min(

                        100,

                        (
                            30 *
                            30 /
                            dados.tempoMedio
                        )

                    );

            }


            // ------------------------------------------------
            // ÍNDICE
            //
            // 70% acertos
            // 30% eficiência do tempo
            // ------------------------------------------------

            dados.indice =

                Math.round(

                    (
                        dados.porcentagem *
                        0.70
                    ) +

                    (
                        eficienciaTempo *
                        0.30
                    )

                );


            dados.indice =

                Math.max(

                    0,

                    Math.min(
                        100,
                        dados.indice
                    )

                );

        }
    );


    return resultados;

}


// ============================================================
// FINALIZAR
// ============================================================

function finalizarAvaliacao() {

    mostrarResultado();

}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

    const resultados =
        calcularResultados();


    preencherInformacoesAluno();


    preencherTabela(
        resultados
    );


    const melhor =
        obterMelhorEstrategia(
            resultados
        );


    dadosAluno.melhorEstrategia =
        melhor.estrategia;


    dadosAluno.melhorIndice =
        melhor.indice;


    preencherMelhorMetodo(
        melhor
    );


    const nota =
        calcularNotaGeral();


    document.getElementById(
        "notaGeral"
    ).textContent =
        `${nota}%`;


    document.getElementById(
        "descricaoAtividades"
    ).textContent =

        `As atividades serão elaboradas de acordo com ` +
        `o método que apresentou o melhor resultado: ` +
        `${melhor.estrategia}.`;


    document.getElementById(
        "listaAtividades"
    ).innerHTML = "";


    mostrarTela(
        "resultado"
    );

}


// ============================================================
// PREENCHER INFORMAÇÕES
// ============================================================

function preencherInformacoesAluno() {

    document.getElementById(
        "resultadoNome"
    ).textContent =
        dadosAluno.nome || "--";


    document.getElementById(
        "resultadoIdade"
    ).textContent =
        dadosAluno.idade
            ? `${dadosAluno.idade} anos`
            : "--";


    document.getElementById(
        "resultadoAno"
    ).textContent =
        dadosAluno.ano || "--";


    document.getElementById(
        "resultadoMateria"
    ).textContent =
        dadosAluno.materia || "--";


    document.getElementById(
        "resultadoConteudo"
    ).textContent =
        dadosAluno.conteudo || "--";


    document.getElementById(
        "resultadoObservacoes"
    ).textContent =
        dadosAluno.observacoes || "Nenhuma";

}


// ============================================================
// PREENCHER TABELA
// ============================================================

function preencherTabela(resultados) {

    estrategias.forEach(
        (estrategia, indice) => {

            const numero =
                indice + 1;


            const dados =
                resultados[
                    estrategia
                ];


            const acertos =
                document.getElementById(
                    `acertos${numero}`
                );


            const tempo =
                document.getElementById(
                    `tempo${numero}`
                );


            const indiceElemento =
                document.getElementById(
                    `indice${numero}`
                );


            if (acertos) {

                acertos.textContent =

                    `${dados.acertos}/${dados.total}`;

            }


            if (tempo) {

                tempo.textContent =

                    dados.total > 0

                        ? `${dados.tempoMedio} s`

                        : "--";

            }


            if (indiceElemento) {

                indiceElemento.textContent =

                    dados.total > 0

                        ? `${dados.indice}%`

                        : "--";

            }

        }
    );

}


// ============================================================
// OBTER MELHOR ESTRATÉGIA
// ============================================================

function obterMelhorEstrategia(resultados) {

    let melhorEstrategia =
        estrategias[0];


    let melhorIndice =
        resultados[
            melhorEstrategia
        ].indice;


    estrategias.forEach(
        estrategia => {

            const dados =
                resultados[
                    estrategia
                ];


            if (
                dados.total > 0 &&
                dados.indice > melhorIndice
            ) {

                melhorEstrategia =
                    estrategia;

                melhorIndice =
                    dados.indice;

            }

        }
    );


    return {

        estrategia:
            melhorEstrategia,

        indice:
            melhorIndice,

        dados:
            resultados[
                melhorEstrategia
            ]

    };

}


// ============================================================
// MOSTRAR MELHOR MÉTODO
// ============================================================

function preencherMelhorMetodo(melhor) {

    document.getElementById(
        "melhorMetodo"
    ).textContent =
        melhor.estrategia;


    const dados =
        melhor.dados;


    document.getElementById(
        "explicacaoMetodo"
    ).textContent =

        `Este método apresentou ${dados.acertos} ` +
        `acerto(s) em ${dados.total} questão(ões), ` +
        `com tempo médio de ${dados.tempoMedio} segundos ` +
        `e índice de desempenho de ${dados.indice}%.`;

}


// ============================================================
// NOTA GERAL
// ============================================================

function calcularNotaGeral() {

    let totalRespondidas = 0;

    let totalAcertos = 0;


    respostas.forEach(
        resposta => {

            if (!resposta) {

                return;

            }


            totalRespondidas++;


            if (
                resposta.correta
            ) {

                totalAcertos++;

            }

        }
    );


    if (
        totalRespondidas === 0
    ) {

        return 0;

    }


    return Math.round(

        (
            totalAcertos /
            totalRespondidas
        ) * 100

    );

}


// ============================================================
// GERAR ATIVIDADES ADAPTADAS
// ============================================================

async function gerarAtividades() {

    const area =
        document.getElementById(
            "listaAtividades"
        );


    const botao =
        document.getElementById(
            "botaoAtividades"
        );


    area.innerHTML = `

        <p>
            A inteligência artificial está preparando
            as atividades adaptadas...
        </p>

    `;


    botao.disabled = true;

    botao.textContent =
        "Gerando atividades...";


    try {

        const resultados =
            calcularResultados();


        const melhor =
            obterMelhorEstrategia(
                resultados
            );


        const resultado =
            await chamarAPI({

                acao:
                    "gerar_atividades",

                ...dadosAluno,

                resultados:
                    resultados,

                melhorEstrategia:
                    melhor.estrategia

            });


        console.log(
            "Resposta das atividades:",
            resultado
        );


        if (
            !resultado ||
            !Array.isArray(
                resultado.atividades
            )
        ) {

            throw new Error(

                "A IA não retornou atividades válidas."

            );

        }


        if (
            resultado.atividades.length === 0
        ) {

            throw new Error(

                "A IA não retornou nenhuma atividade."

            );

        }


        area.innerHTML = "";


        resultado.atividades.forEach(

            (atividade, indice) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "atividade-gerada";


                const titulo =
                    document.createElement(
                        "h4"
                    );


                titulo.textContent =

                    `${indice + 1}. ${
                        atividade.titulo ||
                        "Atividade"
                    }`;


                div.appendChild(
                    titulo
                );


                if (
                    atividade.descricao
                ) {

                    const descricao =
                        document.createElement(
                            "p"
                        );


                    descricao.textContent =
                        atividade.descricao;


                    div.appendChild(
                        descricao
                    );

                }


                if (
                    atividade.questao
                ) {

                    const questao =
                        document.createElement(
                            "p"
                        );


                    questao.textContent =
                        atividade.questao;


                    div.appendChild(
                        questao
                    );

                }


                if (
                    Array.isArray(
                        atividade.alternativas
                    ) &&
                    atividade.alternativas.length
                ) {

                    const lista =
                        document.createElement(
                            "ol"
                        );


                    atividade.alternativas.forEach(

                        alternativa => {

                            const item =
                                document.createElement(
                                    "li"
                                );


                            item.textContent =
                                alternativa;


                            lista.appendChild(
                                item
                            );

                        }

                    );


                    div.appendChild(
                        lista
                    );

                }


                area.appendChild(
                    div
                );

            }

        );


    } catch (erro) {

        console.error(

            "Erro ao gerar atividades:",

            erro

        );


        area.innerHTML = `

            <p class="mensagem-erro">
                Não foi possível gerar as atividades adaptadas.
            </p>

            <p>
                ${escapeHTML(
                    erro.message
                )}
            </p>

        `;

    } finally {

        botao.disabled = false;

        botao.textContent =
            "Gerar atividades adaptadas";

    }

}


// ============================================================
// PROTEÇÃO CONTRA HTML
// ============================================================

function escapeHTML(texto) {

    return String(texto)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}// ============================================================
// NEURODIVERGÊNCIA
// SCRIPT PRINCIPAL
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const TOTAL_QUESTOES = 24;

const QUESTOES_INICIAIS = 18;

const QUESTOES_ADAPTATIVAS = 6;

const estrategias = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];


// ============================================================
// ESTADO
// ============================================================

let questaoAtual = 0;

let questoes = [];

let respostas = [];

let inicioQuestao = 0;

let dadosAluno = {};


// ============================================================
// NAVEGAÇÃO
// ============================================================

function mostrarTela(id) {

    document.querySelectorAll(".tela").forEach(tela => {

        tela.classList.remove("ativa");

    });


    const tela =
        document.getElementById(id);


    if (tela) {

        tela.classList.add("ativa");

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });
}


// ============================================================
// API
// ============================================================

async function chamarAPI(payload) {

    try {

        const resposta = await fetch(

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

                `Servidor respondeu com HTTP ${resposta.status}.`

            );

        }


        const texto =
            await resposta.text();


        if (!texto) {

            throw new Error(

                "O servidor não retornou nenhuma resposta."

            );

        }


        let dados;


        try {

            dados =
                JSON.parse(texto);

        } catch (erro) {

            console.error(
                "Resposta recebida do servidor:",
                texto
            );

            throw new Error(

                "O servidor retornou uma resposta que não é JSON válido."

            );

        }


        if (!dados.sucesso) {

            throw new Error(

                dados.erro ||
                "O servidor informou um erro desconhecido."

            );

        }


        return dados.dados;


    } catch (erro) {

        console.error(

            "Erro na comunicação com o Apps Script:",

            erro

        );

        throw erro;

    }

}


// ============================================================
// INICIAR AVALIAÇÃO
// ============================================================

async function iniciarAvaliacao() {

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


    if (
        !nome ||
        !idade ||
        !ano ||
        !materia ||
        !conteudo
    ) {

        alert(
            "Preencha todos os campos obrigatórios."
        );

        return;

    }


    dadosAluno = {

        nome,
        idade,
        ano,
        materia,
        conteudo,
        observacoes

    };


    const botao =
        document.getElementById(
            "botaoIniciar"
        );


    botao.disabled = true;

    botao.textContent =
        "Preparando avaliação...";


    try {

        mostrarTela("avaliacao");


        document.getElementById(
            "contador"
        ).textContent =
            "Preparando avaliação...";


        document.getElementById(
            "estrategia"
        ).textContent =
            "Inteligência artificial";


        document.getElementById(
            "pergunta"
        ).textContent =
            "A inteligência artificial está preparando sua avaliação...";


        document.getElementById(
            "alternativas"
        ).innerHTML = "";


        document.getElementById(
            "proxima"
        ).disabled = true;


        const resultado =
            await chamarAPI({

                acao:
                    "gerar_avaliacao",

                ...dadosAluno

            });


        console.log(
            "Resposta da avaliação:",
            resultado
        );


        if (
            !resultado ||
            !Array.isArray(resultado.questoes)
        ) {

            throw new Error(

                "A IA não retornou uma lista de questões válida."

            );

        }


        if (
            resultado.questoes.length < QUESTOES_INICIAIS
        ) {

            throw new Error(

                `A IA retornou ${resultado.questoes.length} questões. Eram necessárias pelo menos ${QUESTOES_INICIAIS}.`

            );

        }


        questoes =
            resultado.questoes.slice(
                0,
                QUESTOES_INICIAIS
            );


        questaoAtual = 0;

        respostas = [];


        mostrarQuestao();


    } catch (erro) {

        console.error(
            "Erro ao iniciar avaliação:",
            erro
        );


        mostrarTela(
            "configuracao"
        );


        alert(

            "Não foi possível preparar a avaliação.\n\n" +
            erro.message

        );


    } finally {

        botao.disabled = false;

        botao.textContent =
            "Iniciar avaliação";

    }

}


// ============================================================
// MOSTRAR QUESTÃO
// ============================================================

function mostrarQuestao() {

    const questao =
        questoes[questaoAtual];


    if (!questao) {

        finalizarAvaliacao();

        return;

    }


    document.getElementById(
        "contador"
    ).textContent =

        `Questão ${questaoAtual + 1} de ${TOTAL_QUESTOES}`;


    document.getElementById(
        "estrategia"
    ).textContent =

        questao.estrategia ||
        "Estratégia";


    document.getElementById(
        "pergunta"
    ).textContent =

        questao.pergunta ||
        questao.enunciado ||
        "Pergunta não disponível.";


    const progresso =

        (
            (questaoAtual + 1) /
            TOTAL_QUESTOES
        ) * 100;


    document.getElementById(
        "progresso"
    ).style.width =

        `${progresso}%`;


    const alternativas =
        document.getElementById(
            "alternativas"
        );


    alternativas.innerHTML = "";


    if (
        !Array.isArray(
            questao.alternativas
        ) ||
        questao.alternativas.length === 0
    ) {

        alternativas.innerHTML =

            "<p>Não foi possível carregar as alternativas.</p>";

    } else {

        questao.alternativas.forEach(

            (alternativa, indice) => {

                const botao =
                    document.createElement(
                        "button"
                    );


                botao.className =
                    "alternativa";


                botao.type =
                    "button";


                botao.textContent =
                    alternativa;


                botao.onclick = () => {

                    selecionarAlternativa(
                        indice
                    );

                };


                alternativas.appendChild(
                    botao
                );

            }

        );

    }


    document.getElementById(
        "dificuldade"
    ).value = 3;


    document.getElementById(
        "proxima"
    ).disabled = true;


    inicioQuestao =
        Date.now();

}


// ============================================================
// SELECIONAR ALTERNATIVA
// ============================================================

function selecionarAlternativa(indice) {

    document
        .querySelectorAll(
            ".alternativa"
        )
        .forEach(botao => {

            botao.classList.remove(
                "selecionada"
            );

        });


    const botoes =
        document.querySelectorAll(
            ".alternativa"
        );


    if (!botoes[indice]) {

        return;

    }


    botoes[indice].classList.add(
        "selecionada"
    );


    const questao =
        questoes[questaoAtual];


    const tempo =

        Math.max(

            1,

            Math.round(

                (
                    Date.now() -
                    inicioQuestao
                ) / 1000

            )

        );


    const respostaCorreta =
        obterIndiceCorreto(questao);


    respostas[questaoAtual] = {

        estrategia:
            normalizarEstrategia(
                questao.estrategia
            ),

        correta:
            Number(indice) ===
            Number(respostaCorreta),

        dificuldade:
            Number(
                document.getElementById(
                    "dificuldade"
                ).value
            ),

        tempo:

            tempo,

        resposta:
            questao.alternativas[indice]

    };


    document.getElementById(
        "proxima"
    ).disabled = false;

}


// ============================================================
// OBTER RESPOSTA CORRETA
// ============================================================

function obterIndiceCorreto(questao) {

    if (
        questao.correta !== undefined &&
        questao.correta !== null
    ) {

        return Number(
            questao.correta
        );

    }


    if (
        questao.resposta_correta !== undefined &&
        Array.isArray(questao.alternativas)
    ) {

        const indice =
            questao.alternativas.indexOf(
                questao.resposta_correta
            );


        return indice;

    }


    if (
        typeof questao.resposta === "number"
    ) {

        return Number(
            questao.resposta
        );

    }


    return -1;

}


// ============================================================
// PRÓXIMA QUESTÃO
// ============================================================

async function proximaQuestao() {

    if (
        !respostas[questaoAtual]
    ) {

        alert(
            "Escolha uma alternativa antes de continuar."
        );

        return;

    }


    questaoAtual++;


    // --------------------------------------------------------
    // Ainda existem questões iniciais
    // --------------------------------------------------------

    if (
        questaoAtual < questoes.length
    ) {

        mostrarQuestao();

        return;

    }


    // --------------------------------------------------------
    // Terminou as 18 iniciais
    // --------------------------------------------------------

    if (
        questoes.length ===
        QUESTOES_INICIAIS
    ) {

        await gerarQuestoesAdaptativas();

        return;

    }


    // --------------------------------------------------------
    // Terminou as 24
    // --------------------------------------------------------

    finalizarAvaliacao();

}


// ============================================================
// GERAR QUESTÕES ADAPTATIVAS
// ============================================================

async function gerarQuestoesAdaptativas() {

    const botao =
        document.getElementById(
            "proxima"
        );


    botao.disabled = true;

    botao.textContent =
        "Analisando desempenho...";


    try {

        const resultados =
            calcularResultados();


        document.getElementById(
            "contador"
        ).textContent =
            "Analisando desempenho...";


        document.getElementById(
            "estrategia"
        ).textContent =
            "Repetição adaptativa";


        document.getElementById(
            "pergunta"
        ).textContent =
            "A inteligência artificial está analisando seu desempenho para criar as próximas questões...";


        document.getElementById(
            "alternativas"
        ).innerHTML = "";


        const resultado =
            await chamarAPI({

                acao:
                    "gerar_adaptativas",

                ...dadosAluno,

                resultados:
                    resultados

            });


        console.log(
            "Resposta adaptativa:",
            resultado
        );


        if (
            !resultado ||
            !Array.isArray(
                resultado.questoes
            )
        ) {

            throw new Error(

                "A IA não retornou as questões adaptativas corretamente."

            );

        }


        if (
            resultado.questoes.length <
            QUESTOES_ADAPTATIVAS
        ) {

            throw new Error(

                `A IA retornou ${resultado.questoes.length} questões adaptativas. Eram necessárias ${QUESTOES_ADAPTATIVAS}.`

            );

        }


        const novasQuestoes =
            resultado.questoes.slice(
                0,
                QUESTOES_ADAPTATIVAS
            );


        // Garantir que as questões adaptativas
        // sejam identificadas como repetição adaptativa
        novasQuestoes.forEach(
            questao => {

                if (
                    !questao.estrategia
                ) {

                    questao.estrategia =
                        "Repetição adaptativa";

                }

            }
        );


        questoes =
            questoes.concat(
                novasQuestoes
            );


        questaoAtual =
            QUESTOES_INICIAIS;


        mostrarQuestao();


    } catch (erro) {

        console.error(
            "Erro nas questões adaptativas:",
            erro
        );


        alert(

            "Erro ao gerar as questões adaptativas.\n\n" +
            erro.message

        );


        mostrarResultado();


    } finally {

        botao.disabled = false;

        botao.textContent =
            "Próxima questão";

    }

}


// ============================================================
// NORMALIZAR ESTRATÉGIA
// ============================================================

function normalizarEstrategia(estrategia) {

    if (!estrategia) {

        return null;

    }


    const texto =
        String(
            estrategia
        ).trim()
        .toLowerCase();


    if (
        texto.includes("etapa")
    ) {

        return "Divisão em etapas";

    }


    if (
        texto.includes("visual")
    ) {

        return "Apoio visual";

    }


    if (
        texto.includes("clara")
    ) {

        return "Instruções claras";

    }


    if (
        texto.includes("repet")
    ) {

        return "Repetição adaptativa";

    }


    return estrategia;

}


// ============================================================
// CALCULAR RESULTADOS
// ============================================================

function calcularResultados() {

    const resultados = {};


    estrategias.forEach(
        estrategia => {

            resultados[estrategia] = {

                total: 0,

                acertos: 0,

                tempoTotal: 0,

                dificuldadeTotal: 0,

                porcentagem: 0,

                tempoMedio: 0,

                dificuldadeMedia: 0,

                indice: 0

            };

        }
    );


    respostas.forEach(
        resposta => {

            if (!resposta) {

                return;

            }


            const estrategia =
                normalizarEstrategia(
                    resposta.estrategia
                );


            const dados =
                resultados[
                    estrategia
                ];


            if (!dados) {

                return;

            }


            dados.total++;


            if (
                resposta.correta
            ) {

                dados.acertos++;

            }


            dados.tempoTotal +=

                Number(
                    resposta.tempo
                ) || 0;


            dados.dificuldadeTotal +=

                Number(
                    resposta.dificuldade
                ) || 3;

        }
    );


    estrategias.forEach(
        estrategia => {

            const dados =
                resultados[
                    estrategia
                ];


            // ------------------------------------------------
            // Percentual de acertos
            // ------------------------------------------------

            dados.porcentagem =

                dados.total > 0

                    ? Math.round(

                        (
                            dados.acertos /
                            dados.total
                        ) * 100

                    )

                    : 0;


            // ------------------------------------------------
            // Tempo médio
            // ------------------------------------------------

            dados.tempoMedio =

                dados.total > 0

                    ? Math.round(

                        dados.tempoTotal /
                        dados.total

                    )

                    : 0;


            // ------------------------------------------------
            // Dificuldade média
            // ------------------------------------------------

            dados.dificuldadeMedia =

                dados.total > 0

                    ? Number(

                        (
                            dados.dificuldadeTotal /
                            dados.total
                        ).toFixed(1)

                    )

                    : 0;


            // ------------------------------------------------
            // Eficiência de tempo
            //
            // Quanto menor o tempo, maior a eficiência.
            // O cálculo é limitado a 0-100.
            // ------------------------------------------------

            let eficienciaTempo = 0;


            if (
                dados.tempoMedio > 0
            ) {

                eficienciaTempo =

                    Math.min(

                        100,

                        (
                            30 *
                            30 /
                            dados.tempoMedio
                        )

                    );

            }


            // ------------------------------------------------
            // ÍNDICE
            //
            // 70% acertos
            // 30% eficiência do tempo
            // ------------------------------------------------

            dados.indice =

                Math.round(

                    (
                        dados.porcentagem *
                        0.70
                    ) +

                    (
                        eficienciaTempo *
                        0.30
                    )

                );


            dados.indice =

                Math.max(

                    0,

                    Math.min(
                        100,
                        dados.indice
                    )

                );

        }
    );


    return resultados;

}


// ============================================================
// FINALIZAR
// ============================================================

function finalizarAvaliacao() {

    mostrarResultado();

}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

    const resultados =
        calcularResultados();


    preencherInformacoesAluno();


    preencherTabela(
        resultados
    );


    const melhor =
        obterMelhorEstrategia(
            resultados
        );


    dadosAluno.melhorEstrategia =
        melhor.estrategia;


    dadosAluno.melhorIndice =
        melhor.indice;


    preencherMelhorMetodo(
        melhor
    );


    const nota =
        calcularNotaGeral();


    document.getElementById(
        "notaGeral"
    ).textContent =
        `${nota}%`;


    document.getElementById(
        "descricaoAtividades"
    ).textContent =

        `As atividades serão elaboradas de acordo com ` +
        `o método que apresentou o melhor resultado: ` +
        `${melhor.estrategia}.`;


    document.getElementById(
        "listaAtividades"
    ).innerHTML = "";


    mostrarTela(
        "resultado"
    );

}


// ============================================================
// PREENCHER INFORMAÇÕES
// ============================================================

function preencherInformacoesAluno() {

    document.getElementById(
        "resultadoNome"
    ).textContent =
        dadosAluno.nome || "--";


    document.getElementById(
        "resultadoIdade"
    ).textContent =
        dadosAluno.idade
            ? `${dadosAluno.idade} anos`
            : "--";


    document.getElementById(
        "resultadoAno"
    ).textContent =
        dadosAluno.ano || "--";


    document.getElementById(
        "resultadoMateria"
    ).textContent =
        dadosAluno.materia || "--";


    document.getElementById(
        "resultadoConteudo"
    ).textContent =
        dadosAluno.conteudo || "--";


    document.getElementById(
        "resultadoObservacoes"
    ).textContent =
        dadosAluno.observacoes || "Nenhuma";

}


// ============================================================
// PREENCHER TABELA
// ============================================================

function preencherTabela(resultados) {

    estrategias.forEach(
        (estrategia, indice) => {

            const numero =
                indice + 1;


            const dados =
                resultados[
                    estrategia
                ];


            const acertos =
                document.getElementById(
                    `acertos${numero}`
                );


            const tempo =
                document.getElementById(
                    `tempo${numero}`
                );


            const indiceElemento =
                document.getElementById(
                    `indice${numero}`
                );


            if (acertos) {

                acertos.textContent =

                    `${dados.acertos}/${dados.total}`;

            }


            if (tempo) {

                tempo.textContent =

                    dados.total > 0

                        ? `${dados.tempoMedio} s`

                        : "--";

            }


            if (indiceElemento) {

                indiceElemento.textContent =

                    dados.total > 0

                        ? `${dados.indice}%`

                        : "--";

            }

        }
    );

}


// ============================================================
// OBTER MELHOR ESTRATÉGIA
// ============================================================

function obterMelhorEstrategia(resultados) {

    let melhorEstrategia =
        estrategias[0];


    let melhorIndice =
        resultados[
            melhorEstrategia
        ].indice;


    estrategias.forEach(
        estrategia => {

            const dados =
                resultados[
                    estrategia
                ];


            if (
                dados.total > 0 &&
                dados.indice > melhorIndice
            ) {

                melhorEstrategia =
                    estrategia;

                melhorIndice =
                    dados.indice;

            }

        }
    );


    return {

        estrategia:
            melhorEstrategia,

        indice:
            melhorIndice,

        dados:
            resultados[
                melhorEstrategia
            ]

    };

}


// ============================================================
// MOSTRAR MELHOR MÉTODO
// ============================================================

function preencherMelhorMetodo(melhor) {

    document.getElementById(
        "melhorMetodo"
    ).textContent =
        melhor.estrategia;


    const dados =
        melhor.dados;


    document.getElementById(
        "explicacaoMetodo"
    ).textContent =

        `Este método apresentou ${dados.acertos} ` +
        `acerto(s) em ${dados.total} questão(ões), ` +
        `com tempo médio de ${dados.tempoMedio} segundos ` +
        `e índice de desempenho de ${dados.indice}%.`;

}


// ============================================================
// NOTA GERAL
// ============================================================

function calcularNotaGeral() {

    let totalRespondidas = 0;

    let totalAcertos = 0;


    respostas.forEach(
        resposta => {

            if (!resposta) {

                return;

            }


            totalRespondidas++;


            if (
                resposta.correta
            ) {

                totalAcertos++;

            }

        }
    );


    if (
        totalRespondidas === 0
    ) {

        return 0;

    }


    return Math.round(

        (
            totalAcertos /
            totalRespondidas
        ) * 100

    );

}


// ============================================================
// GERAR ATIVIDADES ADAPTADAS
// ============================================================

async function gerarAtividades() {

    const area =
        document.getElementById(
            "listaAtividades"
        );


    const botao =
        document.getElementById(
            "botaoAtividades"
        );


    area.innerHTML = `

        <p>
            A inteligência artificial está preparando
            as atividades adaptadas...
        </p>

    `;


    botao.disabled = true;

    botao.textContent =
        "Gerando atividades...";


    try {

        const resultados =
            calcularResultados();


        const melhor =
            obterMelhorEstrategia(
                resultados
            );


        const resultado =
            await chamarAPI({

                acao:
                    "gerar_atividades",

                ...dadosAluno,

                resultados:
                    resultados,

                melhorEstrategia:
                    melhor.estrategia

            });


        console.log(
            "Resposta das atividades:",
            resultado
        );


        if (
            !resultado ||
            !Array.isArray(
                resultado.atividades
            )
        ) {

            throw new Error(

                "A IA não retornou atividades válidas."

            );

        }


        if (
            resultado.atividades.length === 0
        ) {

            throw new Error(

                "A IA não retornou nenhuma atividade."

            );

        }


        area.innerHTML = "";


        resultado.atividades.forEach(

            (atividade, indice) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "atividade-gerada";


                const titulo =
                    document.createElement(
                        "h4"
                    );


                titulo.textContent =

                    `${indice + 1}. ${
                        atividade.titulo ||
                        "Atividade"
                    }`;


                div.appendChild(
                    titulo
                );


                if (
                    atividade.descricao
                ) {

                    const descricao =
                        document.createElement(
                            "p"
                        );


                    descricao.textContent =
                        atividade.descricao;


                    div.appendChild(
                        descricao
                    );

                }


                if (
                    atividade.questao
                ) {

                    const questao =
                        document.createElement(
                            "p"
                        );


                    questao.textContent =
                        atividade.questao;


                    div.appendChild(
                        questao
                    );

                }


                if (
                    Array.isArray(
                        atividade.alternativas
                    ) &&
                    atividade.alternativas.length
                ) {

                    const lista =
                        document.createElement(
                            "ol"
                        );


                    atividade.alternativas.forEach(

                        alternativa => {

                            const item =
                                document.createElement(
                                    "li"
                                );


                            item.textContent =
                                alternativa;


                            lista.appendChild(
                                item
                            );

                        }

                    );


                    div.appendChild(
                        lista
                    );

                }


                area.appendChild(
                    div
                );

            }

        );


    } catch (erro) {

        console.error(

            "Erro ao gerar atividades:",

            erro

        );


        area.innerHTML = `

            <p class="mensagem-erro">
                Não foi possível gerar as atividades adaptadas.
            </p>

            <p>
                ${escapeHTML(
                    erro.message
                )}
            </p>

        `;

    } finally {

        botao.disabled = false;

        botao.textContent =
            "Gerar atividades adaptadas";

    }

}


// ============================================================
// PROTEÇÃO CONTRA HTML
// ============================================================

function escapeHTML(texto) {

    return String(texto)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}
