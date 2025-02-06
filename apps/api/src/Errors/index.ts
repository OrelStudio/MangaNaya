class APIError extends Error {
  constructor(message: string, public code: number) {
    super(message);
    this.name = 'Error'
    this.stack = '' // hide the stack trace
    this.code = code
    this.message = message
  }
}

export default APIError