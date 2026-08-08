"use client";

import Image from "next/image";
import {
  ImagePlus,
  LogOut,
  Package,
  Pencil,
  Plus,
  Save,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { languageOptions } from "@/lib/i18n";
import type { AdminCategory, AdminData, AdminProduct, AdminTranslations } from "@/types/admin";
import type { LanguageCode } from "@/types/catalog";

const inputClass = "w-full rounded-lg border border-[#ccd1d5] bg-white px-3 py-2.5 text-sm text-[#232323] outline-none transition focus:border-[#d79a00] focus:ring-2 focus:ring-[#fdbc24]/25 placeholder:text-[#777f86]";
const labelClass = "grid gap-2 text-sm font-semibold text-[#343a40]";

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

function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
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
        ? "Đăng nhập quá nhiều lần. Vui lòng thử lại sau."
        : "Tài khoản hoặc mật khẩu không đúng.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center overflow-y-auto bg-[#eef1f3] px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-[0_18px_50px_rgba(20,29,39,.12)] sm:p-8">
        <div className="flex items-center gap-4">
          <Image src="/images/logo.jpg" alt="MiniMart" width={64} height={64} className="size-16 rounded-xl object-cover" />
          <div>
            <h1 className="text-2xl font-bold text-[#20252b]">Quản trị MiniMart</h1>
            <p className="mt-1 text-sm text-[#687078]">Đăng nhập để quản lý cửa hàng</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-8 grid gap-5">
          <label className={labelClass}>
            Tài khoản
            <input className={inputClass} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label className={labelClass}>
            Mật khẩu
            <input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </label>
          {error ? <p role="alert" className="rounded-lg bg-[#fff0ef] px-3 py-2.5 text-sm text-[#b42318]">{error}</p> : null}
          <button disabled={isSubmitting} className="rounded-lg bg-[#fdbc24] px-4 py-3 font-bold text-[#20252b] transition hover:bg-[#efae14] active:translate-y-px disabled:opacity-60">
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}

interface ProductDraft {
  categoryId: string;
  slug: string;
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
  onClose,
  onSaved,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: (data: AdminData) => void;
}) {
  const [language, setLanguage] = useState<LanguageCode>("vi");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>({
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    slug: product?.slug ?? "",
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
      setError(code === "DUPLICATE_VALUE" ? "Slug hoặc SKU đã tồn tại." : "Không thể lưu sản phẩm. Kiểm tra lại các trường bắt buộc.");
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
            <h2 className="text-xl font-bold text-[#20252b]">{product ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
            <p className="mt-1 text-xs text-[#707880]">Tên tiếng Việt là bắt buộc. Các ngôn ngữ khác sẽ dùng bản tiếng Việt khi để trống.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="grid size-10 place-items-center rounded-lg text-[#596168] hover:bg-[#f0f2f3]"><X /></button>
        </header>

        <div className="grid gap-8 p-4 sm:p-6 lg:grid-cols-[320px_1fr]">
          <aside className="grid content-start gap-5">
            <div className="overflow-hidden rounded-xl border border-[#dfe3e6] bg-[#f7f8f9]">
              {product?.imageUrl ? <Image src={product.imageUrl} alt="Ảnh sản phẩm" width={640} height={640} className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center text-[#8a9299]"><ImagePlus className="size-10" /></div>}
            </div>
            <label className={labelClass}>
              Ảnh sản phẩm
              <span className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#aeb5bb] px-4 py-3 text-sm font-semibold text-[#3f474e] hover:border-[#d79a00]">
                <ImagePlus className="size-4" /> {image ? image.name : "Chọn ảnh"}
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
              </span>
              <span className="text-xs font-normal text-[#6e767d]">Tối đa 12MB. Server tự xoay, thu nhỏ và nén WebP.</span>
            </label>
            <label className={labelClass}>Danh mục
              <select className={inputClass} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} required>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.translations.vi?.name || category.slug}</option>)}
              </select>
            </label>
            <label className={labelClass}>Slug
              <input className={inputClass} value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase() })} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>Giá (VND)
                <input className={inputClass} type="number" min="0" step="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} required />
              </label>
              <label className={labelClass}>Thứ tự
                <input className={inputClass} type="number" min="0" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: event.target.value })} />
              </label>
            </div>
            <label className={labelClass}>SKU
              <input className={inputClass} value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold text-[#343a40]"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} className="size-4 accent-[#d79a00]" /> Đang hiển thị</label>
            <label className="flex items-center gap-3 text-sm font-semibold text-[#343a40]"><input type="checkbox" checked={draft.soldOut} onChange={(event) => setDraft({ ...draft, soldOut: event.target.checked })} className="size-4 accent-[#d79a00]" /> Hết hàng</label>
          </aside>

          <section>
            <div className="flex overflow-x-auto border-b border-[#dfe3e6]">
              {languageOptions.map((option) => <button key={option.code} type="button" onClick={() => setLanguage(option.code)} className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold ${language === option.code ? "border-[#d79a00] text-[#a36f00]" : "border-transparent text-[#687078]"}`}>{option.label}</button>)}
            </div>
            <div className="mt-6 grid gap-5">
              <label className={labelClass}>Tên sản phẩm {language === "vi" ? "*" : ""}
                <input className={inputClass} value={translation.name ?? ""} onChange={(event) => updateTranslation("name", event.target.value)} required={language === "vi"} />
              </label>
              <label className={labelClass}>Mô tả
                <textarea className={`${inputClass} min-h-40 resize-y`} value={translation.description ?? ""} onChange={(event) => updateTranslation("description", event.target.value)} />
              </label>
            </div>
          </section>
        </div>

        {error ? <p role="alert" className="mx-4 mb-4 rounded-lg bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318] sm:mx-6">{error}</p> : null}
        <footer className="sticky bottom-0 flex justify-end gap-3 border-t border-[#e2e5e8] bg-white px-4 py-4 sm:px-6">
          <button type="button" onClick={onClose} className="rounded-lg border border-[#cdd2d6] px-4 py-2.5 font-semibold text-[#454d54] hover:bg-[#f3f5f6]">Huỷ</button>
          <button disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-[#fdbc24] px-5 py-2.5 font-bold text-[#20252b] hover:bg-[#efae14] active:translate-y-px disabled:opacity-60"><Save className="size-4" /> {isSaving ? "Đang lưu..." : "Lưu sản phẩm"}</button>
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
    return data.products.filter((product) => `${product.translations.vi?.name ?? ""} ${product.slug} ${product.sku}`.toLocaleLowerCase().includes(normalized));
  }, [data.products, query]);
  const categoryNames = new Map(data.categories.map((category) => [category.id, category.translations.vi?.name || category.slug]));

  async function remove(product: AdminProduct) {
    if (!window.confirm(`Xóa sản phẩm "${product.translations.vi?.name || product.slug}"? Ảnh R2 của sản phẩm cũng sẽ được xóa.`)) return;
    setError("");
    try {
      await jsonRequest(`/api/admin/products/${product.id}`, { method: "DELETE" });
      onChange({ ...data, products: data.products.filter((item) => item.id !== product.id) });
    } catch {
      setError("Không thể xóa sản phẩm.");
    }
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#20252b]">Sản phẩm</h1>
          <p className="mt-1 text-sm text-[#687078]">{data.products.length} sản phẩm trong cửa hàng</p>
        </div>
        <button onClick={() => setEditing(null)} className="flex items-center justify-center gap-2 rounded-lg bg-[#fdbc24] px-4 py-3 font-bold text-[#20252b] hover:bg-[#efae14] active:translate-y-px"><Plus className="size-4" /> Thêm sản phẩm</button>
      </div>
      <input className={`${inputClass} mt-6 max-w-md`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, slug hoặc SKU" aria-label="Tìm sản phẩm" />
      {error ? <p role="alert" className="mt-4 rounded-lg bg-[#fff0ef] px-4 py-3 text-sm text-[#b42318]">{error}</p> : null}

      {products.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#cbd1d5] bg-white px-6 py-14 text-center text-[#697179]">Chưa có sản phẩm phù hợp.</div>
      ) : (
        <div className="mt-6 grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="grid gap-4 rounded-xl border border-[#dfe3e6] bg-white p-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
              {product.imageUrl ? <Image src={product.imageUrl} alt="" width={72} height={72} className="size-[72px] rounded-lg object-cover" /> : <div className="grid size-[72px] place-items-center rounded-lg bg-[#f0f2f3]"><Package className="text-[#8a9299]" /></div>}
              <div className="min-w-0">
                <h2 className="truncate font-bold text-[#252b30]">{product.translations.vi?.name || product.slug}</h2>
                <p className="mt-1 text-sm text-[#687078]">{categoryNames.get(product.categoryId)} · {new Intl.NumberFormat("vi-VN").format(product.price)}₫</p>
                <p className="mt-1 text-xs text-[#8a9299]">/{product.slug}{product.sku ? ` · SKU ${product.sku}` : ""}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className={`rounded-md px-2 py-1 ${product.active ? "bg-[#ecf8ef] text-[#26733d]" : "bg-[#f0f2f3] text-[#687078]"}`}>{product.active ? "Đang hiển thị" : "Đang ẩn"}</span>
                  {product.soldOut ? <span className="rounded-md bg-[#fff0ef] px-2 py-1 text-[#b42318]">Hết hàng</span> : null}
                </div>
              </div>
              <div className="flex gap-2 sm:justify-end">
                <button onClick={() => setEditing(product)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#cfd4d8] px-3 py-2 text-sm font-semibold text-[#3e464d] hover:bg-[#f3f5f6] sm:flex-none"><Pencil className="size-4" /> Sửa</button>
                <button onClick={() => void remove(product)} className="grid size-10 place-items-center rounded-lg border border-[#efc6c2] text-[#b42318] hover:bg-[#fff0ef]" aria-label={`Xóa ${product.translations.vi?.name || product.slug}`}><Trash2 className="size-4" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing !== undefined ? <ProductEditor product={editing} categories={data.categories.filter((category) => category.active)} onClose={() => setEditing(undefined)} onSaved={(next) => { onChange(next); setEditing(undefined); }} /> : null}
    </section>
  );
}

function ContentPanel({ data, onChange }: { data: AdminData; onChange: (data: AdminData) => void }) {
  const [language, setLanguage] = useState<LanguageCode>("vi");
  const [phone, setPhone] = useState(data.site.phone);
  const [translations, setTranslations] = useState(mergeTranslations(data.site.translations));
  const [logo, setLogo] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
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
      form.append("data", JSON.stringify({ phone, translations }));
      if (logo) form.append("logo", logo);
      if (cover) form.append("cover", cover);
      const next = await jsonRequest<AdminData>("/api/admin/site", { method: "PUT", body: form });
      onChange(next);
      setLogo(null);
      setCover(null);
      setMessage("Đã lưu nội dung website.");
    } catch {
      setMessage("Không thể lưu nội dung website.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#20252b]">Nội dung website</h1>
        <p className="mt-1 text-sm text-[#687078]">Thông tin cửa hàng, hình ảnh và tên danh mục theo từng ngôn ngữ.</p>
      </div>
      <form onSubmit={save} className="rounded-xl border border-[#dfe3e6] bg-white p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-5">
            <label className={labelClass}>Số điện thoại
              <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#343a40]">Logo</p>
                {data.site.logoUrl ? <Image src={data.site.logoUrl} alt="Logo hiện tại" width={160} height={160} className="aspect-square w-full rounded-lg border border-[#e1e4e7] object-cover" /> : null}
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#aeb5bb] p-2 text-xs font-semibold"><ImagePlus className="size-4" /> {logo ? logo.name : "Đổi logo"}<input type="file" accept="image/*" className="sr-only" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} /></label>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[#343a40]">Ảnh bìa</p>
                {data.site.coverImageUrl ? <Image src={data.site.coverImageUrl} alt="Ảnh bìa hiện tại" width={320} height={320} className="aspect-square w-full rounded-lg border border-[#e1e4e7] object-cover" /> : null}
                <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#aeb5bb] p-2 text-xs font-semibold"><ImagePlus className="size-4" /> {cover ? cover.name : "Đổi ảnh bìa"}<input type="file" accept="image/*" className="sr-only" onChange={(event) => setCover(event.target.files?.[0] ?? null)} /></label>
              </div>
            </div>
          </div>
          <div>
            <div className="flex overflow-x-auto border-b border-[#dfe3e6]">
              {languageOptions.map((option) => <button key={option.code} type="button" onClick={() => setLanguage(option.code)} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${language === option.code ? "border-[#d79a00] text-[#a36f00]" : "border-transparent text-[#687078]"}`}>{option.label}</button>)}
            </div>
            <div className="mt-5 grid gap-4">
              <label className={labelClass}>Tên cửa hàng {language === "vi" ? "*" : ""}<input className={inputClass} value={translation.name ?? ""} onChange={(event) => update("name", event.target.value)} required={language === "vi"} /></label>
              <label className={labelClass}>Khẩu hiệu<input className={inputClass} value={translation.tagline ?? ""} onChange={(event) => update("tagline", event.target.value)} /></label>
              <label className={labelClass}>Giờ mở cửa<input className={inputClass} value={translation.openingHours ?? ""} onChange={(event) => update("openingHours", event.target.value)} /></label>
              <label className={labelClass}>Địa chỉ<textarea className={`${inputClass} min-h-20 resize-y`} value={translation.address ?? ""} onChange={(event) => update("address", event.target.value)} /></label>
              <label className={labelClass}>Tiêu đề SEO<input className={inputClass} value={translation.seoTitle ?? ""} onChange={(event) => update("seoTitle", event.target.value)} /></label>
              <label className={labelClass}>Mô tả SEO<textarea className={`${inputClass} min-h-20 resize-y`} value={translation.seoDescription ?? ""} onChange={(event) => update("seoDescription", event.target.value)} /></label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 border-t border-[#e5e8ea] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p role="status" className={`text-sm ${message.startsWith("Đã") ? "text-[#26733d]" : "text-[#b42318]"}`}>{message}</p>
          <button disabled={isSaving} className="flex items-center justify-center gap-2 rounded-lg bg-[#fdbc24] px-5 py-2.5 font-bold text-[#20252b] hover:bg-[#efae14] active:translate-y-px disabled:opacity-60"><Save className="size-4" /> {isSaving ? "Đang lưu..." : "Lưu nội dung"}</button>
        </div>
      </form>
      <CategoryEditor data={data} onChange={onChange} />
    </section>
  );
}

function CategoryEditor({ data, onChange }: { data: AdminData; onChange: (data: AdminData) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
      const next = await jsonRequest<AdminData>(`/api/admin/categories/${draft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      onChange(next);
      setEditingId(null);
      setDraft(null);
    } catch {
      setError("Không thể lưu danh mục.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#20252b]">Tên danh mục</h2>
      <div className="mt-4 grid gap-3">
        {data.categories.map((category) => (
          <article key={category.id} className="rounded-xl border border-[#dfe3e6] bg-white p-4">
            {editingId === category.id && draft ? (
              <div className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {languageOptions.map((option) => <label key={option.code} className={labelClass}>{option.label}<input className={inputClass} value={draft.translations[option.code]?.name ?? ""} onChange={(event) => setDraft({ ...draft, translations: { ...draft.translations, [option.code]: { ...draft.translations[option.code], name: event.target.value } } })} /></label>)}
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} className="size-4 accent-[#d79a00]" /> Hiển thị</label>
                  <label className="flex items-center gap-2 text-sm font-semibold">Thứ tự <input className={`${inputClass} w-24`} type="number" min="0" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} /></label>
                  <span className="flex-1" />
                  <button type="button" onClick={() => { setEditingId(null); setDraft(null); }} className="rounded-lg border border-[#cfd4d8] px-4 py-2 text-sm font-semibold">Huỷ</button>
                  <button type="button" disabled={isSaving} onClick={() => void save()} className="rounded-lg bg-[#fdbc24] px-4 py-2 text-sm font-bold text-[#20252b] disabled:opacity-60">{isSaving ? "Đang lưu..." : "Lưu"}</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div><h3 className="font-bold text-[#2a3035]">{category.translations.vi?.name || category.slug}</h3><p className="mt-1 text-xs text-[#7b838a]">/{category.slug}</p></div>
                <button type="button" onClick={() => edit(category)} className="flex items-center gap-2 rounded-lg border border-[#cfd4d8] px-3 py-2 text-sm font-semibold"><Pencil className="size-4" /> Sửa</button>
              </div>
            )}
          </article>
        ))}
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-[#b42318]">{error}</p> : null}
    </div>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<"checking" | "guest" | "authenticated">("checking");
  const [data, setData] = useState<AdminData | null>(null);
  const [active, setActive] = useState<"products" | "content">("products");
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
        setError("Không thể tải dữ liệu quản trị.");
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function logout() {
    await jsonRequest("/api/admin/session", { method: "DELETE" }).catch(() => undefined);
    setData(null);
    setSession("guest");
  }

  if (session === "checking") return <main className="grid min-h-dvh place-items-center bg-[#eef1f3] text-sm text-[#687078]">Đang kiểm tra phiên đăng nhập...</main>;
  if (session === "guest") return <LoginScreen onSuccess={() => void load()} />;

  return (
    <main className="h-dvh overflow-y-auto bg-[#eef1f3] text-[#232323]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#141d27] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Image src="/images/logo.jpg" alt="MiniMart" width={42} height={42} className="size-10 rounded-lg object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate font-bold">Quản trị MiniMart</p><p className="text-xs text-white/60">Cửa hàng trực tuyến</p></div>
          <button onClick={() => void logout()} className="flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10"><LogOut className="size-4" /><span className="hidden sm:inline">Đăng xuất</span></button>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Quản trị" className="flex gap-2 overflow-x-auto lg:flex-col">
          <button onClick={() => setActive("products")} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${active === "products" ? "bg-[#fdbc24] text-[#20252b]" : "bg-white text-[#4c555c] hover:bg-[#f8f9fa]"}`}><Package className="size-4" /> Sản phẩm</button>
          <button onClick={() => setActive("content")} className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-bold ${active === "content" ? "bg-[#fdbc24] text-[#20252b]" : "bg-white text-[#4c555c] hover:bg-[#f8f9fa]"}`}><Store className="size-4" /> Nội dung website</button>
        </nav>
        <div className="min-w-0">
          {error ? <div className="rounded-xl border border-[#efc6c2] bg-[#fff0ef] p-5"><p className="text-sm text-[#b42318]">{error}</p><button onClick={() => void load()} className="mt-3 rounded-lg bg-[#b42318] px-4 py-2 text-sm font-bold text-white">Tải lại</button></div> : null}
          {!error && !data ? <div className="grid gap-3"><div className="h-24 animate-pulse rounded-xl bg-white" /><div className="h-28 animate-pulse rounded-xl bg-white" /><div className="h-28 animate-pulse rounded-xl bg-white" /></div> : null}
          {data && active === "products" ? <ProductsPanel data={data} onChange={setData} /> : null}
          {data && active === "content" ? <ContentPanel data={data} onChange={setData} /> : null}
        </div>
      </div>
    </main>
  );
}
