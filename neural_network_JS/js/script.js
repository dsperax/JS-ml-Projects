const _TRAINING_SIZE_MAX = 10000;
const _CANVAS_WIDTH = 1000;
const _CANVAS_HEIGHT = 600;
const _CIRCLE_RADIUS = 50;
const _POINT_RADIUS = 8;

const _epochs = 100;
const _params = {
    libURI: "https://franpapers.com/lib/neural-network-241117.js", // biblioteca
    activation: "linear", // Função de ativação usada para as camadas ocultas. Neurônios de entradas e saídas têm uma função de ativação linear 
    // Se não for especificado, "linear" é o valor padrão. activationParams são apenas fatores que afetam alguma função de ativação (etc: PReLu) 
    // Valores atualmente possíveis: 
    // linear, sigmóide, tanh, relu, pré-
    lr: 0.05, // fator de taxa de aprendizagem (learn rate)
    layers: [2, 6, 6, 6, 6, 6, 6, 2] //camadas de neurônios
        // layers: [2, 4, 4, 4, 2],
        // layers: [2, 5, 1, 5, 2]
        // layers: [2, 15, 15, 15, 2]
        // layers: [2, 3, 4, 5, 6, 5, 4, 3, 2]
        // layers: [2, 40, 2]
        // Pode colocar valores diferentes de camadas;
};

function init() {

    DOM.canvas.width = _CANVAS_WIDTH;
    DOM.canvas.height = _CANVAS_HEIGHT;

    ctx.translate(_CANVAS_WIDTH / 2, _CANVAS_HEIGHT / 2);
    ctx.scale(1, -1);

    // capta movimentação do mouse
    DOM.canvas.addEventListener("mousemove", function(e) {
        mouse.x = (e.pageX - DOM.canvas.offsetLeft) * 2 - _CANVAS_WIDTH / 2;
        mouse.y = (e.pageY - DOM.canvas.offsetTop) * -2 + _CANVAS_HEIGHT / 2;
        mouse.refresh = true;
    });

    // desativa aleatóriamente alguns neuronios da rede
    DOM.dropoutButton.addEventListener("click", function(e) {
        brain.dropout();
    });

    DOM.trainButton.addEventListener("click", function(e) {

        // Treinamento inicial
        if (typeof training_data_imported !== 'undefined' && training_data_imported !== undefined) {

            var training_set = typeof training_data_imported !== "undefined" ? Utils.static.parseTrainingData(training_data_imported) : undefined;

            console.log(training_set);
            DOM.trainButton.parentElement.appendChild(brain.train({
                trainingSet: training_set,
                epochs: _epochs,
                visualize: true
            }));
        } else {
            alert("No training data available");
        }
    });

    window.addEventListener("keydown", function(e) {

        if (e.keyCode === 32) // barra de espaço ativa ou desativa a retropropagação (desliga o circulo)
        {
            e.stopPropagation();
            e.preventDefault();
            DOM.backpropagationCheckbox.click();
        }
    });
}

function update() {

    requestAnimationFrame(function() {
        update();
    });
    ctx.clearRect(-_CANVAS_WIDTH / 2, -_CANVAS_HEIGHT / 2, _CANVAS_WIDTH, _CANVAS_HEIGHT);

    ///////////////////// BIBLIOTECA JS //////////////////

    // Taxa de avanço da rede neural
    var inputs = [mouse.x / norm_x, mouse.y / norm_y];
    var targets = [mouse.x / norm_x, mouse.y / norm_y];
    var neurons = brain.feed(inputs);

    // Crie dados de treinamento (como string) para exportação futura
    if (training_size <= _TRAINING_SIZE_MAX) {
        training_data += inputs[0] + " " + inputs[1] + " : " + targets[0] + " " + targets[1] + "\\\n";
        training_size++;
    }

    if (DOM.backpropagationCheckbox.checked === true)
        brain.backpropagate(targets);

    // Desenha mouse
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, _POINT_RADIUS, 0, Math.PI * 2, false);
    ctx.fill();

    // Desenha circulo
    ctx.beginPath();
    ctx.arc(neurons[0].output * norm_x, neurons[1].output * norm_y, _CIRCLE_RADIUS, 0, Math.PI * 2, false);
    ctx.stroke();

    // Atualiza o display de erro global
    DOM.globalError.innerHTML = (brain.globalError).toFixed(6);

    // Atualizar visualização de SVG da rede
    brain.visualize(inputs);
}

var DOM, ctx, mouse, brain, training_data = "",
    training_size = 0;
var norm_x = _CANVAS_WIDTH / 2;
var norm_y = _CANVAS_HEIGHT / 2;

function Network(params) {

    // Variáveis requisitadas: lr, layers
    this.params = params;

    this.lr = undefined; // Taxa de aprendizado
    this.layers = undefined;
    this.optimizer = undefined; // Deve ser incuído em _AVAILABLE_OPTIMIZER
    this.optimizerParams = undefined; // exemplo: a taxa de momentum será {alpha: X}
    this.activation = undefined; // função de ativação para camada oculta
    this.activationParams = undefined;

    this.neurons = undefined;
    this.weights = undefined;
    this.momentums = undefined; // coeficientes de momentums a t-1
    this.gradients = undefined; // gradientes quadrados para Adagrad 
    this.output = undefined; // matriz de saída atual

    // Variáveis de cache:
    this.layersSum = undefined;
    this.layersMul = undefined;
    this.nbLayers = undefined;
    this.nbNeurons = undefined;
    this.nbWeights = undefined;

    // Objetivo das estatísticas:
    this.iterations = 0;
    this.maxWeight = 0;
    this.outputError = 0;
    this.globalError = 0;
    this.avgWeightsPerNeuron = 0;

    // Visualização:
    this.svgVisualization = false;
    this.DOM = {
        svg: undefined,
        tooltip: undefined,

        neuronsCircles: undefined,
        weightTexts: undefined,
        inputTexts: undefined,
        outputTexts: undefined,
        weightCurves: undefined
    };

    // Necessário para evitar problemas com Cross Origin (Web Worker)
    this.libURI = undefined;

    this.loadParams(params);
    this.initialize();
}

window.onload = function() {

    DOM = {
        canvas: document.querySelector("canvas"),
        globalError: document.querySelector("#global_error span"),
        backpropagationCheckbox: document.querySelector("#backpropagate"),
        trainButton: document.querySelector("#train"),
        dropoutButton: document.querySelector("#dropout"),
    };

    ctx = DOM.canvas.getContext("2d");

    mouse = {
        x: 1,
        y: 2,
        refresh: false
    };
    brain = new Network(_params);

    document.body.appendChild(brain.createVisualization());

    init();
    update();
};
