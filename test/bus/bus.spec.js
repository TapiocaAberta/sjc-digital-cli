let chai = require('chai')
var expect = chai.expect;

let bus = require('../../lib/bus')

describe('transformCSVArrayToObject', function() {
  it('should transform the plain array with the first property as the key and the rest as value', function() {
    var mockData = [
      ['linha', 1, 2],
      ['nome', 'putim', 'sao judas'],
      ['sentido', 'centro', 'bairro']
    ]

    var expectedResult = [{
      line: 1,
      name: 'putim',
      direction: 'centro'
    }, {
      line: 2,
      name: 'sao judas',
      direction: 'bairro'
    }]

    var result = bus.transformCSVArrayToObject(mockData)
    expect(result).to.deep.equal(expectedResult);
  })
})
