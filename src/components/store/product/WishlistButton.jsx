import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../../hooks/useAuth";
import { useWishlist, useWishlistToggle } from "../../../hooks/store/useAccount";

/**
 * Save to wishlist.
 *
 * A wishlist requires an account: the backend has no guest concept, and a
 * localStorage fallback would promise persistence it cannot keep (cleared
 * browser, different device). So a signed-out tap sends them to sign in rather
 * than silently saving into a list that will evaporate.
 *
 * The toggle writes optimistically, so the heart fills immediately and rolls
 * back only if the request actually fails.
 */
export default function WishlistButton({ productId, className = "", showLabel = false }) {
    const { isAuthenticated } = useAuth();
    const { savedIds } = useWishlist();
    const toggle = useWishlistToggle();
    const navigate = useNavigate();

    const isSaved = savedIds.has(productId);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            toast("Sign in to save items", { icon: "♡" });
            navigate("/login");
            return;
        }

        toggle.mutate(
            { productId, isSaved },
            {
                onError: () => toast.error("Could not update your saved items."),
            },
        );
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from saved items" : "Save for later"}
            className={`inline-flex items-center gap-2 transition-colors ${
                isSaved ? "text-coral" : "text-ink/45 hover:text-coral"
            } ${className}`}
        >
            <Heart size={16} className={isSaved ? "fill-coral" : ""} />
            {showLabel && (
                <span className="font-label text-[11px] uppercase tracking-[0.16em]">
                    {isSaved ? "Saved" : "Save for later"}
                </span>
            )}
        </button>
    );
}
