/* ==========================================================================
   DISTRIBUIDORA ÁGUIA — Catálogo digital + Pedido pelo WhatsApp
   ==========================================================================
   COMO O SITE FUNCIONA (resumo):
   - Os produtos ficam listados neste arquivo (array "produtos") e o JavaScript
     os desenha na tela automaticamente (funk renderizarProdutos).
   - Quando o cliente clica em "Adicionar ao pedido", o produto entra no
     "carrinho" (um array). O carrinho é salvo no navegador via localStorage,
     para que o pedido não se perca ao fechar a página.
   - O painel do carrinho funciona em 4 ETAPAS, uma de cada vez:
       1) Produtos  -> 2) Entrega  -> 3) Dados  -> 4) Envio
     Cada etapa tem sua própria validação. Só passa para a próxima se estiver
     correta.
   - Na última etapa, o JavaScript monta uma mensagem de texto com o resumo
     completo do pedido e abre o WhatsApp do fornecedor com essa mensagem
     pronta. NÃO existe pagamento nem finalização de compra no site.
   ========================================================================== */

/* ==========================================================================
   CONFIGURAÇÃO CENTRAL
   --------------------------------------------------------------------------
   É AQUI QUE O DONO DA EMPRESA EDITA TUDO. Nada precisa ser procurado
   no resto do código.
   ========================================================================== */

const CONFIG = {
    // Nome e slogan exibidos no site
    nomeEmpresa: "Distribuidora Águia",
    slogan: "Distribuidora de alimentos",
    segmento: "DISTRIBUIDORA DE ALIMENTOS",

    // WhatsApp no formato internacional: 55 + DDD + número.
    // SEM espaços, parênteses ou hífens. Exemplo: "5589999999999"
    whatsappFornecedor: "5589981425420",

    // Redes sociais e localização
    instagram: "https://instagram.com/SEU_INSTAGRAM",
    cidade: "Picos",
    estado: "PI",
    endereco: "[ENDEREÇO], Picos - PI",

    // Horário de funcionamento
    horario: "SEG A SEX • 7H ÀS 18H"
};

/* --------------------------------------------------------------------------
   TAXA DE ENTREGA
   --------------------------------------------------------------------------
   - Sem taxa: mantenha taxaEntrega = 0.
   - Taxa fixa por bairro: preencha o objeto "taxasEntrega", por exemplo:

       const taxasEntrega = {
           "Centro": 5.00,
           "Bairro São José": 7.00,
           "Bairro Junco": 10.00
       };

   Quando o objeto tiver bairros, o site mostra sozinho um campo "bairro"
   na etapa 2 (Entrega) e calcula a taxa conforme o que o cliente escolher.
   ========================================================================== */

const taxaEntrega = 0;

const taxasEntrega = {}; // vazio = sem taxa por bairro

/* --------------------------------------------------------------------------
   PRODUTOS DO CATÁLOGO
   --------------------------------------------------------------------------
   Cada produto é um "objeto" com estas informações:
     - id          : número único do produto
     - nome        : nome que aparece no card
     - descricao   : texto curto explicando o produto
     - preco       : preço em reais, usando PONTO para os centavos (ex.: 6.50)
     - categoria   : precisa ser igual a uma das categorias da lista abaixo
     - imagem      : caminho da imagem em assets/images/
     - disponivel  : true = à venda | false = esgotado (aparece indisponível)
   Para cadastrar um produto novo é só copiar um bloco { } e mudar os valores.
   ========================================================================== */

const produtos = [
    { id: 1, nome: "Paçoca Artesanal Tradicional", descricao: "Paçoca de amendoim feita na receita tradicional. Pacote 200g.", preco: 6.50, categoria: "Paçocas", imagem: "assets/images/pacoca-tradicional.svg", disponivel: true },
    { id: 2, nome: "Paçoca Rolha", descricao: "A clássica paçoca em formato de rolha, perfeita para revenda. Embalagem 500g.", preco: 14.90, categoria: "Paçocas", imagem: "assets/images/pacoca-rolha.svg", disponivel: true },
    { id: 3, nome: "Paçoca de Coco", descricao: "Paçoca com toque de coco, para quem ama o sabor do Nordeste. 150g.", preco: 8.90, categoria: "Paçocas", imagem: "assets/images/pacoca-coco.svg", disponivel: true },
    { id: 4, nome: "Pote de Paçoca Cremosa", descricao: "Paçoca cremosa em pote, irresistível de colher. 300g.", preco: 10.90, categoria: "Paçocas", imagem: "assets/images/pacoca-cremosa.svg", disponivel: true },
    { id: 5, nome: "Pipoca Doce Caramelizada", descricao: "Pipoca doce crocante com cobertura de caramelo. Pacote 300g.", preco: 5.90, categoria: "Pipocas", imagem: "assets/images/pipoca-doce.svg", disponivel: true },
    { id: 6, nome: "Pipoca Salgada de Manteiga", descricao: "Pipoca salgada no ponto certo, com um toque de manteiga. Pacote 300g.", preco: 5.90, categoria: "Pipocas", imagem: "assets/images/pipoca-salgada.svg", disponivel: true },
    { id: 7, nome: "Milho de Pipoca", descricao: "Milho de pipoca de ótima qualidade para fazer em casa. Pacote 500g.", preco: 4.50, categoria: "Pipocas", imagem: "assets/images/milho-pipoca.svg", disponivel: true },
    { id: 8, nome: "Doce de Leite Cremoso", descricao: "Doce de leite cremoso, ideal para recheios e sobremesas. Pote 250g.", preco: 9.90, categoria: "Doces", imagem: "assets/images/doce-de-leite.svg", disponivel: true },
    { id: 9, nome: "Pé de Moleque Caseiro", descricao: "Pé de moleque de amendoim, feito com receita caseira. 200g.", preco: 7.90, categoria: "Doces", imagem: "assets/images/pe-de-moleque.svg", disponivel: true },
    { id: 10, nome: "Rapadura de Cana", descricao: "Rapadura de cana-de-açúcar pura e saborosa. 500g.", preco: 8.50, categoria: "Doces", imagem: "assets/images/rapadura.svg", disponivel: true },
    { id: 11, nome: "Doce de Caju em Pasta", descricao: "Doce de caju artesanal em pasta, tradição do Piauí. Pote 250g.", preco: 9.90, categoria: "Doces", imagem: "assets/images/doce-de-caju.svg", disponivel: true },
    { id: 12, nome: "Chocolate ao Leite", descricao: "Barra de chocolate ao leite cremoso, 90g.", preco: 5.90, categoria: "Chocolates", imagem: "assets/images/chocolate-ao-leite.svg", disponivel: true },
    { id: 13, nome: "Bombom Sortido", descricao: "Caixa de bombons sortidos, ótima para presentear. 450g.", preco: 16.90, categoria: "Chocolates", imagem: "assets/images/bombom-sortido.svg", disponivel: true },
    { id: 14, nome: "Bala de Coco", descricao: "Balas de coco macias e cheias de sabor. Pacote 400g.", preco: 7.90, categoria: "Balas e Gomas", imagem: "assets/images/bala-de-coco.svg", disponivel: true },
    { id: 15, nome: "Bala de Caramelo", descricao: "Balas de caramelo cremosinho, o clássico da venda. Pacote 300g.", preco: 6.90, categoria: "Balas e Gomas", imagem: "assets/images/bala-caramelo.svg", disponivel: true },
    { id: 16, nome: "Salgadinho de Queijo", descricao: "Salgadinho de queijo crocante para o lanche. Pacote 45g.", preco: 3.50, categoria: "Salgadinhos", imagem: "assets/images/salgadinho-queijo.svg", disponivel: true },
    { id: 17, nome: "Amendoim Torrado Salgado", descricao: "Amendoim torrado e salgado na medida, ótimo para petiscos. 200g.", preco: 4.90, categoria: "Salgadinhos", imagem: "assets/images/amendoim-torrado.svg", disponivel: true },
    { id: 18, nome: "Amendoim Japonês", descricao: "Amendoim com casquinha crocante e sabor oriental. Pacote 100g.", preco: 3.90, categoria: "Salgadinhos", imagem: "assets/images/amendoim-japones.svg", disponivel: false },
    { id: 19, nome: "Combo Festa", descricao: "Mix de paçocas, doces e pipocas para festas e eventos. Caixa sortida.", preco: 29.90, categoria: "Combos", imagem: "assets/images/combo-festa.svg", disponivel: true },
    { id: 20, nome: "Combo Tradicional", descricao: "Seleção de paçocas artesanais da casa. Caixa especial.", preco: 24.90, categoria: "Combos", imagem: "assets/images/combo-tradicional.svg", disponivel: true }
];

/* --------------------------------------------------------------------------
   CATEGORIAS DO CATÁLOGO
   --------------------------------------------------------------------------
   - A categoria "Todos" é especial: mostra todos os produtos.
   - Os botões de categoria são criados automaticamente a partir desta lista.
   - Para criar uma categoria nova: adicione o nome aqui E use o mesmo nome
     no campo "categoria" dos produtos acima.
   ========================================================================== */

const categorias = [
    "Todos",
    "Paçocas",
    "Pipocas",
    "Doces",
    "Chocolates",
    "Balas e Gomas",
    "Salgadinhos",
    "Combos"
];

/* --------------------------------------------------------------------------
   VARIÁVEIS DE ESTADO DO SITE
   --------------------------------------------------------------------------
   Guardam, durante o uso, as informações que mudam:
     - carrinho      : lista com os produtos escolhidos
                       (cada item: { id, quantidade, observacao })
     - filtroCategoria: categoria selecionada (começa em "Todos")
     - termoBusca    : texto digitado na busca (não usado, a leitura é direta)
     - produtoModalAtual: produto aberto no modal de detalhes
     - etapaAtual    : etapa do carrinho em que o cliente está (1 a 4)
   ========================================================================== */

let carrinho = [];
let filtroCategoria = "Todos";
let termoBusca = "";
let produtoModalAtual = null;
let etapaAtual = 1;

// Chave usada no localStorage. Cada empresa salva o carrinho de forma separada.
const CHAVE_LOCALSTORAGE = "pedido_" + (CONFIG.nomeEmpresa || "empresa");

/* ==========================================================================
   ATALHO PARA PEGAR ELEMENTOS DA PÁGINA
   --------------------------------------------------------------------------
   el("carrinho") é o mesmo que document.getElementById("carrinho").
   Só abrevia para o código ficar menor e mais limpo.
   ========================================================================== */

function el(id) {
    return document.getElementById(id);
}

/* ==========================================================================
   FORMATAR VALOR EM REAIS
   --------------------------------------------------------------------------
   Converte 6.5 em "R$ 6,50". Usa o formato brasileiro de moeda.
   ========================================================================== */

function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valor);
}

/* ==========================================================================
   ENCONTRAR UM PRODUTO PELO ID
   --------------------------------------------------------------------------
   Varre o array "produtos" e devolve o produto que tem o id indicado.
   É usado para consultar preço, nome e imagem de um produto do carrinho.
   ========================================================================== */

function buscarProduto(id) {
    return produtos.find(function (produto) {
        return produto.id === id;
    });
}

/* ==========================================================================
   INICIAR O SITE
   --------------------------------------------------------------------------
   Executa uma vez, quando a página termina de carregar (DOMContentLoaded).
   Liga todas as partes do site.
   ========================================================================== */

function iniciar() {
    preencherDadosDaEmpresa(); // coloca nome, cidade, WhatsApp, etc. na página
    renderizarCategorias();    // desenha os botões de categoria
    carregarCarrinho();        // lê o pedido salvo no navegador (se houver)
    atualizarCarrinho();       // mostra o carrinho e o contador com os itens
    renderizarProdutos();      // desenha os cards de produtos
    configurarEventos();       // liga todos os cliques e ações da página
    el("anoAtual").textContent = String(new Date().getFullYear()); // ano do rodapé
}

/* --------------------------------------------------------------------------
   PREENCHER OS TEXTOS DA PÁGINA COM O CONFIG
   --------------------------------------------------------------------------
   Pega os dados do CONFIG (nome, cidade, WhatsApp...) e escreve nos lugares
   certos do HTML. Assim o dono só precisa mudar o CONFIG, não o HTML.
   ========================================================================== */

function preencherDadosDaEmpresa() {
    // Título da aba do navegador
    document.title = CONFIG.nomeEmpresa + " | Doces, paçocas e pipocas";

    // Nome do logo e informações do topo
    el("logoNome").textContent = "ÁGUIA";
    el("horarioTexto").textContent = CONFIG.horario;
    el("cidadeTexto").textContent = CONFIG.cidade;
    el("estadoTexto").textContent = CONFIG.estado;

    // Seção de contato
    el("contatoWhatsText").textContent = CONFIG.whatsappFornecedor;
    el("contatoInstaText").textContent = "@" + CONFIG.instagram.split("/").pop();
    el("contatoEnderecoText").textContent = CONFIG.endereco;
    el("contatoHorarioText").textContent = CONFIG.horario;

    // Links que abrem o WhatsApp e o Instagram em outra aba
    const linkWhats = urlWhatsApp();
    const linkInsta = CONFIG.instagram;

    el("contatoWhatsLink").setAttribute("href", linkWhats);
    el("contatoWhatsLink").setAttribute("target", "_blank");
    el("contatoWhatsLink").setAttribute("rel", "noopener");

    el("contatoInstaLink").setAttribute("href", linkInsta);
    el("footerWhatsLink").setAttribute("href", linkWhats);
    el("footerWhatsLink").setAttribute("target", "_blank");
    el("footerWhatsLink").setAttribute("rel", "noopener");
    el("footerInstaLink").setAttribute("href", linkInsta);

    // Botão "Falar conosco no WhatsApp" abre o WhatsApp com uma saudação
    el("botaoFalarWhats").addEventListener("click", function () {
        abrirWhatsApp("Olá! Gostaria de falar com a Distribuidora Águia sobre pedidos.");
    });
}

/* ==========================================================================
   DESENHAR OS BOTÕES DE CATEGORIA
   --------------------------------------------------------------------------
   Cada nome da lista "categorias" vira um botão. Clicar em um botão muda o
   "filtroCategoria" e redesenha os produtos (renderizarProdutos).
   ========================================================================== */

function renderizarCategorias() {
    const lista = el("categoriasLista");
    lista.innerHTML = ""; // limpa os botões antigos antes de criar novos

    categorias.forEach(function (categoria) {
        // Cria o botão
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "categoria-chip" + (categoria === filtroCategoria ? " ativo" : "");
        botao.textContent = categoria;
        botao.setAttribute("aria-pressed", categoria === filtroCategoria);

        // Ao clicar: guarda a categoria escolhida e redesenha produtos e botões
        botao.addEventListener("click", function () {
            filtroCategoria = categoria;
            renderizarCategorias();
            renderizarProdutos();
        });

        lista.appendChild(botao); // coloca o botão na tela
    });
}

/* ==========================================================================
   DESENHAR OS PRODUTOS
   --------------------------------------------------------------------------
   Filtra a lista de produtos por:
     - categoria escolhida (filtroCategoria)
     - texto da busca (termo digitado em "buscaProdutos")
   E desenha um "card" (cartão) para cada produto encontrado.
   Os dois filtros funcionam JUNTOS.
   ========================================================================== */

function renderizarProdutos() {
    const grid = el("produtosGrid");
    const busca = el("buscaProdutos").value.trim().toLowerCase(); // texto da busca

    // Filtra: mantém só produtos da categoria ESCOLHIDA e que "casam" com a busca
    const listaFiltrada = produtos.filter(function (produto) {
        const temCategoria = filtroCategoria === "Todos" || produto.categoria === filtroCategoria;
        const temBusca =
            busca === "" ||
            produto.nome.toLowerCase().includes(busca) ||
            produto.descricao.toLowerCase().includes(busca);
        return temCategoria && temBusca;
    });

    grid.innerHTML = ""; // limpa os cards anteriores

    // Se não veio nenhum produto, mostra um aviso
    if (listaFiltrada.length === 0) {
        grid.innerHTML =
            '<div class="produtos-sem-resultado">' +
                "<p>😕 Nenhum produto encontrado.</p>" +
                "<p>Tente outra busca ou categoria.</p>" +
            "</div>";
        return;
    }

    // Desenha um card para cada produto filtrado
    listaFiltrada.forEach(function (produto, indice) {
        const card = document.createElement("article");
        card.className = "produto-card" + (produto.disponivel ? "" : " indisponivel");
        card.dataset.id = produto.id; // guarda o id no card (usado nos cliques)
        card.style.animationDelay = Math.min(indice * 0.04, 0.4) + "s"; // animação em cascata

        // Monta o HTML interno do card (imagem + nome + descrição + preço + botão)
        card.innerHTML =
            '<div class="produto-imagem">' +
                '<img src="' + produto.imagem + '" alt="' + produto.nome +
                '" loading="lazy">' + /* loading=lazy: imagem carrega só quando aparece na tela */
                (produto.disponivel ? "" : '<div class="aviso-indisponivel">INDISPONÍVEL</div>') +
            "</div>" +
            '<div class="produto-info">' +
                '<span class="categoria-label">' + produto.categoria + "</span>" +
                "<h3>" + produto.nome + "</h3>" +
                "<p>" + produto.descricao + "</p>" +
                '<div class="produto-rodape">' +
                    '<span class="preco">' + formatarMoeda(produto.preco) + "</span>" +
                    '<button type="button" class="btn-adicionar" ' +
                        (produto.disponivel ? "" : "disabled") + ">" +
                        (produto.disponivel ? "Adicionar ao pedido" : "Indisponível") +
                    "</button>" +
                "</div>" +
            "</div>";

        grid.appendChild(card); // coloca o card na grade
    });
}

/* ==========================================================================
   MODAL DE DETALHES DO PRODUTO
   --------------------------------------------------------------------------
   O modal é a janelinha que abre ao clicar no nome/foto do produto.
   Ele mostra a descrição, o preço, a quantidade e um campo de observação.
   ========================================================================== */

function abrirModalProduto(id) {
    const produto = buscarProduto(id);
    if (!produto || !produto.disponivel) {
        return; // não abre modal de produto indisponível
    }

    // Guarda qual produto está aberto no modal
    produtoModalAtual = produto;

    // Preenche os campos do modal com os dados do produto
    el("modalImagem").src = produto.imagem;
    el("modalImagem").alt = produto.nome;
    el("modalCategoria").textContent = produto.categoria;
    el("modalNome").textContent = produto.nome;
    el("modalDescricao").textContent = produto.descricao;
    el("modalPreco").textContent = formatarMoeda(produto.preco);
    el("modalQtd").textContent = "1";           // quantidade começa em 1
    el("modalObservacao").value = "";             // observação começa vazia

    // Mostra o modal
    el("modalProduto").hidden = false;
    document.body.style.overflow = "hidden";      // trava a rolagem atrás do modal
    el("fecharModalProdutoBtn").focus();          // acessibilidade: foco no X
}

function fecharModalProduto() {
    el("modalProduto").hidden = true;             // esconde o modal
    produtoModalAtual = null;
    document.body.style.overflow = "";            // libera a rolagem de novo
}

function alterarQuantidadeModal(delta) {
    // Aumenta ou diminui a quantidade do modal, mas nunca abaixo de 1
    let atual = parseInt(el("modalQtd").textContent, 10) || 1;
    atual = Math.max(1, atual + delta);
    el("modalQtd").textContent = String(atual);
}

/* ==========================================================================
   CARRINHO — ADICIONAR / MUDAR / REMOVER
   --------------------------------------------------------------------------
   O carrinho é um array. Cada item do array é:
       { id, quantidade, observacao }
   ========================================================================== */

function adicionarAoCarrinho(id, quantidade, observacao) {
    // Procura se o produto já está no carrinho
    const itemExistente = carrinho.find(function (item) {
        return item.id === id;
    });

    quantidade = quantidade || 1;
    observacao = observacao ? observacao.trim() : "";

    if (itemExistente) {
        // Já existe: só soma a quantidade (e atualiza a observação, se vier)
        itemExistente.quantidade += quantidade;
        if (observacao) {
            itemExistente.observacao = observacao;
        }
    } else {
        // Não existe: adiciona como item novo
        carrinho.push({
            id: id,
            quantidade: quantidade,
            observacao: observacao
        });
    }

    salvarCarrinho();      // grava no navegador
    atualizarCarrinho();   // redesenha o painel e o contador
    mostrarToast("✓ Produto adicionado ao pedido"); // feedback visual
    animarContador();      // anima o número do carrinho no topo
}

function alterarQuantidade(id, delta) {
    // +1 ou -1 na quantidade de um item do carrinho
    const item = carrinho.find(function (i) {
        return i.id === id;
    });
    if (!item) {
        return;
    }

    item.quantidade += delta;

    // Se chegar a zero, o item é removido sozinho
    if (item.quantidade <= 0) {
        removerDoCarrinho(id);
        return;
    }

    salvarCarrinho();
    atualizarCarrinho();
}

function removerDoCarrinho(id) {
    // Remove o item que tem o id informado
    carrinho = carrinho.filter(function (item) {
        return item.id !== id;
    });
    salvarCarrinho();
    atualizarCarrinho();
}

function limparCarrinho() {
    // Esvazia todo o pedido
    carrinho = [];
    salvarCarrinho();
    atualizarCarrinho();
    mostrarToast("Pedido limpo");
}

function quantidadeTotalNoCarrinho() {
    // Soma as quantidades de todos os itens (ex.: 2 paçocas + 1 pipoca = 3)
    return carrinho.reduce(function (total, item) {
        return total + item.quantidade;
    }, 0);
}

/* --------------------------------------------------------------------------
   CÁLCULOS DO PEDIDO
   ========================================================================== */

function calcularSubtotal() {
    // Soma o preço de cada item multiplicado pela quantidade
    return carrinho.reduce(function (total, item) {
        const produto = buscarProduto(item.id);
        return total + produto.preco * item.quantidade;
    }, 0);
}

function obterFormaRecebimento() {
    // Lê qual "radio" (Entrega ou Retirada) está marcado na etapa 2
    if (el("optEntrega").checked) {
        return "entrega";
    }
    if (el("optRetirada").checked) {
        return "retirada";
    }
    return ""; // nada marcado ainda
}

function calcularTaxa() {
    // Só existe taxa quando o cliente escolhe "Entrega"
    if (obterFormaRecebimento() !== "entrega") {
        return 0;
    }

    // Se houver taxas por bairro configuradas, usa o valor do bairro escolhido
    const bairro = el("bairroEntrega").value;
    if (Object.prototype.hasOwnProperty.call(taxasEntrega, bairro)) {
        return taxasEntrega[bairro];
    }

    // Caso contrário, usa a taxa fixa de taxaEntrega
    return taxaEntrega;
}

function calcularTotal() {
    // Total = subtotal dos produtos + taxa de entrega
    return calcularSubtotal() + calcularTaxa();
}

/* ==========================================================================
   ATUALIZAR O CARRINHO NA TELA
   --------------------------------------------------------------------------
   Redesenha:
     - o contador do carrinho no topo
     - a lista de itens dentro do painel
     - o estado "vazio" ou o resumo com os valores
     - a barra de total do rodapé
   Esta função é chamada após QUALQUER mudança no carrinho.
   ========================================================================== */

function atualizarCarrinho() {
    const contador = el("carrinhoContador");
    const quantidade = quantidadeTotalNoCarrinho();

    // Contador do topo: mostra só quando há itens
    if (quantidade > 0) {
        contador.hidden = false;
        contador.textContent = String(quantidade);
    } else {
        contador.hidden = true;
    }

    // Desenha a lista de itens dentro do painel
    const itens = el("carrinhoItens");
    itens.innerHTML = "";

    carrinho.forEach(function (item) {
        const produto = buscarProduto(item.id);
        const qtde = item.quantidade;

        // Cada item vira uma linha com foto, nome, observação, preço e botões
        const linha = document.createElement("div");
        linha.className = "carrinho-item";
        linha.dataset.id = produto.id;

        linha.innerHTML =
            '<img src="' + produto.imagem + '" alt="' + produto.nome + '" loading="lazy">' +
            '<div class="item-info">' +
                '<p class="item-nome">' + produto.nome + "</p>" +
                (item.observacao
                    ? '<p class="item-obs">Obs: ' + item.observacao + "</p>"
                    : "") +
                '<p class="item-preco">' +
                    formatarMoeda(produto.preco) + " • " + qtde + "x = " +
                    formatarMoeda(produto.preco * qtde) +
                "</p>" +
                '<div class="item-acoes">' +
                    '<button type="button" class="qt-btn" data-acao="menos" aria-label="Diminuir quantidade">−</button>' +
                    "<span>" + qtde + "</span>" +
                    '<button type="button" class="qt-btn" data-acao="mais" aria-label="Aumentar quantidade">+</button>' +
                    '<button type="button" class="remover" data-acao="remover">Remover</button>' +
                "</div>" +
            "</div>";

        itens.appendChild(linha);
    });

    // Troca entre o aviso "vazio" e o resumo de valores, na etapa 1
    const vazio = el("carrinhoVazio");
    const resumo = el("carrinhoResumo");
    const btnLimpar = el("limparPedidoBtn");
    const ehVazio = carrinho.length === 0;

    vazio.hidden = !ehVazio;
    resumo.hidden = ehVazio;
    btnLimpar.hidden = ehVazio;

    // Rodapé do carrinho (total + botões) só aparece quando há itens
    el("carrinhoFooter").style.display = ehVazio ? "none" : "flex";

    // Calcula os valores
    const subtotal = calcularSubtotal();
    const taxa = calcularTaxa();
    const total = calcularTotal();

    // Resumo da etapa 1 (Produtos)
    el("subtotalTxt").textContent = formatarMoeda(subtotal);
    el("taxaTxt").textContent = formatarMoeda(taxa);
    el("totalTxt").textContent = formatarMoeda(total);
    el("taxaLinha").hidden = taxa === 0; // só mostra a linha de taxa se houver taxa

    // Resumo da etapa 2 (Entrega)
    el("entSubtotalTxt").textContent = formatarMoeda(subtotal);
    el("entTaxaTxt").textContent = formatarMoeda(taxa);
    el("entTotalTxt").textContent = formatarMoeda(total);
    el("entTaxaLinha").hidden = taxa === 0;
    // Mostra o resumo da etapa 2 quando o cliente já escolheu uma forma
    // de recebimento OU quando existe taxa para ser exibida
    el("resumoEntrega").hidden = taxa === 0 && obterFormaRecebimento() === "";

    // Total fixo no rodapé do painel (visível em todas as etapas)
    el("totalBarTxt").textContent = formatarMoeda(total);
}

/* --------------------------------------------------------------------------
   ABRIR E FECHAR O PAINEL DO CARRINHO
   --------------------------------------------------------------------------
   O painel é um "menu lateral" que desliza pela direita. O "overlay" é a
   camada escura que fica atrás dele e cobre o restante do site.

   ATENÇÃO (importante!): quando o carrinho fecha, o overlay precisa ser
   realmente ESCONDIDO (hidden = true). Se ele ficar na tela com transparência,
   continua bloqueando cliques e hover no site todo — foi isso que causou o
   "travamento" relatado. Por isso aqui, depois da animação, o overlay é
   removido de vez. Isso é resolvido por: el("overlay").hidden = true.
   ========================================================================== */

function abrirCarrinho() {
    atualizarCarrinho();
    irParaEtapa(1);              // sempre abre mostrando a etapa 1
    el("carrinho").classList.add("aberto");           // desliza o painel para dentro
    el("carrinho").setAttribute("aria-hidden", "false");

    // Mostra o overlay e, no próximo quadro, aplica a opacidade (animação suave)
    el("overlay").hidden = false;
    requestAnimationFrame(function () {
        el("overlay").classList.add("visivel");
    });

    document.body.style.overflow = "hidden"; // trava a rolagem da página atrás
}

function fecharCarrinho() {
    el("carrinho").classList.remove("aberto");        // desliza o painel para fora
    el("carrinho").setAttribute("aria-hidden", "true");

    const overlay = el("overlay");
    overlay.classList.remove("visivel");              // some a opacidade

    // Depois que a animação terminar (300ms), esconde o overlay POR COMPLETO.
    // Se o carrinho for aberto de novo nesse meio tempo, não esconde (proteção).
    setTimeout(function () {
        if (!el("carrinho").classList.contains("aberto")) {
            overlay.hidden = true; /* <<< ESSA LINHA ARRUMOU O TRAVAMENTO */
        }
    }, 300);

    document.body.style.overflow = "";                // libera a rolagem da página
}

/* --------------------------------------------------------------------------
   NAVEGAR ENTRE AS ETAPAS DO CARRINHO (WIZARD)
   --------------------------------------------------------------------------
   1 = Produtos | 2 = Entrega | 3 = Dados | 4 = Envio
   Cada etapa é mostrada uma de cada vez: ao passar para a próxima, a anterior
   some. Os botões "Voltar" e "Continuar/Enviar" do rodapé comandam essa troca.
   ========================================================================== */

function irParaEtapa(numero) {
    // Garante que o número esteja entre 1 e 4
    if (numero < 1) {
        numero = 1;
    }
    if (numero > 4) {
        numero = 4;
    }

    etapaAtual = numero;

    // Esconde todas as etapas e mostra somente a escolhida (uma por vez)
    el("carrinhoEtapa1").hidden = numero !== 1;
    el("carrinhoEtapa2").hidden = numero !== 2;
    el("carrinhoEtapa3").hidden = numero !== 3;
    el("carrinhoEtapa4").hidden = numero !== 4;

    // Atualiza a barra de progresso (etapa atual fica azul, as passadas vermelhas)
    const passos = document.querySelectorAll(".passo-item");
    passos.forEach(function (item, indice) {
        const n = indice + 1;
        item.classList.toggle("ativo", n === numero);
        item.classList.toggle("concluido", n < numero);
    });

    // Botão "Voltar" some na primeira etapa (não tem para onde voltar)
    el("btnVoltar").style.visibility = numero === 1 ? "hidden" : "visible";

    // Botão "Continuar" vira "Enviar para o WhatsApp" na última etapa
    const btContinuar = el("btnContinuar");
    if (numero === 4) {
        btContinuar.textContent = "Enviar para o WhatsApp";
        btContinuar.className = "btn btn-whatsapp";
    } else {
        btContinuar.textContent = "Continuar";
        btContinuar.className = "btn btn-primario";
    }

    esconderErro(); // limpa qualquer mensagem de erro de etapas anteriores

    // Preparos específicos de cada etapa
    if (numero === 2) {
        montarOpcoesBairro(); // recria a lista de bairros (caso exista taxa)
    }
    if (numero === 4) {
        montarConfirmacao(); // monta o resumo final do pedido
    }

    atualizarCarrinho(); // recalcula os totais para a etapa atual

    el("carrinhoBody").scrollTop = 0; // volta o painel para o topo
}

/* ==========================================================================
   ETAPA 2 — ENTREGA
   --------------------------------------------------------------------------
   O cliente escolhe "Entrega" ou "Retirada". Se escolher Entrega, aparecem
   os campos de endereço e bairro. Tudo é validado antes de continuar.
   ========================================================================== */

function montarOpcoesBairro() {
    // Cria as opções do "select" de bairro a partir do objeto taxasEntrega.
    // Se não houver taxas por bairro, o campo fica escondido.
    const select = el("bairroEntrega");
    const bairros = Object.keys(taxasEntrega);

    // Primeira opção é um texto explicativo
    select.innerHTML = '<option value="">Selecionar bairro (ajuda a calcular a entrega)</option>';

    // Uma opção para cada bairro que tiver taxa
    bairros.forEach(function (bairro) {
        const opcao = document.createElement("option");
        opcao.value = bairro;
        opcao.textContent = bairro + " — " + formatarMoeda(taxasEntrega[bairro]);
        select.appendChild(opcao);
    });

    // Sem bairros configurados => não mostra o campo
    select.style.display = bairros.length === 0 ? "none" : "";
}

function alternarCampoEndereco() {
    // Quando o cliente marca "Entrega", mostra o campo de endereço.
    // Quando marca "Retirada", esconde. E recalcula os totais.
    const forma = obterFormaRecebimento();
    el("divEndereco").hidden = forma !== "entrega";
    atualizarCarrinho();
}

function mascararTelefone(valor) {
    // Formata o número enquanto o cliente digita:
    // (89) 99999-9999
    const digitos = valor.replace(/\D/g, "").slice(0, 11); // só números, máx. 11
    if (digitos.length === 0) {
        return "";
    }
    if (digitos.length <= 2) {
        return "(" + digitos;
    }
    if (digitos.length <= 6) {
        return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2);
    }
    if (digitos.length <= 10) {
        return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 6) + "-" + digitos.slice(6);
    }
    return "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 7) + "-" + digitos.slice(7);
}

function validarEtapaEntrega() {
    // Confere se a etapa 2 está preenchida corretamente
    const forma = obterFormaRecebimento();
    const mensagens = [];

    if (forma === "") {
        mensagens.push("Escolha entre Entrega ou Retirada no local.");
    }

    if (forma === "entrega" && el("enderecoEntrega").value.trim() === "") {
        mensagens.push("Informe o endereço de entrega.");
    }

    if (
        forma === "entrega" &&
        Object.keys(taxasEntrega).length > 0 &&
        el("bairroEntrega").value === ""
    ) {
        mensagens.push("Selecione o bairro de entrega.");
    }

    // Se houver erros, mostra e bloqueia
    if (mensagens.length > 0) {
        mostrarErro(mensagens);
        return false;
    }

    esconderErro();
    return true; // libera passar para a etapa 3
}

/* ==========================================================================
   ETAPA 3 — DADOS DO CLIENTE
   --------------------------------------------------------------------------
   Só pedimos nome, telefone e observações. Nada de senha ou cartão.
   ========================================================================== */

function validarEtapaDados() {
    // Confere se a etapa 3 está preenchida corretamente
    const nome = el("clienteNome").value.trim();
    const telefone = el("clienteTelefone").value.trim();
    const mensagens = [];

    if (nome === "") {
        mensagens.push("Informe seu nome.");
    }

    if (telefone === "") {
        mensagens.push("Informe seu telefone.");
    } else if (telefone.replace(/\D/g, "").length < 10) {
        mensagens.push("Informe um telefone válido com DDD.");
    }

    // Se houver erros, mostra e bloqueia
    if (mensagens.length > 0) {
        mostrarErro(mensagens);
        el("erroEtapa").scrollIntoView({ behavior: "smooth", block: "nearest" });
        return false;
    }

    esconderErro();
    return true; // libera passar para a etapa 4
}

function obterDadosDoFormulario() {
    // Pega todos os valores preenchidos nas etapas 2 e 3 de uma vez.
    // Usado na confirmação e na mensagem do WhatsApp.
    return {
        nome: el("clienteNome").value.trim(),
        telefone: el("clienteTelefone").value.trim(),
        forma: obterFormaRecebimento(),
        endereco: el("enderecoEntrega").value.trim(),
        bairro: el("bairroEntrega").value,
        observacoes: el("observacoesPedido").value.trim()
    };
}

/* ==========================================================================
   MENSAGENS DE ERRO (na tela, sem alert())
   --------------------------------------------------------------------------
   Mostra os avisos de validação dentro do próprio painel do carrinho.
   ========================================================================== */

function mostrarErro(mensagens) {
    const erro = el("erroEtapa");
    erro.hidden = false;
    erro.innerHTML = "⚠️ " + mensagens.join("<br>");
}

function esconderErro() {
    const erro = el("erroEtapa");
    erro.hidden = true;
    erro.innerHTML = "";
}

/* ==========================================================================
   ETAPA 4 — CONFIRMAÇÃO E ENVIO
   --------------------------------------------------------------------------
   Monta o resumo final do pedido (cliente, produtos, valores, entrega e
   observações) para o cliente conferir antes de ir para o WhatsApp.
   ========================================================================== */

function montarConfirmacao() {
    const dados = obterDadosDoFormulario();
    const resumo = el("confirmacaoResumo");

    // Lista de produtos com quantidade e valor de cada um
    let produtosHtml = "";
    carrinho.forEach(function (item) {
        const produto = buscarProduto(item.id);
        produtosHtml +=
            "<li>" +
                "<span>" + item.quantidade + "x " + produto.nome + "</span>" +
                "<strong>" + formatarMoeda(produto.preco * item.quantidade) + "</strong>" +
            "</li>";
    });

    const subtotal = calcularSubtotal();
    const taxa = calcularTaxa();
    const total = calcularTotal();

    const enderecoExibicao = dados.endereco
        ? dados.endereco + (dados.bairro ? " — " + dados.bairro : "")
        : "—";

    // Monta o HTML do resumo em blocos organizados
    resumo.innerHTML =
        '<div class="confirmacao-blocos">' +
            "<h4>Cliente</h4>" +
            "<p><strong>" + escapeHtml(dados.nome) + "</strong> — " + escapeHtml(dados.telefone) + "</p>" +
        "</div>" +

        '<div class="confirmacao-blocos">' +
            "<h4>Produtos</h4>" +
            "<ul>" + produtosHtml + "</ul>" +
        "</div>" +

        '<div class="confirmacao-blocos">' +
            "<h4>Resumo</h4>" +
            '<div class="resumo-linha"><span>Subtotal</span><span>' + formatarMoeda(subtotal) + "</span></div>" +
            (taxa > 0
                ? '<div class="resumo-linha"><span>Taxa de entrega</span><span>' + formatarMoeda(taxa) + "</span></div>"
                : "") +
            '<div class="resumo-linha total"><span>Total estimado</span><span>' + formatarMoeda(total) + "</span></div>" +
        "</div>" +

        '<div class="confirmacao-blocos">' +
            "<h4>Forma de recebimento</h4>" +
            "<p><strong>" + (dados.forma === "entrega" ? "🛵 Entrega" : "🏪 Retirada no local") + "</strong></p>" +
            (dados.forma === "entrega" ? "<p>" + escapeHtml(enderecoExibicao) + "</p>" : "") +
        "</div>" +

        (dados.observacoes
            ? '<div class="confirmacao-blocos">' +
                "<h4>Observações</h4>" +
                "<p>" + escapeHtml(dados.observacoes) + "</p>" +
              "</div>"
            : "");
}

function escapeHtml(texto) {
    // Evita que o cliente digite código capaz de "quebrar" a página.
    // Converte os caracteres especiais < > & " em texto simples.
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/* ==========================================================================
   WHATSAPP
   --------------------------------------------------------------------------
   O pedido viram um link do tipo:
       https://wa.me/NUMERO?text=OLÁ...
   O navegador abre esse link em outra aba e o WhatsApp já vem preenchido.
   ========================================================================== */

function urlWhatsApp() {
    // Só o endereço base do WhatsApp (sem a mensagem)
    return "https://wa.me/" + CONFIG.whatsappFornecedor;
}

function abrirWhatsApp(mensagem) {
    // encodeURIComponent protege acentos, espaços e quebras de linha do texto
    const url = urlWhatsApp() + "?text=" + encodeURIComponent(mensagem);
    window.open(url, "_blank"); // abre em nova aba
}

function gerarMensagemWhatsApp() {
    // Monta o texto da mensagem linha por linha, de forma organizada
    const dados = obterDadosDoFormulario();

    // *texto* no WhatsApp deixa em negrito
    const linhas = ["Olá! Gostaria de fazer um pedido pelo site.", ""];
    linhas.push("*NOVO PEDIDO*");
    linhas.push("");
    linhas.push("*Cliente:* " + dados.nome);
    linhas.push("*Telefone:* " + dados.telefone);
    linhas.push("");

    linhas.push("*PRODUTOS:*");

    // Um linha para cada produto + observação dele (se existir)
    carrinho.forEach(function (item) {
        const produto = buscarProduto(item.id);
        linhas.push(
            item.quantidade + "x " + produto.nome + " — " + formatarMoeda(produto.preco)
        );
        if (item.observacao) {
            linhas.push("   Obs: " + item.observacao);
        }
    });

    // Resumo de valores
    linhas.push("");
    linhas.push("*RESUMO*");
    linhas.push("Subtotal: " + formatarMoeda(calcularSubtotal()));
    const taxa = calcularTaxa();
    if (taxa > 0) {
        linhas.push("Taxa de entrega: " + formatarMoeda(taxa));
    }
    linhas.push("*Total estimado: " + formatarMoeda(calcularTotal()) + "*");
    linhas.push("");
    linhas.push("*Forma de recebimento:* " + (dados.forma === "entrega" ? "Entrega" : "Retirada no local"));

    // Endereço só entra se for entrega
    if (dados.forma === "entrega") {
        linhas.push("Endereço:");
        linhas.push(dados.endereco + (dados.bairro ? "\nBairro: " + dados.bairro : ""));
    }

    // Observações gerais (se o cliente preencheu)
    if (dados.observacoes) {
        linhas.push("");
        linhas.push("*Observações:*");
        linhas.push(dados.observacoes);
    }

    linhas.push("");
    linhas.push("Enviado através do catálogo online da Distribuidora Águia. Aguardo a confirmação do pedido!");

    // Junta tudo, separando por quebra de linha
    return linhas.join("\n");
}

function enviarPedidoWhatsApp() {
    // Monta a mensagem, abre o WhatsApp e fecha o painel do carrinho
    const mensagem = gerarMensagemWhatsApp();
    abrirWhatsApp(mensagem);
    mostrarToast("📲 Abrindo o WhatsApp com seu pedido...");

    setTimeout(fecharCarrinho, 800);
}

/* ==========================================================================
   TOAST — AVISOS RÁPIDOS NA TELA
   --------------------------------------------------------------------------
   Pequeno balão que aparece no rodapé para avisar "Produto adicionado" etc.
   Some sozinho depois de alguns segundos.
   ========================================================================== */

let timeoutToast = null; // guarda o "temporizador" para cancelar o anterior

function mostrarToast(mensagem) {
    const toast = el("toast");
    toast.textContent = mensagem;
    toast.hidden = false;

    // No próximo quadro da animação, aplica a classe que faz o balão aparecer
    requestAnimationFrame(function () {
        toast.classList.add("visivel");
    });

    // Remove o balão após 2,4s
    clearTimeout(timeoutToast); // se já estava contando, zera e recomeça
    timeoutToast = setTimeout(function () {
        toast.classList.remove("visivel");
        setTimeout(function () {
            toast.hidden = true;
        }, 300);
    }, 2400);
}

function animarContador() {
    // Pequeno pulso no número do carrinho sempre que um produto é adicionado
    const contador = el("carrinhoContador");
    contador.classList.remove("pulso");
    void contador.offsetWidth; // força o navegador a "reiniciar" a animação
    contador.classList.add("pulso");
}

/* ==========================================================================
   LOCALSTORAGE — LEMBRAR O PEDIDO
   --------------------------------------------------------------------------
   - salvarCarrinho(): grava o carrinho no navegador (strings em JSON)
   - carregarCarrinho(): lê o carrinho salvo quando a página abre
   Assim, se o cliente fechar a página e voltar depois, o pedido continua lá.
   ========================================================================== */

function salvarCarrinho() {
    try {
        localStorage.setItem(CHAVE_LOCALSTORAGE, JSON.stringify(carrinho));
    } catch (erro) {
        // Se o navegador bloquear o localStorage, o site continua funcionando
    }
}

function carregarCarrinho() {
    try {
        const salvo = localStorage.getItem(CHAVE_LOCALSTORAGE);
        if (salvo) {
            carrinho = JSON.parse(salvo) || [];
        }
    } catch (erro) {
        carrinho = [];
    }
}

/* ==========================================================================
   EVENTOS DA PÁGINA
   --------------------------------------------------------------------------
   Aqui ficam todos os "ouvintes" de clique, digitação, etc.
   Cada listener "escuta" um elemento e reage quando o usuário interage.
   ========================================================================== */

function configurarEventos() {
    // ----- MENU HAMBÚRGUER (celular) -----
    // Clica no botão de 3 linhas => abre/fecha o menu
    const menuBtn = el("menuBtn");
    const navLista = el("navLista");

    menuBtn.addEventListener("click", function () {
        const aberto = navLista.classList.toggle("aberto");
        menuBtn.classList.toggle("ativo", aberto);
        menuBtn.setAttribute("aria-expanded", aberto ? "true" : "false");
    });

    // Clicar num link do menu fecha o menu
    navLista.addEventListener("click", function (evento) {
        if (evento.target.closest(".nav-link")) {
            navLista.classList.remove("aberto");
            menuBtn.classList.remove("ativo");
            menuBtn.setAttribute("aria-expanded", "false");
        }
    });

    // ----- CARRINHO (abrir / fechar / clique no fundo escuro) -----
    el("abrirCarrinhoBtn").addEventListener("click", abrirCarrinho);
    el("fecharCarrinhoBtn").addEventListener("click", fecharCarrinho);

    // Clicar no fundo escuro (overlay) fecha tudo
    el("overlay").addEventListener("click", function () {
        fecharCarrinho();
        fecharModalProduto();
    });

    // ----- BUSCA: filtra os produtos a cada tecla digitada -----
    el("buscaProdutos").addEventListener("input", renderizarProdutos);

    // ----- GRADE DE PRODUTOS (delegação de eventos) -----
    // Um único listener para todos os cards. "Delegação" = descobre em qual
    // card o clique aconteceu e age de acordo (botão "Adicionar" ou abrir modal).
    el("produtosGrid").addEventListener("click", function (evento) {
        const botaoAdicionar = evento.target.closest(".btn-adicionar");
        const card = evento.target.closest(".produto-card");

        if (!card) {
            return; // clicou fora de um card
        }

        const id = parseInt(card.dataset.id, 10);

        // Clique no botão "Adicionar ao pedido"
        if (botaoAdicionar) {
            evento.stopPropagation(); // impede de abrir o modal junto
            if (botaoAdicionar.disabled) {
                return; // produto indisponível
            }
            adicionarAoCarrinho(id, 1, "");
            return;
        }

        // Clique na foto/nome do produto => abre o modal de detalhes
        abrirModalProduto(id);
    });

    // ----- MODAL DO PRODUTO -----
    el("fecharModalProdutoBtn").addEventListener("click", fecharModalProduto);

    // Botões - e + da quantidade no modal
    el("modalQtdMenos").addEventListener("click", function () {
        alterarQuantidadeModal(-1);
    });
    el("modalQtdMais").addEventListener("click", function () {
        alterarQuantidadeModal(1);
    });

    // Botão "Adicionar ao pedido" do modal: usa quantidade e observação
    el("modalAdicionarBtn").addEventListener("click", function () {
        if (!produtoModalAtual) {
            return;
        }
        const quantidade = parseInt(el("modalQtd").textContent, 10) || 1;
        const observacao = el("modalObservacao").value;
        adicionarAoCarrinho(produtoModalAtual.id, quantidade, observacao);
        fecharModalProduto();
    });

    // ----- ITENS DO CARRINHO (delegação de eventos) -----
    // Os botões - / + / Remover de cada linha usam "data-acao" para dizer o que fazer
    el("carrinhoItens").addEventListener("click", function (evento) {
        const botao = evento.target.closest("button[data-acao]");
        if (!botao) {
            return;
        }

        const linha = botao.closest(".carrinho-item");
        const id = parseInt(linha.dataset.id, 10);
        const acao = botao.dataset.acao;

        if (acao === "mais") {
            alterarQuantidade(id, 1);
        } else if (acao === "menos") {
            alterarQuantidade(id, -1);
        } else if (acao === "remover") {
            removerDoCarrinho(id);
        }
    });

    // Botão "Ver produtos" (estado vazio) fecha o painel e rola até os produtos
    el("verProdutosBtn").addEventListener("click", function () {
        fecharCarrinho();
        document.querySelector("#produtos").scrollIntoView({ behavior: "smooth" });
    });

    el("limparPedidoBtn").addEventListener("click", limparCarrinho);

    // ----- NAVEGAÇÃO ENTRE ETAPAS -----
    // Botão "Voltar": volta uma etapa
    el("btnVoltar").addEventListener("click", function () {
        if (etapaAtual > 1) {
            irParaEtapa(etapaAtual - 1);
        }
    });

    // Botão "Continuar / Enviar": valida a etapa atual e avança
    el("btnContinuar").addEventListener("click", function () {
        if (etapaAtual === 1) {
            // Etapa 1: o carrinho não pode estar vazio
            if (carrinho.length === 0) {
                mostrarToast("Adicione pelo menos um produto ao seu pedido.");
                return;
            }
            irParaEtapa(2);
        } else if (etapaAtual === 2) {
            // Etapa 2: validar forma de recebimento/endereço
            if (validarEtapaEntrega()) {
                irParaEtapa(3);
            }
        } else if (etapaAtual === 3) {
            // Etapa 3: validar nome e telefone
            if (validarEtapaDados()) {
                irParaEtapa(4);
            }
        } else if (etapaAtual === 4) {
            // Etapa 4: enviar para o WhatsApp
            enviarPedidoWhatsApp();
        }
    });

    // ----- FORMULÁRIO DA ETAPA DE ENTREGA -----
    // Marcar "Entrega" ou "Retirada" mostra/esconde o endereço e recalcula total
    document.querySelectorAll('input[name="recebimento"]').forEach(function (radio) {
        radio.addEventListener("change", alternarCampoEndereco);
    });

    // Trocar o bairro recalcula a taxa de entrega
    el("bairroEntrega").addEventListener("change", atualizarCarrinho);

    // ----- FORMULÁRIO DA ETAPA DE DADOS -----
    // Máscara de telefone enquanto o cliente digita
    el("clienteTelefone").addEventListener("input", function () {
        const campo = el("clienteTelefone");
        campo.value = mascararTelefone(campo.value);
    });

    // ----- TECLA ESC (acessibilidade) -----
    // Escape fecha o modal do produto ou o carrinho
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            if (!el("modalProduto").hidden) {
                fecharModalProduto();
            } else if (el("carrinho").classList.contains("aberto")) {
                fecharCarrinho();
            }
        }
    });
}

/* ==========================================================================
   INICIAR
   --------------------------------------------------------------------------
   Só começa o site depois que a página HTML terminou de carregar.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", iniciar);