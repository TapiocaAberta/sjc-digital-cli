// const chai = require('chai')
// const expect = chai.expect
const busModule = require('../../lib/bus')
const assert = require('assert')
const coMocha = require('co-mocha')
const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')

let rawEntirePage = require('fs').readFileSync('test/bus/details_page_example.txt', 'utf8')

var nock = require('nock')

describe('transformCSVArrayToObject', function () {
  it('should transform the plain array with the first property as the key and the rest as value', function () {
    let rawList = [
      ['linha', 1, 2],
      ['nome', 'putim', 'sao judas'],
      ['sentido', 'centro', 'bairro'],
      ['horarios', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>'],
      ['rota', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>']
    ]

    let parsedList = [{
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=1',
      'direction': 'centro',
      'line': 1,
      'name': 'putim',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=1'
    }, {
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=2',
      'direction': 'bairro',
      'line': 2,
      'name': 'sao judas',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=2'
    }]

    let result = busModule.transformCSVArrayToObject(rawList)
    assert.deepEqual(result, parsedList)
  })

  it.skip('parseBuses - should parse and return', function* () {
    let buses = [{
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=1',
      'direction': 'centro',
      'line': 1,
      'name': 'putim',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=1'
    }]

    // TODO: add nock in other to simulate http requests

    let result = yield busModule.parseBuses(buses)
    assert.deepEqual(result, buses)
  })

  it.skip('getScheduleTimes - should parse the page and return the schedule of buses', function* () {
    let cheerioEntirePage = cheerio.load(rawEntirePage)
    cheerioTableparser(cheerioEntirePage)

    let result = yield busModule.parseDetailsPage(cheerioEntirePage)

    assert.deepEqual(result, '')
      // let result = yield busModule.getScheduleTimes(cheerioTable)
      // assert.deepEqual(result, '')
  })

  it('chunkScheduleByPeriod: should split the schedule by dawn, morning, afternoon and night', function () {
    let rawInput = [
      'De segunda-feira a sexta-feira',
      '0 às 6h',
      '05:10',
      '05:44',
      'Aos sábados',
      '0 às 6h',
      '00:50',
      '05:00',
      '05:36',
      'Aos domingos e feriados',
      '0 às 6h',
      '00:45',
      '05:00',
      '05:54'
    ]

    let expectedDawn = {
      'weekDays': [
        '05:10',
        '05:44'
      ],
      'saturday': [
        '00:50',
        '05:00',
        '05:36'
      ],
      'sunday': [
        '00:45',
        '05:00',
        '05:54'
      ]
    }

    let result = busModule.chunkScheduleByPeriod(rawInput)
    assert.deepEqual(result, expectedDawn)
  })
})

function nockSJCWebSite () {
  let responseJsonObject = '' // read it from FS
  var couchdb = nock('http://www.sjc.sp.gov.br')
    .get('/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=1')
    .reply(200, responseJsonObject)
}
