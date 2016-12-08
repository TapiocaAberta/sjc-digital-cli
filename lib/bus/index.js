'use strict'

let cheerio = require('cheerio')
let cheerioTableparser = require('cheerio-tableparser')
let requestModule = require('request')
let request = require('request-promise')
let _ = require('lodash')
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

let crawlerBus = {
  init() {
    return getPage()
      .then(parseBusTable)
      .then(parseAlternativeBusTable)
      .then(createFolder)
      .then(saveResult)
      .catch(handleServicesError)
  },

  getPage() {
    return request({
      uri: url,
      transform: (body) => {
        return cheerio.load(body)
      }
    })
  },

  parseBusTable($) {
    cheerioTableparser($)
    let data = $(busId).parsetable()

    let jsonData = transformCSVArrayToObject(data)

    console.log(jsonData)
  },

  transformCSVArrayToObject(data) {
    let result = []

    let [lines, names, directions] = data

    // Gets all but the first element of array, because the first element is the head of the table
    for (let i = 1; i < lines.length; i++) {
      result.push({
        line: lines[i],
        name: names[i],
        direction: directions[i]
      })
    }

    return result
  },

  parseBusPage($) {},

  parseAlternativeBusTable() {
    console.log('parseAlternativeBusTable')
  },

  createFolder() {
    console.log('createFolder')
  },

  saveResult() {
    console.log('saveResult')
  },

  handleServicesError(error) {
    throw new DefaultError({
      message: error.message,
      type: error.type,
      errors: error.errors
    })
  }
}

module.exports = crawlerBus
