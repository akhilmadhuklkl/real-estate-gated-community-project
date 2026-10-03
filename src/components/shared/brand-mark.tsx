import Link from "next/link";

type BrandMarkProps = { inverse?: boolean };

export function BrandMark({ inverse = false }: BrandMarkProps) {
  return (
    <Link
      className="brand-mark"
      data-inverse={inverse || undefined}
      href="/"
      aria-label="Glitz Pride home"
    >
      <span className="brand-mark__seal" aria-hidden="true">
        GP
      </span>
      <span className="brand-mark__name">
        <strong>Glitz Pride</strong>
        <small>Villa community</small>
      </span>
    </Link>
  );
}
