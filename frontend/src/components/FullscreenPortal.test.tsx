import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FullscreenPortal } from './FullscreenPortal';

/**
 * Unit tests for FullscreenPortal component
 * 
 * **Validates: Requirements 4.2, 4.4, 4.8, 4.11**
 * 
 * Tests cover:
 * - Portal rendering into document.body
 * - Body scroll prevention when open
 * - Body scroll restoration on close
 * - Close button click handler
 * - Escape key press handler
 */

describe('FullscreenPortal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow style before each test
    document.body.style.overflow = '';
  });

  afterEach(() => {
    cleanup();
    // Clean up body overflow style after each test
    document.body.style.overflow = '';
  });

  describe('portal rendering', () => {
    it('renders into document.body when open', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div data-testid="portal-content">Test Content</div>
        </FullscreenPortal>
      );

      // Verify content is rendered
      const content = screen.getByTestId('portal-content');
      expect(content).toBeInTheDocument();
      expect(content.textContent).toBe('Test Content');

      // Verify portal is rendered as a direct child of document.body
      const portalContainer = content.closest('.fixed.inset-0.z-50.bg-black');
      expect(portalContainer).toBeInTheDocument();
      expect(portalContainer?.parentElement).toBe(document.body);
    });

    it('does not render when isOpen is false', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div data-testid="portal-content">Test Content</div>
        </FullscreenPortal>
      );

      // Verify content is not rendered
      expect(screen.queryByTestId('portal-content')).not.toBeInTheDocument();
    });

    it('renders close button with correct aria-label', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      const closeButton = screen.getByLabelText('Close fullscreen');
      expect(closeButton).toBeInTheDocument();
    });

    it('renders children inside portal content area', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
        </FullscreenPortal>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  describe('body scroll prevention', () => {
    it('sets body overflow to hidden when portal opens', () => {
      const onClose = vi.fn();
      
      // Verify initial state
      expect(document.body.style.overflow).toBe('');

      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Verify body scroll is prevented
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('does not set body overflow when portal is closed', () => {
      const onClose = vi.fn();
      
      // Verify initial state
      expect(document.body.style.overflow).toBe('');

      render(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Verify body overflow is not changed
      expect(document.body.style.overflow).toBe('');
    });

    it('preserves existing body overflow value when portal is closed', () => {
      const onClose = vi.fn();
      
      // Set initial overflow value
      document.body.style.overflow = 'auto';

      render(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Verify existing value is preserved
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  describe('body scroll restoration', () => {
    it('restores body overflow when portal closes', () => {
      const onClose = vi.fn();
      
      const { rerender } = render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Verify body scroll is prevented
      expect(document.body.style.overflow).toBe('hidden');

      // Close the portal
      rerender(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Verify body overflow is restored to empty string
      expect(document.body.style.overflow).toBe('');
    });

    it('restores body overflow when component unmounts', () => {
      const onClose = vi.fn();
      
      const { unmount } = render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Verify body scroll is prevented
      expect(document.body.style.overflow).toBe('hidden');

      // Unmount the component
      unmount();

      // Verify body overflow is restored
      expect(document.body.style.overflow).toBe('');
    });

    it('handles multiple open/close cycles correctly', () => {
      const onClose = vi.fn();
      
      const { rerender } = render(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Initial state
      expect(document.body.style.overflow).toBe('');

      // Open portal
      rerender(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );
      expect(document.body.style.overflow).toBe('hidden');

      // Close portal
      rerender(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );
      expect(document.body.style.overflow).toBe('');

      // Open again
      rerender(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );
      expect(document.body.style.overflow).toBe('hidden');

      // Close again
      rerender(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('close button functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      const closeButton = screen.getByLabelText('Close fullscreen');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose only once per click', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      const closeButton = screen.getByLabelText('Close fullscreen');
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(3);
    });

    it('does not call onClose when portal is closed', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Close button should not be rendered when portal is closed
      expect(screen.queryByLabelText('Close fullscreen')).not.toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Escape key functionality', () => {
    it('calls onClose when Escape key is pressed while portal is open', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape is pressed while portal is closed', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={false} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not call onClose when other keys are pressed', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Press various other keys
      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'Space' });
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'a' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('handles multiple Escape key presses', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Press Escape key multiple times
      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(3);
    });

    it('removes event listener when component unmounts', () => {
      const onClose = vi.fn();
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      unmount();

      // Verify removeEventListener was called for keydown event
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });

    it('updates event listener when onClose callback changes', () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();
      
      const { rerender } = render(
        <FullscreenPortal isOpen={true} onClose={onClose1}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Press Escape with first callback
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose1).toHaveBeenCalledTimes(1);
      expect(onClose2).not.toHaveBeenCalled();

      // Update callback
      rerender(
        <FullscreenPortal isOpen={true} onClose={onClose2}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      // Press Escape with second callback
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose1).toHaveBeenCalledTimes(1); // Still 1
      expect(onClose2).toHaveBeenCalledTimes(1); // Now called
    });
  });

  describe('portal styling', () => {
    it('applies correct fullscreen overlay classes', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div data-testid="portal-content">Test Content</div>
        </FullscreenPortal>
      );

      const content = screen.getByTestId('portal-content');
      const portalContainer = content.closest('.fixed.inset-0.z-50.bg-black');
      
      expect(portalContainer).toBeInTheDocument();
      expect(portalContainer).toHaveClass('fixed', 'inset-0', 'z-50', 'bg-black');
    });

    it('applies correct close button styling classes', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      const closeButton = screen.getByLabelText('Close fullscreen');
      
      expect(closeButton).toHaveClass(
        'absolute',
        'right-4',
        'top-4',
        'z-[1000]',
        'rounded-lg',
        'bg-white/90',
        'p-2',
        'shadow-lg',
        'backdrop-blur-sm',
        'hover:bg-white'
      );
    });

    it('renders close button icon with correct attributes', () => {
      const onClose = vi.fn();
      
      render(
        <FullscreenPortal isOpen={true} onClose={onClose}>
          <div>Test Content</div>
        </FullscreenPortal>
      );

      const closeButton = screen.getByLabelText('Close fullscreen');
      const svg = closeButton.querySelector('svg');
      
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-5', 'w-5', 'text-gray-700');
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });
  });
});
