// ============================================================
// NEURODIVERGÊNCIA
// SCRIPT PRINCIPAL
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";


// ============================================================
// ESTADO DA APLICAÇÃO
// ============================================================

let questaoAtual = 0;
let questoes = [];
let respostas = [];
let inicioQuestao = 0;

let dadosAluno = {};

const estrategias = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];


// ============================================================
// NAVEGAÇÃO
// ============================================================

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


// ============================================================
// COMUNICAÇÃO COM O APPS SCRIPT
// ============================================================

async function chamarAPI(payload) {

    try {

        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
            throw new Error(
                `Servidor respondeu com HTTP ${resposta.status}.`
            );
        }

        const texto = await resposta.text();

        if (!texto) {
            throw new Error(
                "O servidor não retornou nenhuma resposta."
            );
        }

        let dados;

        try {
            dados = JSON.parse(texto);
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


    if (!nome || !idade || !ano || !materia || !conteudo) {

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
        document.querySelector(
            "#configuracao button"
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

                acao: "gerar_avaliacao",

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


        if (resultado.questoes.length < 18) {

            throw new Error(
                `A IA retornou ${resultado.questoes.length} questões. Eram necessárias pelo menos 18.`
            );
        }


        questoes =
            resultado.questoes.slice(0, 18);


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
        `Questão ${questaoAtual + 1} de 24`;


    document.getElementById(
        "estrategia"
    ).textContent =
        questao.estrategia ||
        "Estratégia";


    document.getElementById(
        "pergunta"
    ).textContent =
        questao.pergunta ||
        "Pergunta não disponível.";


    const progresso =
        ((questaoAtual + 1) / 24) * 100;


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
        )
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


                botao.onclick =
                    () =>
                        selecionarAlternativa(
                            indice
                        );


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
        Math.round(
            (Date.now() - inicioQuestao) /
            1000
        );


    respostas[questaoAtual] = {

        estrategia:
            questao.estrategia,

        correta:
            Number(indice) ===
            Number(questao.correta),

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
// PRÓXIMA QUESTÃO
// ============================================================

async function proximaQuestao() {

    if (!respostas[questaoAtual]) {

        alert(
            "Escolha uma alternativa antes de continuar."
        );

        return;
    }


    questaoAtual++;


    // Primeiras 18 questões
    if (
        questaoAtual <
        questoes.length
    ) {

        mostrarQuestao();

        return;
    }


    // Depois das 18, gerar as 6 adaptativas
    if (questoes.length === 18) {

        await gerarQuestoesAdaptativas();

        return;
    }


    // Depois das 24
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
            resultado.questoes.length < 6
        ) {

            throw new Error(
                `A IA retornou ${resultado.questoes.length} questões adaptativas. Eram necessárias 6.`
            );
        }


        questoes =
            questoes.concat(
                resultado.questoes.slice(
                    0,
                    6
                )
            );


        questaoAtual = 18;


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

                dificuldadeTotal: 0
            };
        }
    );


    respostas.forEach(
        resposta => {

            if (!resposta) {
                return;
            }


            const dados =
                resultados[
                    resposta.estrategia
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


            dados.porcentagem =
                dados.total > 0
                    ? Math.round(
                        (
                            dados.acertos /
                            dados.total
                        ) *
                        100
                    )
                    : 0;


            dados.tempoMedio =
                dados.total > 0
                    ? Math.round(
                        dados.tempoTotal /
                        dados.total
                    )
                    : 0;


            dados.dificuldadeMedia =
                dados.total > 0
                    ? (
                        dados.dificuldadeTotal /
                        dados.total
                    ).toFixed(1)
                    : "0";
        }
    );


    return resultados;
}


// ============================================================
// FINALIZAR AVALIAÇÃO
// ============================================================

function finalizarAvaliacao() {

    mostrarResultado();
}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

    mostrarTela(
        "resultado"
    );


    const resultados =
        calcularResultados();


    const porcentagens = [];


    estrategias.forEach(
        (estrategia, indice) => {

            const dados =
                resultados[
                    estrategia
                ];


            const porcentagem =
                dados.porcentagem;


            porcentagens.push(
                porcentagem
            );


            const elemento =
                document.getElementById(
                    `resultado${indice + 1}`
                );


            if (elemento) {

                elemento.textContent =
                    `${porcentagem}%`;
            }
        }
    );


    const maior =
        Math.max(
            ...porcentagens
        );


    const melhorIndice =
        porcentagens.indexOf(
            maior
        );


    const melhorEstrategia =
        estrategias[
            melhorIndice
        ];


    dadosAluno.melhorEstrategia =
        melhorEstrategia;


    document.getElementById(
        "mensagemResultado"
    ).innerHTML =

        `A avaliação foi concluída. ` +
        `A estratégia que apresentou o maior ` +
        `desempenho nesta avaliação foi ` +
        `<strong>${escapeHTML(
            melhorEstrategia
        )}</strong>, ` +
        `com ${maior}% de acertos.`;
}


// ============================================================
// GERAR ATIVIDADES ADAPTADAS
// ============================================================

async function gerarAtividades() {

    const area =
        document.getElementById(
            "listaAtividades"
        );


    area.innerHTML = `

        <p>
            A inteligência artificial está
            preparando as atividades adaptadas...
        </p>

    `;


    try {

        const resultados =
            calcularResultados();


        const resultado =
            await chamarAPI({

                acao:
                    "gerar_atividades",

                ...dadosAluno,

                resultados:
                    resultados,

                melhorEstrategia:
                    dadosAluno.melhorEstrategia
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


                div.style.marginBottom =
                    "25px";


                const titulo =
                    document.createElement(
                        "h3"
                    );


                titulo.textContent =
                    `${indice + 1}. ${
                        atividade.titulo ||
                        "Atividade"
                    }`;


                const descricao =
                    document.createElement(
                        "p"
                    );


                descricao.textContent =
                    atividade.descricao ||
                    "";


                const questao =
                    document.createElement(
                        "p"
                    );


                questao.textContent =
                    atividade.questao ||
                    "";


                div.appendChild(
                    titulo
                );


                div.appendChild(
                    descricao
                );


                div.appendChild(
                    questao
                );


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

            <p>
                Não foi possível gerar as
                atividades adaptadas.
            </p>

            <p>
                ${escapeHTML(
                    erro.message
                )}
            </p>

        `;
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
