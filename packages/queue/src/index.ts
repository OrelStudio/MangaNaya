import {Subject, from} from 'rxjs'
import {mergeMap, finalize, tap} from 'rxjs/operators'

import {ProcessingQueueType} from './types'

/**
 * Create a processing queue
 * @description - This function will create a queue that processes items concurrently with a limit
 * used to limit the number of concurrent requests to handle backpressure
 * @param callback - handler for request in the queue
 * @param max - maximum number of concurrent requests
 * @returns {Function} - function to add item to the queue
 */
const createProcessingQueue: ProcessingQueueType = <T>(callback: (item: T) => Promise<void>, max: number): ((item: T) => void) => {
  const tube: T[] = []
  const droplets = new Subject()
  
  const processItem = (item: T) => {
    console.log(`Processing item ${item}`)
    return from(callback(item)).pipe(
      tap(() => console.log(`Processed item ${item}`))
    )
  }
  
  // Observable to process items from droplets
  const processingObservable = droplets.pipe(
    mergeMap(
      (item) => {
        // Add item to tube
        tube.push(item as T)
        console.log(`Tube items after adding: ${tube}`)
  
        // Process the item
        return processItem(item as T).pipe(
          // Remove item from tube when processing is complete
          finalize(() => {
            const index = tube.indexOf(item as T)
            if (index >= 0) {
              tube.splice(index, 1)
              console.log(`Tube items after removing: ${tube}`)
            }
          })
        )
      },
      max // Concurrency limit
    )
  )

  // Subscribe to start processing
  processingObservable.subscribe()
  return (item) => droplets.next(item)
}

export default createProcessingQueue