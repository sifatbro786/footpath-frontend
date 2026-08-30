import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Seo from "../../components/common/Seo";
import Eyebrow from "../../components/store/ui/Eyebrow";
import Breadcrumbs from "../../components/store/ui/Breadcrumbs";
import AddressForm from "../../components/store/checkout/AddressForm";
import PaymentMethodSelect from "../../components/store/checkout/PaymentMethodSelect";
import OrderSummary from "../../components/store/checkout/OrderSummary";

import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import {
    useCartPayload,
    useCheckoutCalculation,
    useLocationValidation,
    usePlaceOrder,
} from "../../hooks/store/useCheckout";
import { rememberGuestOrderToken } from "../../lib/store/orderAccess";

/**
 * /checkout
 *
 * Single page rather than a multi step wizard. The form is short enough that
 * splitting it would mean three screens of two fields each, and a wizard hides
 * the running total behind steps, which is exactly when people abandon.
 *
 * Flow facts that shape this file:
 *   • locationType is derived server side from the upazila, never picked here.
 *   • Guests send guestItems; signed in users send nothing and createOrder
 *     reads their server cart. That is why the payload branches on isGuest.
 *   • Both payment methods return a redirectUrl. COD is not a gateway bypass.
 *   • A guest order returns guestAccessToken exactly once. It must be stored
 *     before the redirect or the shopper can never read their own order back.
 */

const EMPTY_ADDRESS = {
    name: "",
    phone: "",
    email: "",
    district: "",
    upazila: "",
    addressLine1: "",
    addressLine2: "",
    deliveryType: "",
    courierBranch: "",
};

export default function CheckoutPage() {
    const navigate = useNavigate();
    // Subtotal is deliberately NOT read from the cart here: every figure the
    // summary shows comes from /checkout/calculate so it matches what the order
    // will actually charge.
    const { items, isGuestCart, resetAfterOrder } = useCart();
    const { user, isAuthenticated } = useAuth();

    const [address, setAddress] = useState(EMPTY_ADDRESS);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [couponCode, setCouponCode] = useState("");
    const [locationType, setLocationType] = useState(null);
    const [availableDeliveryTypes, setAvailableDeliveryTypes] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState(null);

    const { couponItems, guestItems } = useCartPayload(items);
    const validateLocation = useLocationValidation();
    const placeOrder = usePlaceOrder();

    // Prefill what we know about a signed in shopper.
    useEffect(() => {
        if (!user) return;
        setAddress((prev) => ({
            ...prev,
            name: prev.name || user.name || "",
            email: prev.email || user.email || "",
            phone: prev.phone || user.phoneNumber || "",
        }));
    }, [user]);

    // District plus upazila resolves the zone, which decides both the shipping
    // rate and which delivery methods are offered.
    useEffect(() => {
        if (!address.district || !address.upazila) {
            setLocationType(null);
            setAvailableDeliveryTypes([]);
            return;
        }

        let cancelled = false;
        validateLocation.mutate(
            { district: address.district, upazila: address.upazila },
            {
                onSuccess: (data) => {
                    if (cancelled) return;
                    setLocationType(data.locationType);
                    setAvailableDeliveryTypes(data.availableDeliveryTypes ?? []);
                },
                onError: () => {
                    if (cancelled) return;
                    setLocationType(null);
                    setAvailableDeliveryTypes([]);
                },
            },
        );
        return () => {
            cancelled = true;
        };
        // validateLocation is a stable mutation object from React Query.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address.district, address.upazila]);

    const calcPayload = useMemo(
        () => ({
            isGuest: isGuestCart,
            guestItems: isGuestCart ? guestItems : undefined,
            couponCode: couponCode || undefined,
            locationType,
            deliveryType: address.deliveryType || undefined,
            courierBranch: address.courierBranch || undefined,
            paymentMethod,
            shippingAddress: {
                district: address.district,
                upazila: address.upazila,
            },
        }),
        [
            isGuestCart,
            guestItems,
            couponCode,
            locationType,
            address.deliveryType,
            address.courierBranch,
            address.district,
            address.upazila,
            paymentMethod,
        ],
    );

    const { totals, needsAddress, isFetching: isCalculating } = useCheckoutCalculation(
        calcPayload,
        items.length > 0,
    );

    const updateAddress = useCallback((patch) => {
        setAddress((prev) => ({ ...prev, ...patch }));
        setErrors((prev) => {
            const next = { ...prev };
            for (const key of Object.keys(patch)) delete next[key];
            return next;
        });
    }, []);

    /**
     * Mirrors the conditional `required` validators on Order.shippingAddress.
     * Validating here is a courtesy that saves a round trip; the server is
     * still the authority and will reject anything that slips through.
     */
    const validate = () => {
        const next = {};
        if (!address.name.trim()) next.name = "We need a name for the delivery.";
        if (!address.phone.trim()) next.phone = "A phone number is required.";
        else if (!/^01\d{9}$/.test(address.phone.replace(/\s|-/g, "")))
            next.phone = "Enter an 11 digit number starting 01.";

        if (isGuestCart && !address.email.trim())
            next.email = "We need an email to send your confirmation.";
        else if (address.email && !/\S+@\S+\.\S+/.test(address.email))
            next.email = "That email does not look right.";

        if (!address.district) next.district = "Choose a district.";
        if (!address.upazila) next.upazila = "Choose an area.";

        if (locationType === "outside_dhaka" && !address.deliveryType)
            next.deliveryType = "Choose how you would like it delivered.";

        if (address.deliveryType === "Courier" && !address.courierBranch)
            next.courierBranch = "Choose a branch to collect from.";

        if (address.deliveryType !== "Courier" && !address.addressLine1.trim())
            next.addressLine1 = "A street address is required for home delivery.";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);

        if (!validate()) {
            document.querySelector("[aria-invalid='true'], .text-coral")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            return;
        }

        const payload = {
            // No prices are sent. pricingService recomputes everything and
            // ignores client supplied money values.
            shippingAddress: {
                name: address.name.trim(),
                phone: address.phone.replace(/\s|-/g, ""),
                email: address.email.trim(),
                addressLine1: address.addressLine1.trim(),
                addressLine2: address.addressLine2.trim(),
                district: address.district,
                upazila: address.upazila,
                country: "Bangladesh",
            },
            paymentMethod,
            couponCode: couponCode || undefined,
            locationType,
            deliveryType: address.deliveryType,
            courierBranch:
                address.deliveryType === "Courier" ? address.courierBranch : undefined,
            isGuest: isGuestCart,
            guestEmail: isGuestCart ? address.email.trim() : undefined,
            // Signed in orders are built from the SERVER cart; sending items
            // would be ignored anyway.
            guestItems: isGuestCart ? guestItems : undefined,
        };

        try {
            const data = await placeOrder.mutateAsync(payload);

            // Store the capability token before navigating anywhere. It is
            // returned once and cannot be recovered.
            if (data?.guestAccessToken && data?.order?.orderNumber) {
                rememberGuestOrderToken(data.order.orderNumber, data.guestAccessToken);
            }

            resetAfterOrder();

            if (data?.redirectUrl) {
                // Full navigation, not client routing: this leaves our origin
                // for the payment gateway.
                window.location.href = data.redirectUrl;
                return;
            }

            // No gateway URL should not happen for either method, but landing
            // on the confirmation page beats a blank screen.
            navigate(
                `/order/success?orderId=${data?.order?._id ?? ""}&orderNumber=${
                    data?.order?.orderNumber ?? ""
                }`,
            );
        } catch (error) {
            const response = error?.response?.data;
            setSubmitError(
                response?.errors?.join(" ") ??
                    response?.message ??
                    "We could not place your order. Please try again.",
            );
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    if (items.length === 0 && !placeOrder.isPending) {
        return (
            <>
                <Seo title="Checkout | Elmate Stationery" noIndex />
                <div className="mx-auto max-w-lg px-4 py-24 text-center">
                    <h1 className="font-display text-2xl font-semibold text-ink">
                        There is nothing to check out
                    </h1>
                    <p className="mt-3 text-[15px] text-ink-soft">
                        Your bag is empty, so there is no order to place yet.
                    </p>
                    <Link
                        to="/shop"
                        className="mt-7 inline-block border border-ink bg-ink px-6 py-3 font-label
                                   text-[11px] uppercase tracking-[0.18em] text-paper
                                   transition-colors hover:bg-transparent hover:text-ink"
                    >
                        Browse the shop
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <Seo title="Checkout | Elmate Stationery" noIndex />

            <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:pt-10">
                <Breadcrumbs
                    items={[
                        { label: "Your bag", href: "/cart" },
                        { label: "Checkout", href: "/checkout" },
                    ]}
                    className="mb-7"
                />

                <header>
                    <Eyebrow>Almost there</Eyebrow>
                    <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Checkout
                    </h1>
                </header>

                {!isAuthenticated && (
                    <p className="mt-5 border border-line bg-paper-dim px-4 py-3 text-[13px] text-ink-soft">
                        Checking out as a guest.{" "}
                        <Link
                            to="/login"
                            className="text-ink underline underline-offset-4 hover:text-brand"
                        >
                            Sign in
                        </Link>{" "}
                        if you would rather use a saved address and keep this order in your
                        history.
                    </p>
                )}

                {submitError && (
                    <div
                        role="alert"
                        className="mt-5 border-l-2 border-coral bg-coral/5 px-4 py-3.5"
                    >
                        <p className="font-label text-[11px] uppercase tracking-[0.16em] text-coral">
                            Order not placed
                        </p>
                        <p className="mt-1.5 text-sm text-ink-soft">{submitError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-10">
                    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
                        <div className="space-y-10">
                            <section>
                                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                                    Delivery details
                                </h2>
                                <div className="mt-6">
                                    <AddressForm
                                        values={{ ...address, isGuest: isGuestCart }}
                                        errors={errors}
                                        onChange={updateAddress}
                                        locationType={locationType}
                                        availableDeliveryTypes={availableDeliveryTypes}
                                    />
                                </div>
                            </section>

                            <section className="border-t border-line pt-10">
                                <PaymentMethodSelect
                                    value={paymentMethod}
                                    onChange={setPaymentMethod}
                                    totals={totals}
                                />
                            </section>
                        </div>

                        <aside>
                            <div className="lg:sticky lg:top-28">
                                <OrderSummary
                                    items={items}
                                    totals={totals}
                                    needsAddress={needsAddress || !locationType}
                                    isCalculating={isCalculating}
                                    couponItems={couponItems}
                                    userId={user?._id}
                                    appliedCode={couponCode}
                                    onApplyCoupon={(code) => setCouponCode(code)}
                                    onRemoveCoupon={() => setCouponCode("")}
                                />

                                <button
                                    type="submit"
                                    disabled={placeOrder.isPending}
                                    className="mt-5 w-full border border-ink bg-ink py-4 font-label
                                               text-[11px] uppercase tracking-[0.18em] text-paper
                                               transition-colors hover:bg-transparent hover:text-ink
                                               disabled:cursor-not-allowed disabled:border-ink/12
                                               disabled:bg-ink/8 disabled:text-ink/35 disabled:hover:text-ink/35"
                                >
                                    {placeOrder.isPending ? "Placing your order" : "Place order"}
                                </button>

                                <p className="mt-3 text-center font-label text-[11px] leading-relaxed text-ink/40">
                                    You will be taken to our payment partner to complete this
                                    order.
                                </p>
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </>
    );
}
