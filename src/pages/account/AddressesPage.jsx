import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import toast from "react-hot-toast";

import Seo from "../../components/common/Seo";
import { useAddressBook } from "../../hooks/store/useAccount";

/**
 * /account/addresses
 *
 * ⚠️ SHAPE MISMATCH worth knowing about: User.shippingAddress and
 * Order.shippingAddress are DIFFERENT schemas designed separately.
 *
 *   User.shippingAddress:  fullName, phoneNumber, addressLine1, city, state,
 *                          zipCode, country, isDefault, addressType
 *   Order.shippingAddress: name, phone, addressLine1, district, upazila,
 *                          locationType, deliveryType, courierBranch
 *
 * There is no city/state in Bangladesh delivery terms, and no district/upazila
 * on the saved address, so a saved address cannot be dropped straight into
 * checkout. This page therefore stores what the User schema requires and treats
 * the book as a convenience record, not a checkout autofill source. Unifying
 * the two schemas is a backend change and is deliberately not faked here.
 */

const EMPTY = {
    fullName: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Bangladesh",
    addressType: "home",
    isDefault: false,
};

const field =
    "w-full border border-ink/20 bg-paper px-3.5 py-2.5 text-sm text-ink " +
    "placeholder:text-ink/30 focus:border-ink focus:outline-none";
const label = "block font-label text-[11px] uppercase tracking-[0.18em] text-ink/50";

export default function AddressesPage() {
    const { addresses, add, update, remove, isBusy } = useAddressBook();
    const [editing, setEditing] = useState(null); // null | "new" | addressId
    const [values, setValues] = useState(EMPTY);

    const startNew = () => {
        setValues(EMPTY);
        setEditing("new");
    };

    const startEdit = (address) => {
        setValues({ ...EMPTY, ...address });
        setEditing(address._id);
    };

    const set = (patch) => setValues((prev) => ({ ...prev, ...patch }));

    const submit = (e) => {
        e.preventDefault();

        const required = ["fullName", "phoneNumber", "addressLine1", "city", "state", "zipCode"];
        const missing = required.filter((key) => !String(values[key] ?? "").trim());
        if (missing.length > 0) {
            toast.error("Please fill in every required field.");
            return;
        }

        const done = () => {
            setEditing(null);
            toast.success(editing === "new" ? "Address added" : "Address updated");
        };

        if (editing === "new") {
            add.mutate(values, { onSuccess: done, onError: () => toast.error("Could not save that address.") });
        } else {
            update.mutate(
                { addressId: editing, address: values },
                { onSuccess: done, onError: () => toast.error("Could not update that address.") },
            );
        }
    };

    return (
        <>
            <Seo title="Your addresses | Elmate Stationery" noIndex />

            <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                    Addresses
                </h2>
                {editing === null && (
                    <button
                        type="button"
                        onClick={startNew}
                        className="inline-flex items-center gap-2 border border-ink/20 px-3.5 py-2
                                   font-label text-[11px] uppercase tracking-[0.16em] text-ink
                                   transition-colors hover:border-ink"
                    >
                        <Plus size={13} />
                        Add
                    </button>
                )}
            </div>

            <p className="mt-2.5 text-[13px] text-ink-soft">
                Kept for your reference. Delivery details are still confirmed at checkout, where
                district and area decide the shipping rate.
            </p>

            {editing !== null && (
                <form onSubmit={submit} className="mt-6 border border-line px-5 py-5">
                    <h3 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/55">
                        {editing === "new" ? "New address" : "Edit address"}
                    </h3>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="fullName" className={label}>
                                Full name <span className="text-coral">*</span>
                            </label>
                            <input
                                id="fullName"
                                className={`mt-2 ${field}`}
                                value={values.fullName}
                                onChange={(e) => set({ fullName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className={label}>
                                Phone <span className="text-coral">*</span>
                            </label>
                            <input
                                id="phoneNumber"
                                type="tel"
                                className={`mt-2 ${field}`}
                                value={values.phoneNumber}
                                onChange={(e) => set({ phoneNumber: e.target.value })}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="addressLine1" className={label}>
                                Address <span className="text-coral">*</span>
                            </label>
                            <input
                                id="addressLine1"
                                className={`mt-2 ${field}`}
                                value={values.addressLine1}
                                onChange={(e) => set({ addressLine1: e.target.value })}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="addressLine2" className={label}>
                                Landmark (optional)
                            </label>
                            <input
                                id="addressLine2"
                                className={`mt-2 ${field}`}
                                value={values.addressLine2}
                                onChange={(e) => set({ addressLine2: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="city" className={label}>
                                City or area <span className="text-coral">*</span>
                            </label>
                            <input
                                id="city"
                                className={`mt-2 ${field}`}
                                value={values.city}
                                onChange={(e) => set({ city: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="state" className={label}>
                                District <span className="text-coral">*</span>
                            </label>
                            <input
                                id="state"
                                className={`mt-2 ${field}`}
                                value={values.state}
                                onChange={(e) => set({ state: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="zipCode" className={label}>
                                Postcode <span className="text-coral">*</span>
                            </label>
                            <input
                                id="zipCode"
                                className={`mt-2 ${field}`}
                                value={values.zipCode}
                                onChange={(e) => set({ zipCode: e.target.value })}
                            />
                        </div>
                        <div>
                            <label htmlFor="addressType" className={label}>
                                Label
                            </label>
                            <select
                                id="addressType"
                                className={`mt-2 ${field}`}
                                value={values.addressType}
                                onChange={(e) => set({ addressType: e.target.value })}
                            >
                                <option value="home">Home</option>
                                <option value="office">Office</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
                        <input
                            type="checkbox"
                            checked={values.isDefault}
                            onChange={(e) => set({ isDefault: e.target.checked })}
                            className="h-3.5 w-3.5 appearance-none border border-ink/30 bg-paper
                                       checked:border-ink checked:bg-ink"
                        />
                        Use as my default address
                    </label>

                    <div className="mt-6 flex gap-2.5">
                        <button
                            type="submit"
                            disabled={isBusy}
                            className="border border-ink bg-ink px-5 py-2.5 font-label text-[11px]
                                       uppercase tracking-[0.16em] text-paper transition-colors
                                       hover:bg-transparent hover:text-ink disabled:opacity-50"
                        >
                            {isBusy ? "Saving" : "Save address"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="border border-ink/20 px-5 py-2.5 font-label text-[11px]
                                       uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {addresses.length === 0 && editing === null ? (
                <div className="mt-6 border border-line px-5 py-10 text-center">
                    <p className="font-display text-lg text-ink">No addresses saved</p>
                    <p className="mt-2 text-sm text-ink-soft">
                        Save one to keep your details handy.
                    </p>
                </div>
            ) : (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {addresses.map((address) => (
                        <li
                            key={address._id}
                            className="relative border border-line px-5 py-4"
                        >
                            {address.isDefault && (
                                <span className="font-label text-[10px] uppercase tracking-[0.16em] text-grass">
                                    Default
                                </span>
                            )}

                            <p className="mt-1 text-sm font-medium text-ink">{address.fullName}</p>
                            <address className="mt-1.5 text-[13px] not-italic leading-relaxed text-ink-soft">
                                {address.addressLine1}
                                {address.addressLine2 && <>, {address.addressLine2}</>}
                                <br />
                                {[address.city, address.state, address.zipCode]
                                    .filter(Boolean)
                                    .join(", ")}
                                <br />
                                {address.phoneNumber}
                            </address>

                            <div className="mt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => startEdit(address)}
                                    className="inline-flex items-center gap-1.5 font-label text-[11px]
                                               uppercase tracking-[0.14em] text-ink/55 transition-colors hover:text-ink"
                                >
                                    <Pencil size={12} />
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        remove.mutate(address._id, {
                                            onSuccess: () => toast.success("Address removed"),
                                        })
                                    }
                                    className="inline-flex items-center gap-1.5 font-label text-[11px]
                                               uppercase tracking-[0.14em] text-ink/55 transition-colors hover:text-coral"
                                >
                                    <Trash2 size={12} />
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
