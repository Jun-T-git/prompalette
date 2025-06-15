import { formatDate, formatDateTime, timeAgo } from './date'

// Mock Date constructor for consistent testing
const mockDate = new Date('2024-01-15T10:30:00Z')

vi.useFakeTimers()
vi.setSystemTime(mockDate)

afterAll(() => {
  vi.useRealTimers()
})

describe('date utils', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toBe('2024年1月15日')
    })

    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toBe('2024年1月15日')
    })
  })

  describe('formatDateTime', () => {
    it('formats datetime string correctly', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z')
      expect(result).toBe('2024年1月15日 19:30')
    })

    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDateTime(date)
      expect(result).toBe('2024年1月15日 19:30')
    })
  })

  describe('timeAgo', () => {
    it('returns "たった今" for very recent dates', () => {
      const recent = new Date(mockDate.getTime() - 30000) // 30 seconds ago
      expect(timeAgo(recent)).toBe('たった今')
    })

    it('returns minutes ago for recent dates', () => {
      const recent = new Date(mockDate.getTime() - 5 * 60 * 1000) // 5 minutes ago
      expect(timeAgo(recent)).toBe('5分前')
    })

    it('returns hours ago for dates within a day', () => {
      const recent = new Date(mockDate.getTime() - 3 * 60 * 60 * 1000) // 3 hours ago
      expect(timeAgo(recent)).toBe('3時間前')
    })

    it('returns days ago for dates within a week', () => {
      const recent = new Date(mockDate.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      expect(timeAgo(recent)).toBe('3日前')
    })

    it('returns formatted date for older dates', () => {
      const old = new Date(mockDate.getTime() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      expect(timeAgo(old)).toBe('2024年1月5日')
    })
  })
})