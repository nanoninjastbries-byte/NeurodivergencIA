const API_URL =
    "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";

const ESTRATEGIAS = [
    "Divisão em etapas",
    "Apoio visual",
    "Instruções claras",
    "Repetição adaptativa"
];

let dadosAluno = {};
let questoes = [];
let respostas = [];
let questaoAtual = 0;
let inicioQuestao = null;
let alternativaSelecionada = null;
let questoesIniciais = [];
let questoesAdaptativas = [];
let estrategiaEscolhida = "";
let avaliacaoFinalizada = false;

document.addEventListener("DOMContentLoaded", function () {

    const btnComecar = document.getElementById("btnComecar");
    const form = document.getElementById("formAvaliacao");
    const btnIniciar = document.getElementById("btnIniciarExercicios");
    const btnRegistrar = document.getElementById("registrarResposta");
    const btnProxima = document.getElementById("proxima");
    const btnAtividades = document.getElementById("btnAtividades");
    const btnReiniciar = document.getElementById("btnReiniciar");
    const btnNova = document.getElementById("btnNovaAvaliacao");

    if (btnComecar) {
        btnComecar.addEventListener("click", function () {
            mostrarTela("configuracao");
        });
    }

    if (form) {
        form.addEventListener("submit", iniciarAvaliacao);
    }

    if (btnIniciar) {
        btnIniciar.addEventListener("click", iniciarExercicios);
    }

    if (btnRegistrar) {
        btnRegistrar.addEventListener("click", registrarResposta);
    }

    if (btnProxima) {
        btnProxima.addEventListener("click", proximaQuestao);
    }

    if (btnAtividades) {
        btnAtividades.addEventListener("click", mostrarAtividades);
    }

    if (btnReiniciar) {
        btnReiniciar.addEventListener("click", reiniciar);
    }

    if (btnNova) {
        btnNova.addEventListener("click", reiniciar);
    }
});

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

async function iniciarAvaliacao(event) {

    if (event) {
        event.preventDefault();
    }

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

    erro.textContent = "";
    erro.classList.add("oculto");
    erro.hidden = true;

    if (!nome || !idade || !ano || !materia || !conteudo) {

        erro.textContent =
            "Preencha todos os campos obrigatórios.";

        erro.classList.remove("oculto");
        erro.hidden = false;

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

    questoes = [];
    respostas = [];
    questaoAtual = 0;
    inicioQuestao = null;
    alternativaSelecionada = null;
    questoesIniciais = [];
    questoesAdaptativas = [];
    estrategiaEscolhida = "";
    avaliacaoFinalizada = false;

    mostrarTela("preparacao");

    document.getElementById("statusPreparacao").innerHTML =
        "<strong>Criando atividades</strong>" +
        "<p>A IA está preparando questões sobre " +
        escaparHTML(materia) +
        " — " +
        escaparHTML(conteudo) +
        ".</p>";

    const btn =
        document.getElementById("btnIniciarExercicios");

    if (btn) {
        btn.classList.add("oculto");
        btn.hidden = true;
        btn.disabled = true;
    }

    try {

        await gerarQuestoesIniciais();

    } catch (erroGeracao) {

        document.getElementById("statusPreparacao").textContent =
            "Erro ao preparar as atividades: " +
            erroGeracao.message;
    }
}

async function gerarQuestoesIniciais() {

    const payload = {

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
    };

    const resultado =
        await fazerRequisicao(payload);

    if (
        !resultado.questoes ||
        !Array.isArray(resultado.questoes)
    ) {
        throw new Error(
            "A IA não retornou as questões."
        );
    }

    if (resultado.questoes.length !== 18) {

        throw new Error(
            "Foram recebidas " +
            resultado.questoes.length +
            " questões. Eram esperadas 18."
        );
    }

    questoesIniciais =
        organizarQuestoesIniciais(
            resultado.questoes
        );

    questoes =
        questoesIniciais.slice();

    document.getElementById("statusPreparacao").innerHTML =
        "<strong>As 18 questões iniciais foram preparadas.</strong>" +
        "<p>Quando estiver pronto, inicie a avaliação.</p>";

    atualizarContador();

    const btn =
        document.getElementById("btnIniciarExercicios");

    if (btn) {

        btn.classList.remove("oculto");

        btn.hidden = false;

        btn.removeAttribute("hidden");

        btn.disabled = false;

        btn.style.display = "block";
        btn.style.visibility = "visible";
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
    }
}

function organizarQuestoesIniciais(lista) {

    const grupos = {};

    [
        "Divisão em etapas",
        "Apoio visual",
        "Instruções claras"
    ].forEach(function (nome) {
        grupos[nome] = [];
    });

    lista.forEach(function (questao) {

        const normalizada =
            normalizarQuestao(questao);

        let estrategia =
            normalizada.estrategia;

        if (!grupos[estrategia]) {

            estrategia =
                "Divisão em etapas";
        }

        normalizada.estrategia =
            estrategia;

        grupos[estrategia].push(
            normalizada
        );
    });

    const resultado = [];

    [
        "Divisão em etapas",
        "Apoio visual",
        "Instruções claras"
    ].forEach(function (nome) {

        const grupo =
            grupos[nome] || [];

        if (grupo.length !== 6) {

            throw new Error(
                "A estratégia " +
                nome +
                " recebeu " +
                grupo.length +
                " questões em vez de 6."
            );
        }

        resultado.push.apply(
            resultado,
            grupo
        );
    });

    return resultado;
}

function iniciarExercicios() {

    if (!questoes.length) {
        return;
    }

    questaoAtual = 0;
    respostas = [];
    avaliacaoFinalizada = false;

    mostrarTela("avaliacao");

    mostrarQuestao();
}

function normalizarQuestao(q) {

    const alternativas =
        Array.isArray(q.alternativas)
            ? q.alternativas
            : [
                q.alternativa_a,
                q.alternativa_b,
                q.alternativa_c,
                q.alternativa_d
            ];

    let correta =
        q.resposta_correta;

    if (
        correta === undefined ||
        correta === null
    ) {
        correta = q.correta;
    }

    if (typeof correta === "string") {

        const letras = {
            A: 0,
            B: 1,
            C: 2,
            D: 3
        };

        const letra =
            correta.trim().toUpperCase();

        if (letras[letra] !== undefined) {

            correta =
                letras[letra];

        } else if (!isNaN(Number(correta))) {

            correta =
                Number(correta);
        }
    }

    return {

        pergunta:
            q.pergunta ||
            q.enunciado ||
            "",

        alternativas:
            alternativas
                .slice(0, 4)
                .map(function (a) {
                    return String(a || "");
                }),

        correta:
            Number(correta),

        explicacao:
            q.explicacao || "",

        estrategia:
            q.estrategia || "",

        passos:
            Array.isArray(q.passos)
                ? q.passos
                : [],

        visual:
            typeof q.visual === "string"
                ? q.visual
                : ""
    };
}

function mostrarQuestao() {

    const q =
        questoes[questaoAtual];

    if (!q) {
        return;
    }

    alternativaSelecionada = null;

    const feedback =
        document.getElementById("feedback");

    feedback.innerHTML = "";
    feedback.classList.add("oculto");
    feedback.hidden = true;

    const registrar =
        document.getElementById(
            "registrarResposta"
        );

    registrar.classList.remove("oculto");
    registrar.disabled = false;

    const proxima =
        document.getElementById("proxima");

    proxima.classList.add("oculto");

    document.getElementById(
        "dificuldade"
    ).value = 2;

    document.getElementById(
        "pergunta"
    ).textContent = q.pergunta;

    document.getElementById(
        "estrategia"
    ).textContent =
        q.estrategia ||
        "Atividade adaptada";

    atualizarContador();

    renderizarPassos(q.passos);

    renderizarVisual(q.visual);

    renderizarAlternativas(
        q.alternativas
    );

    inicioQuestao =
        Date.now();
}

function atualizarContador() {

    const total =
        questoes.length;

    const atual =
        questaoAtual + 1;

    document.getElementById(
        "contador"
    ).textContent =
        atual + " / " + total;

    const porcentagem =
        Math.round(
            (atual / total) * 100
        );

    document.getElementById(
        "progresso"
    ).style.width =
        porcentagem + "%";
}

function renderizarAlternativas(
    alternativas
) {

    const container =
        document.getElementById(
            "alternativas"
        );

    container.innerHTML = "";

    alternativas.forEach(
        function (alternativa, indice) {

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
                function () {

                    document
                        .querySelectorAll(
                            ".alternativa"
                        )
                        .forEach(
                            function (item) {
                                item.classList
                                    .remove(
                                        "selecionada"
                                    );
                            }
                        );

                    botao.classList.add(
                        "selecionada"
                    );

                    alternativaSelecionada =
                        indice;
                }
            );

            container.appendChild(
                botao
            );
        }
    );
}

function renderizarPassos(passos) {

    const bloco =
        document.getElementById(
            "passos"
        );

    const lista =
        document.getElementById(
            "listaPassos"
        );

    lista.innerHTML = "";

    bloco.classList.add("oculto");
    bloco.hidden = true;

    if (
        !Array.isArray(passos) ||
        passos.length === 0
    ) {
        return;
    }

    passos.forEach(
        function (passo) {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                String(passo);

            lista.appendChild(li);
        }
    );

    bloco.classList.remove("oculto");
    bloco.hidden = false;
}

function renderizarVisual(visual) {

    const bloco =
        document.getElementById(
            "visual"
        );

    const lista =
        document.getElementById(
            "listaVisual"
        );

    lista.innerHTML = "";

    bloco.classList.add("oculto");
    bloco.hidden = true;

    if (!visual) {
        return;
    }

    bloco.classList.remove("oculto");
    bloco.hidden = false;

    const texto =
        document.createElement(
            "div"
        );

    texto.className =
        "visual-texto";

    texto.textContent =
        String(visual);

    lista.appendChild(texto);
}

function registrarResposta() {

    if (
        alternativaSelecionada === null
    ) {

        mostrarFeedback(
            "Selecione uma alternativa antes de continuar.",
            false
        );

        return;
    }

    const q =
        questoes[questaoAtual];

    const dificuldade =
        Number(
            document.getElementById(
                "dificuldade"
            ).value
        );

    const tempo =
        inicioQuestao
            ? Math.round(
                (Date.now() -
                    inicioQuestao) /
                1000
            )
            : 0;

    const correta =
        alternativaSelecionada ===
        Number(q.correta);

    respostas.push({

        questao:
            questaoAtual + 1,

        estrategia:
            q.estrategia,

        resposta:
            alternativaSelecionada,

        correta:
            correta,

        dificuldade:
            dificuldade,

        tempo:
            tempo
    });

    mostrarFeedback(
        correta
            ? "Resposta correta. " +
              (q.explicacao || "")
            : "Resposta registrada. " +
              (q.explicacao || ""),
        correta
    );

    document
        .getElementById(
            "registrarResposta"
        )
        .classList.add("oculto");

    document
        .getElementById(
            "registrarResposta"
        )
        .disabled = true;

    document
        .getElementById(
            "proxima"
        )
        .classList.remove("oculto");
}

function mostrarFeedback(
    mensagem,
    correta
) {

    const feedback =
        document.getElementById(
            "feedback"
        );

    feedback.textContent =
        mensagem;

    feedback.classList.remove(
        "oculto",
        "correta",
        "incorreta"
    );

    feedback.classList.add(
        correta
            ? "correta"
            : "incorreta"
    );

    feedback.hidden = false;
}

async function proximaQuestao() {

    questaoAtual++;

    if (
        questaoAtual <
        questoes.length
    ) {

        mostrarQuestao();

        return;
    }

    if (
        questoesAdaptativas.length === 0
    ) {

        await prepararAdaptativas();

        return;
    }

    finalizarAvaliacao();
}

async function prepararAdaptativas() {

    mostrarTela("adaptacao");

    document.getElementById(
        "statusAdaptacao"
    ).textContent =
        "A IA está analisando seu desempenho e preparando atividades adaptadas...";

    try {

        const desempenho =
            calcularDesempenho();

        estrategiaEscolhida =
            escolherEstrategia(
                desempenho
            );

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

        const resultado =
            await fazerRequisicao(
                payload
            );

        if (
            !resultado.questoes ||
            !Array.isArray(
                resultado.questoes
            )
        ) {

            throw new Error(
                "A IA não retornou as atividades adaptativas."
            );
        }

        if (
            resultado.questoes.length !== 6
        ) {

            throw new Error(
                "A IA retornou " +
                resultado.questoes.length +
                " atividades adaptativas. Eram esperadas 6."
            );
        }

        questoesAdaptativas =
            resultado.questoes.map(
                function (q) {

                    const n =
                        normalizarQuestao(q);

                    n.estrategia =
                        "Repetição adaptativa";

                    return n;
                }
            );

        questoes =
            questoesIniciais.concat(
                questoesAdaptativas
            );

        document.getElementById(
            "statusAdaptacao"
        ).textContent =
            "As 6 atividades adaptativas foram preparadas.";

        await esperar(700);

        questaoAtual = 18;

        mostrarTela("avaliacao");

        mostrarQuestao();

    } catch (erro) {

        document.getElementById(
            "statusAdaptacao"
        ).textContent =
            "Erro ao preparar as atividades adaptativas: " +
            erro.message;
    }
}

function calcularDesempenho() {

    const resultado = {};

    [
        "Divisão em etapas",
        "Apoio visual",
        "Instruções claras"
    ].forEach(function (estrategia) {

        const lista =
            respostas.filter(
                function (r) {
                    return (
                        r.estrategia ===
                        estrategia
                    );
                }
            );

        if (!lista.length) {

            resultado[estrategia] = {

                acertos: 0,
                total: 0,
                percentual: 0,
                tempo_medio: 0,
                dificuldade_media: 0
            };

            return;
        }

        const acertos =
            lista.filter(
                function (r) {
                    return r.correta;
                }
            ).length;

        const tempo =
            lista.reduce(
                function (soma, r) {
                    return soma +
                        Number(
                            r.tempo || 0
                        );
                },
                0
            ) / lista.length;

        const dificuldade =
            lista.reduce(
                function (soma, r) {
                    return soma +
                        Number(
                            r.dificuldade || 0
                        );
                },
                0
            ) / lista.length;

        resultado[estrategia] = {

            acertos:
                acertos,

            total:
                lista.length,

            percentual:
                Math.round(
                    (acertos /
                        lista.length) *
                    100
                ),

            tempo_medio:
                Math.round(tempo),

            dificuldade_media:
                Number(
                    dificuldade.toFixed(2)
                )
        };
    });

    return resultado;
}

function escolherEstrategia(
    desempenho
) {

    let melhor =
        "Divisão em etapas";

    let maior = -1;

    [
        "Divisão em etapas",
        "Apoio visual",
        "Instruções claras"
    ].forEach(function (estrategia) {

        const dados =
            desempenho[estrategia];

        if (
            dados &&
            dados.percentual > maior
        ) {

            maior =
                dados.percentual;

            melhor =
                estrategia;
        }
    });

    return melhor;
}

function finalizarAvaliacao() {

    if (avaliacaoFinalizada) {
        return;
    }

    avaliacaoFinalizada = true;

    const desempenho =
        calcularDesempenho();

    mostrarTela("resultado");

    preencherResultados(
        desempenho
    );
}

function preencherResultados(
    desempenho
) {

    const estrategias = [
        "Divisão em etapas",
        "Apoio visual",
        "Instruções claras"
    ];

    estrategias.forEach(
        function (nome, indice) {

            const dados =
                desempenho[nome];

            const elemento =
                document.getElementById(
                    "resultado" +
                    (indice + 1)
                );

            if (!elemento) {
                return;
            }

            elemento.innerHTML =
                "<strong>" +
                escaparHTML(nome) +
                "</strong>" +
                "<span>" +
                dados.percentual +
                "% de acertos</span>";
        }
    );

    const adaptativas =
        respostas.filter(
            function (r) {
                return (
                    r.estrategia ===
                    "Repetição adaptativa"
                );
            }
        );

    let percentualAdaptativo = 0;

    if (adaptativas.length) {

        const acertos =
            adaptativas.filter(
                function (r) {
                    return r.correta;
                }
            ).length;

        percentualAdaptativo =
            Math.round(
                (acertos /
                    adaptativas.length) *
                100
            );
    }

    const resultado4 =
        document.getElementById(
            "resultado4"
        );

    if (resultado4) {

        resultado4.innerHTML =
            "<strong>Repetição adaptativa</strong>" +
            "<span>" +
            percentualAdaptativo +
            "% de acertos</span>";
    }

    const mensagem =
        document.getElementById(
            "mensagemResultado"
        );

    if (mensagem) {

        mensagem.textContent =
            "A estratégia com maior percentual de acertos na etapa inicial foi " +
            estrategiaEscolhida +
            ". A etapa adaptativa foi criada a partir desse desempenho.";
    }
}

function mostrarAtividades() {

    const lista =
        document.getElementById(
            "listaAtividades"
        );

    lista.innerHTML = "";

    questoesAdaptativas.forEach(
        function (q, indice) {

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
                "Atividade " +
                (indice + 1);

            const pergunta =
                document.createElement(
                    "p"
                );

            pergunta.textContent =
                q.pergunta;

            atividade.appendChild(
                titulo
            );

            atividade.appendChild(
                pergunta
            );

            q.alternativas.forEach(
                function (alt, i) {

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.textContent =
                        String.fromCharCode(
                            65 + i
                        ) +
                        ") " +
                        alt;

                    atividade.appendChild(
                        div
                    );
                }
            );

            lista.appendChild(
                atividade
            );
        }
    );

    mostrarTela(
        "atividades"
    );
}

function reiniciar() {

    dadosAluno = {};
    questoes = [];
    respostas = [];
    questaoAtual = 0;
    inicioQuestao = null;
    alternativaSelecionada = null;
    questoesIniciais = [];
    questoesAdaptativas = [];
    estrategiaEscolhida = "";
    avaliacaoFinalizada = false;

    const form =
        document.getElementById(
            "formAvaliacao"
        );

    if (form) {
        form.reset();
    }

    const btn =
        document.getElementById(
            "btnIniciarExercicios"
        );

    if (btn) {

        btn.classList.add("oculto");
        btn.hidden = true;
        btn.disabled = true;
    }

    mostrarTela("inicio");
}

async function fazerRequisicao(
    payload
) {

    let resposta;

    try {

        resposta =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(
                            payload
                        ),

                    redirect:
                        "follow"
                }
            );

    } catch (erro) {

        throw new Error(
            "Não foi possível conectar ao servidor: " +
            erro.message
        );
    }

    const texto =
        await resposta.text();

    console.log(
        "Status HTTP:",
        resposta.status
    );

    console.log(
        "Resposta do Apps Script:",
        texto
    );

    if (
        !texto ||
        !texto.trim()
    ) {

        throw new Error(
            "O servidor não retornou nenhum conteúdo."
        );
    }

    let dados;

    try {

        dados =
            JSON.parse(texto);

    } catch (erro) {

        console.error(
            "Resposta completa:",
            texto
        );

        throw new Error(
            "O Apps Script não retornou JSON. " +
            "Resposta recebida: " +
            texto.substring(0, 500)
        );
    }

    if (
        dados &&
        dados.ok === false
    ) {

        throw new Error(
            dados.erro ||
            "Erro desconhecido no servidor."
        );
    }

    if (
        !dados ||
        typeof dados !== "object"
    ) {

        throw new Error(
            "O servidor retornou dados inválidos."
        );
    }

    return dados;
}

function escaparHTML(valor) {

    return String(
        valor == null
            ? ""
            : valor
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

function esperar(ms) {

    return new Promise(
        function (resolve) {
            setTimeout(
                resolve,
                ms
            );
        }
    );
}
