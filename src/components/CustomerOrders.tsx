"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { useLanguage } from "@/context/LanguageContext";
import { formatCurrency } from "@/lib/currency";
import type { MessageKey } from "@/lib/i18n";
import type { CustomerOrder, SavedOrderReference } from "@/types/catalog";

const statusKeys: Record<CustomerOrder["status"], MessageKey> = {
  pending: "statusPending",
  confirmed: "statusConfirmed",
  preparing: "statusPreparing",
  ready: "statusReady",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

const statusClasses: Record<CustomerOrder["status"], string> = {
  pending: "bg-[#fff5d6] text-[#8a5b00]",
  confirmed: "bg-[#e8f1ff] text-[#1859a9]",
  preparing: "bg-[#f1eaff] text-[#6d3eb3]",
  ready: "bg-[#e7f8f0] text-[#18724b]",
  completed: "bg-[#e7f6ea] text-[#26733d]",
  cancelled: "bg-[#fff0ef] text-[#b42318]",
};

const localeByLanguage = {
  vi: "vi-VN",
  en: "en-US",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
} as const;

export function CustomerOrders({ references }: { references: SavedOrderReference[] }) {
  const { language, t } = useLanguage();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(references.length > 0);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (references.length === 0) return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      setHasError(false);

      void Promise.allSettled(references.map(async (reference) => {
        const params = new URLSearchParams({ phone: reference.customerPhone });
        const response = await fetch(
          `/api/orders/${encodeURIComponent(reference.orderCode)}?${params}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) throw new Error("ORDER_LOOKUP_FAILED");
        return response.json() as Promise<CustomerOrder>;
      })).then((results) => {
        if (controller.signal.aborted) return;
        const loadedOrders = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
        setOrders(loadedOrders.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)));
        setHasError(results.some((result) => result.status === "rejected"));
      }).finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [references, reloadKey]);

  if (references.length === 0) {
    return (
      <section className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[#f3f5f7] px-8 text-center text-[#93999f]">
        <p className="text-[clamp(14px,3.5vw,24px)]">{t("noOrders")}</p>
      </section>
    );
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-[#f3f5f7] px-3 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-[#232323] md:text-lg">{t("deviceOrders")}</h2>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setReloadKey((value) => value + 1)}
            className="flex items-center gap-2 rounded-lg border border-[#d5dadd] bg-white px-3 py-2 text-sm font-semibold text-[#4d555d] disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("refreshOrders")}
          </button>
        </div>

        {isLoading && orders.length === 0 ? <p className="py-10 text-center text-sm text-[#7b8389]">{t("loadingOrders")}</p> : null}
        {hasError ? <p role="alert" className="mt-4 rounded-xl bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318]">{t("orderLookupFailed")}</p> : null}

        <div className={`mt-4 grid gap-3 ${isLoading ? "opacity-60" : ""}`}>
          {orders.map((order) => (
            <article key={order.orderCode} className="rounded-xl border border-[#dfe3e6] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#7b8389]">{t("orderCode")}</p>
                  <h3 className="font-bold text-[#232323]">#{order.orderCode}</h3>
                  <p className="mt-1 text-xs text-[#7b8389]">
                    {new Intl.DateTimeFormat(localeByLanguage[language], { dateStyle: "short", timeStyle: "short" }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#7b8389]">{t("orderStatus")}</p>
                  <p className={`mt-1 rounded-md px-2 py-1 text-sm font-bold ${statusClasses[order.status]}`}>{t(statusKeys[order.status])}</p>
                </div>
              </div>
              <div className="mt-4 divide-y divide-[#edf0f2] border-t border-[#edf0f2]">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4 py-2.5 text-sm">
                    <p className="min-w-0 text-[#343a40]">{item.productName} <span className="text-[#7b8389]">× {item.quantity}</span></p>
                    <p className="shrink-0 font-semibold text-[#343a40]">{formatCurrency(item.lineTotal, order.currencyCode, language)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end border-t border-[#dfe3e6] pt-3 font-bold text-[#fb4f45]">{formatCurrency(order.total, order.currencyCode, language)}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
