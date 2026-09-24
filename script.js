// ============================================================
// NEURODIVERGÊNCIA
// CONEXÃO COM GOOGLE APPS SCRIPT + GEMINI
// SCRIPT PRINCIPAL
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";


// ============================================================
// VARIÁVEIS
// ESTADO DA APLICAÇÃO
// ============================================================

let questaoAtual = 0;
@@ -27,7 +27,7 @@ const estrategias = [


// ============================================================
// TROCAR DE TELA
// NAVEGAÇÃO
// ============================================================

function mostrarTela(id) {
@@ -50,34 +50,70 @@ function mostrarTela(id) {


// ============================================================
// CHAMAR GOOGLE APPS SCRIPT
// COMUNICAÇÃO COM O APPS SCRIPT
// ============================================================

async function chamarAPI(payload) {

    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    });
    try {

    if (!resposta.ok) {
        throw new Error(
            "Não foi possível conectar ao servidor."
        );
    }
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

    const dados = await resposta.json();
        const texto = await resposta.text();

    if (!dados.sucesso) {
        throw new Error(
            dados.erro || "Erro desconhecido no servidor."
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
    }

    return dados.dados;
        throw erro;
    }
}


@@ -128,9 +164,10 @@ async function iniciarAvaliacao() {

    const botao =
        document.querySelector(
            '#configuracao button'
            "#configuracao button"
        );


    botao.disabled = true;

    botao.textContent =
@@ -141,45 +178,94 @@ async function iniciarAvaliacao() {

        mostrarTela("avaliacao");

        document.getElementById("pergunta").textContent =

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

        document.getElementById("alternativas").innerHTML =
            "";

        const resultado = await chamarAPI({
        document.getElementById(
            "alternativas"
        ).innerHTML = "";

            acao: "gerar_avaliacao",

            ...dadosAluno
        document.getElementById(
            "proxima"
        ).disabled = true;


        const resultado =
            await chamarAPI({

                acao: "gerar_avaliacao",

                ...dadosAluno

            });

        });

        console.log(
            "Resposta da avaliação:",
            resultado
        );


        if (
            !resultado.questoes ||
            resultado.questoes.length !== 18
            !resultado ||
            !Array.isArray(resultado.questoes)
        ) {

            throw new Error(
                "A IA não retornou as 18 questões esperadas."
                "A IA não retornou uma lista de questões válida."
            );
        }


        questoes = resultado.questoes;
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

        console.error(erro);
        console.error(
            "Erro ao iniciar avaliação:",
            erro
        );


        mostrarTela(
            "configuracao"
        );

        mostrarTela("configuracao");

        alert(
            "Não foi possível preparar a avaliação.\n\n" +
@@ -208,64 +294,111 @@ function mostrarQuestao() {


    if (!questao) {

        finalizarAvaliacao();

        return;
    }


    document.getElementById("contador").textContent =
        `Questão ${questaoAtual + 1} de ${questoes.length}`;
    document.getElementById(
        "contador"
    ).textContent =
        `Questão ${questaoAtual + 1} de 24`;


    document.getElementById("estrategia").textContent =
        questao.estrategia;
    document.getElementById(
        "estrategia"
    ).textContent =
        questao.estrategia ||
        "Estratégia";


    document.getElementById("pergunta").textContent =
        questao.pergunta;
    document.getElementById(
        "pergunta"
    ).textContent =
        questao.pergunta ||
        "Pergunta não disponível.";


    const progresso =
        ((questaoAtual + 1) / 24) * 100;


    document.getElementById("progresso").style.width =
    document.getElementById(
        "progresso"
    ).style.width =
        `${progresso}%`;


    const alternativas =
        document.getElementById("alternativas");
        document.getElementById(
            "alternativas"
        );


    alternativas.innerHTML = "";


    questao.alternativas.forEach(
        (alternativa, indice) => {
    if (
        !Array.isArray(
            questao.alternativas
        )
    ) {

        alternativas.innerHTML =
            "<p>Não foi possível carregar as alternativas.</p>";

    } else {

            const botao =
                document.createElement("button");
        questao.alternativas.forEach(
            (alternativa, indice) => {

            botao.className =
                "alternativa";
                const botao =
                    document.createElement(
                        "button"
                    );

            botao.textContent =
                alternativa;

            botao.onclick = () =>
                selecionarAlternativa(indice);
                botao.className =
                    "alternativa";


            alternativas.appendChild(botao);
        }
    );
                botao.type =
                    "button";


                botao.textContent =
                    alternativa;

    document.getElementById("dificuldade").value = 3;

    document.getElementById("proxima").disabled = true;
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

    inicioQuestao = Date.now();

    document.getElementById(
        "dificuldade"
    ).value = 3;


    document.getElementById(
        "proxima"
    ).disabled = true;


    inicioQuestao =
        Date.now();
}


@@ -276,7 +409,9 @@ function mostrarQuestao() {
function selecionarAlternativa(indice) {

    document
        .querySelectorAll(".alternativa")
        .querySelectorAll(
            ".alternativa"
        )
        .forEach(botao => {

            botao.classList.remove(
@@ -292,6 +427,11 @@ function selecionarAlternativa(indice) {
        );


    if (!botoes[indice]) {
        return;
    }


    botoes[indice].classList.add(
        "selecionada"
    );
@@ -303,7 +443,8 @@ function selecionarAlternativa(indice) {

    const tempo =
        Math.round(
            (Date.now() - inicioQuestao) / 1000
            (Date.now() - inicioQuestao) /
            1000
        );


@@ -313,7 +454,8 @@ function selecionarAlternativa(indice) {
            questao.estrategia,

        correta:
            indice === questao.correta,
            Number(indice) ===
            Number(questao.correta),

        dificuldade:
            Number(
@@ -322,7 +464,9 @@ function selecionarAlternativa(indice) {
                ).value
            ),

        tempo: tempo,
        tempo:

            tempo,

        resposta:
            questao.alternativas[indice]
@@ -354,6 +498,7 @@ async function proximaQuestao() {
    questaoAtual++;


    // Primeiras 18 questões
    if (
        questaoAtual <
        questoes.length
@@ -365,19 +510,31 @@ async function proximaQuestao() {
    }


    // Terminou as 18 iniciais
    await gerarQuestaoAdaptativa();
    // Depois das 18, gerar as 6 adaptativas
    if (questoes.length === 18) {

        await gerarQuestoesAdaptativas();

        return;
    }


    // Depois das 24
    finalizarAvaliacao();
}


// ============================================================
// GERAR 6 QUESTÕES ADAPTATIVAS
// GERAR QUESTÕES ADAPTATIVAS
// ============================================================

async function gerarQuestaoAdaptativa() {
async function gerarQuestoesAdaptativas() {

    const botao =
        document.getElementById("proxima");
        document.getElementById(
            "proxima"
        );


    botao.disabled = true;

@@ -391,10 +548,34 @@ async function gerarQuestaoAdaptativa() {
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

                acao: "gerar_adaptativas",
                acao:
                    "gerar_adaptativas",

                ...dadosAluno,

@@ -403,35 +584,64 @@ async function gerarQuestaoAdaptativa() {
            });


        console.log(
            "Resposta adaptativa:",
            resultado
        );


        if (
            !resultado.questoes ||
            resultado.questoes.length !== 6
            !resultado ||
            !Array.isArray(
                resultado.questoes
            )
        ) {

            throw new Error(
                "A IA não retornou as 6 questões adaptativas."
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
                resultado.questoes
                resultado.questoes.slice(
                    0,
                    6
                )
            );


        questaoAtual = 18;


        mostrarQuestao();


    } catch (erro) {

        console.error(erro);
        console.error(
            "Erro nas questões adaptativas:",
            erro
        );


        alert(
            "Erro ao gerar as questões adaptativas.\n\n" +
            erro.message
        );


        mostrarResultado();


@@ -493,17 +703,24 @@ function calcularResultados() {
            dados.total++;


            if (resposta.correta) {
            if (
                resposta.correta
            ) {

                dados.acertos++;
            }


            dados.tempoTotal +=
                resposta.tempo || 0;
                Number(
                    resposta.tempo
                ) || 0;


            dados.dificuldadeTotal +=
                resposta.dificuldade || 3;
                Number(
                    resposta.dificuldade
                ) || 3;
        }
    );

@@ -512,7 +729,9 @@ function calcularResultados() {
        estrategia => {

            const dados =
                resultados[estrategia];
                resultados[
                    estrategia
                ];


            dados.porcentagem =
@@ -521,7 +740,8 @@ function calcularResultados() {
                        (
                            dados.acertos /
                            dados.total
                        ) * 100
                        ) *
                        100
                    )
                    : 0;

@@ -566,7 +786,9 @@ function finalizarAvaliacao() {

function mostrarResultado() {

    mostrarTela("resultado");
    mostrarTela(
        "resultado"
    );


    const resultados =
@@ -580,7 +802,9 @@ function mostrarResultado() {
        (estrategia, indice) => {

            const dados =
                resultados[estrategia];
                resultados[
                    estrategia
                ];


            const porcentagem =
@@ -592,24 +816,37 @@ function mostrarResultado() {
            );


            document.getElementById(
                `resultado${indice + 1}`
            ).textContent =
                `${porcentagem}%`;
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
        Math.max(...porcentagens);
        Math.max(
            ...porcentagens
        );


    const melhorIndice =
        porcentagens.indexOf(maior);
        porcentagens.indexOf(
            maior
        );


    const melhorEstrategia =
        estrategias[melhorIndice];
        estrategias[
            melhorIndice
        ];


    dadosAluno.melhorEstrategia =
@@ -623,7 +860,9 @@ function mostrarResultado() {
        `A avaliação foi concluída. ` +
        `A estratégia que apresentou o maior ` +
        `desempenho nesta avaliação foi ` +
        `<strong>${melhorEstrategia}</strong>, ` +
        `<strong>${escapeHTML(
            melhorEstrategia
        )}</strong>, ` +
        `com ${maior}% de acertos.`;
}

@@ -641,10 +880,12 @@ async function gerarAtividades() {


    area.innerHTML = `

        <p>
            A inteligência artificial está
            preparando as atividades adaptadas...
        </p>

    `;


@@ -657,7 +898,8 @@ async function gerarAtividades() {
        const resultado =
            await chamarAPI({

                acao: "gerar_atividades",
                acao:
                    "gerar_atividades",

                ...dadosAluno,

@@ -669,13 +911,31 @@ async function gerarAtividades() {
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
            !resultado.atividades ||
            !resultado.atividades.length
            resultado.atividades.length === 0
        ) {

            throw new Error(
                "A IA não retornou atividades."
                "A IA não retornou nenhuma atividade."
            );
        }

@@ -703,7 +963,10 @@ async function gerarAtividades() {


                titulo.textContent =
                    `${indice + 1}. ${atividade.titulo}`;
                    `${indice + 1}. ${
                        atividade.titulo ||
                        "Atividade"
                    }`;


                const descricao =
@@ -713,7 +976,8 @@ async function gerarAtividades() {


                descricao.textContent =
                    atividade.descricao;
                    atividade.descricao ||
                    "";


                const questao =
@@ -723,18 +987,29 @@ async function gerarAtividades() {


                questao.textContent =
                    atividade.questao;
                    atividade.questao ||
                    "";


                div.appendChild(
                    titulo
                );


                div.appendChild(titulo);
                div.appendChild(
                    descricao
                );

                div.appendChild(descricao);

                div.appendChild(questao);
                div.appendChild(
                    questao
                );


                if (
                    atividade.alternativas &&
                    Array.isArray(
                        atividade.alternativas
                    ) &&
                    atividade.alternativas.length
                ) {

@@ -752,54 +1027,87 @@ async function gerarAtividades() {
                                    "li"
                                );


                            item.textContent =
                                alternativa;


                            lista.appendChild(
                                item
                            );
                        }
                    );


                    div.appendChild(lista);
                    div.appendChild(
                        lista
                    );
                }


                area.appendChild(div);
                area.appendChild(
                    div
                );
            }
        );


    } catch (erro) {

        console.error(erro);
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
                ${escapeHTML(erro.message)}
                ${escapeHTML(
                    erro.message
                )}
            </p>

        `;
    }
}


// ============================================================
// PROTEÇÃO DE TEXTO
// PROTEÇÃO CONTRA HTML
// ============================================================

function escapeHTML(texto) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

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
