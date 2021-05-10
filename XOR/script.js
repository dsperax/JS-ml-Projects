// Criação da rede (variáveis)
const { Layer, Network } = window.synaptic;

var inputLayer = new Layer(2); // 2 neuronios de entrada
var hiddenLayer = new Layer(3); // 3 neuronios de processamento (interno)
var outputLayer = new Layer(1); // 1 neuronio de saida

inputLayer.project(hiddenLayer); // neuronios de entrada passam resultado para os internos
hiddenLayer.project(outputLayer); // neuronios internos passam resultado para a saida

// criação da rede e atribuição dos valores
var myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});

// Treinando a rede - Aprendendo XOR
var learningRate = .6; // indice de aprendizado: precisão da retropropagação (backpropagation), onde a rete atualiza seus parametros, o quão longe está do valor real

// looping para mostrar resultados para rede resultados.
for (var i = 0; i < 20000; i++) {
    // 0,0 => 0
    myNetwork.activate([0, 0]); //ativa passando os dados (0,0) na entrada
    myNetwork.propagate(learningRate, [0]); //propaga a resposta com o indice de aprendizado e a resposta correta

    // 0,1 => 1
    myNetwork.activate([0, 1]);
    myNetwork.propagate(learningRate, [1]);

    // 1,0 => 1
    myNetwork.activate([1, 0]);
    myNetwork.propagate(learningRate, [1]);

    // 1,1 => 0
    myNetwork.activate([1, 1]);
    myNetwork.propagate(learningRate, [0]);
}

// Testando a rede

console.log(myNetwork.activate([0, 0])); // [0.015020775950893527] para lr .3
console.log(myNetwork.activate([0, 1])); // [0.9815816381088985] para lr .3
console.log(myNetwork.activate([1, 0])); // [0.9871822457132193] para lr .3
console.log(myNetwork.activate([1, 1])); // [0.012950087641929467] para lr .3

//imprimindo resultados

function resultados() {
    var resultado00 = myNetwork.activate([0, 0]);
    var resultado01 = myNetwork.activate([0, 1]);
    var resultado10 = myNetwork.activate([1, 0]);
    var resultado11 = myNetwork.activate([1, 1]);

    var resultados = document.getElementById("resultados");

    resultados.innerHTML = `Para [0, 0]: ${resultado00}<br>
    Para [0, 1]: ${resultado01}<br>
    Para [1, 0]: ${resultado10}<br>
    Para [1, 1]: ${resultado11}`;
}