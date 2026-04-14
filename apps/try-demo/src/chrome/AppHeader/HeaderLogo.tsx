import { EXTERNAL_LINKS } from '../../config/links';

/**
 * Ikary brand lockup for the header. The two `<img>` tags swap via CSS
 * (`.dark` class), avoiding a render on theme change.
 */
export function HeaderLogo() {
  return (
    <a
      className="app-title"
      href={EXTERNAL_LINKS.product}
      target="_blank"
      rel="noreferrer"
      aria-label="Ikary"
    >
      <img className="app-logo app-logo-light" src="/brand/black-full.svg" alt="Ikary" />
      <img className="app-logo app-logo-dark" src="/brand/white-full.svg" alt="Ikary" />
      <span className="app-title-subdomain">try</span>
    </a>
  );
}
