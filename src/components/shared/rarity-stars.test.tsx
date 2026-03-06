import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RarityStars } from './rarity-stars';

describe('RarityStars', () => {
  it('renders the correct number of stars for 5-star', () => {
    const { container } = render(<RarityStars rarity={5} />);
    const stars = container.querySelectorAll('span');
    expect(stars).toHaveLength(5);
    for (const star of stars) {
      expect(star.textContent).toBe('\u2605'); // Unicode star character
    }
  });

  it('renders the correct number of stars for 4-star', () => {
    const { container } = render(<RarityStars rarity={4} />);
    const stars = container.querySelectorAll('span');
    expect(stars).toHaveLength(4);
  });

  it('renders the correct number of stars for 3-star', () => {
    const { container } = render(<RarityStars rarity={3} />);
    const stars = container.querySelectorAll('span');
    expect(stars).toHaveLength(3);
  });

  it('renders 1 star for rarity 1', () => {
    const { container } = render(<RarityStars rarity={1} />);
    const stars = container.querySelectorAll('span');
    expect(stars).toHaveLength(1);
  });

  it('applies amber color for 5-star rarity', () => {
    const { container } = render(<RarityStars rarity={5} />);
    const star = container.querySelector('span');
    expect(star?.className).toContain('text-amber-400');
  });

  it('applies purple color for 4-star rarity', () => {
    const { container } = render(<RarityStars rarity={4} />);
    const star = container.querySelector('span');
    expect(star?.className).toContain('text-purple-400');
  });

  it('applies blue color for 3-star rarity', () => {
    const { container } = render(<RarityStars rarity={3} />);
    const star = container.querySelector('span');
    expect(star?.className).toContain('text-blue-400');
  });

  it('falls back to gray for unknown rarities', () => {
    const { container } = render(<RarityStars rarity={2} />);
    const star = container.querySelector('span');
    expect(star?.className).toContain('text-gray-400');
  });

  it('uses sm size by default', () => {
    const { container } = render(<RarityStars rarity={5} />);
    const star = container.querySelector('span');
    expect(star?.className).toContain('text-xs');
  });

  it('uses xs size when specified', () => {
    const { container } = render(<RarityStars rarity={5} size="xs" />);
    const star = container.querySelector('span');
    expect(star?.className).toContain('text-[8px]');
  });

  it('uses md size when specified', () => {
    const { container } = render(<RarityStars rarity={5} size="md" />);
    const star = container.querySelector('span');
    expect(star?.className).toContain('text-sm');
  });

  it('applies custom className to the container', () => {
    const { container } = render(
      <RarityStars rarity={5} className="custom-stars" />,
    );
    expect(container.firstElementChild?.classList.contains('custom-stars')).toBe(true);
  });
});
