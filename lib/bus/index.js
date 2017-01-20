'use strict'

const cheerio = require('cheerio')
const cheerioTableparser = require('cheerio-tableparser')
const request = require('request-promise')
const urlModule = require('url')
const wrap = require('co').wrap
const {
  cloneDeep,
  compact,
  remove,
  forEach,
  omitBy,
  toArray,
  split,
  findLastIndex,
  isString
} = require('lodash')

const DefaultError = require('../errors/DefaultError')

const urlBase = 'http://www.sjc.sp.gov.br/'
const busId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgLista'
const busUrl = urlModule.resolve(urlBase, '/secretarias/mobilidade_urbana/horario-e-itinerario.aspx?acao=p&opcao=1&txt=')
  // const alternativeBusId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgListaAlternativo'

exports.execute = wrap(function * () {
  try {
    const $ = yield getPage(busUrl)
    const data = yield parseBusTable($)
    const busesData = transformCSVArrayToObject(data)
    const buses = yield parseBuses(busesData)
    return buses
  } catch (err) {
    return handleServicesError(err)
  }
})

function getPage (url) {
  return request({
    uri: url,
    transform: (body) => cheerio.load(body)
  })
}

function parseBusTable ($) {
  cheerioTableparser($)
  return $(busId).parsetable()
}

// Gets all but the first element of array, because the first element is the head of the table
function transformCSVArrayToObject ([lines, names, directions, busSchedule, route]) {
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

let parseBuses = wrap(function * (buses) {
  const result = []

  for (let bus of buses) {
    const parsedBus = yield parseBusPage(bus)
    result.push(parsedBus)
  }

  return result
})

let parseBusPage = wrap(function * ({busSchedule}) {
  const cheerioDetailsPage = yield getPage(busSchedule)
  cheerioTableparser(cheerioDetailsPage)
  return parseDetailsPage(cheerioDetailsPage)
})

function parseDetailsPage (busDetailPage) {
  let routes = getRouteMetadata(busDetailPage)
  let times = getScheduleTimes(busDetailPage)
  return {
    routes,
    times
  }
}

function compactArray (array) {
  let copyArray = cloneDeep(array)
  for (let i = 0; i < array.length; i++) {
    copyArray[i] = compact(copyArray[i])
  }
  return copyArray
}

function getScheduleTimes (cheerioPage) {
  const parsedScheduleTable = cheerioPage('table[width="33%"][border="0"][cellpadding="2"][cellspacing="2"][bordercolor="FFFFFF"]').parsetable(true, true, true)

  let scheduleTables = compactArray(parsedScheduleTable)
  scheduleTables.map((scheduleTimeArray) => {
    scheduleTimeArray = remove(scheduleTimeArray, (scheduleTime) => scheduleTime.length > 70)
  })

  const [dawn, morning, afternoon, night] = scheduleTables
  const dawnPeriod = chunkScheduleByPeriod(dawn)
  const morningPeriod = chunkScheduleByPeriod(morning)
  const afternoonPeriod = chunkScheduleByPeriod(afternoon)
  const nightPeriod = chunkScheduleByPeriod(night)

  return {
    dawn: dawnPeriod,
    morning: morningPeriod,
    afternoon: afternoonPeriod,
    night: nightPeriod
  }
}

function getObservationInfo (cheerioPage) {
  const parsedObservation = cheerioPage('p[class="textosm"]').text()
  let splitObservation = split(parsedObservation, '\r')
  let result = splitObservation[findLastIndex(splitObservation)]
  result = result.replace(/ {2}/g, '').replace(/\n /g, '')
  return result
}

function chunkScheduleByPeriod (scheduleTime) {
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

function getRouteMetadata (cheerioPage) {
  const table = cheerioPage('table[width="100%"][border="0"][align="center"][cellpadding="2"][cellspacing="0"]').parsetable(true, true, true)
  let compactedRoute = compactArray(table)
  let [number, line, direction, itinerary, observation] = compactedRoute[1]
  if (isString(observation)) observation += '\n' + getObservationInfo(cheerioPage)
  return {number, line, direction, itinerary, observation}
}

// function parseAlternativeBusTable () {
//   console.log('parseAlternativeBusTable')
// }

// function createFolder () {
//   console.log('createFolder')
// }

// function saveResult () {
//   console.log('saveResult')
// }

function handleServicesError (error) {
  throw new DefaultError({
    message: error.message,
    type: error.type,
    errors: error.errors
  })
}
