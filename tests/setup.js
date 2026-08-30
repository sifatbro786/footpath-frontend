/**
 * Browser APIs that jsdom does not implement.
 *
 * These are polyfilled here rather than guarded in application code: every real
 * browser provides them, so shipping workarounds for a test environment would
 * be carrying dead weight into production. (The one exception is matchMedia in
 * useIsMobile, which IS guarded — but for Safari < 14's differing listener API,
 * not for jsdom.)
 */

// framer-motion's `whileInView` needs this. The stub reports every observed
// element as immediately visible so scroll-reveal content renders in tests.
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe(el) {
        this.callback([{ isIntersecting: true, target: el, intersectionRatio: 1 }], this);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}

global.IntersectionObserver = MockIntersectionObserver;

global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

if (!window.matchMedia) {
    window.matchMedia = (query) => ({
        matches: false, // default to desktop
        media: query,
        onchange: null,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        dispatchEvent() {
            return false;
        },
    });
}

// jsdom has no layout engine, so scrollTo is undefined — ScrollToTop calls it
// on every navigation.
if (!window.scrollTo) {
    window.scrollTo = () => {};
}
