'use strict'

let cheerio = require('cheerio')
let cheerioTableparser = require('cheerio-tableparser')
let requestModule = require('request')
let request = require('request-promise')
let DefaultError = require('../errors/DefaultError')

const http_proxy = process.env.http_proxy

let tableConfig = {
  line: '',
  name: '',
  direction: '',
  busSchedule: '',
  route: ''
}

const
  url = 'http://www.sjc.sp.gov.br/secretarias/transportes/horario-e-itinerario.aspx?acao=p&opcao=1&txt=',
  busId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgLista',
  alternativeBusId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgListaAlternativo'

function crawlerBus() {
  return new Promise((resolve, reject) => {
    Promise.resolve(getPage)
      .then(parsePage)
      .then(parseBusTable)
      .then(parseAlternativeBusTable)
      .then(createFolder)
      .then(saveResult)
      .catch(handleServicesError)
  })

  function getPage() {
    return request({
      uri: url,
      transform: function(body) {
        return cheerio.load(body);
      }
    })
  }

  // Teoricamente deveria receber o $ com o cheerio carregado com a página
  function parsePage($) {
    var table = $(busId);
    console.log(table)
  }

  function parseBusTable() {
    console.log('parseBusTable')
  }

  function parseAlternativeBusTable() {
    console.log('parseAlternativeBusTable')
  }

  function createFolder() {
    console.log('createFolder')
  }

  function saveResult() {
    console.log('saveResult')
  }

  function handleServicesError(error) {
    throw new DefaultError({
      message: error.message,
      type: error.type,
      errors: error.errors
    })
  }
}

module.exports = crawlerBus
