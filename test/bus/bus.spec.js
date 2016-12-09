let chai = require('chai')
var expect = chai.expect

let bus = require('../../lib/bus')

describe('transformCSVArrayToObject', function () {
  it('should transform the plain array with the first property as the key and the rest as value', function () {
    var mockData = [
      ['linha', 1, 2],
      ['nome', 'putim', 'sao judas'],
      ['sentido', 'centro', 'bairro'],
      ['horarios', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=d&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=d&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>'],
      ['rota', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=m&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=m&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>']
    ]

    var expectedResult = [{
      line: 1,
      name: 'putim',
      direction: 'centro',
      busSchedule: "/secretarias/transportes/horario-e-itinerario.aspx?acao=d&id_linha=1",
      route: "/secretarias/transportes/horario-e-itinerario.aspx?acao=m&id_linha=1"
    }, {
      line: 2,
      name: 'sao judas',
      direction: 'bairro',
      busSchedule: "/secretarias/transportes/horario-e-itinerario.aspx?acao=d&id_linha=2",
      route: "/secretarias/transportes/horario-e-itinerario.aspx?acao=m&id_linha=2"
    }]

    var result = bus.transformCSVArrayToObject(mockData)
    expect(result).to.deep.equal(expectedResult)
  })
})
