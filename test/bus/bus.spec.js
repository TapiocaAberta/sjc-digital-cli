// const chai = require('chai')
// const expect = chai.expect
const  busModule = require('../../lib/bus')
const assert = require('assert')
const coMocha = require('co-mocha')

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

let rawDetailsHTML = '<div class="texto" align="justify"> <!-- Conteúdo --> <table width="100%" border="0" align="center" cellpadding="2" cellspacing="0"> <tbody> <tr valign="top" class="textosm"> <!--codigo da linha--> <td width="100"> <strong>Número da Linha:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblNumeroLinha">101</span> </td> </tr> <tr valign="top" class="textosm"> <!--descricao da linha--> <td> <strong>Nome da Linha:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblNomeLinha">REPRESA / TERMINAL CENTRAL (RADIAL) O.S.O 38</span> </td> </tr> <tr valign="top" class="textosm"> <!--Sentido--> <td> <strong>Sentido:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblSentido">REPRESA / TERMINAL CENTRAL </span> </td> </tr> <tr valign="top" class="textosm"> <!--Itinerário--> <td> <strong>Itinerário:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblItinerario">BAIRRO RIO DAS COBRAS – ESTR. JUCA CARVALHO – AV. RUI BARBOSA – RUA ALZIRO LEBRAO – RUA AUDEMO VENEZIANI – PONTE MINAS GERAIS – PRACA BANDEIRANTES – RUA CAP. ELISIARIO – AV. RUI BARBOSA – VD. DOS EXPEDICIONARIOS – RUA ANA EUFRASIA – AV. SAO JOSE – RUA FLAVIO B. MACHADO – AV. TEN. NEVIO BARACHO – TERMINAL CENTRAL</span> </td> </tr> <tr valign="top" class="textosm"> <!--Itinerário--> <td> <strong>Observação:</strong> </td> <td> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblObservacao">-</span> </td> </tr> <tr valign="bottom"> <!--Título : Horários--> <td colspan="2" class="texto"> &nbsp; </td> </tr> </tbody> </table> <div class="observacoes" align="center"><span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblAtualizadoEm">Atualizado em: 18/04/2016</span></div> <br> <div style="width: 100%; clear: both;"> <p class="textosm"> <b>Horários:</b> </p> </div> <span id="ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_lblResultado" class="textosm"><table width="33%" border="0" cellpadding="2" cellspacing="2" bordercolor="FFFFFF"> <tbody><tr><td align="center"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border: none;"><tbody><tr><td colspan="4" align="center" style="border: 1px solid black"><b>De segunda-feira a sexta-feira</b></td> </tr><tr><td colspan="4" style="border: none"><div style="font-size:4px">&nbsp;</div></td></tr><tr><td align="center" width="25%" style="border: 1px solid black"><b>0 às 6h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>6 às 12h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>12 às 18h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>18 às 24h</b></td></tr><tr><td align="center" style="border: 1px solid black">05:50(1)</td><td align="center" style="border: 1px solid black">06:00(2)</td><td align="center" style="border: 1px solid black">14:15(5)</td><td align="center" style="border: 1px solid black">18:45(7)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">09:50(3)</td><td align="center" style="border: 1px solid black">17:15(6)</td><td align="center" style="border: 1px solid black">20:15</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">11:50(4)</td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">21:30</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">23:40(8)</td></tr></tbody></table></td></tr></tbody></table><table width="33%" border="0" cellpadding="2" cellspacing="2" bordercolor="FFFFFF"> <tbody><tr><td align="center"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border: none;"><tbody><tr><td colspan="4" align="center" style="border: 1px solid black"><b>Aos sábados</b></td> </tr><tr><td colspan="4" style="border: none"><div style="font-size:4px">&nbsp;</div></td></tr><tr><td align="center" width="25%" style="border: 1px solid black"><b>0 às 6h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>6 às 12h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>12 às 18h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>18 às 24h</b></td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">06:10(7)</td><td align="center" style="border: 1px solid black">14:40(7)</td><td align="center" style="border: 1px solid black">20:05(7)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">09:00</td><td align="center" style="border: 1px solid black">17:30</td><td align="center" style="border: 1px solid black">23:20(8)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">11:40(7)</td><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black"></td></tr></tbody></table></td></tr></tbody></table><table width="33%" border="0" cellpadding="2" cellspacing="2" bordercolor="FFFFFF"> <tbody><tr><td align="center"><table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse; border: none;"><tbody><tr><td colspan="4" align="center" style="border: 1px solid black"><b>Aos domingos e feriados</b></td> </tr><tr><td colspan="4" style="border: none"><div style="font-size:4px">&nbsp;</div></td></tr><tr><td align="center" width="25%" style="border: 1px solid black"><b>0 às 6h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>6 às 12h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>12 às 18h</b></td><td align="center" width="25%" style="border: 1px solid black"><b>18 às 24h</b></td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">07:20(7)</td><td align="center" style="border: 1px solid black">13:10</td><td align="center" style="border: 1px solid black">19:00(7)</td></tr><tr><td align="center" style="border: 1px solid black"></td><td align="center" style="border: 1px solid black">10:20(7)</td><td align="center" style="border: 1px solid black">16:10(7)</td><td align="center" style="border: 1px solid black">22:00</td></tr></tbody></table></td></tr></tbody></table><br><div style="width: 100%; clear: both;"><p class="textosm">(1) SANTO AGOSTINHO DE CIMA - VILA PAIVA<br>(2) GUIRRA - PAÇO MUNICIPAL<br>(3) GUIRRA - VIA ESTRADA SANTO AGOSTINHO DE CIMA<br>(4) PARTE DO BAIRRO SANTO AGOSTINHO DE CIMA - VIA VL. PAIVA<br>(5) GUIRRA - VIA ESTRADA DO SANTO AGOSTINHO DE CIMA<br>(6) SANTO AGOSTINHO DE CIMA<br>(7) GUIRRA<br>(8) ATÉ A PONTE<br></p></div></span> <!-- FIM - Conteúdo --></div>'

let rawDetails = [{

}]

let parsedDetails = [{

}]

describe('transformCSVArrayToObject', function() {

  it('should transform the plain array with the first property as the key and the rest as value', function() {
    let result = busModule.transformCSVArrayToObject(rawList)
    assert.deepEqual(result, parsedList)
  })

  it('parseBuses - should parse and return', function*() {
    let teste = [{
      'teste': 1
    }, {
      'teste': 2
    }]
    let result = yield busModule.parseBuses(teste)
    assert.deepEqual(result, teste)
  })
})
