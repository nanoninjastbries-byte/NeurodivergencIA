// ============================================================
// NEURODIVERGÊNCIA
// JAVASCRIPT DO SITE
// ============================================================


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwh_ihAxxU-eM7YSmDzX-rDP4XabCABM6OON0KKs3Gwx0vvSOCQRxTxUOj2ZAIRbppf/exec";

const TOTAL_QUESTOES = 24;
const QUESTOES_INICIAIS = 18;
const QUESTOES_ADAPTATIVAS = 6;

const ESTRATEGIAS = [
  "Divisão em etapas",
  "Apoio visual",
  "Instruções claras",
  "Repetição adaptativa"
];


// ============================================================
// ESTADO DA APLICAÇÃO
// ============================================================

let estado = {
  aluno: {
    nome: "",
    idade: "",
    ano: "",
    materia: "",
    conteudo: "",
    observacoes: ""
  },

  questoes: [],

  respostas: [],

  indiceQuestao: 0,

  inicioQuestao: 0,

  questaoRespondida: false,

  resultados: {},

  melhorEstrategia: "",

  notaGeral: 0,

  atividades: []
};


// ============================================================
// MOSTRAR TELA
// ============================================================

function mostrarTela(idTela) {

  const telas =
    document.querySelectorAll(".tela");

  telas.forEach(function(tela) {
    tela.classList.remove("ativa");
  });


  const tela =
    document.getElementById(idTela);

  if (!tela) {
    console.error(
      "Tela não encontrada:",
      idTela
    );
    return;
  }


  tela.classList.add("ativa");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ============================================================
// CHAMAR API
// ============================================================

async function chamarAPI(dados) {

  const resposta =
    await fetch(
      API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify(dados)
      }
    );


  if (!resposta.ok) {

    throw new Error(
      "Erro de comunicação com o servidor: " +
      resposta.status
    );

  }


  const texto =
    await resposta.text();


  let resultado;


  try {

    resultado =
      JSON.parse(texto);

  } catch (erro) {

    console.error(
      "Resposta recebida:",
      texto
    );

    throw new Error(
      "O servidor retornou uma resposta inválida."
    );

  }


  if (!resultado.sucesso) {

    throw new Error(
      resultado.erro ||
      "O servidor não conseguiu processar a solicitação."
    );

  }


  return resultado.dados;
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


  if (!nome) {

    alert(
      "Informe o nome do estudante."
    );

    return;

  }


  if (!idade) {

    alert(
      "Informe a idade do estudante."
    );

    return;

  }


  if (!ano) {

    alert(
      "Informe o ano escolar."
    );

    return;

  }


  if (!materia) {

    alert(
      "Informe a matéria."
    );

    return;

  }


  if (!conteudo) {

    alert(
      "Informe o conteúdo."
    );

    return;

  }


  estado.aluno = {
    nome: nome,
    idade: idade,
    ano: ano,
    materia: materia,
    conteudo: conteudo,
    observacoes: observacoes
  };


  estado.questoes = [];

  estado.respostas = [];

  estado.indiceQuestao = 0;

  estado.inicioQuestao = 0;

  estado.questaoRespondida = false;

  estado.resultados = {};

  estado.melhorEstrategia = "";

  estado.notaGeral = 0;

  estado.atividades = [];


  const botao =
    document.getElementById(
      "botaoIniciar"
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "Preparando avaliação...";

  }


  mostrarTela("avaliacao");


  const pergunta =
    document.getElementById(
      "pergunta"
    );


  if (pergunta) {

    pergunta.textContent =
      "Gerando as atividades...";

  }


  try {

    const resultado =
      await chamarAPI({

        acao: "gerar_avaliacao",

        nome: estado.aluno.nome,

        idade: estado.aluno.idade,

        ano: estado.aluno.ano,

        materia: estado.aluno.materia,

        conteudo: estado.aluno.conteudo,

        observacoes:
          estado.aluno.observacoes

      });


    if (
      !resultado ||
      !Array.isArray(resultado.questoes)
    ) {

      throw new Error(
        "A avaliação não foi gerada corretamente."
      );

    }


    if (
      resultado.questoes.length < QUESTOES_INICIAIS
    ) {

      throw new Error(
        "A avaliação recebeu apenas " +
        resultado.questoes.length +
        " questões. Eram necessárias 18."
      );

    }


    estado.questoes =
      resultado.questoes
        .slice(
          0,
          QUESTOES_INICIAIS
        );


    mostrarQuestao();


  } catch (erro) {

    console.error(erro);


    mostrarTela(
      "configuracao"
    );


    alert(
      "Erro ao preparar as atividades:\n\n" +
      erro.message
    );

  } finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "Começar avaliação";

    }

  }

}


// ============================================================
// MOSTRAR QUESTÃO
// ============================================================

function mostrarQuestao() {

  const questao =
    estado.questoes[
      estado.indiceQuestao
    ];


  if (!questao) {

    console.error(
      "Questão não encontrada."
    );

    return;

  }


  estado.questaoRespondida = false;

  estado.inicioQuestao =
    Date.now();


  const numero =
    estado.indiceQuestao + 1;


  const contador =
    document.getElementById(
      "contador"
    );


  const estrategia =
    document.getElementById(
      "estrategia"
    );


  const pergunta =
    document.getElementById(
      "pergunta"
    );


  const alternativas =
    document.getElementById(
      "alternativas"
    );


  const progresso =
    document.getElementById(
      "progresso"
    );


  const dificuldade =
    document.getElementById(
      "dificuldade"
    );


  const botaoProxima =
    document.getElementById(
      "proxima"
    );


  if (contador) {

    contador.textContent =
      "Questão " +
      numero +
      " de " +
      TOTAL_QUESTOES;

  }


  if (estrategia) {

    estrategia.textContent =
      normalizarEstrategia(
        questao.estrategia
      );

  }


  if (pergunta) {

    pergunta.textContent =
      questao.pergunta;

  }


  if (progresso) {

    const porcentagem =
      (numero / TOTAL_QUESTOES) *
      100;

    progresso.style.width =
      porcentagem + "%";

  }


  if (dificuldade) {

    dificuldade.value = 3;

  }


  if (botaoProxima) {

    botaoProxima.disabled = true;

  }


  if (alternativas) {

    alternativas.innerHTML = "";


    questao.alternativas.forEach(
      function(
        alternativa,
        indice
      ) {

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
          function() {

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

  }

}


// ============================================================
// SELECIONAR ALTERNATIVA
// ============================================================

function selecionarAlternativa(
  indiceSelecionado
) {

  if (estado.questaoRespondida) {
    return;
  }


  const questao =
    estado.questoes[
      estado.indiceQuestao
    ];


  if (!questao) {
    return;
  }


  const tempo =
    Math.max(
      1,
      Math.round(
        (
          Date.now() -
          estado.inicioQuestao
        ) / 1000
      )
    );


  const dificuldadeElemento =
    document.getElementById(
      "dificuldade"
    );


  const dificuldade =
    dificuldadeElemento
      ? Number(
          dificuldadeElemento.value
        )
      : 3;


  const correta =
    obterIndiceCorreto(
      questao
    );


  const acertou =
    Number(indiceSelecionado) ===
    Number(correta);


  estado.respostas.push({

    questao:
      estado.indiceQuestao,

    estrategia:
      normalizarEstrategia(
        questao.estrategia
      ),

    resposta:
      indiceSelecionado,

    correta:
      correta,

    acertou:
      acertou,

    dificuldade:
      dificuldade,

    tempo:
      tempo

  });


  estado.questaoRespondida =
    true;


  const botoes =
    document.querySelectorAll(
      "#alternativas .alternativa"
    );


  botoes.forEach(
    function(botao, indice) {

      botao.disabled = true;


      if (
        indice === correta
      ) {

        botao.classList.add(
          "correta"
        );

      }


      if (
        indice === indiceSelecionado &&
        indice !== correta
      ) {

        botao.classList.add(
          "incorreta"
        );

      }

    }
  );


  const botaoProxima =
    document.getElementById(
      "proxima"
    );


  if (botaoProxima) {

    botaoProxima.disabled =
      false;

  }

}


// ============================================================
// OBTER RESPOSTA CORRETA
// ============================================================

function obterIndiceCorreto(
  questao
) {

  if (
    typeof questao.correta ===
    "number"
  ) {

    return questao.correta;

  }


  if (
    typeof questao.resposta_correta ===
    "number"
  ) {

    return questao.resposta_correta;

  }


  if (
    typeof questao.resposta_correta ===
    "string"
  ) {

    const texto =
      questao.resposta_correta.trim();


    const numero =
      Number(texto);


    if (
      Number.isInteger(numero) &&
      numero >= 0 &&
      numero <= 3
    ) {

      return numero;

    }


    if (questao.alternativas) {

      const indice =
        questao.alternativas.findIndex(
          function(alternativa) {

            return (
              String(alternativa)
                .trim()
                .toLowerCase() ===
              texto
                .toLowerCase()
            );

          }
        );


      if (indice >= 0) {

        return indice;

      }

    }

  }


  if (
    typeof questao.resposta ===
    "number"
  ) {

    return questao.resposta;

  }


  return 0;

}


// ============================================================
// PRÓXIMA QUESTÃO
// ============================================================

async function proximaQuestao() {

  if (!estado.questaoRespondida) {

    return;

  }


  if (
    estado.indiceQuestao <
    estado.questoes.length - 1
  ) {

    estado.indiceQuestao++;

    mostrarQuestao();

    return;

  }


  if (
    estado.questoes.length ===
    QUESTOES_INICIAIS &&
    estado.respostas.length >=
    QUESTOES_INICIAIS
  ) {

    await gerarQuestoesAdaptativas();

    return;

  }


  if (
    estado.questoes.length >=
    TOTAL_QUESTOES
  ) {

    finalizarAvaliacao();

  }

}


// ============================================================
// GERAR QUESTÕES ADAPTATIVAS
// ============================================================

async function gerarQuestoesAdaptativas() {

  const botao =
    document.getElementById(
      "proxima"
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "Preparando próxima etapa...";

  }


  const pergunta =
    document.getElementById(
      "pergunta"
    );


  if (pergunta) {

    pergunta.textContent =
      "Analisando o desempenho para adaptar as próximas questões...";

  }


  try {

    const resultados =
      calcularResultados();


    const resposta =
      await chamarAPI({

        acao:
          "gerar_adaptativas",

        nome:
          estado.aluno.nome,

        idade:
          estado.aluno.idade,

        ano:
          estado.aluno.ano,

        materia:
          estado.aluno.materia,

        conteudo:
          estado.aluno.conteudo,

        observacoes:
          estado.aluno.observacoes,

        resultados:
          resultados

      });


    if (
      !resposta ||
      !Array.isArray(
        resposta.questoes
      )
    ) {

      throw new Error(
        "As questões adaptativas não foram geradas."
      );

    }


    if (
      resposta.questoes.length <
      QUESTOES_ADAPTATIVAS
    ) {

      throw new Error(
        "A Gemini gerou apenas " +
        resposta.questoes.length +
        " questões adaptativas."
      );

    }


    const adaptativas =
      resposta.questoes
        .slice(
          0,
          QUESTOES_ADAPTATIVAS
        );


    adaptativas.forEach(
      function(questao) {

        questao.estrategia =
          "Repetição adaptativa";

      }
    );


    estado.questoes =
      estado.questoes.concat(
        adaptativas
      );


    estado.indiceQuestao =
      QUESTOES_INICIAIS;


    mostrarQuestao();


  } catch (erro) {

    console.error(erro);


    alert(
      "Erro ao gerar as questões adaptativas:\n\n" +
      erro.message
    );


    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "Próxima questão";

    }

  }

}


// ============================================================
// NORMALIZAR ESTRATÉGIA
// ============================================================

function normalizarEstrategia(
  estrategia
) {

  if (!estrategia) {

    return "";

  }


  const texto =
    String(estrategia)
      .trim()
      .toLowerCase();


  if (
    texto.includes("divisão") ||
    texto.includes("divisao") ||
    texto.includes("etapas")
  ) {

    return "Divisão em etapas";

  }


  if (
    texto.includes("visual")
  ) {

    return "Apoio visual";

  }


  if (
    texto.includes("instruções") ||
    texto.includes("instrucoes") ||
    texto.includes("claras")
  ) {

    return "Instruções claras";

  }


  if (
    texto.includes("repetição") ||
    texto.includes("repeticao") ||
    texto.includes("adaptativa")
  ) {

    return "Repetição adaptativa";

  }


  return String(estrategia).trim();

}


// ============================================================
// CALCULAR RESULTADOS
// ============================================================

function calcularResultados() {

  const resultados = {};


  ESTRATEGIAS.forEach(
    function(estrategia) {

      resultados[estrategia] = {

        total: 0,

        acertos: 0,

        erros: 0,

        tempoTotal: 0,

        dificuldadeTotal: 0,

        porcentagem: 0,

        tempoMedio: 0,

        dificuldadeMedia: 0,

        indice: 0

      };

    }
  );


  estado.respostas.forEach(
    function(resposta) {

      const estrategia =
        normalizarEstrategia(
          resposta.estrategia
        );


      if (
        !resultados[estrategia]
      ) {

        return;

      }


      resultados[estrategia]
        .total++;


      if (resposta.acertou) {

        resultados[estrategia]
          .acertos++;

      } else {

        resultados[estrategia]
          .erros++;

      }


      resultados[estrategia]
        .tempoTotal +=
        Number(resposta.tempo) || 0;


      resultados[estrategia]
        .dificuldadeTotal +=
        Number(
          resposta.dificuldade
        ) || 0;

    }
  );


  ESTRATEGIAS.forEach(
    function(estrategia) {

      const dados =
        resultados[estrategia];


      if (dados.total > 0) {

        dados.porcentagem =
          (
            dados.acertos /
            dados.total
          ) * 100;


        dados.tempoMedio =
          dados.tempoTotal /
          dados.total;


        dados.dificuldadeMedia =
          dados.dificuldadeTotal /
          dados.total;


        // Eficiência temporal:
        // 9 segundos ou menos = 100 pontos.
        // Tempos maiores reduzem gradualmente
        // a eficiência.

        const eficienciaTempo =
          Math.min(
            100,
            (
              9 /
              Math.max(
                dados.tempoMedio,
                1
              )
            ) * 100
          );


        dados.indice =
          (
            dados.porcentagem *
            0.70
          ) +
          (
            eficienciaTempo *
            0.30
          );

      }

    }
  );


  return resultados;

}


// ============================================================
// FINALIZAR AVALIAÇÃO
// ============================================================

function finalizarAvaliacao() {

  estado.resultados =
    calcularResultados();


  estado.melhorEstrategia =
    obterMelhorEstrategia(
      estado.resultados
    );


  estado.notaGeral =
    calcularNotaGeral();


  mostrarResultado();

}


// ============================================================
// OBTER MELHOR ESTRATÉGIA
// ============================================================

function obterMelhorEstrategia(
  resultados
) {

  let melhor =
    "Divisão em etapas";

  let maiorIndice =
    -1;


  ESTRATEGIAS.forEach(
    function(estrategia) {

      const dados =
        resultados[estrategia];


      if (!dados) {
        return;
      }


      if (
        dados.total > 0 &&
        dados.indice > maiorIndice
      ) {

        maiorIndice =
          dados.indice;

        melhor =
          estrategia;

      }

    }
  );


  return melhor;

}


// ============================================================
// CALCULAR NOTA GERAL
// ============================================================

function calcularNotaGeral() {

  if (
    estado.respostas.length === 0
  ) {

    return 0;

  }


  let acertos = 0;


  estado.respostas.forEach(
    function(resposta) {

      if (resposta.acertou) {

        acertos++;

      }

    }
  );


  return (
    acertos /
    estado.respostas.length
  ) * 100;

}


// ============================================================
// MOSTRAR RESULTADO
// ============================================================

function mostrarResultado() {

  preencherInformacoesAluno();

  preencherTabela();

  preencherMelhorMetodo();


  const nota =
    document.getElementById(
      "notaGeral"
    );


  if (nota) {

    nota.textContent =
      formatarNumero(
        estado.notaGeral
      ) +
      "%";

  }


  const descricao =
    document.getElementById(
      "descricaoAtividades"
    );


  if (descricao) {

    descricao.textContent =
      "As atividades serão adaptadas de acordo com o desempenho apresentado e com a estratégia que apresentou o maior índice de desempenho.";

  }


  const lista =
    document.getElementById(
      "listaAtividades"
    );


  if (lista) {

    lista.innerHTML = "";

  }


  mostrarTela(
    "resultado"
  );

}


// ============================================================
// PREENCHER INFORMAÇÕES DO ALUNO
// ============================================================

function preencherInformacoesAluno() {

  definirTexto(
    "resultadoNome",
    estado.aluno.nome
  );


  definirTexto(
    "resultadoIdade",
    estado.aluno.idade
  );


  definirTexto(
    "resultadoAno",
    estado.aluno.ano
  );


  definirTexto(
    "resultadoMateria",
    estado.aluno.materia
  );


  definirTexto(
    "resultadoConteudo",
    estado.aluno.conteudo
  );


  definirTexto(
    "resultadoObservacoes",
    estado.aluno.observacoes ||
    "Nenhuma"
  );

}


// ============================================================
// PREENCHER TABELA
// ============================================================

function preencherTabela() {

  const ids = {

    "Divisão em etapas": {
      acertos: "acertos1",
      tempo: "tempo1",
      indice: "indice1"
    },

    "Apoio visual": {
      acertos: "acertos2",
      tempo: "tempo2",
      indice: "indice2"
    },

    "Instruções claras": {
      acertos: "acertos3",
      tempo: "tempo3",
      indice: "indice3"
    },

    "Repetição adaptativa": {
      acertos: "acertos4",
      tempo: "tempo4",
      indice: "indice4"
    }

  };


  ESTRATEGIAS.forEach(
    function(estrategia) {

      const dados =
        estado.resultados[
          estrategia
        ];


      const elementos =
        ids[estrategia];


      if (
        !dados ||
        !elementos
      ) {

        return;

      }


      definirTexto(
        elementos.acertos,
        dados.acertos +
        " / " +
        dados.total
      );


      definirTexto(
        elementos.tempo,
        formatarNumero(
          dados.tempoMedio
        ) +
        " s"
      );


      definirTexto(
        elementos.indice,
        formatarNumero(
          dados.indice
        )
      );

    }
  );

}


// ============================================================
// PREENCHER MELHOR MÉTODO
// ============================================================

function preencherMelhorMetodo() {

  definirTexto(
    "melhorMetodo",
    estado.melhorEstrategia
  );


  const explicacao =
    document.getElementById(
      "explicacaoMetodo"
    );


  if (!explicacao) {
    return;
  }


  const textos = {

    "Divisão em etapas":
      "O estudante apresentou melhor desempenho quando as atividades foram organizadas em etapas menores e sequenciais.",

    "Apoio visual":
      "O estudante apresentou melhor desempenho quando as atividades utilizaram representações e elementos de apoio visual.",

    "Instruções claras":
      "O estudante apresentou melhor desempenho quando as atividades utilizaram instruções objetivas e diretas.",

    "Repetição adaptativa":
      "O estudante apresentou melhor desempenho nas atividades adaptadas progressivamente de acordo com seu desempenho anterior."

  };


  explicacao.textContent =
    textos[
      estado.melhorEstrategia
    ] ||
    "A estratégia apresentou o maior índice de desempenho na avaliação.";

}


// ============================================================
// GERAR ATIVIDADES
// ============================================================

async function gerarAtividades() {

  const botao =
    document.getElementById(
      "botaoAtividades"
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "Gerando atividades...";

  }


  const lista =
    document.getElementById(
      "listaAtividades"
    );


  if (lista) {

    lista.innerHTML =
      "<p>Preparando atividades adaptadas...</p>";

  }


  try {

    const resultado =
      await chamarAPI({

        acao:
          "gerar_atividades",

        nome:
          estado.aluno.nome,

        idade:
          estado.aluno.idade,

        ano:
          estado.aluno.ano,

        materia:
          estado.aluno.materia,

        conteudo:
          estado.aluno.conteudo,

        observacoes:
          estado.aluno.observacoes,

        melhorEstrategia:
          estado.melhorEstrategia,

        resultados:
          estado.resultados

      });


    if (
      !resultado ||
      !Array.isArray(
        resultado.atividades
      )
    ) {

      throw new Error(
        "As atividades não foram geradas corretamente."
      );

    }


    estado.atividades =
      resultado.atividades;


    renderizarAtividades();


  } catch (erro) {

    console.error(erro);


    if (lista) {

      lista.innerHTML =
        '<div class="mensagem-erro">' +
        escapeHTML(
          "Erro ao gerar atividades: " +
          erro.message
        ) +
        "</div>";

    }

  } finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "Gerar atividades adaptadas";

    }

  }

}


// ============================================================
// RENDERIZAR ATIVIDADES
// ============================================================

function renderizarAtividades() {

  const lista =
    document.getElementById(
      "listaAtividades"
    );


  if (!lista) {
    return;
  }


  lista.innerHTML = "";


  estado.atividades.forEach(
    function(
      atividade,
      indice
    ) {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "atividade-gerada";


      const titulo =
        document.createElement(
          "h3"
        );


      titulo.textContent =
        atividade.titulo ||
        "Atividade " +
        (indice + 1);


      const descricao =
        document.createElement(
          "p"
        );


      descricao.textContent =
        atividade.descricao ||
        "";


      const pergunta =
        document.createElement(
          "p"
        );


      pergunta.className =
        "atividade-pergunta";


      pergunta.textContent =
        atividade.questao ||
        "";


      const alternativas =
        document.createElement(
          "div"
        );


      alternativas.className =
        "alternativas-atividade";


      if (
        Array.isArray(
          atividade.alternativas
        )
      ) {

        atividade.alternativas.forEach(
          function(
            alternativa,
            alternativaIndice
          ) {

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
              function() {

                const botoes =
                  alternativas.querySelectorAll(
                    "button"
                  );


                botoes.forEach(
                  function(
                    outroBotao
                  ) {

                    outroBotao.disabled =
                      true;

                  }
                );


                if (
                  alternativaIndice ===
                  Number(
                    atividade.correta
                  )
                ) {

                  botao.classList.add(
                    "correta"
                  );

                } else {

                  botao.classList.add(
                    "incorreta"
                  );


                  if (
                    botoes[
                      Number(
                        atividade.correta
                      )
                    ]
                  ) {

                    botoes[
                      Number(
                        atividade.correta
                      )
                    ].classList.add(
                      "correta"
                    );

                  }

                }

              }
            );


            alternativas.appendChild(
              botao
            );

          }
        );

      }


      card.appendChild(
        titulo
      );


      card.appendChild(
        descricao
      );


      card.appendChild(
        pergunta
      );


      card.appendChild(
        alternativas
      );


      lista.appendChild(
        card
      );

    }
  );

}


// ============================================================
// FUNÇÃO AUXILIAR PARA TEXTO
// ============================================================

function definirTexto(
  id,
  valor
) {

  const elemento =
    document.getElementById(id);


  if (elemento) {

    elemento.textContent =
      valor === undefined ||
      valor === null
        ? ""
        : valor;

  }

}


// ============================================================
// FORMATAR NÚMERO
// ============================================================

function formatarNumero(
  numero
) {

  const valor =
    Number(numero);


  if (
    !Number.isFinite(valor)
  ) {

    return "0,00";

  }


  return valor
    .toFixed(2)
    .replace(".", ",");

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escapeHTML(
  texto
) {

  return String(texto)
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


// ============================================================
// GARANTIR QUE O SITE COMECE NA TELA INICIAL
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    mostrarTela(
      "inicio"
    );

  }
);
