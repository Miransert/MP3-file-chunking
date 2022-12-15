import { it } from 'mocha'
import { expect } from 'chai'
import logger from '../../src/logger'
import winston from 'winston'
import path from 'path'
import { unlinkSync, readFileSync } from 'fs'
import { toUnicode } from 'punycode'

describe("File transport testing", () => {
    const foundfileTransport = logger.transports.find((transport) => { return transport instanceof winston.transports.File })

    it('should contain a transport of the type File', () => {
        expect(foundfileTransport).to.not.be.undefined;
    })
    if (foundfileTransport == undefined || !(foundfileTransport instanceof winston.transports.File)) {
        return;
    }
    const fileTransport = <typeof winston.transports.File>foundfileTransport

    it('should log at level info', () => {
        expect(fileTransport.level).to.equal('info')
    })

    it('should save logs to the /logs folder', () => {
        expect(fileTransport.dirname).to.equal(path.join(__dirname, '..', '..', 'src', 'logs'))
    })
    it('should give .log files correctly formatted name', () => {
        expect(fileTransport.filename).to.match(new RegExp("(Backend_Streaming_\\[([1-9]|[12][0-9]|3[0-2])-([1-9]|1[0-2])-(\\d+)\](_\\d+\\.log|\\.log))"))
    })

    it("should write log correctly", () => {
        logger.info("Test")
        const logFile = readFileSync(fileTransport.dirname + '/' + fileTransport.filename, 'utf-8');
        const date = new Date()
        const formattedDateString = '[' +
            date.getFullYear() + '-' +
            (date.getMonth() + 1) + '-' +
            date.getDate() + ' ' +
            date.getHours() + ':' +
            date.getUTCMinutes() + ':' +
            date.getSeconds() + ']'
        expect(logFile.trim()).to.be.equal(formattedDateString + " [Streaming Backend] [INFO]: Test")
    })
})

describe("File transport testing", () => {
    const foundConsoleTransport = logger.transports.find((transport) => { return transport instanceof winston.transports.Console })

    it('should contain a transport of the type Console', () => {
        expect(foundConsoleTransport).to.not.be.undefined;
    })
    if (foundConsoleTransport == undefined || !(foundConsoleTransport instanceof winston.transports.Console)) {
        return;
    }
    const consoleTransport = <typeof winston.transports.Console>foundConsoleTransport

    it('should log at level silly', () => {
        expect(consoleTransport.level).to.equal('silly')
    })

    // console.log(consoleTransport.toString())

})