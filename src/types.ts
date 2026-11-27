/** Page orientation of the document section. */
export type Orientation = 'portrait' | 'landscape';

/** Page margins, in TWIP. */
export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  header: number;
  footer: number;
  gutter: number;
}
