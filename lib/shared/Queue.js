const {wrap} = require('async-class')
const queueName = 'tasks'
const open = require('amqplib').connect('amqp://localhost')

class Queue {

  constructor () {
    // TODO: constructor cannot be a generator
    this._publisher()
  }

  * _publisher () {
    let channel = yield open.createChannel()
    yield channel.assertQueue(queueName)
    yield channel.sendToQueue(queueName, new Buffer('something to do'))
  }

  * consumer () {
    let channel = yield open.createChannel()
    yield channel.assertQueue(queueName)
    let message = yield channel.consume(queueName)

    if (message !== null) {
      console.log(message.content.toString())
      channel.ack(message)
    }
  }
}

module.exports = wrap(Queue)
