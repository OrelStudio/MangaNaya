import amqplib from 'amqplib'
import createProcessingQueue from '@manga-naya/queue'

const listenToQueue = async <T>(channel: amqplib.Channel, queue: string, max: number, callback: (query: T) => Promise<void>) => {
  const addToQueue = createProcessingQueue<T>(callback, max)
  
  try {
    await channel.assertQueue(queue, {
      durable: true
    })
  } catch (error) {
    throw new Error(`Error asserting queue: ${error}`)
  }

  console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`)

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const args = JSON.parse(msg.content.toString())

      console.log(` [x] Received`, args.query)
      // push the message to the tube
      addToQueue(args.query)

      channel.ack(msg)
    } else {
      console.log(' [*] Consumer cancelled by the server')
    }
  })

  // return function to stop consuming
  return () => channel.cancel(queue)
}

export default listenToQueue