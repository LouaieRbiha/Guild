import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseBannerDate, getNextAbyssReset, getTodaysTalentBooks } from './banner-helpers';

describe('parseBannerDate', () => {
  it('parses a valid ISO date string', () => {
    const date = parseBannerDate('2025-01-15T00:00:00Z');
    expect(date).toBeInstanceOf(Date);
    expect(date.getUTCFullYear()).toBe(2025);
    expect(date.getUTCMonth()).toBe(0); // January
    expect(date.getUTCDate()).toBe(15);
  });

  it('parses a date with timezone info', () => {
    const date = parseBannerDate('2025-06-01T12:00:00+08:00');
    expect(date).toBeInstanceOf(Date);
    // UTC time should be 04:00
    expect(date.getUTCHours()).toBe(4);
  });

  it('handles date-only strings', () => {
    const date = parseBannerDate('2025-03-10');
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2025);
  });
});

describe('getNextAbyssReset', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a Date object', () => {
    const reset = getNextAbyssReset();
    expect(reset).toBeInstanceOf(Date);
  });

  it('returns the 16th when current date is between 2nd and 15th', () => {
    // Mock: March 10, 2025 at 12:00 UTC
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2025, 2, 10, 12, 0, 0)));

    const reset = getNextAbyssReset();
    expect(reset.getUTCDate()).toBe(16);
    expect(reset.getUTCMonth()).toBe(2); // March
    expect(reset.getUTCHours()).toBe(4);
  });

  it('returns the 1st of next month when current date is after the 16th', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2025, 2, 20, 12, 0, 0)));

    const reset = getNextAbyssReset();
    expect(reset.getUTCDate()).toBe(1);
    expect(reset.getUTCMonth()).toBe(3); // April
    expect(reset.getUTCHours()).toBe(4);
  });

  it('returns the 16th when on the 16th but before 04:00 UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2025, 2, 16, 2, 0, 0)));

    const reset = getNextAbyssReset();
    expect(reset.getUTCDate()).toBe(16);
    expect(reset.getUTCHours()).toBe(4);
  });

  it('returns next month 1st when on the 16th after 04:00 UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2025, 2, 16, 5, 0, 0)));

    const reset = getNextAbyssReset();
    expect(reset.getUTCDate()).toBe(1);
    expect(reset.getUTCMonth()).toBe(3); // April
  });

  it('always returns a date in the future or at exact reset time', () => {
    const now = new Date();
    const reset = getNextAbyssReset();
    expect(reset.getTime()).toBeGreaterThanOrEqual(
      now.getTime() - 1000, // allow 1 second tolerance
    );
  });
});

describe('getTodaysTalentBooks', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns all talent books on Sunday', () => {
    vi.useFakeTimers();
    // Sunday, March 2, 2025
    vi.setSystemTime(new Date(2025, 2, 2, 12, 0, 0));

    const books = getTodaysTalentBooks();
    // On Sunday all books are available (18 books total)
    expect(books.length).toBeGreaterThan(6);
    expect(books).toContain('Freedom');
    expect(books).toContain('Resistance');
    expect(books).toContain('Ballad');
  });

  it('returns Monday/Thursday books on Monday', () => {
    vi.useFakeTimers();
    // Monday, March 3, 2025
    vi.setSystemTime(new Date(2025, 2, 3, 12, 0, 0));

    const books = getTodaysTalentBooks();
    expect(books).toContain('Freedom');
    expect(books).toContain('Prosperity');
    expect(books).toContain('Transience');
    expect(books).not.toContain('Resistance');
    expect(books).not.toContain('Ballad');
  });

  it('returns Tuesday/Friday books on Tuesday', () => {
    vi.useFakeTimers();
    // Tuesday, March 4, 2025
    vi.setSystemTime(new Date(2025, 2, 4, 12, 0, 0));

    const books = getTodaysTalentBooks();
    expect(books).toContain('Resistance');
    expect(books).toContain('Diligence');
    expect(books).toContain('Elegance');
    expect(books).not.toContain('Freedom');
    expect(books).not.toContain('Ballad');
  });

  it('returns Wednesday/Saturday books on Wednesday', () => {
    vi.useFakeTimers();
    // Wednesday, March 5, 2025
    vi.setSystemTime(new Date(2025, 2, 5, 12, 0, 0));

    const books = getTodaysTalentBooks();
    expect(books).toContain('Ballad');
    expect(books).toContain('Gold');
    expect(books).toContain('Light');
    expect(books).not.toContain('Freedom');
    expect(books).not.toContain('Resistance');
  });
});
