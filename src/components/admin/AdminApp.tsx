"use client";

import Image from "next/image";
import {
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  Download,
  ImagePlus,
  Layers3,
  LogOut,
  Package,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { languageOptions } from "@/lib/i18n";
import { formatCurrency } from "@/lib/currency";
import type {
  AdminCategory,
  AdminData,
  AdminOrder,
  AdminOrderEmailLog,
  AdminOrdersResponse,
  AdminProduct,
  AdminReferralCode,
  AdminReferralsResponse,
  AdminTranslations,
  FulfillmentMode,
  OrderStatus,
} from "@/types/admin";
import type { LanguageCode, SiteContent, StorefrontData } from "@/types/catalog";

const inputClass = "w-full rounded-lg border border-[#ccd1d5] bg-white px-3 py-2.5 text-sm text-[#232323] outline-none transition focus:border-[#d79a00] focus:ring-2 focus:ring-[#fdbc24]/25 placeholder:text-[#777f86]";
const labelClass = "grid gap-2 text-sm font-semibold text-[#343a40]";
const adminLanguageOptions = languageOptions.map((option) => ({
  ...option,
  label: option.code === "vi" ? "越南语" : option.code === "en" ? "英语" : option.code === "zh-Hans" ? "简体中文" : "繁体中文",
}));

function emptyTranslations(): AdminTranslations {
  return Object.fromEntries(languageOptions.map(({ code }) => [code, { name: "", description: "" }])) as AdminTranslations;
}

function mergeTranslations(value?: AdminTranslations): AdminTranslations {
  const empty = emptyTranslations();
  for (const { code } of languageOptions) {
    empty[code] = { ...empty[code], ...value?.[code], name: value?.[code]?.name ?? "" };
  }
  return empty;
}

async function jsonRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "REQUEST_FAILED" })) as { error?: string };
    throw new Error(payload.error ?? "REQUEST_FAILED");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function LoginScreen({ onSuccess, site }: { onSuccess: () => void; site: SiteContent | null }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await jsonRequest("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      onSuccess();
    } catch (requestError) {
      setError(requestError instanceof Error && requestError.message === "TOO_MANY_ATTEMPTS"
        ? "登录尝试次数过多，请稍后再试。"
        : "用户名或密码不正确。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center overflow-y-auto bg-[#eef1f3] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(20,29,39,.12)] sm:p-8">
        <div className="flex items-center gap-4">
          {site?.logoUrl ? <Image src={site.logoUrl} alt={site.name} width={64} height={64} className="size-16 rounded-xl object-cover" /> : <div className="grid size-16 place-items-center rounded-xl bg-[#fdbc24]/20"><Store className="size-7 text-[#9b6a00]" /></div>}
          <div>
            <h1 className="text-2xl font-bold text-[#20252b]">{site?.name ?? "商店"}管理后台</h1>
            <p className="mt-1 text-sm text-[#687078]">登录以管理商店</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          <label className={labelClass}>
            用户名
            <input className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label className={labelClass}>
            密码
            <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          {error ? <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-sm text-[#b42318]">{error}</p> : null}
          <button disabled={isSubmitting} className="rounded-lg bg-[#fdbc24] px-4 py-3 font-bold text-[#20252b] transition hover:bg-[#efae14] active:translate-y-px disabled:opacity-60">
            {isSubmitting ? "正在登录..." : "登录"}
          </button>
        </form>
      </section>
    </main>
  );
}

interface ProductDraft {
  categoryId: string;
  sku: string;
  price: string;
  soldOut: boolean;
  active: boolean;
  sortOrder: string;
  translations: AdminTranslations;
}

function ProductEditor({
  product,
  categories,
  currencyCode,
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  currencyCode: string;
  onClose: () => void;
  onSaved: (data: AdminData) => void;
}) {
  const [language, setLanguage] = useState<LanguageCode>("vi");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>({
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    sku: product?.sku ?? "",
    price: product ? String(product.price) : "",
    soldOut: product?.soldOut ?? false,
    active: product?.active ?? true,
    sortOrder: String(product?.sortOrder ?? 0),
    translations: mergeTranslations(product?.translations),
  });

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  function updateTranslation(field: "name" | "description", value: string) {
    setDraft((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [language]: { ...current.translations[language], [field]: value },
      },
    }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const form = new FormData();
      form.append("data", JSON.stringify({ ...draft, price: Number(draft.price), sortOrder: Number(draft.sortOrder) }));
      if (image) form.append("image", image);
      const data = await jsonRequest<AdminData>(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        { method: product ? "PUT" : "POST", body: form },
      );
      onSaved(data);
    } catch (requestError) {
      const code = requestError instanceof Error ? requestError.message : "REQUEST_FAILED";
      setError(code === "DUPLICATE_VALUE" ? "SKU 已存在。" : "无法保存商品，请检查必填字段。");
    } finally {
      setIsSaving(false);
    }
  }

  const translation = draft.translations[language] ?? { name: "", description: "" };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#eef1f3]">
      <form onSubmit={save} className="mx-auto min-h-dvh max-w-6xl bg-white lg:my-6 lg:min-h-0 lg:rounded-2xl lg:shadow-xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e5e8] bg-white px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold text-[#20252b]">{product ? "编辑商品" : "添加商品"}</h2>
            <p className="mt-1 text-xs text-[#707880]">越南语名称为必填项，其他语言留空时将使用越南语内容。</p>
          </div>
          <button type="button" onClick={onClose} aria-label="关闭" className="grid size-10 place-items-center rounded-lg text-[#596168] hover:bg-[#f0f2f3]"><X /></button>
        </header>

        <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-[320px_1fr]">
          <aside className="grid content-start gap-5">
            <div className="overflow-hidden rounded-xl border border-[#dfe3e6] bg-[#f7f8f9]">
              {product?.imageUrl ? <Image src={product.imageUrl} alt="商品图片" width={640} height={640} className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center text-[#8a9299]"><ImagePlus className="size-10" /></div>}
            </div>
            <label className={labelClass}>
              商品图片
              <span className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#aeb5bb] px-4 py-3 text-sm font-semibold text-[#3f474e] hover:border-[#d79a00]">
                <ImagePlus className="size-4" /> {image ? image.name : "选择图片"}
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
              </span>
              <span className="text-xs font-normal text-[#6e767d]">最大 12MB，服务器会自动旋转、缩放并压缩为 WebP。</span>
            </label>
            <label className={labelClass}>分类
              <select className={inputClass} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} required>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.translations["zh-Hans"]?.name || category.translations.vi?.name || category.slug}{category.active ? "" : "（已隐藏）"}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>价格（{currencyCode}）
                <input className={inputClass} type="number" min="0" step="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} required />
              </label>
              <label className={labelClass}>排序
                <input className={inputClass} type="number" min="0" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })} />
              </label>
            </div>
            <label className={labelClass}>SKU
              <input className={inputClass} value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-[#343a40]"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} className="size-4 accent-[#d79a00]" /> 正在显示</label>
            <label className="flex items-center gap-3 text-sm font-semibold text-[#343a40]"><input type="checkbox" checked={draft.soldOut} onChange={(event) => setDraft({ ...draft, soldOut: event.target.checked })} className="size-4 accent-[#d79a00]" /> 已售罄</label>
          </aside>

          <section>
            <div className="flex overflow-x-auto border-b border-[#dfe3e6]">
              {adminLanguageOptions.map((option) => <button key={option.code} type="button" onClick={() => setLanguage(option.code)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${language === option.code ? "border-[#d79a00] text-[#a36f00]" : "border-transparent text-[#687078]"}`}>{option.label}</button>)}
            </div>
            <div className="mt-6 grid gap-5">
              <label className={labelClass}>商品名称 {language === "vi" ? "*" : ""}
                <input className={inputClass} value={translation.name ?? ""} onChange={(event) => updateTranslation("name", event.target.value)} required={language === "vi"} />
              </label>
              <label className={labelClass}>商品描述
                <textarea className={`${inputClass} min-h-40 resize-y`} value={translation.description ?? ""} onChange={(event) => updateTranslation("description", event.target.value)} />
              </label>
            </div>
          </section>
        </div>

        {error ? <p role="alert" className="mx-4 mb-4 rounded-lg bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318] sm:mx-6">{error}</p> : null}
        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e2e5e8] bg-white px-4 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#cdd2d6] px-4 py-2.5 font-semibold text-[#454d54] hover:bg-[#f3f5f6]">取消</button>
          <button disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-[#fdbc24] px-5 py-2.5 font-bold text-[#20252b] hover:bg-[#efae14] active:translate-y-px disabled:opacity-60"><Save className="size-4" /> {isSaving ? "正在保存..." : "保存商品"}</button>
        </footer>
      </form>
    </div>
  );
}

function ProductsPanel({ data, onChange }: { data: AdminData; onChange: (data: AdminData) => void }) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminProduct | null | undefined>(undefined);
  const [error, setError] = useState("");
  const products = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return data.products;
    return data.products.filter((product) => `${product.translations["zh-Hans"]?.name ?? ""} ${product.translations.vi?.name ?? ""} ${product.sku}`.toLocaleLowerCase().includes(normalized));
  }, [data.products, query]);
  const categoryNames = new Map(data.categories.map((category) => [category.id, category.translations["zh-Hans"]?.name || category.translations.vi?.name || category.slug]));

  async function remove(product: AdminProduct) {
    if (!window.confirm(`确定删除商品“${product.translations["zh-Hans"]?.name || product.translations.vi?.name || product.slug}”吗？该商品的 R2 图片也会被删除。`)) return;
    setError("");
    try {
      await jsonRequest(`/api/admin/products/${product.id}`, { method: "DELETE" });
      onChange({ ...data, products: data.products.filter((item) => item.id !== product.id) });
    } catch {
      setError("无法删除商品。");
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20252b]">商品</h1>
          <p className="mt-1 text-sm text-[#687078]">店内共有 {data.products.length} 件商品</p>
        </div>
        <button onClick={() => setEditing(null)} className="flex items-center justify-center gap-2 rounded-lg bg-[#fdbc24] px-4 py-3 font-bold text-[#20252b] hover:bg-[#efae14] active:translate-y-px"><Plus className="size-4" /> 添加商品</button>
      </div>
      <input className={`${inputClass} mt-6 max-w-md`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="按名称或 SKU 搜索" aria-label="搜索商品" />
      {error ? <p role="alert" className="mt-4 rounded-lg bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}

      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#cbd1d5] bg-white px-6 py-14 text-center text-[#697179]">没有符合条件的商品。</div>
      ) : (
        <div className="mt-6 grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="grid gap-4 rounded-xl border border-[#dfe3e6] bg-white p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
              {product.imageUrl ? <Image src={product.imageUrl} alt="" width={72} height={72} className="size-[72px] rounded-lg object-cover" /> : <div className="grid size-[72px] place-items-center rounded-lg bg-[#f0f2f3]"><Package className="text-[#8a9299]" /></div>}
              <div className="min-w-0">
                <h2 className="truncate font-bold text-[#252b30]">{product.translations["zh-Hans"]?.name || product.translations.vi?.name || product.slug}</h2>
                <p className="mt-1 text-sm text-[#687078]">{categoryNames.get(product.categoryId)} · {formatCurrency(product.price, data.site.currencyCode, "zh-Hans")}</p>
                {product.sku ? <p className="mt-1 text-xs text-[#8a9299]">SKU {product.sku}</p> : null}
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={`rounded-md px-2 py-1 ${product.active ? "bg-[#ecf8ef] text-[#26733d]" : "bg-[#f0f2f3] text-[#687078]"}`}>{product.active ? "正在显示" : "已隐藏"}</span>
                  {product.soldOut ? <span className="rounded-md bg-[#fff0ef] px-2 py-1 text-[#b42318]">已售罄</span> : null}
                </div>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <button onClick={() => setEditing(product)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#cfd4d8] px-3 py-2 text-sm font-semibold text-[#3e464d] hover:bg-[#f3f5f6] sm:flex-none"><Pencil className="size-4" /> 编辑</button>
                <button onClick={() => void remove(product)} className="grid size-10 place-items-center rounded-lg border border-[#efc6c2] text-[#b42318] hover:bg-[#fff0ef]" aria-label={`删除 ${product.translations["zh-Hans"]?.name || product.translations.vi?.name || product.slug}`}><Trash2 className="size-4" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing !== undefined ? <ProductEditor product={editing} categories={data.categories} currencyCode={data.site.currencyCode} onClose={() => setEditing(undefined)} onSaved={(next) => { onChange(next); setEditing(undefined); }} /> : null}
    </section>
  );
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "待确认",
  confirmed: "已确认",
  preparing: "准备中",
  ready: "可取货",
  completed: "已完成",
  cancelled: "已取消",
};

const orderStatusClasses: Record<OrderStatus, string> = {
  pending: "bg-[#fff5d6] text-[#8a5b00]",
  confirmed: "bg-[#e8f1ff] text-[#1859a9]",
  preparing: "bg-[#f1eaff] text-[#6d3eb3]",
  ready: "bg-[#e7f8f0] text-[#18724b]",
  completed: "bg-[#e7f6ea] text-[#26733d]",
  cancelled: "bg-[#fff0ef] text-[#b42318]",
};

function formatMoney(value: number, currencyCode: string) {
  return formatCurrency(value, currencyCode, "zh-Hans");
}

function formatOrderTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

const emailStatusLabels: Record<AdminOrderEmailLog["status"], string> = {
  pending: "等待发送",
  sent: "Resend 已接受",
  failed: "发送失败",
};

const emailStatusClasses: Record<AdminOrderEmailLog["status"], string> = {
  pending: "bg-[#fff5d6] text-[#8a5b00]",
  sent: "bg-[#e7f6ea] text-[#26733d]",
  failed: "bg-[#fff0ef] text-[#b42318]",
};

function EmailLogCard({ log, timezone }: { log: AdminOrderEmailLog; timezone: string }) {
  const latestEvent = log.events[0];
  return (
    <article className="rounded-lg border border-[#dfe3e6] bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-[#30363b]">{log.subject}</p>
        <span className={`rounded-md px-2 py-1 text-xs font-bold ${emailStatusClasses[log.status]}`}>{emailStatusLabels[log.status]}</span>
      </div>
      <dl className="mt-3 grid gap-1 text-sm text-[#596168]">
        <div><dt className="inline font-semibold text-[#30363b]">收件人：</dt><dd className="inline">{log.recipient}</dd></div>
        <div><dt className="inline font-semibold text-[#30363b]">发件人：</dt><dd className="inline">{log.sender}</dd></div>
        <div><dt className="inline font-semibold text-[#30363b]">创建时间：</dt><dd className="inline">{formatOrderTime(log.createdAt, timezone)}</dd></div>
        {log.sentAt ? <div><dt className="inline font-semibold text-[#30363b]">发送时间：</dt><dd className="inline">{formatOrderTime(log.sentAt, timezone)}</dd></div> : null}
        {log.providerMessageId ? <div><dt className="inline font-semibold text-[#30363b]">Resend 邮件 ID：</dt><dd className="inline break-all">{log.providerMessageId}</dd></div> : null}
        {latestEvent ? <div><dt className="inline font-semibold text-[#30363b]">最新投递事件：</dt><dd className="inline">{latestEvent.eventType}</dd></div> : null}
        {log.errorMessage ? <div className="mt-2 rounded-md bg-[#fff0ef] px-3 py-2 text-[#b42318]"><dt className="inline font-semibold">错误：</dt><dd className="inline">{log.errorMessage}</dd></div> : null}
      </dl>
      <details className="mt-3 rounded-md border border-[#e2e5e8] bg-[#f8f9fa] p-3">
        <summary className="cursor-pointer text-sm font-semibold">查看完整邮件内容</summary>
        <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-[#434b52]">{log.textBody}</pre>
      </details>
      <details className="mt-2 rounded-md border border-[#e2e5e8] bg-[#f8f9fa] p-3">
        <summary className="cursor-pointer text-sm font-semibold">查看 HTML 源码</summary>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[#434b52]">{log.htmlBody}</pre>
      </details>
      {log.providerResponse ? (
        <details className="mt-2 rounded-md border border-[#e2e5e8] bg-[#f8f9fa] p-3">
          <summary className="cursor-pointer text-sm font-semibold">查看 Resend 完整响应</summary>
          <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-[#434b52]">{log.providerResponse}</pre>
        </details>
      ) : null}
      {log.events.length > 0 ? (
        <details className="mt-2 rounded-md border border-[#e2e5e8] bg-[#f8f9fa] p-3">
          <summary className="cursor-pointer text-sm font-semibold">查看全部投递事件（{log.events.length}）</summary>
          <div className="mt-3 grid gap-3">
            {log.events.map((event) => (
              <div key={event.id} className="rounded border border-[#dfe3e6] bg-white p-3">
                <p className="text-xs font-bold text-[#30363b]">{event.eventType} · {formatOrderTime(event.occurredAt || event.createdAt, timezone)}</p>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[#596168]">{event.payload}</pre>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}

function OrderCard({
  order,
  timezone,
  onStatusUpdated,
}: {
  order: AdminOrder;
  timezone: string;
  onStatusUpdated: (orderId: string, status: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [nextStatus, setNextStatus] = useState<OrderStatus>(order.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const isDelivery = order.fulfillmentMode === "delivery";

  useEffect(() => {
    setNextStatus(order.status);
  }, [order.status]);

  async function updateStatus() {
    setIsUpdatingStatus(true);
    setStatusMessage("");
    try {
      const result = await jsonRequest<{ id: string; status: OrderStatus }>(
        `/api/admin/orders/${order.id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      onStatusUpdated(result.id, result.status);
      setStatusMessage("订单状态已更新。");
    } catch {
      setStatusMessage("无法更新订单状态。");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-[#dfe3e6] bg-white">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="grid w-full gap-4 p-4 text-left hover:bg-[#fafbfb] sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold text-[#20252b]">#{order.orderCode}</h2>
            <span className={`rounded-md px-2 py-1 text-xs font-bold ${isDelivery ? "bg-[#eaf2ff] text-[#1d5ea8]" : "bg-[#fff4d5] text-[#8a5b00]"}`}>
              {isDelivery ? "配送" : "到店自取"}
            </span>
            <span className={`rounded-md px-2 py-1 text-xs font-bold ${orderStatusClasses[order.status]}`}>
              {orderStatusLabels[order.status]}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#343a40]">{order.customerName} · {order.customerPhone}</p>
          <p className="mt-1 text-xs text-[#7a8289]">{formatOrderTime(order.createdAt, timezone)} · {order.items.length} 件商品</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <strong className="text-base text-[#20252b]">{formatMoney(order.total, order.currencyCode)}</strong>
          <ChevronDown className={`size-5 text-[#687078] transition ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-[#e5e8ea] bg-[#fbfcfc] p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
            <section className="rounded-lg border border-[#e1e5e8] bg-white p-4">
              <h3 className="text-sm font-bold text-[#2a3035]">收货信息</h3>
              <div className="mt-3 grid gap-2 text-sm text-[#535c63]">
                <p><span className="font-semibold text-[#30363b]">客户：</span> {order.customerName}</p>
                <p><span className="font-semibold text-[#30363b]">电话：</span> <a href={`tel:${order.customerPhone}`} className="text-[#1859a9] hover:underline">{order.customerPhone}</a></p>
                <div className="flex items-start gap-2">
                  {isDelivery ? <Truck className="mt-0.5 size-4 shrink-0" /> : <Store className="mt-0.5 size-4 shrink-0" />}
                  <p>{isDelivery ? order.deliveryAddress : "客户到店自取"}</p>
                </div>
                {order.customerNote ? <p className="rounded-md bg-[#fff8e7] px-3 py-2"><span className="font-semibold">备注：</span> {order.customerNote}</p> : null}
                {order.referralCode ? (
                  <div className="rounded-md bg-[#eef7ee] p-2.5 text-xs text-[#206332]">
                    <p className="font-bold">🏷️ 推荐码：{order.referralCode}</p>
                    <p className="mt-0.5">
                      优惠：{formatMoney(order.referralDiscountAmount, order.currencyCode)} | 佣金：{formatMoney(order.referralCommission, order.currencyCode)}
                      {order.status === "completed" ? " (已结算)" : " (待订单完成)"}
                    </p>
                  </div>
                ) : null}
                <p className="text-xs text-[#7a8289]">下单语言：{order.languageCode}</p>
              </div>
            </section>

            <section className="rounded-lg border border-[#e1e5e8] bg-white p-4">
              <h3 className="text-sm font-bold text-[#2a3035]">商品</h3>
              <div className="mt-3 divide-y divide-[#edf0f2]">
                {order.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#343a40]">{item.productName}</p>
                      <p className="mt-1 text-xs text-[#747c83]">{formatMoney(item.unitPrice, order.currencyCode)} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-[#30363b]">{formatMoney(item.lineTotal, order.currencyCode)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-[#dfe3e6] pt-4">
                {order.referralDiscountAmount > 0 ? (
                  <div className="mb-2 space-y-1 text-xs text-[#687078]">
                    <div className="flex justify-between">
                      <span>商品小计</span>
                      <span>{formatMoney(order.subtotal, order.currencyCode)}</span>
                    </div>
                    <div className="flex justify-between text-[#d9382e]">
                      <span>推荐码优惠 ({order.referralCode})</span>
                      <span>-{formatMoney(order.referralDiscountAmount, order.currencyCode)}</span>
                    </div>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#30363b]">合计</span>
                  <strong className="text-lg text-[#20252b]">{formatMoney(order.total, order.currencyCode)}</strong>
                </div>
              </div>
            </section>
          </div>
          <div className="mt-4 grid gap-3 rounded-lg border border-[#dfe3e6] bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className={labelClass}>订单状态
              <select className={inputClass} value={nextStatus} onChange={(event) => { setNextStatus(event.target.value as OrderStatus); setStatusMessage(""); }}>
                {(Object.entries(orderStatusLabels) as [OrderStatus, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <button type="button" disabled={isUpdatingStatus || nextStatus === order.status} onClick={() => void updateStatus()} className="flex items-center justify-center gap-2 rounded-lg bg-[#fdbc24] px-5 py-2.5 text-sm font-bold text-[#20252b] hover:bg-[#efae14] disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="size-4" /> {isUpdatingStatus ? "正在更新..." : "更新状态"}
            </button>
            {statusMessage ? <p role="status" className={`text-sm sm:col-span-2 ${statusMessage.startsWith("订单") ? "text-[#26733d]" : "text-[#b42318]"}`}>{statusMessage}</p> : null}
          </div>
          <section className="mt-4">
            <h3 className="text-sm font-bold text-[#2a3035]">邮件通知记录</h3>
            {order.emailLogs.length > 0 ? (
              <div className="mt-3 grid gap-3">{order.emailLogs.map((log) => <EmailLogCard key={log.id} log={log} timezone={timezone} />)}</div>
            ) : (
              <p className="mt-2 text-sm text-[#7a8289]">此订单没有邮件发送记录。</p>
            )}
          </section>
        </div>
      ) : null}
    </article>
  );
}

function OrdersPanel({ timezone }: { timezone: string }) {
  const [ordersData, setOrdersData] = useState<AdminOrdersResponse | null>(null);
  const [query, setQuery] = useState("");
  const [fulfillmentMode, setFulfillmentMode] = useState<"" | FulfillmentMode>("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page) });
      if (query.trim()) params.set("search", query.trim());
      if (fulfillmentMode) params.set("fulfillmentMode", fulfillmentMode);
      try {
        const next = await jsonRequest<AdminOrdersResponse>(`/api/admin/orders?${params}`, { signal: controller.signal });
        setOrdersData(next);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError("无法加载订单列表。");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [fulfillmentMode, page, query, reloadKey]);

  function changeMode(mode: "" | FulfillmentMode) {
    setFulfillmentMode(mode);
    setPage(1);
  }

  function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrdersData((current) => current ? {
      ...current,
      orders: current.orders.map((order) => order.id === orderId ? { ...order, status } : order),
    } : current);
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20252b]">订单管理</h1>
          <p className="mt-1 text-sm text-[#687078]">查看配送订单和到店自取订单。</p>
        </div>
        <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="flex items-center justify-center gap-2 rounded-lg border border-[#cfd4d8] bg-white px-4 py-2.5 text-sm font-bold text-[#3e464d] hover:bg-[#f7f8f9]">
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /> 刷新
        </button>
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-[#dfe3e6] bg-white p-4 sm:grid-cols-[1fr_auto]">
        <label className={labelClass}>搜索订单
          <input className={inputClass} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="订单号、客户姓名或电话号码" />
        </label>
        <div className="flex flex-wrap items-end gap-2" aria-label="按收货方式筛选">
          {([{"value":"","label":"全部"},{"value":"delivery","label":"配送"},{"value":"pickup","label":"到店自取"}] as const).map((option) => (
            <button key={option.value || "all"} type="button" onClick={() => changeMode(option.value)} className={`rounded-lg px-4 py-2.5 text-sm font-bold ${fulfillmentMode === option.value ? "bg-[#fdbc24] text-[#20252b]" : "bg-[#eef1f3] text-[#505960] hover:bg-[#e3e7e9]"}`}>{option.label}</button>
          ))}
        </div>
      </div>

      {ordersData ? <p className="mt-4 text-sm text-[#687078]">共 {ordersData.total} 个订单</p> : null}
      {error ? <p role="alert" className="mt-4 rounded-lg bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}
      {isLoading && !ordersData ? <div className="mt-4 grid gap-3"><div className="h-28 animate-pulse rounded-xl bg-white" /><div className="h-28 animate-pulse rounded-xl bg-white" /></div> : null}
      {!isLoading && ordersData?.orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#cbd1d5] bg-white px-6 py-14 text-center">
          <ShoppingBag className="mx-auto size-9 text-[#929aa0]" />
          <p className="mt-3 font-semibold text-[#596168]">没有符合条件的订单。</p>
        </div>
      ) : null}
      {ordersData?.orders.length ? <div className={`mt-4 grid gap-3 ${isLoading ? "opacity-60" : ""}`}>{ordersData.orders.map((order) => <OrderCard key={order.id} order={order} timezone={timezone} onStatusUpdated={updateOrderStatus} />)}</div> : null}

      {ordersData && ordersData.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" disabled={ordersData.page <= 1 || isLoading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-[#cfd4d8] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-45">上一页</button>
          <span className="text-sm text-[#596168]">第 {ordersData.page}/{ordersData.totalPages} 页</span>
          <button type="button" disabled={ordersData.page >= ordersData.totalPages || isLoading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-[#cfd4d8] bg-white px-4 py-2 text-sm font-semibold disabled:opacity-45">下一页</button>
        </div>
      ) : null}
    </section>
  );
}

function SiteImageField({ label, currentUrl, file, onFileChange }: { label: string; currentUrl: string | null; file: File | null; onFileChange: (file: File | null) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#343a40]">{label}</p>
      {currentUrl ? <Image src={currentUrl} alt={label} width={320} height={320} className="aspect-square w-full rounded-lg border border-[#e1e4e7] object-cover" /> : <div className="grid aspect-square place-items-center rounded-lg border border-dashed border-[#cbd1d5] bg-[#f7f8f9]"><ImagePlus className="size-8 text-[#8a9299]" /></div>}
      <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#aeb5bb] p-2 text-xs font-semibold"><ImagePlus className="size-4" /> {file ? file.name : `更换${label}`}<input type="file" accept="image/*" className="sr-only" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} /></label>
    </div>
  );
}

function ContentPanel({ data, onChange }: { data: AdminData; onChange: (data: AdminData) => void }) {
  const [language, setLanguage] = useState<LanguageCode>("vi");
  const [phone, setPhone] = useState(data.site.phone);
  const [currencyCode, setCurrencyCode] = useState(data.site.currencyCode);
  const [timezone, setTimezone] = useState(data.site.timezone);
  const [translations, setTranslations] = useState(mergeTranslations(data.site.translations));
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [deliveryImage, setDeliveryImage] = useState<File | null>(null);
  const [pickupImage, setPickupImage] = useState<File | null>(null);
  const [productPlaceholder, setProductPlaceholder] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const translation = translations[language] ?? { name: "" };
  function update(field: string, value: string) {
    setTranslations((current) => ({ ...current, [language]: { ...current[language], [field]: value } }));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("data", JSON.stringify({ phone, currencyCode, timezone, translations }));
      if (logo) form.append("logo", logo);
      if (cover) form.append("cover", cover);
      if (deliveryImage) form.append("deliveryImage", deliveryImage);
      if (pickupImage) form.append("pickupImage", pickupImage);
      if (productPlaceholder) form.append("productPlaceholder", productPlaceholder);
      const next = await jsonRequest<AdminData>("/api/admin/site", { method: "PUT", body: form });
      onChange(next);
      setLogo(null);
      setCover(null);
      setDeliveryImage(null);
      setPickupImage(null);
      setProductPlaceholder(null);
      setMessage("网站内容已保存。");
    } catch {
      setMessage("无法保存网站内容。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#20252b]">网站内容</h1>
        <p className="mt-1 text-sm text-[#687078]">管理各语言的商店信息、图片和网站内容。</p>
      </div>
      <form onSubmit={save} className="rounded-xl border border-[#dfe3e6] bg-white p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-5">
            <label className={labelClass}>电话号码
              <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className={labelClass}>货币代码
                <input className={inputClass} value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())} pattern="[A-Z]{3}" maxLength={3} required />
              </label>
              <label className={labelClass}>时区
                <input className={inputClass} value={timezone} onChange={(event) => setTimezone(event.target.value)} required />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
              <SiteImageField label="商店标志" currentUrl={data.site.logoUrl} file={logo} onFileChange={setLogo} />
              <SiteImageField label="封面图片" currentUrl={data.site.coverImageUrl} file={cover} onFileChange={setCover} />
              <SiteImageField label="配送图片" currentUrl={data.site.deliveryImageUrl} file={deliveryImage} onFileChange={setDeliveryImage} />
              <SiteImageField label="到店自取图片" currentUrl={data.site.pickupImageUrl} file={pickupImage} onFileChange={setPickupImage} />
              <SiteImageField label="默认商品图片" currentUrl={data.site.productPlaceholderUrl} file={productPlaceholder} onFileChange={setProductPlaceholder} />
            </div>
          </div>
          <div>
            <div className="flex overflow-x-auto border-b border-[#dfe3e6]">
              {adminLanguageOptions.map((option) => <button key={option.code} type="button" onClick={() => setLanguage(option.code)} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${language === option.code ? "border-[#d79a00] text-[#a36f00]" : "border-transparent text-[#687078]"}`}>{option.label}</button>)}
            </div>
            <div className="mt-5 grid gap-4">
              <label className={labelClass}>商店名称 {language === "vi" ? "*" : ""}<input className={inputClass} value={translation.name ?? ""} onChange={(event) => update("name", event.target.value)} required={language === "vi"} /></label>
              <label className={labelClass}>宣传语<input className={inputClass} value={translation.tagline ?? ""} onChange={(event) => update("tagline", event.target.value)} /></label>
              <label className={labelClass}>营业时间<input className={inputClass} value={translation.openingHours ?? ""} onChange={(event) => update("openingHours", event.target.value)} /></label>
              <label className={labelClass}>地址<textarea className={`${inputClass} min-h-20 resize-y`} value={translation.address ?? ""} onChange={(event) => update("address", event.target.value)} /></label>
              <label className={labelClass}>SEO 标题<input className={inputClass} value={translation.seoTitle ?? ""} onChange={(event) => update("seoTitle", event.target.value)} /></label>
              <label className={labelClass}>SEO 描述<textarea className={`${inputClass} min-h-20 resize-y`} value={translation.seoDescription ?? ""} onChange={(event) => update("seoDescription", event.target.value)} /></label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-[#e5e8ea] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className={`text-sm ${message.startsWith("网站") ? "text-[#26733d]" : "text-[#b42318]"}`}>{message}</p>
          <button disabled={isSaving} className="flex items-center justify-center gap-2 rounded-lg bg-[#fdbc24] px-5 py-2.5 font-bold text-[#20252b] hover:bg-[#efae14] active:translate-y-px disabled:opacity-60"><Save className="size-4" /> {isSaving ? "正在保存..." : "保存内容"}</button>
        </div>
      </form>
    </section>
  );
}

function CategoriesPanel({ data, onChange }: { data: AdminData; onChange: (data: AdminData) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function create() {
    setEditingId("new");
    setDraft({
      id: "",
      slug: "",
      sortOrder: data.categories.length,
      active: true,
      translations: emptyTranslations(),
    });
    setError("");
  }

  function edit(category: AdminCategory) {
    setEditingId(category.id);
    setDraft({ ...category, translations: mergeTranslations(category.translations) });
    setError("");
  }

  async function save() {
    if (!draft) return;
    setIsSaving(true);
    setError("");
    try {
      const isNew = !draft.id;
      const next = await jsonRequest<AdminData>(isNew ? "/api/admin/categories" : `/api/admin/categories/${draft.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      onChange(next);
      setEditingId(null);
      setDraft(null);
    } catch (requestError) {
      const code = requestError instanceof Error ? requestError.message : "REQUEST_FAILED";
      setError(code === "DUPLICATE_VALUE"
        ? "分类 Slug 已存在。"
        : "无法保存分类，请检查越南语名称和 Slug。");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(category: AdminCategory) {
    const productCount = data.products.filter((product) => product.categoryId === category.id).length;
    if (productCount > 0) {
      setError(`无法删除“${category.translations["zh-Hans"]?.name || category.translations.vi?.name || category.slug}”，该分类下仍有 ${productCount} 件商品。请先移动或删除这些商品。`);
      return;
    }
    if (!window.confirm(`确定删除分类“${category.translations["zh-Hans"]?.name || category.translations.vi?.name || category.slug}”吗？`)) return;
    setError("");
    try {
      await jsonRequest(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      onChange({ ...data, categories: data.categories.filter((item) => item.id !== category.id) });
      if (editingId === category.id) {
        setEditingId(null);
        setDraft(null);
      }
    } catch (requestError) {
      const code = requestError instanceof Error ? requestError.message : "REQUEST_FAILED";
      setError(code === "CATEGORY_NOT_EMPTY"
        ? "该分类下仍有商品，暂时无法删除。"
        : "无法删除分类。");
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20252b]">商品分类</h1>
          <p className="mt-1 text-sm text-[#687078]">添加、编辑、显示或隐藏并排序四种语言的分类。</p>
        </div>
        <button type="button" onClick={create} disabled={editingId !== null} className="flex items-center justify-center gap-2 rounded-lg bg-[#fdbc24] px-4 py-3 font-bold text-[#20252b] hover:bg-[#efae14] disabled:cursor-not-allowed disabled:opacity-50"><Plus className="size-4" /> 添加分类</button>
      </div>
      {error ? <p role="alert" className="mt-4 rounded-lg bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}
      <div className="mt-6 grid gap-3">
        {editingId === "new" && draft ? <div className="rounded-xl border border-[#d79a00] bg-white p-4"><CategoryForm draft={draft} isSaving={isSaving} onChange={setDraft} onCancel={() => { setEditingId(null); setDraft(null); }} onSave={() => void save()} /></div> : null}
        {data.categories.map((category) => (
          <article key={category.id} className="rounded-xl border border-[#dfe3e6] bg-white p-4">
            {editingId === category.id && draft ? (
              <CategoryForm draft={draft} isSaving={isSaving} onChange={setDraft} onCancel={() => { setEditingId(null); setDraft(null); }} onSave={() => void save()} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-[#2a3035]">{category.translations["zh-Hans"]?.name || category.translations.vi?.name || category.slug}</h2>
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${category.active ? "bg-[#ecf8ef] text-[#26733d]" : "bg-[#f0f2f3] text-[#687078]"}`}>{category.active ? "正在显示" : "已隐藏"}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#7b838a]">/{category.slug} · 排序 {category.sortOrder} · {data.products.filter((product) => product.categoryId === category.id).length} 件商品</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => edit(category)} disabled={editingId !== null} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#cfd4d8] px-3 py-2 text-sm font-semibold disabled:opacity-45 sm:flex-none"><Pencil className="size-4" /> 编辑</button>
                  <button type="button" onClick={() => void remove(category)} disabled={editingId !== null} aria-label={`删除 ${category.translations["zh-Hans"]?.name || category.translations.vi?.name || category.slug}`} className="grid size-10 place-items-center rounded-lg border border-[#efc6c2] text-[#b42318] hover:bg-[#fff0ef] disabled:opacity-45"><Trash2 className="size-4" /></button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryForm({
  draft,
  isSaving,
  onChange,
  onCancel,
  onSave,
}: {
  draft: AdminCategory;
  isSaving: boolean;
  onChange: (draft: AdminCategory) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>Slug
          <input className={inputClass} value={draft.slug} onChange={(event) => onChange({ ...draft, slug: event.target.value.toLowerCase() })} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="do-uong" required />
        </label>
        <label className={labelClass}>排序
          <input className={inputClass} type="number" min="0" max="65535" value={draft.sortOrder} onChange={(event) => onChange({ ...draft, sortOrder: Number(event.target.value) })} />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {adminLanguageOptions.map((option) => (
          <label key={option.code} className={labelClass}>{option.label} {option.code === "vi" ? "*" : ""}
            <input className={inputClass} value={draft.translations[option.code]?.name ?? ""} required={option.code === "vi"} onChange={(event) => onChange({ ...draft, translations: { ...draft.translations, [option.code]: { ...draft.translations[option.code], name: event.target.value } } })} />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[#e5e8ea] pt-4">
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.active} onChange={(event) => onChange({ ...draft, active: event.target.checked })} className="size-4 accent-[#d79a00]" /> 在网站上显示</label>
        <span className="flex-1" />
        <button type="button" onClick={onCancel} className="rounded-lg border border-[#cfd4d8] px-4 py-2 text-sm font-semibold">取消</button>
        <button type="button" disabled={isSaving || !draft.slug || !draft.translations.vi?.name} onClick={onSave} className="flex items-center gap-2 rounded-lg bg-[#fdbc24] px-4 py-2 text-sm font-bold text-[#20252b] disabled:opacity-60"><Save className="size-4" /> {isSaving ? "正在保存..." : "保存分类"}</button>
      </div>
    </div>
  );
}

function ReferralModal({
  referral,
  onClose,
  onSaved,
}: {
  referral: AdminReferralCode | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [code, setCode] = useState(referral?.code ?? "");
  const [agentName, setAgentName] = useState(referral?.agentName ?? "");
  const [phone, setPhone] = useState(referral?.phone ?? "");
  const [discountPercent, setDiscountPercent] = useState(referral ? String(referral.discountPercent) : "5");
  const [commissionPercent, setCommissionPercent] = useState(referral ? String(referral.commissionPercent) : "5");
  const [note, setNote] = useState(referral?.note ?? "");
  const [isActive, setIsActive] = useState(referral?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      await jsonRequest(
        referral ? `/api/admin/referrals/${referral.id}` : "/api/admin/referrals",
        {
          method: referral ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code.trim().toUpperCase(),
            agentName: agentName.trim(),
            phone: phone.trim(),
            discountPercent: Number(discountPercent),
            commissionPercent: Number(commissionPercent),
            note: note.trim(),
            isActive,
          }),
        },
      );
      onSaved();
    } catch (requestError) {
      const msg = requestError instanceof Error ? requestError.message : "REQUEST_FAILED";
      if (msg === "DUPLICATE_VALUE") setError("该推荐码已存在。");
      else if (msg === "INVALID_REFERRAL_CODE") setError("推荐码格式不正确（仅限字母、数字、下划线或连字符）。");
      else setError("保存推荐码失败，请检查后重试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/60 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e5e8ea] pb-4">
          <h2 className="text-lg font-bold text-[#20252b]">
            {referral ? "编辑推荐码" : "添加新推荐码"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-[#687078] hover:bg-[#f0f2f4]">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={save} className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              推荐码 *
              <input
                className={`${inputClass} font-mono uppercase tracking-wider`}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="例: MZ001, HDV01"
                required
                maxLength={50}
              />
            </label>
            <label className={labelClass}>
              代理人 / 导游姓名 *
              <input
                className={inputClass}
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="例: 代理小李, 导游小张"
                required
              />
            </label>
          </div>

          <label className={labelClass}>
            代理人联系电话
            <input
              className={inputClass}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="例: 0901234567"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                顾客折扣比例 (%) *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  required
                />
              </label>
              <div className="mt-1.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setDiscountPercent("5")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${discountPercent === "5" ? "bg-[#fdbc24] text-[#20252b]" : "bg-[#f0f2f4] text-[#555]"}`}
                >
                  5% (导游)
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountPercent("10")}
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${discountPercent === "10" ? "bg-[#fdbc24] text-[#20252b]" : "bg-[#f0f2f4] text-[#555]"}`}
                >
                  10% (专属)
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                代理佣金比例 (%) *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  required
                />
              </label>
              <p className="mt-1.5 text-xs text-[#707880]">按折后实付金额计算</p>
            </div>
          </div>

          <label className={labelClass}>
            备注
            <textarea
              className={`${inputClass} min-h-16 resize-y`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="填写关于该代理的备注信息..."
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-semibold text-[#343a40]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 accent-[#d79a00]"
            />
            启用此推荐码
          </label>

          {error ? <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2 text-sm text-[#b42318]">{error}</p> : null}

          <div className="mt-2 flex justify-end gap-3 border-t border-[#e5e8ea] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#cfd4d8] px-4 py-2.5 text-sm font-semibold text-[#505960]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#fdbc24] px-5 py-2.5 text-sm font-bold text-[#20252b] hover:bg-[#efae14] disabled:opacity-60"
            >
              <Save className="size-4" />
              {isSaving ? "正在保存..." : "保存推荐码"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ReferralQrModal({
  referral,
  onClose,
}: {
  referral: AdminReferralCode;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/?ref=${referral.code}`;

  useEffect(() => {
    if (!canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, link, {
      width: 280,
      margin: 2,
      color: {
        dark: "#141d27",
        light: "#ffffff",
      },
    });
  }, [link]);

  function downloadQr() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `QR_${referral.code}.png`;
    anchor.click();
  }

  function copyLink() {
    void navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/60 p-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e5e8ea] pb-3">
          <h2 className="text-base font-bold text-[#20252b]">推荐码专属二维码</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-[#687078] hover:bg-[#f0f2f4]">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="rounded-xl border border-[#e2e6e9] bg-white p-3 shadow-inner">
            <canvas ref={canvasRef} className="size-56 rounded-lg" />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="font-mono text-base font-bold text-[#20252b] bg-[#f0f2f4] px-2.5 py-0.5 rounded">
              {referral.code}
            </span>
            <span className="rounded bg-[#ffebe8] px-2 py-0.5 text-xs font-bold text-[#f05045]">
              立减 {referral.discountPercent}%
            </span>
          </div>

          <p className="mt-1.5 text-sm font-semibold text-[#343a40]">
            {referral.agentName} {referral.phone ? `(${referral.phone})` : ""}
          </p>

          <p className="mt-2 w-full truncate rounded bg-[#f8f9fa] px-3 py-1.5 text-xs text-[#687078] select-all">
            {link}
          </p>

          <div className="mt-5 grid w-full grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={copyLink}
              className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-bold transition ${
                copied
                  ? "border-[#26733d] bg-[#eaf8ec] text-[#26733d]"
                  : "border-[#cfd4d8] bg-white text-[#3e464d] hover:bg-[#f7f8f9]"
              }`}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "已复制" : "复制链接"}
            </button>

            <button
              type="button"
              onClick={downloadQr}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#fdbc24] px-3 py-2.5 text-xs font-bold text-[#20252b] hover:bg-[#efae14] shadow-sm"
            >
              <Download className="size-3.5" /> 下载二维码
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReferralsPanel() {
  const [data, setData] = useState<AdminReferralsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalReferral, setModalReferral] = useState<AdminReferralCode | null | "new">(null);
  const [qrModalReferral, setQrModalReferral] = useState<AdminReferralCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const loadReferrals = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await jsonRequest<AdminReferralsResponse>("/api/admin/referrals");
      setData(res);
    } catch {
      setError("无法加载推荐码列表。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  function copyLink(code: string) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/?ref=${code}`;
    void navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function toggleStatus(referral: AdminReferralCode) {
    setToggleLoadingId(referral.id);
    try {
      await jsonRequest(`/api/admin/referrals/${referral.id}/toggle`, { method: "PATCH" });
      await loadReferrals();
    } catch {
      setError("无法更改推荐码状态。");
    } finally {
      setToggleLoadingId(null);
    }
  }

  async function deleteReferral(referral: AdminReferralCode) {
    if (!window.confirm(`确定要删除推荐码 ${referral.code} 吗？`)) return;
    try {
      await jsonRequest(`/api/admin/referrals/${referral.id}`, { method: "DELETE" });
      await loadReferrals();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "REFERRAL_HAS_ORDERS") {
        alert("该推荐码已有关联订单，无法直接删除。您可以将其设置为“暂停”。");
      } else {
        alert("无法删除该推荐码。");
      }
    }
  }

  const referrals = data?.referrals ?? [];
  const totalAgents = referrals.length;
  const activeAgents = referrals.filter((r) => r.isActive).length;
  const totalCompletedOrders = referrals.reduce((sum, r) => sum + r.completedOrders, 0);
  const totalCompletedCommission = referrals.reduce((sum, r) => sum + r.completedCommission, 0);
  const totalCompletedRevenue = referrals.reduce((sum, r) => sum + r.completedRevenue, 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20252b]">分销推荐码管理</h1>
          <p className="mt-1 text-sm text-[#687078]">创建和管理代理推荐码、推广链接、订单统计及分销佣金。</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadReferrals()}
            className="flex items-center gap-2 rounded-lg border border-[#cfd4d8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#3e464d] hover:bg-[#f7f8f9]"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} /> 刷新
          </button>
          <button
            type="button"
            onClick={() => setModalReferral("new")}
            className="flex items-center gap-2 rounded-lg bg-[#fdbc24] px-4 py-2.5 text-sm font-bold text-[#20252b] hover:bg-[#efae14] shadow-sm"
          >
            <Plus className="size-4" /> 添加推荐码
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-[#dfe3e6] bg-white p-4">
          <p className="text-xs font-semibold text-[#687078]">总代理数 / 推荐码</p>
          <p className="mt-2 text-2xl font-bold text-[#20252b]">{totalAgents}</p>
          <p className="mt-1 text-xs text-[#26733d] font-medium">{activeAgents} 个正在使用</p>
        </div>
        <div className="rounded-xl border border-[#dfe3e6] bg-white p-4">
          <p className="text-xs font-semibold text-[#687078]">已完成订单数</p>
          <p className="mt-2 text-2xl font-bold text-[#20252b]">{totalCompletedOrders}</p>
          <p className="mt-1 text-xs text-[#687078]">来自推荐链接</p>
        </div>
        <div className="rounded-xl border border-[#dfe3e6] bg-white p-4">
          <p className="text-xs font-semibold text-[#687078]">已结算营业额</p>
          <p className="mt-2 text-2xl font-bold text-[#20252b]">{formatCurrency(totalCompletedRevenue, "VND", "zh-Hans")}</p>
          <p className="mt-1 text-xs text-[#687078]">已完成付款</p>
        </div>
        <div className="rounded-xl border border-[#e9dbc2] bg-[#fffbf2] p-4">
          <p className="text-xs font-semibold text-[#9b6a00]">已结算总佣金</p>
          <p className="mt-2 text-2xl font-bold text-[#b42318]">{formatCurrency(totalCompletedCommission, "VND", "zh-Hans")}</p>
          <p className="mt-1 text-xs text-[#8f6200]">仅统计已完成订单</p>
        </div>
      </div>

      {error ? <p role="alert" className="rounded-lg bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}

      {/* Referral list */}
      <div className="rounded-xl border border-[#dfe3e6] bg-white overflow-hidden shadow-sm">
        <div className="border-b border-[#e5e8ea] bg-[#fafbfc] px-5 py-4">
          <h2 className="text-base font-bold text-[#20252b]">推荐码列表 ({referrals.length})</h2>
        </div>

        {isLoading && !data ? (
          <div className="p-6 text-center text-sm text-[#687078]">正在加载列表...</div>
        ) : referrals.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Users className="mx-auto size-10 text-[#a0a8af]" />
            <p className="mt-3 font-semibold text-[#485056]">暂无推荐码数据。</p>
            <p className="mt-1 text-sm text-[#7a8289]">点击“添加推荐码”创建第一个分销链接。</p>
          </div>
        ) : (
          <div className="divide-y divide-[#eceff1] overflow-x-auto">
            {referrals.map((referral) => {
              const isCopied = copiedCode === referral.code;
              return (
                <div key={referral.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between hover:bg-[#fafbfc] transition">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-bold text-[#20252b] bg-[#f0f2f4] px-2.5 py-0.5 rounded">
                        {referral.code}
                      </span>
                      <span className="text-sm font-semibold text-[#343a40]">{referral.agentName}</span>
                      {referral.phone ? <span className="text-xs text-[#707880]">({referral.phone})</span> : null}
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${referral.isActive ? "bg-[#eaf8ec] text-[#26733d]" : "bg-[#f3f4f6] text-[#707880]"}`}>
                        {referral.isActive ? "启用中" : "已暂停"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#525a60]">
                      <span>顾客优惠: <strong className="text-[#d9382e]">{referral.discountPercent}%</strong></span>
                      <span>•</span>
                      <span>代理佣金: <strong className="text-[#26733d]">{referral.commissionPercent}%</strong></span>
                      <span>•</span>
                      <span>完成订单: <strong>{referral.completedOrders}</strong> / {referral.totalOrders} 单</span>
                      <span>•</span>
                      <span>完成业绩: <strong>{formatCurrency(referral.completedRevenue, "VND", "zh-Hans")}</strong></span>
                      <span>•</span>
                      <span>累计佣金: <strong className="text-[#b42318]">{formatCurrency(referral.completedCommission, "VND", "zh-Hans")}</strong></span>
                    </div>

                    {referral.note ? (
                      <p className="text-xs text-[#808890] italic">备注: {referral.note}</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQrModalReferral(referral)}
                      className="flex items-center gap-1.5 rounded-lg border border-[#cfd4d8] bg-white px-3 py-2 text-xs font-bold text-[#3e464d] hover:bg-[#f7f8f9] transition"
                    >
                      <QrCode className="size-3.5 text-[#141d27]" />
                      二维码
                    </button>

                    <button
                      type="button"
                      onClick={() => copyLink(referral.code)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                        isCopied
                          ? "border-[#26733d] bg-[#eaf8ec] text-[#26733d]"
                          : "border-[#cfd4d8] bg-white text-[#3e464d] hover:bg-[#f7f8f9]"
                      }`}
                    >
                      {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                      {isCopied ? "已复制链接" : "复制链接"}
                    </button>

                    <button
                      type="button"
                      disabled={toggleLoadingId === referral.id}
                      onClick={() => void toggleStatus(referral)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        referral.isActive
                          ? "border-[#e0c070] bg-[#fffcf2] text-[#9b6a00] hover:bg-[#fff6dc]"
                          : "border-[#b8e0c0] bg-[#f0faf2] text-[#26733d] hover:bg-[#e4f6e8]"
                      }`}
                    >
                      {referral.isActive ? "暂停" : "启用"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalReferral(referral)}
                      className="rounded-lg border border-[#cfd4d8] bg-white p-2 text-[#525a60] hover:bg-[#f7f8f9] hover:text-[#20252b]"
                      aria-label="编辑"
                    >
                      <Pencil className="size-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteReferral(referral)}
                      className="rounded-lg border border-[#f0c2be] bg-white p-2 text-[#b42318] hover:bg-[#fff0ef]"
                      aria-label="删除"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalReferral ? (
        <ReferralModal
          referral={modalReferral === "new" ? null : modalReferral}
          onClose={() => setModalReferral(null)}
          onSaved={() => {
            setModalReferral(null);
            void loadReferrals();
          }}
        />
      ) : null}

      {qrModalReferral ? (
        <ReferralQrModal
          referral={qrModalReferral}
          onClose={() => setQrModalReferral(null)}
        />
      ) : null}
    </section>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<"checking" | "guest" | "authenticated">("checking");
  const [data, setData] = useState<AdminData | null>(null);
  const [branding, setBranding] = useState<SiteContent | null>(null);
  const [active, setActive] = useState<"products" | "categories" | "orders" | "referrals" | "content">("products");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      await jsonRequest("/api/admin/session");
      setSession("authenticated");
      setData(await jsonRequest<AdminData>("/api/admin/data"));
    } catch (requestError) {
      if (requestError instanceof Error && requestError.message === "AUTH_REQUIRED") setSession("guest");
      else {
        setSession("authenticated");
        setError("无法加载管理数据。");
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void jsonRequest<StorefrontData>("/api/storefront?lang=zh-Hans")
        .then((storefront) => setBranding(storefront.site))
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function logout() {
    await jsonRequest("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    setData(null);
    setSession("guest");
  }

  if (session === "checking") return <main className="grid min-h-dvh place-items-center bg-[#eef1f3] text-sm text-[#687078]">正在检查登录状态...</main>;
  if (session === "guest") return <LoginScreen site={branding} onSuccess={() => void load()} />;

  const siteName = data?.site.translations["zh-Hans"]?.name || data?.site.translations.vi?.name || branding?.name || "商店";
  const siteLogoUrl = data?.site.logoUrl || branding?.logoUrl;

  return (
    <main className="h-dvh overflow-y-auto bg-[#eef1f3] text-[#232323]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#141d27] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          {siteLogoUrl ? <Image src={siteLogoUrl} alt={siteName} width={42} height={42} className="size-10 rounded-lg object-cover" /> : <div className="grid size-10 place-items-center rounded-lg bg-white/10"><Store className="size-5" /></div>}
          <div className="min-w-0 flex-1"><p className="truncate font-bold">{siteName}管理后台</p><p className="text-xs text-white/60">在线商城后台管理</p></div>
          <button onClick={() => void logout()} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10"><LogOut className="size-4" /><span className="hidden sm:inline">退出登录</span></button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="管理后台" className="flex gap-2 overflow-x-auto lg:flex-col">
          <button onClick={() => setActive("products")} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${active === "products" ? "bg-[#fdbc24] text-[#20252b]" : "bg-white text-[#4c555c] hover:bg-[#f8f9fa]"}`}><Package className="size-4" /> 商品</button>
          <button onClick={() => setActive("categories")} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${active === "categories" ? "bg-[#fdbc24] text-[#20252b]" : "bg-white text-[#4c555c] hover:bg-[#f8f9fa]"}`}><Layers3 className="size-4" /> 分类</button>
          <button onClick={() => setActive("orders")} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${active === "orders" ? "bg-[#fdbc24] text-[#20252b]" : "bg-white text-[#4c555c] hover:bg-[#f8f9fa]"}`}><ClipboardList className="size-4" /> 订单</button>
          <button onClick={() => setActive("referrals")} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${active === "referrals" ? "bg-[#fdbc24] text-[#20252b]" : "bg-white text-[#4c555c] hover:bg-[#f8f9fa]"}`}><Users className="size-4" /> 分销推荐</button>
          <button onClick={() => setActive("content")} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${active === "content" ? "bg-[#fdbc24] text-[#20252b]" : "bg-white text-[#4c555c] hover:bg-[#f8f9fa]"}`}><Store className="size-4" /> 网站内容</button>
        </nav>
        <div className="min-w-0">
          {error ? <div className="rounded-xl border border-[#efc6c2] bg-[#fff0ef] p-5"><p className="text-sm text-[#b42318]">{error}</p><button onClick={() => void load()} className="mt-3 rounded-lg bg-[#b42318] px-4 py-2 text-sm font-bold text-white">重新加载</button></div> : null}
          {!error && !data ? <div className="grid gap-3"><div className="h-24 animate-pulse rounded-xl bg-white" /><div className="h-28 animate-pulse rounded-xl bg-white" /><div className="h-28 animate-pulse rounded-xl bg-white" /></div> : null}
          {data && active === "products" ? <ProductsPanel data={data} onChange={setData} /> : null}
          {data && active === "categories" ? <CategoriesPanel data={data} onChange={setData} /> : null}
          {data && active === "orders" ? <OrdersPanel timezone={data.site.timezone} /> : null}
          {data && active === "referrals" ? <ReferralsPanel /> : null}
          {data && active === "content" ? <ContentPanel data={data} onChange={setData} /> : null}
        </div>
      </div>
    </main>
  );
}
