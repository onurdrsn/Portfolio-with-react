/**
 * Shared layout + style primitives for the v4 UI.
 * Keeping these in one place guarantees one spacing rhythm, one type scale
 * and one button language across every section.
 */

export const cx = (...classes) => classes.filter(Boolean).join(" ");

/** Page container: consistent max-width and adaptive gutters per breakpoint. */
export function Container({ as: Tag = "div", className, children, ...rest }) {
  return (
    <Tag
      className={cx("mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Section wrapper: shared vertical rhythm + hairline divider. */
export function Section({ id, labelledBy, className, children }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx("border-t border-ink-line py-20 sm:py-24 lg:py-28", className)}
    >
      {children}
    </section>
  );
}

/** Numbered eyebrow + H2 + lead paragraph. */
export function SectionHeader({ index, eyebrow, title, description, titleId, className }) {
  return (
    <header className={cx("max-w-xl", className)}>
      <p className="font-code text-xs uppercase tracking-[0.14em] text-paper-subtle">
        {index && (
          <span aria-hidden="true" className="mr-3 text-paper-muted">
            {index}
          </span>
        )}
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-paper text-balance sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-paper-muted text-pretty">
          {description}
        </p>
      )}
    </header>
  );
}

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: cx(buttonBase, "bg-paper text-ink hover:bg-white"),
  secondary: cx(
    buttonBase,
    "border border-ink-line-strong text-paper hover:border-paper-subtle hover:bg-ink-hover",
  ),
  ghost: cx(buttonBase, "px-3 text-paper-muted hover:bg-ink-hover hover:text-paper"),
};

/** Underlined text link style used for inline / list links. */
export const textLink =
  "underline decoration-ink-line-strong underline-offset-4 transition-colors hover:text-paper hover:decoration-paper";
