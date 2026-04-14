import { IkaryLogo } from '@ikary/system-ikary-ui/ui';
import { EXTERNAL_LINKS } from '../../config/links';

/**
 * IKARY brand lockup for the header. `IkaryLogo` swaps between the black
 * and white wordmark via CSS (`.dark` class) — zero JS on theme change.
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
      <IkaryLogo variant="full-auto" height={22} />
      <span className="app-title-subdomain">try</span>
    </a>
  );
}
