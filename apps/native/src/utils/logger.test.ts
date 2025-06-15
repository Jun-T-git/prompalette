import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'

import { Logger } from './logger'

// Mock console methods
const originalConsole = { ...console }

beforeEach(() => {
  console.debug = vi.fn()
  console.info = vi.fn()
  console.warn = vi.fn()
  console.error = vi.fn()
})

afterEach(() => {
  Object.assign(console, originalConsole)
  vi.clearAllMocks()
})

describe('logger', () => {
  describe('in development environment', () => {
    it('should log debug messages', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'debug' })
      logger.debug('test debug message')
      expect(console.debug).toHaveBeenCalledWith('[DEBUG] test debug message')
    })

    it('should log info messages', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'debug' })
      logger.info('test info message')
      expect(console.info).toHaveBeenCalledWith('[INFO] test info message')
    })

    it('should log warn messages', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'debug' })
      logger.warn('test warn message')
      expect(console.warn).toHaveBeenCalledWith('[WARN] test warn message')
    })

    it('should log error messages', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'debug' })
      logger.error('test error message')
      expect(console.error).toHaveBeenCalledWith('[ERROR] test error message')
    })

    it('should log with additional arguments', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'debug' })
      const obj = { test: 'data' }
      logger.info('message with data', obj)
      expect(console.info).toHaveBeenCalledWith('[INFO] message with data', obj)
    })
  })

  describe('in production environment', () => {
    it('should not log debug messages in production', () => {
      const logger = new Logger({ nodeEnv: 'production', logLevel: 'debug' })
      logger.debug('test debug message')
      expect(console.debug).not.toHaveBeenCalled()
    })

    it('should not log info messages in production', () => {
      const logger = new Logger({ nodeEnv: 'production', logLevel: 'debug' })
      logger.info('test info message')
      expect(console.info).not.toHaveBeenCalled()
    })

    it('should not log warn messages in production', () => {
      const logger = new Logger({ nodeEnv: 'production', logLevel: 'debug' })
      logger.warn('test warn message')
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should log error messages in production', () => {
      const logger = new Logger({ nodeEnv: 'production', logLevel: 'debug' })
      logger.error('test error message')
      expect(console.error).toHaveBeenCalledWith('[ERROR] test error message')
    })
  })

  describe('log level filtering', () => {
    it('should not log debug when level is warn', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'warn' })
      logger.debug('test debug')
      expect(console.debug).not.toHaveBeenCalled()
    })

    it('should not log info when level is warn', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'warn' })
      logger.info('test info')
      expect(console.info).not.toHaveBeenCalled()
    })

    it('should log warn when level is warn', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'warn' })
      logger.warn('test warn')
      expect(console.warn).toHaveBeenCalledWith('[WARN] test warn')
    })

    it('should log error when level is warn', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'warn' })
      logger.error('test error')
      expect(console.error).toHaveBeenCalledWith('[ERROR] test error')
    })
  })

  describe('invalid log level handling', () => {
    it('should default to info level for invalid log level', () => {
      const logger = new Logger({ nodeEnv: 'development', logLevel: 'invalid' })
      logger.debug('test debug')
      logger.info('test info')
      
      expect(console.debug).not.toHaveBeenCalled()
      expect(console.info).toHaveBeenCalledWith('[INFO] test info')
    })
  })
})