'use strict'

import fs from 'fs'
import path from 'path'
import winston from 'winston'

const day = new Date()
const filename = path.join(
  __dirname,
  '/logs/backend-streaming-[' +
    day.getDate() +
    '-' +
    day.getMonth() +
    '-' +
    day.getFullYear() +
    '].log'
)

//
// Remove the file, ignoring any errors
//
try {
  fs.unlinkSync(filename)
} catch (ex) {}

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
      (info) =>
        `[${info.timestamp}] [${info.lable}] [${info.level.toUpperCase()}]: ${
          info.message
        }`
    )
  ),
  transports: [new winston.transports.File({ filename })],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.label({ label: '[Streaming Backend]' }),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),

        winston.format.printf((info) =>
          colorize.colorize(
            info.level,
            `[${info.timestamp}] [${
              info.lable
            }] [${info.level.toUpperCase()}]: ${info.message}`
          )
        )
      ),
    })
  )
}

export default logger
