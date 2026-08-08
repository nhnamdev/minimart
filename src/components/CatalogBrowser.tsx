"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatVnd } from "@/data/catalog";
import type { CartQuantities, Category, Product } from "@/types/catalog";

import { CloseIcon, MinusIcon, PlusIcon } from "./icons";

interface CatalogBrowserProps {
  categories: Category[];
  searchTerm: string;
  quantities: CartQuantities;
  onQuantityChange: (productId: string, next: number) => void;
}

export function CatalogBrowser({
  categories,
  searchTerm,
  quantities,
  onQuantityChange,
}: CatalogBrowserProps) {
  const paneRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const visibleCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();

    if (!query) {
      return categories;
    }

    return categories
      .map((category) => ({
        ...category,
        products: category.products.filter((product) =>
          `${product.name} ${product.description ?? ""}`
            .toLocaleLowerCase()
            .includes(query),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }, [categories, searchTerm]);

  const visibleCategoryIds = visibleCategories.map((category) => category.id).join("|");
  const resolvedActiveCategory = visibleCategories.some(
    (category) => category.id === activeCategory,
  )
    ? activeCategory
    : (visibleCategories[0]?.id ?? "");

  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0 });
  }, [searchTerm]);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const updateActiveCategory = () => {
      const sections = Array.from(
        pane.querySelectorAll<HTMLElement>("[data-catalog-section]"),
      );
      if (sections.length === 0) return;

      const marker = pane.getBoundingClientRect().top + 2;
      let current = sections[0];

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) {
          current = section;
        } else {
          break;
        }
      }

      setActiveCategory(current.dataset.categoryId ?? "");
    };

    updateActiveCategory();
    pane.addEventListener("scroll", updateActiveCategory, { passive: true });

    return () => pane.removeEventListener("scroll", updateActiveCategory);
  }, [visibleCategoryIds]);

  const scrollToCategory = (categoryId: string) => {
    const pane = paneRef.current;
    const section = document.getElementById(`category-${categoryId}`);
    if (!pane || !section) return;

    setActiveCategory(categoryId);
    pane.scrollTo({
      top:
        pane.scrollTop +
        section.getBoundingClientRect().top -
        pane.getBoundingClientRect().top,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="flex min-h-0 flex-1 overflow-hidden pb-[48px]">
        <nav
          aria-label="Product categories"
          className="w-1/5 shrink-0 overflow-y-auto bg-[#f3f5f7]"
        >
          {visibleCategories.map((category) => {
            const isActive = resolvedActiveCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                aria-current={isActive ? "true" : undefined}
                className={`flex min-h-[6vh] w-full items-center justify-center px-[1vw] text-center text-[3.2vw] leading-tight text-[#5b5b5b] transition-colors ${
                  isActive ? "bg-white font-bold" : "font-normal"
                }`}
                onClick={() => scrollToCategory(category.id)}
              >
                {category.name}
              </button>
            );
          })}
        </nav>

        <div ref={paneRef} className="min-w-0 flex-1 overflow-y-auto bg-white">
          {visibleCategories.map((category) => (
            <section
              key={category.id}
              id={`category-${category.id}`}
              data-catalog-section
              data-category-id={category.id}
            >
              <h2 className="border-l-[3px] border-[#777] bg-[#f3f5f7] pl-[14px] text-[3.5vw] leading-[7vw] font-bold text-[#232323]">
                {category.name}
              </h2>

              {category.products.map((product) => {
                const quantity = quantities[product.id] ?? 0;

                return (
                  <article
                    key={product.id}
                    className="my-[3vw] mr-[3vw] flex items-center border-b border-[rgba(7,17,27,.1)] pb-[3vw]"
                  >
                    <button
                      type="button"
                      className="ml-[2vw] shrink-0 rounded-[1vw] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fdbc24]"
                      aria-label={`View ${product.name}`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={180}
                        height={180}
                        sizes="18vw"
                        className="size-[18vw] rounded-[1vw] object-cover"
                      />
                    </button>

                    <button
                      type="button"
                      className="flex min-w-0 flex-1 flex-col justify-center self-stretch text-left"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <span className="pb-[1vw] text-[3.6vw] leading-tight font-semibold text-[#232323]">
                        {product.name}
                      </span>
                      {product.description ? (
                        <span className="w-[35vw] max-w-full text-[3vw] leading-snug text-[#93999f]">
                          {product.description}
                        </span>
                      ) : null}
                      <span className="mt-auto text-[4.3vw] leading-none font-bold text-[#fb4f45]">
                        {formatVnd(product.price)}
                      </span>
                    </button>

                    <div
                      className="ml-[1vw] flex shrink-0 items-center justify-end gap-[0.4vw]"
                      aria-label={`Quantity for ${product.name}`}
                    >
                      {quantity > 0 ? (
                        <>
                          <button
                            type="button"
                            className="flex size-[9vw] animate-in items-center justify-center text-[#fdbc24] transition-all duration-[400ms] spin-in-90 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={`Remove one ${product.name}`}
                            disabled={product.soldOut}
                            onClick={() => onQuantityChange(product.id, quantity - 1)}
                          >
                            <MinusIcon className="size-[7vw]" />
                          </button>
                          <span className="min-w-[4vw] text-center text-[3.4vw] text-[#232323]">
                            {quantity}
                          </span>
                        </>
                      ) : null}
                      <button
                        type="button"
                        className="flex size-[9vw] items-center justify-center text-[#fdbc24] transition-all duration-[400ms] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label={
                          product.soldOut
                            ? `${product.name} is sold out`
                            : `Add one ${product.name}`
                        }
                        disabled={product.soldOut}
                        onClick={() => onQuantityChange(product.id, quantity + 1)}
                      >
                        <PlusIcon className="size-[7vw]" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          ))}
        </div>
      </div>

      {selectedProduct ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close product details"
              className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full bg-white/90 text-[#232323] shadow"
              onClick={() => setSelectedProduct(null)}
            >
              <CloseIcon className="size-6" />
            </button>
            <Image
              src={selectedProduct.image}
              alt={selectedProduct.name}
              width={480}
              height={480}
              sizes="(max-width: 448px) calc(100vw - 88px), 344px"
              className="aspect-square w-full rounded-xl object-cover"
            />
            <h2 id="product-detail-title" className="mt-4 text-xl font-bold text-[#232323]">
              {selectedProduct.name}
            </h2>
            {selectedProduct.description ? (
              <p className="mt-2 text-sm leading-relaxed text-[#93999f]">
                {selectedProduct.description}
              </p>
            ) : null}
            <p className="mt-4 text-2xl font-bold text-[#fb4f45]">
              {formatVnd(selectedProduct.price)}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
