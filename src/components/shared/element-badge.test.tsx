import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ElementBadge } from './element-badge';

describe('ElementBadge', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the element name', () => {
    render(<ElementBadge element="Pyro" />);
    expect(screen.getByText('Pyro')).toBeInTheDocument();
  });

  it('renders for all known elements', () => {
    const elements = ['Pyro', 'Hydro', 'Anemo', 'Cryo', 'Electro', 'Geo', 'Dendro'];
    for (const el of elements) {
      const { unmount } = render(<ElementBadge element={el} />);
      expect(screen.getByText(el)).toBeInTheDocument();
      unmount();
    }
  });

  it('falls back to outline badge for unknown elements', () => {
    render(<ElementBadge element="Unknown" />);
    const badge = screen.getByText('Unknown');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('[data-slot="badge"]')).not.toBeNull();
  });

  it('applies custom className', () => {
    render(<ElementBadge element="Hydro" className="test-class" />);
    const badge = screen.getByText('Hydro');
    expect(badge.closest('[data-slot="badge"]')?.classList.contains('test-class')).toBe(true);
  });

  it('renders an icon by default for known elements', () => {
    const { container } = render(<ElementBadge element="Pyro" />);
    // The icon component uses next/image, which renders an <img> tag
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
  });

  it('does not render icon when showIcon is false', () => {
    const { container } = render(<ElementBadge element="Pyro" showIcon={false} />);
    const img = container.querySelector('img');
    expect(img).toBeNull();
  });

  it('renders element-specific color classes for Pyro', () => {
    const { container } = render(<ElementBadge element="Pyro" />);
    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.className).toContain('text-red-400');
  });

  it('renders element-specific color classes for Hydro', () => {
    const { container } = render(<ElementBadge element="Hydro" />);
    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge?.className).toContain('text-blue-400');
  });
});
