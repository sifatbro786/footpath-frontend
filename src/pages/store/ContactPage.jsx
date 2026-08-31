import { Link } from "react-router-dom";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

import Seo from "../../components/common/Seo";
import Eyebrow from "../../components/store/ui/Eyebrow";
import Breadcrumbs from "../../components/store/ui/Breadcrumbs";

/**
 * /contact
 *
 * Deliberately NOT a contact form.
 *
 * There is no contact-submission endpoint on the backend and no model to store
 * a message in. A form that posts nowhere, or that silently opens a mail client
 * some people do not have configured, is worse than none: it looks like the
 * message was sent. So this page gives real channels that work today, and the
 * order-specific route people actually need most.
 *
 * Adding a real form means a ContactMessage model, an admin inbox and spam
 * protection. Worth doing, but it is a feature, not a page.
 */

const CHANNELS = [
    {
        icon: Mail,
        label: "Email",
        value: "hello@elmate.com.bd",
        href: "mailto:hello@elmate.com.bd",
        note: "Answered within one working day.",
    },
    {
        icon: Phone,
        label: "Phone and WhatsApp",
        value: "+880 1700 000000",
        href: "tel:+8801700000000",
        note: "Saturday to Thursday, 10am to 7pm.",
    },
];

export default function ContactPage() {
    return (
        <>
            <Seo
                slug="contact"
                fallbackTitle="Contact Elmate Stationery"
                fallbackDescription="Get in touch about an order, a product question, or a bulk enquiry."
            />

            <div className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:pt-10">
                <Breadcrumbs items={[{ label: "Contact", href: "/contact" }]} className="mb-7" />

                <header className="max-w-2xl">
                    <Eyebrow>Get in touch</Eyebrow>
                    <h1 className="mt-3.5 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                        Talk to a person
                    </h1>
                    <p className="mt-5 text-[15px] leading-relaxed text-ink-soft">
                        Whether it is a question about paper weight or a delivery that has not
                        turned up, we would rather hear from you than have you guess.
                    </p>
                </header>

                {/* Order questions dominate the inbox, so answer that first. */}
                <section className="mt-10 border-l-2 border-marigold bg-paper-dim px-5 py-5">
                    <h2 className="font-display text-lg font-semibold text-ink">
                        Asking about an order?
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                        You can see its progress yourself with the order number and the phone
                        number you used. That is usually faster than waiting for a reply.
                    </p>
                    <Link
                        to="/order/track"
                        className="mt-4 inline-block border border-ink bg-ink px-5 py-2.5 font-label
                                   text-[11px] uppercase tracking-[0.18em] text-paper
                                   transition-colors hover:bg-transparent hover:text-ink"
                    >
                        Track your order
                    </Link>
                </section>

                <section className="mt-12 grid gap-8 border-t border-line pt-12 sm:grid-cols-2">
                    {CHANNELS.map((channel) => (
                        <div key={channel.label}>
                            <div className="flex items-center gap-2.5">
                                <channel.icon size={15} className="text-ink/45" aria-hidden="true" />
                                <h2 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/50">
                                    {channel.label}
                                </h2>
                            </div>
                            <a
                                href={channel.href}
                                className="mt-2.5 block font-display text-lg font-semibold text-ink underline underline-offset-4 transition-colors hover:text-brand"
                            >
                                {channel.value}
                            </a>
                            <p className="mt-1.5 text-[13.5px] text-ink-soft">{channel.note}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-12 grid gap-8 border-t border-line pt-12 sm:grid-cols-2">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <MapPin size={15} className="text-ink/45" aria-hidden="true" />
                            <h2 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/50">
                                Where we are
                            </h2>
                        </div>
                        <address className="mt-2.5 text-[14px] not-italic leading-relaxed text-ink-soft">
                            Dhaka, Bangladesh
                            <span className="mt-1 block text-ink/50">
                                Online only for now. Delivery nationwide.
                            </span>
                        </address>
                    </div>

                    <div>
                        <div className="flex items-center gap-2.5">
                            <Clock size={15} className="text-ink/45" aria-hidden="true" />
                            <h2 className="font-label text-[11px] uppercase tracking-[0.18em] text-ink/50">
                                Dispatch
                            </h2>
                        </div>
                        <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                            Inside Dhaka, one to two days. Elsewhere, two to five depending on
                            courier or home delivery.
                        </p>
                    </div>
                </section>

                <section className="mt-12 border-t border-line pt-12">
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                        Buying in bulk
                    </h2>
                    <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                        Schools, studios and offices ordering in quantity should email us directly.
                        We quote separately for larger runs rather than sending you through
                        checkout.
                    </p>
                </section>
            </div>
        </>
    );
}
