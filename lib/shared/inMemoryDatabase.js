let Loki = require('loki')
let db = new Loki('Bus')
let buses = db.addCollection('bus')

buses.insert({
  name: 'putim',
  line: 121
})

let teste = buses.chain().find({})
console.log(teste)
