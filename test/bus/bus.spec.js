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

let parsedTimesDetails = {
  'routes': {
    'number': '212',
    'line': 'PUTIM / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60',
    'direction': 'PUTIM / TERMINAL CENTRAL',
    'itinerary': 'RUA CARLOS A. DE P. TORO – RUA MESSIAS DE ALVARENGA – AV. JOAO RODOLFO CASTELLI – AV. JOSE IGNACIO BICUDO – RUA JOSE GONCALVES CAMPOS – AV. JOSE IGNACIO BICUDO – AV. JOAO RODOLFO CASTELLI – RUA ITATIAIA – RUA TURUMIRIM – RUA NEPOMUCENO – AV. JOAO RODOLFO CASTELLI – ESTR. MUNIC. GLAUDISTON P. DE OLIVEIRA – AV. DOMINGOS MALDONADO CAMPOY – AV. BRIG. FARIA LIMA – AV. DOS ASTRONAUTAS – VD. DOS BANDEIRANTES – RUA BAHIA – RUA TUPA – PCA CAP. PEDRO PINTO DA CUNHA – AV. PEDRO A. CABRAL – VD. RAQUEL MARCONDES – RUA CEL. MORAES – RUA FRANCISCO RAFAEL – RUA SIQUEIRA CAMPOS – PCA PADRE JOAO – TERMINAL CENTRAL',
    'observation': 'AOS SABADOS E DOMINGOS TODAS AS VIAGENS ENTRAM NO VILA ADRIANA.'
  },
  'times': {
    'dawn': {
      'week': ['05:10', '05:44'],
      'saturday': ['00:50', '05:00', '05:36'],
      'sunday': ['00:45', '05:00', '05:54']
    },
    'morning': {
      'week': ['06:12', '06:40', '07:08', '07:36', '08:04', '08:32', '09:00', '09:50(1)', '10:25(1)', '10:55(1)', '11:25(1)', '11:55(1)'],
      'saturday': ['06:12', '06:48', '07:22', '07:54', '08:26', '09:26', '09:58', '10:30', '11:02', '11:34'],
      'sunday': ['06:48', '07:42', '08:36', '09:56', '10:50', '11:57']
    },
    'afternoon': {
      'week': ['12:25(1)', '12:55(1)', '13:25(1)', '14:00(1)', '14:34(1)', '15:08(1)', '15:42(1)', '16:16(1)', '16:50(1)', '17:24(1)', '17:40(1)', '17:58(1)'],
      'saturday': ['12:06', '12:38', '13:10', '13:42', '13:42(2)', '14:46', '15:32', '16:00', '16:32', '17:04(2)', '17:52'],
      'sunday': ['12:51', '13:45(2)', '14:39', '15:33', '16:27(2)', '17:21']
    },
    'night': {
      'week': ['18:32(1)', '19:06(1)', '19:45(1)', '20:32(1)', '21:06(1)', '21:40(1)', '22:12(1)', '23:06(1)', '23:45(1)'],
      'saturday': ['18:52', '19:34', '20:20', '21:05', '21:55', '22:50', '23:40'],
      'sunday': ['18:15', '19:32', '20:26', '21:20', '22:30', '23:35']
    }
  }
}

describe('transformCSVArrayToObject', function () {
  beforeEach(() => {
    nock.cleanAll()
  })

  it('getPage - should get a nock page with success', function* () {
    // mock the http request for the url and send the static page as response simulating the real page
    nock('http://www.sjc.sp.gov.br')
      .get('/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96')
      .reply(200, rawDetailsPage)

    let getPage = busModule.__get__('getPage')
    let $ = yield getPage('http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96')
    var title = $('head > title').text()

    let expectedTitle = 'Horários e Itinerários'

    assert(title.includes(expectedTitle))
  })

  it('should transform the plain array with the first property as the key and the rest as value', function () {
    let rawList = [
      ['linha', 212, 214],
      ['nome', 'PUTIM / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60', 'VILA TESOURO / AV. ENG. FRANCISCO JOSE LONGO (VIA SEBASTIAO GUALBERTO) (CIRCULAR NO CENTRO) O.S.O. 25'],
      ['sentido', 'PUTIM / TERMINAL CENTRAL', 'VILA TESOURO / JOSE LONGO'],
      ['horarios', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>'],
      ['rota', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>', '<a href="/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>']
    ]

    let parsedList = [{
      'line': 212,
      'name': 'PUTIM / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60',
      'direction': 'PUTIM / TERMINAL CENTRAL',
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=1',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=1'
    }, {
      'line': 214,
      'name': 'VILA TESOURO / AV. ENG. FRANCISCO JOSE LONGO (VIA SEBASTIAO GUALBERTO) (CIRCULAR NO CENTRO) O.S.O. 25',
      'direction': 'VILA TESOURO / JOSE LONGO',
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=2',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=2'
    }]

    let transformCSVArrayToObject = busModule.__get__('transformCSVArrayToObject')
    let result = transformCSVArrayToObject(rawList)
    assert.deepEqual(result, parsedList)
  })

  it('parseBuses - should parse and return', function* () {
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
    assert.deepEqual(result, [parsedTimesDetails])
  })

  it('parseBusPage - should parse and return a single bus', function* () {
    let bus = {
      'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96',
      'direction': 'PUTIM / TERMINAL CENTRAL',
      'line': 212,
      'name': 'PUTIM / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60 / TERMINAL CENTRAL – VIA AV. DOS ASTRONAUTAS (CIRCULAR NO CENTRO) O.S.O. 60',
      'route': 'http://www.sjc.sp.gov.br/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=m&id_linha=96'
    }

    nock('http://www.sjc.sp.gov.br')
      .get('/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=d&id_linha=96')
      .reply(200, rawDetailsPage)

    let parseBusPage = busModule.__get__('parseBusPage')
    const parsedBus = yield parseBusPage(bus)

    assert.deepEqual(parsedBus, parsedTimesDetails)
  })

  it('getScheduleTimes - should parse the details page and give the parsed results', function* () {
    let cheerioEntirePage = cheerio.load(rawDetailsPage)
    cheerioTableparser(cheerioEntirePage)

    let parseDetailsPage = busModule.__get__('parseDetailsPage')
    let result = yield parseDetailsPage(cheerioEntirePage)

    assert.deepEqual(result, parsedTimesDetails)
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
      'week': [
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

    let chunkScheduleByPeriod = busModule.__get__('chunkScheduleByPeriod')
    let result = chunkScheduleByPeriod(rawInput)
    assert.deepEqual(result, expectedDawn)
  })

  it('getRouteMetadata - should extract the route data from page', function* () {
    let cheerioEntirePage = cheerio.load(rawDetailsPage)
    cheerioTableparser(cheerioEntirePage)

    let getRouteMetadata = busModule.__get__('getRouteMetadata')
    let result = yield getRouteMetadata(cheerioEntirePage)

    assert.deepEqual(result, parsedTimesDetails.routes)
  })
})
