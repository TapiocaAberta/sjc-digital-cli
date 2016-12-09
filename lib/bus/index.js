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

class BusCrawler {

  init() {
    return this.getPage()
      .then(this.parseBusTable)
      .then(this.transformCSVArrayToObject)
      .then(this.parseBusPage)
      .then(this.parseAlternativeBusTable)
      .then(this.createFolder)
      .then(this.saveResult)
      .catch(this.handleServicesError)
  }

  getPage() {
    return request({
      uri: url,
      transform: (body) => {
        return cheerio.load(body)
      }
    })
  }

  parseBusTable($) {
    cheerioTableparser($)
    let data = $(busId).parsetable()
    return data;
  }

  transformCSVArrayToObject(data) {
    let result = []

    let [lines, names, directions, busSchedule, route] = data

    // Gets all but the first element of array, because the first element is the head of the table
    for (let i = 1; i < lines.length; i++) {
      result.push({
        line: lines[i],
        name: names[i],
        direction: directions[i],
        busSchedule: cheerio.load(busSchedule[i])('a').attr('href'),
        route: cheerio.load(route[i])('a').attr('href')
      })
    }

    return result
  }

  parseBusPage(result) {
    console.log(result)
  }

  parseAlternativeBusTable() {
    console.log('parseAlternativeBusTable')
  }

  createFolder() {
    console.log('createFolder')
  }

  saveResult() {
    console.log('saveResult')
  }

  handleServicesError(error) {
    throw new DefaultError({
      message: error.message,
      type: error.type,
      errors: error.errors
    })
  }
}

module.exports = new BusCrawler()
