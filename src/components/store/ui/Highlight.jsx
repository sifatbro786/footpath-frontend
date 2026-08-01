// A rough, hand-drawn highlighter swipe that sits behind inline text.
// The irregular path (not a clean rect) is what makes it read hand-made.
const Highlight = ({ children, color = "var(--color-marigold)" }) => (
    <span className="relative isolate inline-block">
        <svg
            aria-hidden="true"
            viewBox="0 0 200 60"
            preserveAspectRatio="none"
            className="absolute -inset-x-1 bottom-[0.06em] -z-10 h-[0.66em] w-[calc(100%+0.5rem)]"
        >
            <path
                d="M4,42 C42,32 82,40 122,35 C152,31 182,40 197,31 L196,53 C168,60 138,50 108,55 C76,60 40,52 4,57 Z"
                fill={color}
                opacity="0.9"
            />
        </svg>
        {children}
    </span>
);

export default Highlight;
