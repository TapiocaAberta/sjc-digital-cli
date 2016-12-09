'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var requestModule = require('request');
var request = require('request-promise');
var _ = require('lodash');
var DefaultError = require('../errors/DefaultError');

var http_proxy = process.env.http_proxy;

var tableConfig = {
  line: '',
  name: '',
  direction: '',
  busSchedule: '',
  route: ''
};

var url = 'http://www.sjc.sp.gov.br/secretarias/transportes/horario-e-itinerario.aspx?acao=p&opcao=1&txt=',
    busId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgLista',
    alternativeBusId = '#ctl00_ctl00_ctl00_ctl00_ContentPlaceHolderDefault_modelo_master_meio_modelo_duas_colunas_meio_ctl02_horario_itinerario_onibus_layTab_8_dtgListaAlternativo';

var BusCrawler = function () {
  function BusCrawler() {
    _classCallCheck(this, BusCrawler);
  }

  _createClass(BusCrawler, [{
    key: 'init',
    value: function init() {
      return this.getPage().then(this.parseBusTable).then(this.transformCSVArrayToObject).then(this.parseBusPage).then(this.parseAlternativeBusTable).then(this.createFolder).then(this.saveResult).catch(this.handleServicesError);
    }
  }, {
    key: 'getPage',
    value: function getPage() {
      return request({
        uri: url,
        transform: function transform(body) {
          return cheerio.load(body);
        }
      });
    }
  }, {
    key: 'parseBusTable',
    value: function parseBusTable($) {
      cheerioTableparser($);
      var data = $(busId).parsetable();
      return data;
    }
  }, {
    key: 'transformCSVArrayToObject',
    value: function transformCSVArrayToObject(data) {
      var result = [];

      var _data = _slicedToArray(data, 3),
          lines = _data[0],
          names = _data[1],
          directions = _data[2];

      // Gets all but the first element of array, because the first element is the head of the table


      for (var i = 1; i < lines.length; i++) {
        result.push({
          line: lines[i],
          name: names[i],
          direction: directions[i]
        });
      }

      return result;
    }
  }, {
    key: 'parseBusPage',
    value: function parseBusPage(result) {
      console.log(result);
    }
  }, {
    key: 'parseAlternativeBusTable',
    value: function parseAlternativeBusTable() {
      console.log('parseAlternativeBusTable');
    }
  }, {
    key: 'createFolder',
    value: function createFolder() {
      console.log('createFolder');
    }
  }, {
    key: 'saveResult',
    value: function saveResult() {
      console.log('saveResult');
    }
  }, {
    key: 'handleServicesError',
    value: function handleServicesError(error) {
      throw new DefaultError({
        message: error.message,
        type: error.type,
        errors: error.errors
      });
    }
  }]);

  return BusCrawler;
}();

module.exports = new BusCrawler();