import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  onEscape?: () => void;
  initialFocus?: "first" | "none";
};

export function useFocusTrap(
  active: boolean,
  ref: RefObject<HTMLElement | null>,
  options: Options = {},
): void {
  const { onEscape, initialFocus = "first" } = options;

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const focusable = () =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (element) => element.tabIndex !== -1 && !element.hasAttribute("disabled"),
      );

    if (initialFocus === "first") {
      const items = focusable();
      (items[0] ?? root).focus();
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !root.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, initialFocus, onEscape, ref]);
}
