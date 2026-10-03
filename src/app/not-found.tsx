import { ActionLink } from "@/components/shared/action-link";

export default function NotFound() {
  return (
    <main className="system-state">
      <div className="system-state__content">
        <p className="eyebrow">Page not found</p>
        <h1>This path leads elsewhere.</h1>
        <p>
          The page may have moved or is not yet part of the approved project
          experience.
        </p>
        <ActionLink href="/">Return home</ActionLink>
      </div>
    </main>
  );
}
