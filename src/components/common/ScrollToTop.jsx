import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Resets scroll position on navigation.
 *
 * A client-side router keeps the scroll offset between routes, so clicking a
 * product from halfway down a listing drops you halfway down the product page.
 *
 * POP navigations (back/forward) are excluded — the browser restores those
 * positions itself, and overriding it breaks the expectation that going "back"
 * returns you to where you were in the list.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        if (navigationType === "POP") return;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [pathname, navigationType]);

    return null;
};

export default ScrollToTop;
