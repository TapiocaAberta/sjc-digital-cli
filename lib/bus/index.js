'use strict'

const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')
const request = require('request-promise')
const url = require('url')
const wrap = require('co').wrap

let DefaultError = require('../errors/DefaultError')

const urlBase = 'http://www.sjc.sp.gov.br/'
const busId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgLista'
  // const busUrl = url.resolve(urlBase, '/secretarias/transportes/horario-e-itinerario.aspx?acao=p&opcao=1&txt=')
  // const alternativeBusId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgListaAlternativo'

class BusCrawler {}

BusCrawler.prototype.init = function() {
  return BusCrawler.getPage()
    .then(BusCrawler.parseBusTable)
    .then(BusCrawler.transformCSVArrayToObject)
    .then(BusCrawler.parseBusPage)
    .then(BusCrawler.parseAlternativeBusTable)
    .then(BusCrawler.createFolder)
    .then(BusCrawler.saveResult)
    .catch(BusCrawler.handleServicesError)
}

BusCrawler.prototype.getPage = function() {
  return request({
    uri: url,
    transform: (body) => {
      return cheerio.load(body)
    }
  })
}

BusCrawler.prototype.parseBusTable = function($) {
  cheerioTableparser($)
  let data = $(busId).parsetable()
  return data
}

BusCrawler.prototype.transformCSVArrayToObject = function(data) {
  let result = []

  let [lines, names, directions, busSchedule, route] = data

  // Gets all but the first element of array, because the first element is the head of the table
  for (let i = 1; i < lines.length; i++) {
    result.push({
      line: lines[i],
      name: names[i],
      direction: directions[i],
      busSchedule: url.resolve(urlBase, cheerio.load(busSchedule[i])('a').attr('href')),
      route: url.resolve(urlBase, cheerio.load(route[i])('a').attr('href'))
    })
  }

  return result
}

BusCrawler.prototype.parseBuses = function*(buses) {
  let result = []

  for (var i = 0; i < buses.length; i++) {
    let bus = buses[i]
    let parsedBus = yield this.parseBusPage(bus)
    result.push(parsedBus)
  }

  return result
}

BusCrawler.prototype.parseBusPage = function(bus) {
  return Promise.resolve(bus)
}

BusCrawler.prototype.parseAlternativeBusTable = function() {
  console.log('parseAlternativeBusTable')
}

BusCrawler.prototype.createFolder = function() {
  console.log('createFolder')
}

BusCrawler.prototype.saveResult = function() {
  console.log('saveResult')
}

BusCrawler.prototype.handleServicesError = function(error) {
  throw new DefaultError({
    message: error.message,
    type: error.type,
    errors: error.errors
  })
}

module.exports = new BusCrawler()
