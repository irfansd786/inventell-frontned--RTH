import React, { useMemo } from 'react';

// Standard EAN-13 Encodings
const L_CODE = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011'
];
const G_CODE = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111101', '0000101', '0010001', '0001001', '0010111'
];
const R_CODE = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100'
];
const FIRST_PARITY = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
];

/**
 * Standard EAN-13 SVG Barcode Renderer
 */
export default function BarcodeVisual({ value = '8901234567890', className = '', height = 44, showDigits = true }) {
  const digits = useMemo(() => {
    const raw = String(value).replace(/\D/g, '');
    return raw.padEnd(13, '0').slice(0, 13);
  }, [value]);

  const { modules, guardIndices } = useMemo(() => {
    const firstDigit = parseInt(digits[0], 10) || 0;
    const parity = FIRST_PARITY[firstDigit] || 'LLLLLL';

    let pattern = '';
    const guards = new Set();

    // Start Guard: 101
    for (let i = 0; i < 3; i++) guards.add(pattern.length + i);
    pattern += '101';

    // Left 6 digits
    for (let i = 1; i <= 6; i++) {
      const d = parseInt(digits[i], 10) || 0;
      const useG = parity[i - 1] === 'G';
      pattern += useG ? G_CODE[d] : L_CODE[d];
    }

    // Center Guard: 01010
    const centerStart = pattern.length;
    for (let i = 0; i < 5; i++) guards.add(centerStart + i);
    pattern += '01010';

    // Right 6 digits
    for (let i = 7; i <= 12; i++) {
      const d = parseInt(digits[i], 10) || 0;
      pattern += R_CODE[d];
    }

    // End Guard: 101
    const endStart = pattern.length;
    for (let i = 0; i < 3; i++) guards.add(endStart + i);
    pattern += '101';

    return { modules: pattern, guardIndices: guards };
  }, [digits]);

  const moduleWidth = 2.1;
  const totalWidth = modules.length * moduleWidth;
  const mainBarHeight = height;
  const guardBarHeight = height + 5;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${guardBarHeight + 1}`}
        className="w-full max-w-[210px] h-auto"
        style={{ minHeight: `${height}px` }}
      >
        {modules.split('').map((bit, idx) => {
          if (bit === '0') return null;
          const isGuard = guardIndices.has(idx);
          const barH = isGuard ? guardBarHeight : mainBarHeight;
          return (
            <rect
              key={idx}
              x={idx * moduleWidth}
              y={0}
              width={moduleWidth}
              height={barH}
              className="fill-slate-800 dark:fill-slate-100"
            />
          );
        })}
      </svg>
      {showDigits && (
        <span className="font-mono text-[11px] font-bold tracking-[0.22em] text-slate-800 dark:text-slate-200 mt-1">
          {digits.slice(0, 1)} {digits.slice(1, 7)} {digits.slice(7, 13)}
        </span>
      )}
    </div>
  );
}
