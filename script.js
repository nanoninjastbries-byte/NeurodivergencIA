// ============================================================
// NEURODIVERGÊNCIA
// CONEXÃO COM GOOGLE APPS SCRIPT + GEMINI
// ============================================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";


// ============================================================
// VARIÁVEIS
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
// TROCAR DE TELA
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
// CHAMAR GOOGLE APPS SCRIPT
// ============================================================

async function chamarAPI(payload) {

    const resposta = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
        throw new Error(
            "Não foi possível conectar ao servidor."
        );
    }

    const dados = await resposta.json();

    if (!dados.sucesso) {
        throw new Error(
            dados.erro || "Erro desconhecido no servidor."
        );
    }

    return dados.dados;
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
            '#configuracao button'
        );

    botao.disabled = true;

    botao.textContent =
        "Preparando avaliação...";


    try {

        mostrarTela("avaliacao");

        document.getElementById("pergunta").textContent =
            "A inteligência artificial está preparando sua avaliação...";

        document.getElementById("alternativas").innerHTML =
            "";

        const resultado = await chamarAPI({

            acao: "gerar_avaliacao",

            ...dadosAluno

        });


        if (
            !resultado.questoes ||
            resultado.questoes.length !== 18
        ) {

            throw new Error(
                "A IA não retornou as 18 questões esperadas."
            );
        }


        questoes = resultado.questoes;

        questaoAtual = 0;
        respostas = [];

        mostrarQuestao();


    } catch (erro) {

        console.error(erro);

        mostrarTela("configuracao");

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


    document.getElementById("contador").textContent =
        `Questão ${questaoAtual + 1} de ${questoes.length}`;


    document.getElementById("estrategia").textContent =
        questao.estrategia;


    document.getElementById("pergunta").textContent =
        questao.pergunta;


    const progresso =
        ((questaoAtual + 1) / 24) * 100;


    document.getElementById("progresso").style.width =
        `${progresso}%`;


    const alternativas =
        document.getElementById("alternativas");


    alternativas.innerHTML = "";


    questao.alternativas.forEach(
        (alternativa, indice) => {

            const botao =
                document.createElement("button");

            botao.className =
                "alternativa";

            botao.textContent =
                alternativa;

            botao.onclick = () =>
                selecionarAlternativa(indice);


            alternativas.appendChild(botao);
        }
    );


    document.getElementById("dificuldade").value = 3;

    document.getElementById("proxima").disabled = true;

    inicioQuestao = Date.now();
}


// ============================================================
// SELECIONAR ALTERNATIVA
// ============================================================

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


    botoes[indice].classList.add(
        "selecionada"
    );


    const questao =
        questoes[questaoAtual];


    const tempo =
        Math.round(
            (Date.now() - inicioQuestao) / 1000
        );


    respostas[questaoAtual] = {

        estrategia:
            questao.estrategia,

        correta:
            indice === questao.correta,

        dificuldade:
            Number(
                document.getElementById(
                    "dificuldade"
                ).value
            ),

        tempo: tempo,

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


    if (
        questaoAtual <
        questoes.length
    ) {

        mostrarQuestao();

        return;
    }


    // Terminou as 18 iniciais
    await gerarQuestaoAdaptativa();
}


// ============================================================
// GERAR 6 QUESTÕES ADAPTATIVAS
// ============================================================

async function gerarQuestaoAdaptativa() {

    const botao =
        document.getElementById("proxima");

    botao.disabled = true;

    botao.textContent =
        "Analisando desempenho...";


    try {

        const resultados =
            calcularResultados();


        const resultado =
            await chamarAPI({

                acao: "gerar_adaptativas",

                ...dadosAluno,

                resultados:
                    resultados
            });


        if (
            !resultado.questoes ||
            resultado.questoes.length !== 6
        ) {

            throw new Error(
                "A IA não retornou as 6 questões adaptativas."
            );
        }


        questoes =
            questoes.concat(
                resultado.questoes
            );


        mostrarQuestao();


    } catch (erro) {

        console.error(erro);

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


            if (resposta.correta) {
                dados.acertos++;
            }


            dados.tempoTotal +=
                resposta.tempo || 0;


            dados.dificuldadeTotal +=
                resposta.dificuldade || 3;
        }
    );


    estrategias.forEach(
        estrategia => {

            const dados =
                resultados[estrategia];


            dados.porcentagem =
                dados.total > 0
                    ? Math.round(
                        (
                            dados.acertos /
                            dados.total
                        ) * 100
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

    mostrarTela("resultado");


    const resultados =
        calcularResultados();


    const porcentagens = [];


    estrategias.forEach(
        (estrategia, indice) => {

            const dados =
                resultados[estrategia];


            const porcentagem =
                dados.porcentagem;


            porcentagens.push(
                porcentagem
            );


            document.getElementById(
                `resultado${indice + 1}`
            ).textContent =
                `${porcentagem}%`;
        }
    );


    const maior =
        Math.max(...porcentagens);


    const melhorIndice =
        porcentagens.indexOf(maior);


    const melhorEstrategia =
        estrategias[melhorIndice];


    dadosAluno.melhorEstrategia =
        melhorEstrategia;


    document.getElementById(
        "mensagemResultado"
    ).innerHTML =

        `A avaliação foi concluída. ` +
        `A estratégia que apresentou o maior ` +
        `desempenho nesta avaliação foi ` +
        `<strong>${melhorEstrategia}</strong>, ` +
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

                acao: "gerar_atividades",

                ...dadosAluno,

                resultados:
                    resultados,

                melhorEstrategia:
                    dadosAluno.melhorEstrategia
            });


        if (
            !resultado.atividades ||
            !resultado.atividades.length
        ) {

            throw new Error(
                "A IA não retornou atividades."
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
                    `${indice + 1}. ${atividade.titulo}`;


                const descricao =
                    document.createElement(
                        "p"
                    );


                descricao.textContent =
                    atividade.descricao;


                const questao =
                    document.createElement(
                        "p"
                    );


                questao.textContent =
                    atividade.questao;


                div.appendChild(titulo);

                div.appendChild(descricao);

                div.appendChild(questao);


                if (
                    atividade.alternativas &&
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


                    div.appendChild(lista);
                }


                area.appendChild(div);
            }
        );


    } catch (erro) {

        console.error(erro);


        area.innerHTML = `
            <p>
                Não foi possível gerar as
                atividades adaptadas.
            </p>

            <p>
                ${escapeHTML(erro.message)}
            </p>
        `;
    }
}


// ============================================================
// PROTEÇÃO DE TEXTO
// ============================================================

function escapeHTML(texto) {

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
