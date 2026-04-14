/**
 * Soft left + right fades to blend the waves into the viewport edges.
 */
export function EdgeVignettes() {
  return (
    <>
      <div className="ob-vignette-l" aria-hidden="true" />
      <div className="ob-vignette-r" aria-hidden="true" />
    </>
  );
}
