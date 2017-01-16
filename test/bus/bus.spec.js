// const chai = require('chai')
// const expect = chai.expect

require('co-mocha')

const assert = require('assert')
const nock = require('nock')
const rewire = require('rewire')
const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')
const busModule = rewire('../../lib/bus')

let rawHomePage = require('fs').readFileSync('test/bus/home_page.txt', 'utf8')
let rawDetailsPage = require('fs').readFileSync('test/bus/details_page_example.txt', 'utf8')

describe('transformCSVArrayToObject', function () {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('getPage - should get a nock page with success', function* () {
    // mock the http request for the url and send the static page as response simulating the real page
    nock('http://www.sjc.sp.gov.br')
      .get('/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96')
      .reply(200, rawDetailsPage)

    let $ = yield busModule.getPage('http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96')
    var title = $('head > title').text()

    let expectedTitle = '\r\n  Horários e Itinerários de Ônibus\r\n        - Prefeitura Municipal de São José dos Campos\r\n      \r\n'
    assert.deepEqual(title, expectedTitle)
  })

  it('should transform the plain array with the first property as the key and the rest as value', function () {
    let rawList = [
      ['linha', 212, 214],
      ['nome', 'PUTIM / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60', 'VILA TESOURO / AV. ENG. FRANCISCO JOSE LONGO (VIA SEBASTIAO GUALBERTO) (CIRCULAR NO CENTRO) O.S.O. 25'],
      ['sentido', 'centro', 'bairro'],
      ['horarios', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>'],
      ['rota', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>']
    ]

    let parsedList = [{
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96',
      'direction': 'PUTIM / TERMINAL CENTRAL',
      'line': 212,
      'name': 'PUTIM / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60 / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=96'
    }, {
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=98',
      'direction': 'VILA TESOURO / JOSE LONGO',
      'line': 214,
      'name': 'VILA TESOURO / AV. ENG. FRANCISCO JOSE LONGO (VIA SEBASTIAO GUALBERTO) (CIRCULAR NO CENTRO) O.S.O. 25',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=98'
    }]

    let result = busModule.transformCSVArrayToObject(rawList)
    assert.deepEqual(result, parsedList)
  })

  it.only('parseBuses - should parse and return', function* () {
    let buses = [{
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96',
      'direction': 'PUTIM / TERMINAL CENTRAL',
      'line': 212,
      'name': 'PUTIM / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60 / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=96'
    }]
    // mock the http request for the url and send the static page as response simulating the real page
    nock('http://www.sjc.sp.gov.br')
      .get('/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96')
      .reply(200, rawDetailsPage)

    let parseBuses = busModule.__get__('parseBuses')
    let result = yield parseBuses(buses)
    assert.deepEqual(result, {})
  })

  it.skip('getScheduleTimes - should parse the page and return the schedule of buses', function* () {
    let cheerioEntirePage = cheerio.load(rawDetailsPage)
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
