import { Archivo, Instrument_Serif, JetBrains_Mono } from 'next/font/google';

export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-sans',
});

export const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
});

// xng is a developer tool, so the monospace face does heavier lifting here than
// on the marketing sites. JetBrains Mono reads well at small sizes in code blocks
// and the decoder console, with strong glyph distinction (0/O, 1/l/I).
export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-mono',
});
