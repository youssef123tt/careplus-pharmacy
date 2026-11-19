import { describe, expect, it } from 'vitest'
import { filsToKwdString, formatKWD, kwdToFils, parseKwdInput } from './money'

describe('money (KWD, 3 decimals)', () => {
  it('formats with exactly three decimals', () => {
    expect(formatKWD(39000)).toBe('39.000 KWD')
    expect(formatKWD(5500)).toBe('5.500 KWD')
    expect(formatKWD(950)).toBe('0.950 KWD')
    expect(formatKWD(5)).toBe('0.005 KWD')
    expect(formatKWD(1234567)).toBe('1,234.567 KWD')
  })

  it('converts database numerics to integer fils without float drift', () => {
    expect(kwdToFils('19.500')).toBe(19500)
    expect(kwdToFils(19.5)).toBe(19500)
    expect(kwdToFils('0.1')).toBe(100)
    expect(kwdToFils(1.005)).toBe(1005)
  })

  it('avoids classic floating point errors when summing', () => {
    // 0.1 + 0.2 in floats is 0.30000000000000004
    expect(filsToKwdString(kwdToFils(0.1) + kwdToFils(0.2))).toBe('0.300')
  })

  it('parses admin price input', () => {
    expect(parseKwdInput('19.5')).toBe(19500)
    expect(parseKwdInput(' 55.000 ')).toBe(55000)
    expect(parseKwdInput('0')).toBeNull()
    expect(parseKwdInput('-1')).toBeNull()
    expect(parseKwdInput('1.2345')).toBeNull()
    expect(parseKwdInput('abc')).toBeNull()
    expect(parseKwdInput('')).toBeNull()
    expect(parseKwdInput('1e3')).toBeNull()
  })
})
