"use client";

import { localizePath } from "@company/localization";
import type { Locale } from "@company/schemas";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const searchLabels = {
  ar: {
    cancel: "إغلاق البحث",
    input: "اكتب كلمات البحث",
    open: "فتح البحث",
    placeholder: "ابحث في موفيرا",
    submit: "بحث",
  },
  en: {
    cancel: "Close search",
    input: "Enter search terms",
    open: "Open search",
    placeholder: "Search MOVERA",
    submit: "Search",
  },
} as const;

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="m6 6 12 12M18 6 6 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function SiteHeaderSearch({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labels = searchLabels[locale];

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      return;
    }

    if (returnFocusRef.current) {
      returnFocusRef.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  function closeSearch() {
    returnFocusRef.current = true;
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    closeSearch();
  }

  return (
    <div className="header-search" data-open={open}>
      <button
        aria-controls={inputId}
        aria-expanded={open}
        aria-label={labels.open}
        className="header-search__trigger"
        hidden={open}
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <SearchIcon />
      </button>
      <form
        action={localizePath("/search", locale)}
        aria-label={labels.submit}
        className="header-search__form"
        hidden={!open}
        method="get"
        onKeyDown={handleKeyDown}
        role="search"
      >
        <SearchIcon />
        <label className="visually-hidden" htmlFor={inputId}>
          {labels.input}
        </label>
        <input
          autoComplete="off"
          id={inputId}
          name="q"
          placeholder={labels.placeholder}
          ref={inputRef}
          type="search"
        />
        <button
          aria-label={labels.submit}
          className="header-search__submit"
          type="submit"
        >
          <SearchIcon />
        </button>
        <button
          aria-label={labels.cancel}
          className="header-search__cancel"
          onClick={closeSearch}
          type="button"
        >
          <CloseIcon />
        </button>
      </form>
    </div>
  );
}
