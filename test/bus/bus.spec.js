// const chai = require('chai')
// const expect = chai.expect
const busModule = require('../../lib/bus')
const assert = require('assert')
const coMocha = require('co-mocha')
const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')

let rawList = [
  ['linha', 1, 2],
  ['nome', 'putim', 'sao judas'],
  ['sentido', 'centro', 'bairro'],
  ['horarios', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=d&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=d&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/consultar1.png" border="0"></a>'],
  ['rota', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=m&amp;id_linha=1"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>', '<a href="/secretarias/transportes/horario-e-itinerario.aspx?acao=m&amp;id_linha=2"><img src="http://servicos.sjc.sp.gov.br/imagens/mapa.png" border="0"></a>']
]

let parsedList = [{
  'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/transportes/horario-e-itinerario.aspx?acao=d&id_linha=1',
  'direction': 'centro',
  'line': 1,
  'name': 'putim',
  'route': 'http://www.sjc.sp.gov.br/secretarias/transportes/horario-e-itinerario.aspx?acao=m&id_linha=1'
}, {
  'busSchedule': 'http://www.sjc.sp.gov.br/secretarias/transportes/horario-e-itinerario.aspx?acao=d&id_linha=2',
  'direction': 'bairro',
  'line': 2,
  'name': 'sao judas',
  'route': 'http://www.sjc.sp.gov.br/secretarias/transportes/horario-e-itinerario.aspx?acao=m&id_linha=2'
}]

let rawEntirePage = require('fs').readFileSync('test/bus/details_page_example.txt', 'utf8')
let rawDetailsHTML = '<div class="texto" align="justify"> <!-- Conteúdo --> <table width="100%" border="0" align="center" cellpadding="2" cellspacing="0"> <tbody> <tr valign="top" class="textosm"> <!--codigo da linha--> <td width="100"> <strong>Número da Linha:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblNumeroLinha">101</span> </td> </tr> <tr valign="top" class="textosm"> <!--descricao da linha--> <td> <strong>Nome da Linha:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblNomeLinha">REPRESA / TERMINAL CENTRAL (RADIAL) O.S.O 38</span> </td> </tr> <tr valign="top" class="textosm"> <!--Sentido--> <td> <strong>Sentido:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblSentido">REPRESA / TERMINAL CENTRAL </span> </td> </tr> <tr valign="top" class="textosm"> <!--Itinerário--> <td> <strong>Itinerário:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblItinerario">BAIRRO RIO DAS COBRAS – ESTR. JUCA CARVALHO – AV. RUI BARBOSA – RUA ALZIRO LEBRAO – RUA AUDEMO VENEZIANI – PONTE MINAS GERAIS – PRACA BANDEIRANTES – RUA CAP. ELISIARIO – AV. RUI BARBOSA – VD. DOS EXPEDICIONARIOS – RUA ANA EUFRASIA – AV. SAO JOSE – RUA FLAVIO B. MACHADO – AV. TEN. NEVIO BARACHO – TERMINAL CENTRAL</span> </td> </tr> <tr valign="top" class="textosm"> <!--Itinerário--> <td> <strong>Observação:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblObservacao">-</span> </td> </tr> <tr valign="bottom"> <!--Título : Horários--> <td colspan="2" class="texto"> &nbsp; </td> </tr> </tbody> </table> <div class="observacoes" align="center"><span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblAtualizadoEm">Atualizado em: 18/04/2016</span></div> <br> <div style="width: 100%; clear: both;"> <p class="textosm"> <b>Horários:</b> </p> </div> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblResultado" class="textosm"><table width="33%" border="0" cellpadding="2" cellspacing="2" bordercolor="FFFFFF"> <tbody><tr><td align="center"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border: none;"><tbody><tr><td colspan="4" align="center" style="border: 1px solid black"><b>De segunda-feira a sexta-feira</b></td> </tr><tr><td colspan="4" style="border: none"><div style="font-size:4px">&nbsp;</div></td></tr><tr><td align="center" width="25%" style="border: 1px solid black"><b>0 às 6h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>6 às 12h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>12 às 18h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>18 às 24h</b></td></tr><tr><td align="center" style="border: 1px solid black">05:50(1)</td><td align="center" style="border: 1px solid black">06:00(2)</td><td align="center" style="border: 1px solid black">14:15(5)</td><td align="center" style="border: 1px solid black">18:45(7)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">09:50(3)</td><td align="center" style="border: 1px solid black">17:15(6)</td><td align="center" style="border: 1px solid black">20:15</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">11:50(4)</td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">21:30</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">23:40(8)</td></tr></tbody></table></td></tr></tbody></table><table width="33%" border="0" cellpadding="2" cellspacing="2" bordercolor="FFFFFF"> <tbody><tr><td align="center"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border: none;"><tbody><tr><td colspan="4" align="center" style="border: 1px solid black"><b>Aos sábados</b></td> </tr><tr><td colspan="4" style="border: none"><div style="font-size:4px">&nbsp;</div></td></tr><tr><td align="center" width="25%" style="border: 1px solid black"><b>0 às 6h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>6 às 12h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>12 às 18h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>18 às 24h</b></td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">06:10(7)</td><td align="center" style="border: 1px solid black">14:40(7)</td><td align="center" style="border: 1px solid black">20:05(7)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">09:00</td><td align="center" style="border: 1px solid black">17:30</td><td align="center" style="border: 1px solid black">23:20(8)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">11:40(7)</td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black"></td></tr></tbody></table></td></tr></tbody></table><table width="33%" border="0" cellpadding="2" cellspacing="2" bordercolor="FFFFFF"> <tbody><tr><td align="center"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border: none;"><tbody><tr><td colspan="4" align="center" style="border: 1px solid black"><b>Aos domingos e feriados</b></td> </tr><tr><td colspan="4" style="border: none"><div style="font-size:4px">&nbsp;</div></td></tr><tr><td align="center" width="25%" style="border: 1px solid black"><b>0 às 6h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>6 às 12h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>12 às 18h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>18 às 24h</b></td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">07:20(7)</td><td align="center" style="border: 1px solid black">13:10</td><td align="center" style="border: 1px solid black">19:00(7)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">10:20(7)</td><td align="center" style="border: 1px solid black">16:10(7)</td><td align="center" style="border: 1px solid black">22:00</td></tr></tbody></table></td></tr></tbody></table><br><div style="width: 100%; clear: both;"><p class="textosm">(1) SANTO AGOSTINHO DE CIMA - VILA PAIVA<br>(2) GUIRRA - PAÇO MUNICIPAL<br>(3) GUIRRA - VIA ESTRADA SANTO AGOSTINHO DE CIMA<br>(4) PARTE DO BAIRRO SANTO AGOSTINHO DE CIMA - VIA VL. PAIVA<br>(5) GUIRRA - VIA ESTRADA DO SANTO AGOSTINHO DE CIMA<br>(6) SANTO AGOSTINHO DE CIMA<br>(7) GUIRRA<br>(8) ATÉ A PONTE<br></p></div></span> <!-- FIM - Conteúdo --></div>'

let rawDetails = [{

}]

let parsedDetails = [{

}]

describe('transformCSVArrayToObject', function () {
  it('should transform the plain array with the first property as the key and the rest as value', function () {
    let result = busModule.transformCSVArrayToObject(rawList)
    assert.deepEqual(result, parsedList)
  })

  it('parseBuses - should parse and return', function* () {
    let teste = [{
      'teste': 1
    }, {
      'teste': 2
    }]
    let result = yield busModule.parseBuses(teste)
      // assert.deepEqual(result, teste)
  })

  it.only('getScheduleTimes - should parse the page and return the schedule of buses', function* () {
    let cheerioEntirePage = cheerio.load(rawEntirePage)
    cheerioTableparser(cheerioEntirePage)

    let result = yield busModule.parseDetailsPage(cheerioEntirePage)
      // let result = yield busModule.getScheduleTimes(cheerioTable)
      // assert.deepEqual(result, '')
  })

  it('chunkScheduleByPeriod: should split the schedule by dawn, morning, afternoon and night', function () {
    let rawInput = {
      'dawn': ['De segunda-feira a sexta-feira', '0 às 6h', '05:10', '05:44', 'Aos sábados  0 às 6h6 às 12h12 às 18h18 às 24h00:5006:1212:0618:5205:0006:4812:3819:3405:3607:2213:1020:2007:5413:4221:0508:2613:42(2)21:5509:2614:4622:5009:5815:3223:4010:3016:0011:0216:3211:3417:04(2)17:52', 'Aos sábados', '0 às 6h', '00:50', '05:00', '05:36', 'Aos domingos e feriados  0 às 6h6 às 12h12 às 18h18 às 24h00:4506:4812:5118:1505:0007:4213:45(2)19:3205:5408:3614:3920:2609:5615:3321:2010:5016:27(2)22:3011:5717:2123:35', 'Aos domingos e feriados', '0 às 6h', '00:45', '05:00', '05:54'],
      'morning': ['De segunda-feira a sexta-feira', 'De segunda-feira a sexta-feira', '6 às 12h', '06:12', '06:40', '07:08', '07:36', '08:04', '08:32', '09:00', '09:50(1)', '10:25(1)', '10:55(1)', '11:25(1)', '11:55(1)', 'Aos sábados', 'Aos sábados', '6 às 12h', '06:12', '06:48', '07:22', '07:54', '08:26', '09:26', '09:58', '10:30', '11:02', '11:34', 'Aos domingos e feriados', 'Aos domingos e feriados', '6 às 12h', '06:48', '07:42', '08:36', '09:56', '10:50', '11:57'],
      'afternoon': ['De segunda-feira a sexta-feira', 'De segunda-feira a sexta-feira', '12 às 18h', '12:25(1)', '12:55(1)', '13:25(1)', '14:00(1)', '14:34(1)', '15:08(1)', '15:42(1)', '16:16(1)', '16:50(1)', '17:24(1)', '17:40(1)', '17:58(1)', 'Aos sábados', 'Aos sábados', '12 às 18h', '12:06', '12:38', '13:10', '13:42', '13:42(2)', '14:46', '15:32', '16:00', '16:32', '17:04(2)', '17:52', 'Aos domingos e feriados', 'Aos domingos e feriados', '12 às 18h', '12:51', '13:45(2)', '14:39', '15:33', '16:27(2)', '17:21'],
      'night': ['De segunda-feira a sexta-feira', 'De segunda-feira a sexta-feira', '18 às 24h', '18:32(1)', '19:06(1)', '19:45(1)', '20:32(1)', '21:06(1)', '21:40(1)', '22:12(1)', '23:06(1)', '23:45(1)', 'Aos sábados', 'Aos sábados', '18 às 24h', '18:52', '19:34', '20:20', '21:05', '21:55', '22:50', '23:40', 'Aos domingos e feriados', 'Aos domingos e feriados', '18 às 24h', '18:15', '19:32', '20:26', '21:20', '22:30', '23:35']
    }

    let expectedDawn = {
      weekDay: [],
      saturday: [],
      sunday: []
    }

    let result = busModule.chunkScheduleByPeriod(rawInput)
    expect(result.dawn)
  })
})
