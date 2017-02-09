'use strict'

require('colors')
const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')
const request = require('request-promise')
const urlModule = require('url')
const {wrap} = require('async-class')
const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))
const path = require('path')
const {cloneDeep, compact, remove, forEach, omitBy, toArray, split, findLastIndex, isString} = require('lodash')

const DefaultError = require('../errors/DefaultError')
const urlBase = 'http://www.sjc.sp.gov.br/'
const busId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgLista'
const busUrl = urlModule.resolve(urlBase, '/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=p&opcao=1&txt=')
  // const alternativeBusId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgListaAlternativo'

class Bus {

  * execute () {
    try {
      const $ = yield this._getPage(busUrl)
      const data = this._parseBusTable($)
      const busesData = this._transformCSVArrayToObject(data)
      const buses = yield this._parseBuses(busesData)
      this._saveFile(buses)
      return buses
    } catch (err) {
      return this._handleServicesError(err)
    }
  }

  _getPage (url) {
    return request({
      uri: url,
      transform: (body) => cheerio.load(body)
    })
  }

  _parseBusTable ($) {
    cheerioTableparser($)
    return $(busId).parsetable()
  }

  // Gets all but the first element of array, because the first element is the head of the table
  _transformCSVArrayToObject ([lines, names, directions, busSchedule, route]) {
    let result = []

    // Gets all but the first element of array, because the first element is the head of the table
    for (let i = 1; i < lines.length; i++) {
      result.push({
        line: lines[i],
        name: names[i],
        direction: directions[i],
        busSchedule: urlModule.resolve(urlBase, cheerio.load(busSchedule[i])('a').attr('href')),
        route: urlModule.resolve(urlBase, cheerio.load(route[i])('a').attr('href'))
      })
    }

    return result
  }

  * _parseBuses (buses) {
    const result = []
    let length = buses.length

    for (let i = 0; i < length; i++) {
      let bus = buses[i]
      const parsedBus = yield this._parseBusPage(bus)
      result.push(parsedBus)
      console.log(`Processing ${i} of ${length}`.blue)
    }

    return result
  }

  * _parseBusPage ({busSchedule}) {
    const cheerioDetailsPage = yield this._getPage(busSchedule)
    cheerioTableparser(cheerioDetailsPage)
    return this._parseDetailsPage(cheerioDetailsPage)
  }

  _parseDetailsPage (busDetailPage) {
    let routes = this._getRouteMetadata(busDetailPage)
    let times = this._getScheduleTimes(busDetailPage)
    return {
      routes,
      times
    }
  }

  _compactArray (array) {
    let copyArray = cloneDeep(array)
    for (let i = 0; i < array.length; i++) {
      copyArray[i] = compact(copyArray[i])
    }
    return copyArray
  }

  _getScheduleTimes (cheerioPage) {
    const parsedScheduleTable = cheerioPage('table[width="33%"][border="0"][cellpadding="2"][cellspacing="2"][bordercolor="FFFFFF"]').parsetable(true, true, true)

    let scheduleTables = this._compactArray(parsedScheduleTable)
    scheduleTables.map((scheduleTimeArray) => {
      scheduleTimeArray = remove(scheduleTimeArray, (scheduleTime) => scheduleTime.length > 70)
    })

    const [dawn, morning, afternoon, night] = scheduleTables
    const dawnPeriod = this._chunkScheduleByPeriod(dawn)
    const morningPeriod = this._chunkScheduleByPeriod(morning)
    const afternoonPeriod = this._chunkScheduleByPeriod(afternoon)
    const nightPeriod = this._chunkScheduleByPeriod(night)

    return {
      dawn: dawnPeriod,
      morning: morningPeriod,
      afternoon: afternoonPeriod,
      night: nightPeriod
    }
  }

  _getObservationInfo (cheerioPage) {
    const parsedObservation = cheerioPage('p[class="textosm"]').text()
    let splitObservation = split(parsedObservation, '\r')
    let result = splitObservation[findLastIndex(splitObservation)]
    result = result.replace(/ {2}/g, '').replace(/\n /g, '')
    return result
  }

  _chunkScheduleByPeriod (scheduleTime) {
    let week = []
    let saturday = []
    let sunday = []
    let pointerArray

    forEach(scheduleTime, (value) => {
      if (value.includes('segunda')) pointerArray = week
      if (value.includes('sábados')) pointerArray = saturday
      if (value.includes('domingo')) pointerArray = sunday

      pointerArray.push(value)
    })

    const omitNotTimeString = (value) => value.length > 6 && (value.substr(value.length - 1) !== ')')

    week = toArray(omitBy(week, omitNotTimeString))
    saturday = toArray(omitBy(saturday, omitNotTimeString))
    sunday = toArray(omitBy(sunday, omitNotTimeString))

    return {
      week,
      saturday,
      sunday
    }
  }

  _getRouteMetadata (cheerioPage) {
    const table = cheerioPage('table[width="100%"][border="0"][align="center"][cellpadding="2"][cellspacing="0"]').parsetable(true, true, true)
    let compactedRoute = this._compactArray(table)
    let [number, line, direction, itinerary, observation] = compactedRoute[1]
    if (isString(observation)) observation += '\n' + this._getObservationInfo(cheerioPage)
    return {
      number,
      line,
      direction,
      itinerary,
      observation
    }
  }

  // parseAlternativeBusTable () {
  //   console.log('parseAlternativeBusTable')
  // }

  * _createFolder (optionalPath) {
    let path = optionalPath || path.join(__dirname, 'bus')
    try {
      yield fs.statAsync(path) // will throw an error if it not exists
      return fs.mkdirSync(path)
    } catch (e) {}
  }

  * _saveFile (jsonToSave, optionalPath) {
    yield this._createFolder(optionalPath)
    let timestamp = new Date().getTime()
    let folderPath = optionalPath || path.join(__dirname, 'bus')
    let destinationPath = path.join(folderPath, `${timestamp}.json`)
    fs.writeFileSync(destinationPath, JSON.stringify(jsonToSave))
    console.log(`Success! file saved at ${destinationPath}`.green)
  }

  _handleServicesError ({message, type, errors}) {
    console.log(message)
    // throw new DefaultError({message, type, errors})
  }
}

module.exports = wrap(Bus)
