import { useEffect } from "react";
import {
    useDistricts,
    useUpazilas,
    useCourierBranches,
} from "../../../hooks/store/useCheckout";

/**
 * Delivery address.
 *
 * The conditional rules here are not styling choices, they mirror the
 * conditional `required` validators on Order.shippingAddress. Getting them
 * wrong produces a ValidationError at save time, after payment has been
 * initialised:
 *
 *   outside_dhaka            -> deliveryType required
 *   deliveryType "Courier"   -> courierBranch required
 *   Home Delivery, or any
 *   dhaka_* location         -> addressLine1, district, upazila all required
 *
 * locationType itself is NEVER chosen here. It is derived server side from the
 * upazila's shippingZone by /checkout/validate-location, which also reports
 * which delivery types that zone offers (Courier is not available inside
 * Dhaka). The parent owns that call; this component just reflects the result.
 */

const field =
    "w-full border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-ink " +
    "placeholder:text-ink/30 focus:border-ink focus:outline-none disabled:bg-ink/3 disabled:text-ink/40";

const label = "block font-label text-[11px] uppercase tracking-[0.18em] text-ink/50";

const Field = ({ id, children, required, error, ...rest }) => (
    <div>
        <label htmlFor={id} className={label}>
            {rest.title}
            {required && <span className="ml-1 text-coral">*</span>}
        </label>
        <div className="mt-2">{children}</div>
        {error && <p className="mt-1.5 text-[13px] text-coral">{error}</p>}
    </div>
);

export default function AddressForm({
    values,
    errors = {},
    onChange,
    locationType,
    availableDeliveryTypes,
}) {
    const { data: districts = [] } = useDistricts();
    const { data: upazilas = [], isFetching: loadingUpazilas } = useUpazilas(values.district);

    const isCourier = values.deliveryType === "Courier";
    const { data: branches = [], isFetching: loadingBranches } = useCourierBranches(
        values.district,
        isCourier,
    );

    // Inside Dhaka the only option is Home Delivery, so pin it rather than
    // leaving an empty required field the shopper has to discover.
    useEffect(() => {
        if (!availableDeliveryTypes?.length) return;
        if (!availableDeliveryTypes.includes(values.deliveryType)) {
            onChange({ deliveryType: availableDeliveryTypes[0], courierBranch: "" });
        }
    }, [availableDeliveryTypes, values.deliveryType, onChange]);

    const set = (patch) => onChange(patch);

    return (
        <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="name" title="Full name" required error={errors.name}>
                    <input
                        id="name"
                        className={field}
                        value={values.name}
                        onChange={(e) => set({ name: e.target.value })}
                        autoComplete="name"
                    />
                </Field>

                <Field id="phone" title="Phone number" required error={errors.phone}>
                    <input
                        id="phone"
                        type="tel"
                        inputMode="tel"
                        className={field}
                        value={values.phone}
                        onChange={(e) => set({ phone: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        autoComplete="tel"
                    />
                </Field>
            </div>

            <Field id="email" title="Email" required={values.isGuest} error={errors.email}>
                <input
                    id="email"
                    type="email"
                    className={field}
                    value={values.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder="you@example.com"
                    autoComplete="email"
                />
                <p className="mt-1.5 font-label text-[11px] text-ink/40">
                    Your order confirmation goes here.
                </p>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field id="district" title="District" required error={errors.district}>
                    <select
                        id="district"
                        className={field}
                        value={values.district}
                        onChange={(e) =>
                            // Changing district invalidates everything below it.
                            set({ district: e.target.value, upazila: "", courierBranch: "" })
                        }
                    >
                        <option value="">Select a district</option>
                        {districts.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field id="upazila" title="Area or thana" required error={errors.upazila}>
                    <select
                        id="upazila"
                        className={field}
                        value={values.upazila}
                        disabled={!values.district || loadingUpazilas}
                        onChange={(e) => set({ upazila: e.target.value })}
                    >
                        <option value="">
                            {!values.district
                                ? "Choose a district first"
                                : loadingUpazilas
                                  ? "Loading"
                                  : "Select an area"}
                        </option>
                        {upazilas.map((u) => (
                            <option key={u.name} value={u.name}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            {/* Only meaningful outside Dhaka; inside Dhaka the server offers
                Home Delivery only and the effect above pins it. */}
            {availableDeliveryTypes?.length > 1 && (
                <fieldset>
                    <legend className={label}>
                        Delivery method<span className="ml-1 text-coral">*</span>
                    </legend>
                    <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                        {availableDeliveryTypes.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => set({ deliveryType: type, courierBranch: "" })}
                                aria-pressed={values.deliveryType === type}
                                className={`border px-4 py-3 text-left text-sm transition-colors ${
                                    values.deliveryType === type
                                        ? "border-ink bg-ink text-paper"
                                        : "border-ink/20 text-ink hover:border-ink"
                                }`}
                            >
                                <span className="block font-medium">{type}</span>
                                <span
                                    className={`mt-0.5 block font-label text-[11px] ${
                                        values.deliveryType === type
                                            ? "text-paper/70"
                                            : "text-ink/45"
                                    }`}
                                >
                                    {type === "Courier"
                                        ? "Collect from a branch"
                                        : "Brought to your door"}
                                </span>
                            </button>
                        ))}
                    </div>
                    {errors.deliveryType && (
                        <p className="mt-1.5 text-[13px] text-coral">{errors.deliveryType}</p>
                    )}
                </fieldset>
            )}

            {isCourier && (
                <Field
                    id="courierBranch"
                    title="Courier branch"
                    required
                    error={errors.courierBranch}
                >
                    <select
                        id="courierBranch"
                        className={field}
                        value={values.courierBranch}
                        disabled={loadingBranches}
                        onChange={(e) => set({ courierBranch: e.target.value })}
                    >
                        <option value="">
                            {loadingBranches ? "Loading" : "Select a branch"}
                        </option>
                        {branches.map((branch) => (
                            <option key={branch} value={branch}>
                                {branch}
                            </option>
                        ))}
                    </select>
                    {!loadingBranches && branches.length === 0 && values.district && (
                        <p className="mt-1.5 text-[13px] text-coral">
                            No courier branches are listed for {values.district}. Please choose
                            home delivery.
                        </p>
                    )}
                </Field>
            )}

            {/* Street address is required for home delivery and for anywhere in
                Dhaka; for courier pickup the branch is the destination. */}
            {!isCourier && (
                <>
                    <Field
                        id="addressLine1"
                        title="Street address"
                        required
                        error={errors.addressLine1}
                    >
                        <input
                            id="addressLine1"
                            className={field}
                            value={values.addressLine1}
                            onChange={(e) => set({ addressLine1: e.target.value })}
                            placeholder="House, road, block"
                            autoComplete="address-line1"
                        />
                    </Field>

                    <Field id="addressLine2" title="Landmark (optional)">
                        <input
                            id="addressLine2"
                            className={field}
                            value={values.addressLine2}
                            onChange={(e) => set({ addressLine2: e.target.value })}
                            placeholder="Near the school, beside the pharmacy"
                            autoComplete="address-line2"
                        />
                    </Field>
                </>
            )}

            {locationType && (
                <p className="font-label text-[11px] uppercase tracking-[0.14em] text-ink/40">
                    Delivery zone:{" "}
                    {locationType === "dhaka_inside"
                        ? "Inside Dhaka"
                        : locationType === "dhaka_sub"
                          ? "Dhaka suburbs"
                          : "Outside Dhaka"}
                </p>
            )}
        </div>
    );
}
