import Image from "next/image";

import { ActionLink } from "./action-link";
import { PageShell } from "./page-shell";
import { SectionHeading } from "./section-heading";

type PlannedPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc?: string;
};

export function PlannedPage({
  eyebrow,
  title,
  description,
  imageSrc,
}: PlannedPageProps) {
  return (
    <main className="planned-page">
      <PageShell className="planned-page__grid">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={<p>{description}</p>}
        />
        <div className="planned-page__visual">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : null}
          <span>Production content in preparation</span>
        </div>
        <ActionLink href="/">Return home</ActionLink>
      </PageShell>
    </main>
  );
}
