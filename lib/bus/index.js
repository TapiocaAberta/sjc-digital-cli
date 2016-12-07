'use strict'

let cheerio = require('cheerio')
let cheerioTableparser = require('cheerio-tableparser')
let request = require('request')
let rp = require('request-promise')

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

function crawlerBus () {
  return new Promise((resolve, reject) => {
    Promise.resolve(getPage)
      .then(parsePage)
      .then(parseBusTable)
      .then(parseAlternativeBusTable)
      .then(createFolder)
      .then(saveResult)
      // .catch(handleServicesError)
  })

  function getPage () {
    console.log('getPAge')
  }

  function parsePage () {
    console.log('parsePage')
  }

  function parseBusTable () {
    console.log('parseBusTable')
  }

  function parseAlternativeBusTable () {
    console.log('parseAlternativeBusTable')
  }

  function createFolder () {
    console.log('createFolder')
  }

  function saveResult () {
    console.log('saveResult')
  }
}

module.exports = crawlerBus
