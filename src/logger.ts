'use strict'

import fs from 'fs'
import path from 'path'
import winston from 'winston'

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
  levels: config.levels,
  
  transports: [
    new winston.transports.File({ 
      filename: generateNewLogPath(),
      level: 'info',
      format: winston.format.combine(
        winston.format.label({ label: 'Streaming Backend' }),
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf((info) => generatePrintingFormat(info))
      )
  }),
  new winston.transports.Console({
    level: (process.env.NODE_ENV === 'production') ? 'info': 'silly',
    format: winston.format.combine(
      winston.format.label({ label: '[Streaming Backend]'}),
      winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      winston.format.printf((info) => generateColoredPrintingFormat(info))
    )
  })
],
})

export default logger


function generateColoredPrintingFormat(info: winston.Logform.TransformableInfo): string {
  return colorize.colorize(info.level, generatePrintingFormat(info))
}

function generatePrintingFormat(info: winston.Logform.TransformableInfo): string {
  return `[${info.timestamp}] [Streaming Backend] [${info.level.toUpperCase()}]: ${info.message}`
}

function generateNewLogPath() {
  let logNumber = 0
  let logPath;
  do{
    logPath = generateLogPath(logNumber);
    logNumber++;
  } while (fs.existsSync(logPath))

  return logPath;
}

function generateLogPath(logNumber: number) {
const day = new Date()
  return path.join(
    __dirname,
    '/logs/Backend_Streaming_[' +
    day.getDate() +
    '-' +
    day.getMonth() +
    '-' +
    day.getFullYear() +
    ']' + ((logNumber==0) ? "": "_" + logNumber) + '.log'
  );
}