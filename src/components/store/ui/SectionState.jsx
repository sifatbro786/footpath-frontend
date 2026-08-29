/**
 * Loading / empty / error gate for a homepage section.
 *
 * Editorial decision baked in here: on a storefront homepage, a section with
 * nothing in it should DISAPPEAR, not announce its emptiness. "No best sellers
 * yet" reads as a broken shop. Same for a failed request — one dead endpoint
 * should cost the visitor that strip, not confront them with an error banner
 * halfway down the page. Both cases render nothing by default.
 *
 * That silence is only acceptable because the failure is still visible where it
 * matters: React Query logs it, and Phase 10 wires the same boundary to Sentry.
 *
 * Props:
 *   isLoading   show `skeleton` instead of children
 *   isError     render `errorFallback` (default: nothing)
 *   isEmpty     render `emptyFallback` (default: nothing)
 *   skeleton    what to show while loading — should match the loaded layout
 *               so the page doesn't jump when data arrives
 */
const SectionState = ({
    isLoading,
    isError,
    isEmpty,
    skeleton = null,
    emptyFallback = null,
    errorFallback = null,
    children,
}) => {
    if (isLoading) return skeleton;
    if (isError) return errorFallback;
    if (isEmpty) return emptyFallback;
    return children;
};

export default SectionState;
