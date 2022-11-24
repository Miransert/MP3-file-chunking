'use strict'

import fs from 'fs'
import path from 'path'
import winston from 'winston'

const day = new Date()
const filename = generateNewLogPath()

//
// Remove the file, ignoring any errors
//
// try {
//   fs.unlinkSync(filename)
// } catch (ex) {}

const config = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    verbose: 'grey',
    debug: 'blue',
    silly: 'magenta',
  },
}

winston.addColors(config.colors)

const colorize = winston.format.colorize()

const logger = winston.createLogger({
  level: 'info',
  levels: config.levels,
  format: winston.format.combine(
    winston.format.label({ label: 'Streaming Backend' }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),

    winston.format.printf(
      (info) => `[${info.timestamp}] [Streaming Backend] [${info.level.toUpperCase()}]: ${info.message}`)
  ),
  transports: [new winston.transports.File({ filename })],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(
        winston.format.label({ label: '[Streaming Backend]' }),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),

        winston.format.printf((info) =>
          colorize.colorize(
            info.level,
            `[${info.timestamp}] [Streaming Backend] [${info.level.toUpperCase()}]: ${info.message}`
          )
        )
      ),
    })
  )
}

export default logger


function generateNewLogPath() {
  var logPath = generateLogPath('')
  var logNumber = 0
  while(fs.existsSync(logPath)){
    logNumber++;
    logPath = generateLogPath('_' + String(logNumber))
  }
  return logPath;
}

function generateLogPath(logNumber:String){
  return path.join(
    __dirname,
    '/logs/backend_streaming_[' +
    day.getDate() +
    '-' +
    day.getMonth() +
    '-' +
    day.getFullYear() +
    ']' + logNumber + '.log'
  );
}