'use strict'

const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')
const request = require('request-promise')
const url = require('url')
const wrap = require('co').wrap
const {cloneDeep, compact, remove, forEach, omitBy, toArray} = require('lodash')

let DefaultError = require('../errors/DefaultError')

const urlBase = 'http://www.sjc.sp.gov.br/'
const busId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgLista'
const busUrl = url.resolve(urlBase, '/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=p&opcao=1&txt=')
  // const alternativeBusId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgListaAlternativo'

class BusCrawler {}

BusCrawler.prototype.init = function () {
  return BusCrawler.getPage(busUrl)
    .then(BusCrawler.parseBusTable)
    .then(BusCrawler.transformCSVArrayToObject)
    .then(BusCrawler.parseBusPage)
    .then(BusCrawler.parseAlternativeBusTable)
    .then(BusCrawler.createFolder)
    .then(BusCrawler.saveResult)
    .catch(BusCrawler.handleServicesError)
}

BusCrawler.prototype.getPage = function (url) {
  return request({
    uri: url,
    transform: (body) => {
      return cheerio.load(body)
    }
  })
}

BusCrawler.prototype.parseBusTable = function ($) {
  cheerioTableparser($)
  let data = $(busId).parsetable()
  return data
}

BusCrawler.prototype.transformCSVArrayToObject = function (data) {
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

BusCrawler.prototype.parseBuses = function* (buses) {
  let result = []

  for (let i = 0; i < buses.length; i++) {
    let bus = buses[i]
    let parsedBus = yield this.parseBusPage(bus)
    result.push(parsedBus)
  }

  return result
}

BusCrawler.prototype.parseBusPage = function* (bus) {
  let cheerioDetailsPage = yield this.getPage(bus.busSchedule)
  cheerioTableparser(cheerioDetailsPage)
  let result = this.parseDetailsPage(cheerioDetailsPage)
  return result
}

BusCrawler.prototype.parseDetailsPage = function* (busDetailPage) {
  let routes = this.getRouteMetadata(busDetailPage)
  let times = this.getScheduleTimes(busDetailPage)
  return {routes, times}
}

BusCrawler.prototype.compactArray = function (array) {
  let copyArray = cloneDeep(array)
  for (let i = 0; i < array.length; i++) {
    copyArray[i] = compact(copyArray[i])
  }
  return copyArray
}

BusCrawler.prototype.getScheduleTimes = function (cheerioPage) {
  // '<table width="33%" border="0" cellpadding="2" cellspacing="2" bordercolor="FFFFFF">'
  let parsedScheduleTable = cheerioPage('table[bordercolor="FFFFFF"]').parsetable(true, true, true)
  let scheduleTables = this.compactArray(parsedScheduleTable)

  scheduleTables.forEach((scheduleTimeArray) => {
    scheduleTimeArray = remove(scheduleTimeArray, function (scheduleTime) {
      return scheduleTime.length > 70
    })
  })

  let [dawn, morning, afternoon, night] = scheduleTables
  let dawnWeek = this.chunkScheduleByPeriod(dawn)
  let morningWeek = this.chunkScheduleByPeriod(morning)
  let afternoonWeek = this.chunkScheduleByPeriod(afternoon)
  let nightWeek = this.chunkScheduleByPeriod(night)
  // TODO: const observationInfo = '<p class="textosm">'

  return {dawnWeek, morningWeek, afternoonWeek, nightWeek}
}

BusCrawler.prototype.chunkScheduleByPeriod = function (scheduleTime) {
  let weekDays = []
  let saturday = []
  let sunday = []

  let pointerArray

  forEach(scheduleTime, (value) => {
    if (value.includes('segunda')) pointerArray = weekDays
    if (value.includes('sábados')) pointerArray = saturday
    if (value.includes('domingo')) pointerArray = sunday

    pointerArray.push(value)
  })

  let omitNotTimeString = (value) => { return value.length > 6 && (value.substr(value.length - 1) !== ')') }
  weekDays = toArray(omitBy(weekDays, omitNotTimeString))
  saturday = toArray(omitBy(saturday, omitNotTimeString))
  sunday = toArray(omitBy(sunday, omitNotTimeString))

  return {weekDays, saturday, sunday}
}

BusCrawler.prototype.getRouteMetadata = function (cheerioPage) {
  // '<table width="100%" border="0" align="center" cellpadding="2" cellspacing="0">'
  let table = cheerioPage('table[width="100%"]').parsetable(true, true, true)
  let data = this.compactArray(table)

  return data
}

BusCrawler.prototype.parseAlternativeBusTable = function () {
  console.log('parseAlternativeBusTable')
}

BusCrawler.prototype.createFolder = function () {
  console.log('createFolder')
}

BusCrawler.prototype.saveResult = function () {
  console.log('saveResult')
}

BusCrawler.prototype.handleServicesError = function (error) {
  throw new DefaultError({
    message: error.message,
    type: error.type,
    errors: error.errors
  })
}

module.exports = new BusCrawler()
