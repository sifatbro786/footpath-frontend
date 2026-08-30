import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { checkoutApi } from "../../api/checkoutApi";
import { storeKeys } from "./useStorefront";

export const checkoutKeys = {
    shippingRates: () => [...storeKeys.all, "shipping-rates"],
    districts: () => [...storeKeys.all, "districts"],
    upazilas: (district) => [...storeKeys.all, "upazilas", district],
    courierBranches: (district) => [...storeKeys.all, "courier-branches", district],
    calculate: (payload) => [...storeKeys.all, "checkout-calc", payload],
};

/** Free delivery threshold, for the progress bar. Cached hard: admin data. */
export const useShippingRates = () => {
    const query = useQuery({
        queryKey: checkoutKeys.shippingRates(),
        queryFn: () => checkoutApi.getShippingRates().then((r) => r.data),
        staleTime: 60 * 60 * 1000,
    });

    return {
        ...query,
        rates: query.data?.rates ?? [],
        freeShippingThreshold: query.data?.lowestFreeShippingThreshold ?? null,
    };
};

export const useDistricts = () =>
    useQuery({
        queryKey: checkoutKeys.districts(),
        // Returns plain strings, not objects.
        queryFn: () => checkoutApi.getDistricts().then((r) => r.data?.districts ?? []),
        staleTime: 60 * 60 * 1000,
    });

export const useUpazilas = (district) =>
    useQuery({
        queryKey: checkoutKeys.upazilas(district),
        queryFn: () => checkoutApi.getUpazilas(district).then((r) => r.data?.upazilas ?? []),
        enabled: Boolean(district),
        staleTime: 60 * 60 * 1000,
        // A district with no upazilas configured 404s; that is data, not a fault.
        retry: false,
    });

export const useCourierBranches = (district, enabled) =>
    useQuery({
        queryKey: checkoutKeys.courierBranches(district),
        queryFn: () =>
            checkoutApi.getCourierBranches(district).then((r) => r.data?.branches ?? []),
        enabled: Boolean(district) && enabled,
        staleTime: 60 * 60 * 1000,
        retry: false,
    });

/**
 * Resolve district + upazila into a locationType and the delivery types that
 * are actually offered there.
 *
 * locationType is never chosen by the shopper. It is derived server side from
 * the upazila's shippingZone, and Courier is not offered inside Dhaka. Letting
 * the UI guess would produce orders the Order schema rejects at save time.
 */
export const useLocationValidation = () =>
    useMutation({
        mutationFn: (payload) => checkoutApi.validateLocation(payload).then((r) => r.data),
    });

/**
 * Live totals.
 *
 * Kept as a query rather than a mutation so React Query dedupes and caches
 * identical payloads: the summary recalculates on every quantity change,
 * coupon and address edit, and without caching that is a request per keystroke
 * in the address form.
 *
 * `enabled` gates it until the minimum the endpoint needs is present, otherwise
 * every partially filled form fires a guaranteed 400.
 */
export const useCheckoutCalculation = (payload, enabled = true) => {
    const query = useQuery({
        queryKey: checkoutKeys.calculate(payload),
        queryFn: () => checkoutApi.calculate(payload).then((r) => r.data?.data ?? null),
        enabled: enabled && Boolean(payload?.locationType && payload?.paymentMethod),
        // Old totals stay on screen while new ones load, so the summary does
        // not flash empty every time a quantity changes.
        placeholderData: (previous) => previous,
        retry: false,
    });

    return {
        ...query,
        totals: query.data ?? null,
        // The endpoint answers 200 with a `message` and zeroed shipping when the
        // address is incomplete. That is a prompt, not a failure.
        needsAddress: Boolean(query.data?.message),
        errorMessage: query.error?.response?.data?.message ?? null,
    };
};

/**
 * Coupon check.
 *
 * The response is only a preview. The real discount is recomputed by
 * pricingService during order creation, so a coupon that passes here can still
 * be reduced or rejected at checkout (usage limits race, product eligibility).
 * The UI treats it as an estimate and lets the calculate endpoint own the
 * number actually displayed in the summary.
 */
export const useCouponCheck = () =>
    useMutation({
        mutationFn: ({ couponCode, cartItems, userId }) =>
            checkoutApi
                .applyCoupon({ couponCode, cartItems, userId })
                .then((r) => ({
                    ...r.data,
                    // discountAmount arrives as a toFixed string.
                    discountAmount: Number(r.data?.discountAmount) || 0,
                })),
    });

export const usePlaceOrder = () =>
    useMutation({
        mutationFn: (payload) => checkoutApi.createOrder(payload).then((r) => r.data),
    });

/**
 * Cart lines in the shape the coupon and calculate endpoints expect.
 *
 * Both want `price`/`priceAtPurchase` and `quantity`; createOrder additionally
 * wants name, image and the variant options array. Built once here so the three
 * call sites cannot drift.
 */
export const useCartPayload = (items) =>
    useMemo(
        () => ({
            // For /coupons/apply
            couponItems: items.map((i) => ({
                productId: i.productId,
                price: i.price,
                quantity: i.quantity,
            })),
            // For /checkout/calculate and /orders (guests only)
            guestItems: items.map((i) => ({
                productId: i.productId,
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                priceAtPurchase: i.price,
                image: i.image,
                // The options array IS the variant identity. Sent verbatim so
                // the server can match it back to a variant and decrement the
                // right stock row.
                variant: i.variant,
            })),
        }),
        [items],
    );
