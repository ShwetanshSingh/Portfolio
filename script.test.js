const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('Portfolio Script', () => {
    beforeAll(() => {
        document.documentElement.innerHTML = html.toString();
        // Mock window.scrollTo
        window.scrollTo = jest.fn();

        require('./script.js');

        // Manually trigger DOMContentLoaded
        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        window.document.dispatchEvent(event);
    });

    beforeEach(() => {
        // Reset state before each test
        document.body.className = '';
        localStorage.clear();
        document.getElementById('theme-icon').textContent = '🌙';
    });

    test('Initial theme is light by default', () => {
        expect(document.body.classList.contains('dark-theme')).toBe(false);
    });

    test('Toggles to dark theme on click', () => {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');

        themeToggle.click();

        expect(document.body.classList.contains('dark-theme')).toBe(true);
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(themeIcon.textContent).toBe('☀️');
    });

    test('Toggles back to light theme on second click', () => {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');

        // First click (light to dark)
        themeToggle.click();

        // Second click (dark to light)
        themeToggle.click();

        expect(document.body.classList.contains('dark-theme')).toBe(false);
        expect(localStorage.getItem('theme')).toBe('light');
        expect(themeIcon.textContent).toBe('🌙');
    });

    test('Smooth scrolling is triggered on anchor click', () => {
        // Find an anchor tag
        const anchor = document.querySelector('a[href="#about"]');
        const targetElement = document.querySelector('#about');

        // Mock offsetTop for the target element
        Object.defineProperty(targetElement, 'offsetTop', { value: 500, configurable: true });

        // Click the anchor
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        clickEvent.preventDefault = jest.fn();

        anchor.dispatchEvent(clickEvent);

        expect(clickEvent.preventDefault).toHaveBeenCalled();
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 500 - 70, // offsetTop - 70
            behavior: 'smooth'
        });
    });
});

describe('Portfolio Script - Initial Load with Saved Theme', () => {
    beforeAll(() => {
        // We need a fresh environment, but we can't easily reset document listeners.
        // However, we can just call the DOMContentLoaded event again while localStorage has 'dark'.
        // Because the script relies on DOMContentLoaded to set the initial class.
        // Wait, if we trigger DOMContentLoaded again, the click listener will be added again.
        // Let's just create a new DOMContentLoaded event to test the init logic.
    });

    test('Loads dark theme from localStorage if saved', () => {
        // Clear body class
        document.body.className = '';
        localStorage.setItem('theme', 'dark');

        const event = document.createEvent('Event');
        event.initEvent('DOMContentLoaded', true, true);
        window.document.dispatchEvent(event);

        expect(document.body.classList.contains('dark-theme')).toBe(true);
        expect(document.getElementById('theme-icon').textContent).toBe('☀️');
    });
});