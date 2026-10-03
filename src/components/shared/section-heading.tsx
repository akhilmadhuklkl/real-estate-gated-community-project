import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
}: SectionHeadingProps) {
  return (
    <header className="section-heading" data-align={align}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description ? (
        <div className="section-heading__description">{description}</div>
      ) : null}
    </header>
  );
}
