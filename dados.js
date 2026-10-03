/* =========================================================
   Dados do questionário e utilitários compartilhados
   pelo formulário (index.html) e pelos relatórios.
   ========================================================= */

/* Cada seção tem: id, t (título), curto (rótulo), intro e qs (perguntas).
   Tipos de pergunta: text, number, select, textarea, checks e nota (0 a 10, entra no radar). */

const AREAS_OPC=["Estratégia e liderança","Comercial e atendimento","Oficina e produção","Peças e estoque","Financeiro e precificação","Pessoas e equipe","Processos e indicadores","Tecnologia e sistemas","Jurídico, segurança e meio ambiente","Mercado e concorrência"];
const NOTA = (area)=>({id:"nota",tipo:"nota",t:`De 0 a 10, que nota você dá hoje para ${area}?`,h:"Seja sincero: a nota serve para comparar a sua percepção com o que vamos levantar juntos."});
const SECOES=[
 {id:"empresa",t:"Identificação da empresa",curto:"Empresa",intro:"Dados básicos para conhecer a oficina, a estrutura física e o tipo de serviço que vocês fazem.",qs:[
  {id:"nome",tipo:"text",t:"Seu nome completo"},
  {id:"cargo",tipo:"text",t:"Seu cargo ou função na empresa"},
  {id:"email",tipo:"text",t:"Seu e-mail",h:"Para onde enviaremos o relatório do seu diagnóstico."},
  {id:"whatsapp",tipo:"text",t:"Seu WhatsApp com DDD",h:"Ex.: (11) 91234-5678. Também receberá o relatório por aqui."},
  {id:"empresa",tipo:"text",t:"Nome da oficina (nome fantasia)"},
  {id:"cidade",tipo:"text",t:"Cidade / Estado"},
  {id:"fundacao",tipo:"number",t:"Ano de fundação"},
  {id:"regime",tipo:"select",t:"Regime tributário",op:["Simples Nacional","Lucro Presumido","Lucro Real","MEI","Não sei informar"]},
  {id:"funcionarios",tipo:"number",t:"Número total de colaboradores (incluindo sócios que trabalham na operação)"},
  {id:"estrutura",tipo:"textarea",t:"Estrutura física",h:"Área do terreno e do galpão, quantos caminhões cabem ao mesmo tempo, valas, área de lavagem, pátio."},
  {id:"especialidades",tipo:"checks",t:"Serviços que vocês oferecem",op:["Motor","Reparo de Injetores","Câmbio e transmissão","Diferencial","Freios e pneumática","Suspensão e direção","Elétrica","Ar-condicionado","Arla / pós-tratamento","Programação de Módulos (Remap)","Funilaria e pintura","Retífica","Atendimento externo","Venda de peças balcão","Implementos e carretas","Linha amarela / agrícola"]},
  {id:"marcas",tipo:"textarea",t:"Quais marcas e modelos vocês mais atendem?",h:"Ex.: Scania, Volvo, Mercedes-Benz, VW/MAN, Iveco, DAF, máquinas agrícolas ou de construção."},
  {id:"historia",tipo:"textarea",t:"Conte brevemente a história da empresa",h:"Como começou, marcos importantes, momentos difíceis e o que mudou nos últimos anos."},
  {id:"socios",tipo:"textarea",t:"Existem sócios? Como dividem funções e decisões?",h:"Inclua familiares que trabalham na empresa."}
 ]},
 {id:"estrategia",t:"Dono, estratégia e liderança",curto:"Estratégia",intro:"Como o dono ocupa o tempo, para onde a empresa está indo e quanto ela depende de você.",qs:[
  NOTA("a estratégia e a sua liderança"),
  {id:"dia",tipo:"textarea",t:"Como é o seu dia típico?",h:"Quanto do seu tempo é dedicado ao operacional (execução de serviços mecânicos, elétricos e diagnósticos), ao atendimento de clientes, à resolução de problemas e ao planejamento e desenvolvimento do negócio?"},
  {id:"visao",tipo:"textarea",t:"Onde você quer que a empresa esteja daqui a 3 a 5 anos?"},
  {id:"metas",tipo:"textarea",t:"A empresa tem metas escritas? Quais são e como você acompanha?"},
  {id:"diferencial",tipo:"textarea",t:"Por que o cliente escolhe você e não o concorrente?"},
  {id:"melhorar",tipo:"textarea",t:"Na sua percepção, quais são os principais aspectos que a empresa precisa melhorar atualmente? Em quais processos, decisões ou atividades a empresa apresenta maior dependência da sua participação direta?"},
  {id:"dependencia",tipo:"textarea",t:"Quais decisões só você toma hoje? O que trava se você ficar 15 dias fora?"},
  {id:"braco",tipo:"textarea",t:"Você tem um braço direito ou pessoa de confiança? Existe plano de sucessão?"},
  {id:"dor",tipo:"textarea",t:"O que mais tira o seu sono hoje no negócio?"}
 ]},
 {id:"comercial",t:"Comercial, atendimento e marketing",curto:"Comercial",intro:"Da chegada do cliente ao pós-venda: como a oficina capta, orçamenta, converte e fideliza.",qs:[
  NOTA("o comercial e o atendimento"),
  {id:"carteira",tipo:"textarea",t:"Qual o perfil da sua carteira de clientes?",h:"Percentual aproximado de transportadoras/frotistas, caminhoneiros autônomos, agronegócio, construção, órgãos públicos."},
  {id:"concentracao",tipo:"textarea",t:"Quanto os 5 maiores clientes representam do faturamento?",h:"Existe dependência de algum cliente grande?"},
  {id:"contratos",tipo:"textarea",t:"Vocês têm contratos de manutenção com frotas? Como funcionam?",h:"Preventiva programada, valor fixo mensal, prazo de atendimento, tabela de preços acordada."},
  {id:"recepcao",tipo:"textarea",t:"Como é feita a recepção do caminhão?",h:"Quem recebe, se há checklist de entrada, fotos, registro de km, relato do motorista."},
  {id:"orcamento",tipo:"textarea",t:"Como funciona o orçamento?",h:"Quem faz, em quanto tempo chega ao cliente e como ele aprova (WhatsApp, e-mail, papel, sistema)."},
  {id:"checklistentrada",tipo:"checks",t:"Quando um caminhão entra na sua empresa para a realização de algum serviço, é realizado um checklist completo do veículo para identificar outras necessidades de manutenção, ou a equipe executa apenas o serviço solicitado pelo cliente?",op:["Realizamos um checklist completo em todos os veículos.","Realizamos o checklist apenas quando o cliente solicita.","Avaliamos alguns itens, mas não fazemos um checklist completo.","Executamos somente o serviço solicitado pelo cliente.","Depende do tipo de serviço."]},
  {id:"conversao",tipo:"textarea",t:"De cada 10 orçamentos, quantos são aprovados? O que acontece com os recusados?"},
  {id:"captacao",tipo:"textarea",t:"Como chegam os clientes novos?",h:"Indicação, Google, Instagram, vendedor externo, movimento da rodovia, parceiros."},
  {id:"vendedor",tipo:"textarea",t:"Existe consultor técnico ou vendedor externo? Tem meta e comissão?"},
  {id:"atividadesconsultor",tipo:"textarea",t:"Por favor, descreva detalhadamente todas as atividades realizadas pelo seu consultor técnico no atendimento ao cliente, desde o primeiro contato até a conclusão do serviço. Inclua também as responsabilidades relacionadas à elaboração de orçamentos, abertura e acompanhamento de ordens de serviço, comunicação com o cliente, acompanhamento da execução dos reparos, aprovação de serviços adicionais, entrega do veículo, pós-venda e demais atividades que fazem parte da rotina dessa função.",h:"Quanto mais detalhada for a sua descrição, melhor poderemos compreender a operação atual e identificar oportunidades de melhoria e estratégias para o seu negócio."},
  {id:"posvenda",tipo:"textarea",t:"O que é feito depois da entrega do caminhão?",h:"Contato de retorno, lembrete de revisão, pesquisa de satisfação."},
  {id:"marketing",tipo:"textarea",t:"Como está a presença digital e o marketing?",h:"Redes sociais, perfil no Google, site, quanto investe por mês e quem cuida."},
  {id:"perfis",tipo:"textarea",t:"Informe os perfis e canais digitais utilizados pela empresa para divulgação e relacionamento com os clientes, como Instagram, TikTok, Google, Facebook, YouTube e outros.",h:"Se possível, informe o @usuário ou o link de cada perfil."}
 ]},
 {id:"oficina",t:"Oficina e produção técnica",curto:"Oficina",intro:"O chão de oficina: fluxo da ordem de serviço, capacidade, diagnóstico, produtividade e qualidade.",qs:[
  NOTA("a oficina e a produção"),
  {id:"fluxo",tipo:"textarea",t:"Descreva o caminho do caminhão da entrada até a entrega",h:"Abertura da OS, diagnóstico, aprovação, separação de peças, execução, teste, faturamento e entrega."},
  {id:"capacidade",tipo:"textarea",t:"Quantos veículos vocês atendem por mês? Quantos ficam no pátio ao mesmo tempo? Qual o tempo médio de permanência?"},
  {id:"gargalo",tipo:"textarea",t:"Onde o caminhão mais fica parado?",h:"Esperando aprovação, peça, mecânico disponível, diagnóstico ou terceiros."},
  {id:"diagnostico",tipo:"textarea",t:"Quais equipamentos de diagnóstico vocês têm e quem domina o uso?",h:"Scanners multimarcas, softwares originais, osciloscópio, bancada de teste."},
  {id:"produtividade",tipo:"textarea",t:"Vocês medem horas vendidas versus horas trabalhadas por mecânico? Como?"},
  {id:"tempopadrao",tipo:"textarea",t:"Usam tabela de tempo padrão para cobrar e medir os serviços?"},
  {id:"retrabalho",tipo:"textarea",t:"Com que frequência acontece retrabalho ou garantia? Qual a causa principal e quem paga a conta?"},
  {id:"conferencia",tipo:"textarea",t:"Existe teste de rodagem e conferência final antes da entrega? Quem faz?"},
  {id:"metodo5s",tipo:"textarea",t:"A empresa aplica o método 5S na organização e rotina da oficina? Seus colaboradores conhecem claramente suas responsabilidades, funções e as tarefas que devem ser cumpridas diariamente?"},
  {id:"organizacao",tipo:"textarea",t:"Como está a organização do ambiente?",h:"Limpeza, layout, ferramentaria controlada, ferramentas identificadas, 5S."},
  {id:"socorro",tipo:"textarea",t:"Vocês fazem atendimento externo ou socorro? Como é cobrado e controlado?"},
  {id:"veiculosexternos",tipo:"textarea",t:"A empresa possui veículos destinados ao atendimento externo ou à prestação de serviços fora da oficina? Como é realizado o controle de utilização, custos e produtividade desses veículos?",h:"Informe, por favor:\n• Quantos veículos são utilizados para atendimento externo;\n• Qual é a finalidade de cada veículo;\n• Qual é o faturamento médio mensal gerado pelos serviços realizados com esses veículos;\n• Qual é o custo médio mensal de cada veículo (combustível, manutenção, pneus, seguros, impostos, depreciação e demais despesas);\n• Se existe algum controle de quilometragem, rotas, horas trabalhadas e serviços realizados."},
  {id:"sonho",tipo:"textarea",t:"Como você sonha que sua empresa esteja daqui a 1 ano e daqui a 5 anos?",h:"Descreva como gostaria que estivesse sua estrutura, número de colaboradores, capacidade de atendimento, faturamento, organização, processos, equipamentos, serviços oferecidos e, principalmente, qual seria o seu papel dentro da empresa em cada uma dessas fases."}
 ]},
 {id:"pecas",t:"Peças, estoque e compras",curto:"Peças",intro:"Como as peças são compradas, guardadas e vendidas, e quanto isso pesa no tempo de parada do caminhão.",qs:[
  NOTA("peças e estoque"),
  {id:"modelo",tipo:"textarea",t:"Vocês trabalham com estoque próprio, compra sob demanda ou o cliente traz a peça?",h:"Diga a proporção aproximada de cada um."},
  {id:"valor",tipo:"text",t:"Valor aproximado do estoque hoje (R$)"},
  {id:"controle",tipo:"textarea",t:"Como o estoque é controlado?",h:"Sistema, inventário periódico, quem tem acesso ao almoxarifado, diferenças e perdas."},
  {id:"fornecedores",tipo:"textarea",t:"Quem são os principais fornecedores? Quantos vocês cotam e quais as condições de prazo e pagamento?"},
  {id:"espera",tipo:"textarea",t:"Quanto tempo o caminhão espera peça, em média?"},
  {id:"markup",tipo:"textarea",t:"Como é definido o preço de venda das peças? Qual a margem média?"},
  {id:"pecacliente",tipo:"textarea",t:"Qual a política para peça trazida pelo cliente?",h:"Garantia do serviço, cobrança diferenciada, recusa."},
  {id:"parado",tipo:"textarea",t:"Como a empresa administra as peças que permanecem por longos períodos em estoque? Existe um controle do tempo de permanência de cada peça no estoque e são adotadas estratégias para identificar, movimentar ou reduzir o estoque de peças paradas?"}
 ]},
 {id:"financeiro",t:"Financeiro e precificação",curto:"Financeiro",intro:"Faturamento, custos, margem e caixa. Os números podem ser aproximados; o importante é saber o que é medido.",qs:[
  NOTA("o financeiro"),
  {id:"faturamento",tipo:"text",t:"Faturamento médio mensal nos últimos 12 meses (R$)"},
  {id:"mix",tipo:"text",t:"Divisão do faturamento: % mão de obra, % peças, % serviços de terceiros"},
  {id:"valorhora",tipo:"textarea",t:"Qual o valor da hora técnica cobrada hoje e como vocês chegaram nesse valor?"},
  {id:"custohora",tipo:"textarea",t:"Você sabe quanto custa cada hora disponível da oficina?",h:"Despesas fixas do mês divididas pelas horas produtivas da equipe."},
  {id:"lucro",tipo:"textarea",t:"Você sabe a margem de lucro líquido? Existe DRE mensal? Quem monta?"},
  {id:"caixa",tipo:"textarea",t:"Como é feito o controle de fluxo de caixa e de contas a pagar e receber?"},
  {id:"pfpj",tipo:"textarea",t:"As contas da pessoa física e da empresa são separadas? Existe pró-labore definido?"},
  {id:"prolabore",tipo:"textarea",t:"A empresa possui um pró-labore fixo e definido para os sócios? Ou os sócios realizam retiradas de valores conforme a necessidade?"},
  {id:"percnota",tipo:"text",t:"Qual é o percentual (%) do faturamento da empresa que atualmente é emitido com Nota Fiscal?"},
  {id:"prazos",tipo:"textarea",t:"Quais prazos de pagamento vocês concedem e como está a inadimplência?",h:"Faturamento para frotas em 30/60/90 dias, cheques, boletos em atraso."},
  {id:"dividas",tipo:"textarea",t:"Há empréstimos, financiamentos ou falta de capital de giro?"},
  {id:"contador",tipo:"textarea",t:"Como é a relação com a contabilidade? Os impostos estão em dia e sob controle?"},
  {id:"impostos",tipo:"textarea",t:"A empresa possui controle sobre o valor dos impostos pagos mensalmente? Se sim, qual foi a média mensal dos impostos pagos nos últimos 12 meses?"},
  {id:"futurofin",tipo:"textarea",t:"Como você gostaria que estivesse a situação financeira da sua empresa daqui a 1 ano e daqui a 5 anos?",h:"Descreva suas expectativas em relação ao faturamento, lucro, fluxo de caixa, reservas financeiras, nível de endividamento, investimentos e capacidade de crescimento da empresa."},
  {id:"futuroprolabore",tipo:"textarea",t:"Como você gostaria que estivesse o seu pró-labore daqui a 1 ano e daqui a 5 anos?"}
 ]},
 {id:"pessoas",t:"Pessoas, equipe e cultura",curto:"Pessoas",intro:"Quem faz a oficina funcionar, como é contratado, treinado, pago e liderado.",qs:[
  NOTA("pessoas e equipe"),
  {id:"equipe",tipo:"textarea",t:"Descreva a equipe por função e quantidade",h:"Mecânicos (níveis), auxiliares, eletricista, consultor técnico, recepção, peças, administrativo, chefe de oficina."},
  {id:"lider",tipo:"textarea",t:"Existe chefe de oficina ou líder técnico? Que autonomia ele tem?"},
  {id:"contratacao",tipo:"textarea",t:"Como vocês contratam? Qual a dificuldade para encontrar mecânico diesel qualificado?"},
  {id:"integracao",tipo:"textarea",t:"Existe integração para novos colaboradores e descrição de cargos?"},
  {id:"treinamento",tipo:"textarea",t:"Quais treinamentos técnicos e comportamentais a equipe fez no último ano?"},
  {id:"remuneracao",tipo:"textarea",t:"Como é a remuneração?",h:"Salário fixo, comissão por produtividade, bônus por meta, plano de carreira."},
  {id:"turnover",tipo:"textarea",t:"Quantas pessoas saíram nos últimos 12 meses e por quê?"},
  {id:"clima",tipo:"textarea",t:"Como você avalia o clima e o comprometimento da equipe?",h:"Faltas, atrasos, conflitos, iniciativa."},
  {id:"reunioesdiarias",tipo:"textarea",t:"Você realiza reuniões diárias com sua equipe para planejar e organizar as atividades do dia?"},
  {id:"reunioessemanais",tipo:"textarea",t:"Você realiza reuniões semanais com toda a equipe para avaliar a produtividade, o desempenho e os resultados da semana, além de fornecer feedback aos colaboradores?"},
  {id:"feedback",tipo:"textarea",t:"Existe avaliação de desempenho ou rotina de feedback?"}
 ]},
 {id:"processos",t:"Gestão, processos e indicadores",curto:"Processos",intro:"O que está padronizado, o que é medido e com que frequência a empresa olha para os próprios números.",qs:[
  NOTA("processos e indicadores"),
  {id:"escritos",tipo:"textarea",t:"Quais processos estão escritos e padronizados? Quais existem só na cabeça das pessoas?"},
  {id:"indicadores",tipo:"checks",t:"Quais indicadores vocês acompanham hoje?",op:["Faturamento","Ticket médio","Número de OS","Produtividade dos mecânicos","Conversão de orçamentos","Tempo de permanência","Retrabalho","Margem por OS","Satisfação do cliente","Giro de estoque","Inadimplência","Nenhum"]},
  {id:"frequencia",tipo:"textarea",t:"Com que frequência você olha os números e onde?",h:"Planilha, sistema, painel, caderno."},
  {id:"rotinas",tipo:"textarea",t:"Existem rotinas fixas de gestão?",h:"Reunião diária com a oficina, fechamento semanal, reunião mensal de resultados."},
  {id:"checklists",tipo:"textarea",t:"Vocês usam checklists?",h:"Recepção, revisão preventiva, entrega, limpeza."},
  {id:"comunicacao",tipo:"textarea",t:"Como as informações circulam internamente?",h:"Quadro de OS, grupo de WhatsApp, sistema, conversa no pátio."}
 ]},
 {id:"tecnologia",t:"Tecnologia e sistemas",curto:"Tecnologia",intro:"Ferramentas digitais que sustentam a gestão e o acesso à informação técnica.",qs:[
  NOTA("tecnologia e sistemas"),
  {id:"sistema",tipo:"textarea",t:"Vocês usam sistema de gestão para oficina? Qual, há quanto tempo e o que usam de fato?"},
  {id:"papel",tipo:"textarea",t:"O que ainda é feito em papel ou planilha?"},
  {id:"osdigital",tipo:"textarea",t:"O orçamento e a OS são enviados ao cliente com fotos e vídeos?"},
  {id:"fiscal",tipo:"textarea",t:"Emissão de notas, boletos, Pix e maquininha estão integrados ao sistema?"},
  {id:"infotec",tipo:"textarea",t:"Como a equipe acessa informação técnica?",h:"Manuais, diagramas elétricos, softwares de montadora, grupos técnicos."},
  {id:"investir",tipo:"textarea",t:"Que equipamentos ou ferramentas fazem falta? Há investimento planejado?"}
 ]},
 {id:"legal",t:"Jurídico, segurança e meio ambiente",curto:"Jurídico e SSMA",intro:"Riscos que não aparecem no dia a dia até virarem multa, processo ou acidente.",qs:[
  NOTA("jurídico, segurança e meio ambiente"),
  {id:"licencas",tipo:"textarea",t:"Alvará, licença ambiental e AVCB (bombeiros) estão em dia?"},
  {id:"residuos",tipo:"textarea",t:"Como é feito o descarte de óleo usado, filtros, baterias, pneus e água oleosa?",h:"Caixa separadora, empresa coletora, certificado de destinação."},
  {id:"seguranca",tipo:"textarea",t:"Como está a segurança do trabalho?",h:"Uso de EPIs, NR-12 (elevadores e máquinas), NR-10, NR-35, acidentes recentes."},
  {id:"trabalhista",tipo:"textarea",t:"Todos os colaboradores são registrados? Há ou houve processos trabalhistas? Como são as horas extras?"},
  {id:"contratos",tipo:"textarea",t:"Existem documentos formais com clientes?",h:"Autorização de serviço assinada, termo de garantia escrito, contratos com frotas."},
  {id:"seguro",tipo:"textarea",t:"A empresa tem seguro? Cobre os veículos de clientes sob sua guarda?"}
 ]},
 {id:"mercado",t:"Mercado e concorrência",curto:"Mercado",intro:"O contexto em volta da oficina: região, concorrentes, oportunidades e ameaças.",qs:[
  NOTA("a posição da empresa no mercado"),
  {id:"concorrentes",tipo:"textarea",t:"Quem são os principais concorrentes (concessionárias e independentes)? Onde você ganha e onde perde deles?"},
  {id:"regiao",tipo:"textarea",t:"Quais as características da sua região?",h:"Rodovias e rotas, polos logísticos, agronegócio, mineração, sazonalidade de safra."},
  {id:"oportunidades",tipo:"textarea",t:"Que oportunidades você enxerga e ainda não aproveita?",h:"Novos serviços, contratos com frotas, segmentos, cidades vizinhas."},
  {id:"ameacas",tipo:"textarea",t:"Que ameaças preocupam você?",h:"Tecnologia Euro 6 / Proconve P8, concessionárias, falta de mão de obra, preço."}
 ]},
 {id:"mentoria",t:"Prioridades e expectativas",curto:"Prioridades",intro:"Para fechar: o que é mais urgente e o que você espera construir na mentoria.",qs:[
  {id:"top3",tipo:"textarea",t:"Quais são os 3 maiores problemas da empresa hoje, em ordem de prioridade?"},
  {id:"meta12",tipo:"textarea",t:"Onde você quer estar daqui a 12 meses?",h:"Faturamento, equipe, estrutura e a sua própria rotina."},
  {id:"tentou",tipo:"textarea",t:"O que você já tentou mudar e não funcionou? Por quê?"},
  {id:"ajuda",tipo:"checks",t:"Em quais áreas você mais quer ajuda?",op:AREAS_OPC},
  {id:"dedicacao",tipo:"textarea",t:"Quanto tempo por semana você consegue dedicar à implantação? Quem da equipe vai participar?"},
  {id:"extra",tipo:"textarea",t:"Tem algo mais que seu mentor precisa saber?"}
 ]}
];

const AREAS_RADAR = SECOES.filter(s => s.qs.some(q => q.tipo === "nota"));
const TOTAL = SECOES.reduce((n, s) => n + s.qs.length, 0);



const $ = s => document.querySelector(s);

const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ESC_MAP[c]);

const key = (s, q) => s.id + "." + q.id;

function preenchido(v) {
  if (Array.isArray(v)) return v.length > 0;
  return v !== undefined && v !== null && String(v).trim() !== "";
}

function status(txt, cls) {
  $("#statusTxt").textContent = txt;
  $("#statusDot").className = "dot " + (cls || "");
}

const apiAtiva = () => typeof API !== "undefined" && !!API.url;

/** Chama o servidor (Google Apps Script). Lança erro se a resposta não for ok. */
async function api(acao, dados) {
  // text/plain evita a verificação prévia (CORS) que o Apps Script não responde
  const resp = await fetch(API.url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ acao, ...dados })
  });
  const j = await resp.json();
  if (!j.ok) {
    const e = new Error(j.erro || "Falha no servidor");
    e.codigo = j.codigo;
    throw e;
  }
  return j;
}
