import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Countdown } from './countdown';

describe('Countdown', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders "Ended" when target is in the past', () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
    render(<Countdown target={pastDate} />);
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('renders hours and minutes for a near-future target', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    // 2 hours and 30 minutes from the frozen time
    const futureDate = new Date('2025-06-15T14:30:00Z');
    const { container } = render(<Countdown target={futureDate} />);
    const text = container.textContent || '';
    expect(text).toContain('2h');
    expect(text).toContain('30m');
  });

  it('renders days when target is more than 24 hours away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const futureDate = new Date('2025-06-18T12:00:00Z'); // exactly 3 days
    const { container } = render(<Countdown target={futureDate} />);
    expect(container.textContent).toContain('3d');
  });

  it('does not show days when target is less than 24 hours away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00Z'));
    const futureDate = new Date('2025-06-15T17:00:00Z'); // 5 hours
    const { container } = render(<Countdown target={futureDate} />);
    expect(container.textContent).not.toContain('d ');
  });

  it('renders the label when provided', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 2);
    render(<Countdown target={futureDate} label="Banner ends in" />);
    expect(screen.getByText('Banner ends in')).toBeInTheDocument();
  });

  it('does not render a label when not provided', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 2);
    const { container } = render(<Countdown target={futureDate} />);
    expect(container.querySelector('.text-muted-foreground')).toBeNull();
  });

  it('applies className to the wrapper', () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 2);
    const { container } = render(
      <Countdown target={futureDate} className="custom-class" />,
    );
    expect(container.firstElementChild?.classList.contains('custom-class')).toBe(true);
  });

  it('renders "Ended" when target is exactly now', () => {
    vi.useFakeTimers();
    const now = new Date();
    const { container } = render(<Countdown target={now} />);
    expect(container.textContent).toContain('Ended');
  });
});
