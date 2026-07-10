// ─── QR Code Display ──────────────────────────────────────────────────────────

export default function QRCodeDisplay({ value, size = 180 }: { value: string; size?: number }) {
  const cells = 25;
  const cs = size / cells;
  const grid: boolean[][] = Array(cells).fill(null).map(() => Array(cells).fill(false));

  const drawFinder = (sr: number, sc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        grid[sr + r][sc + c] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, cells - 7);
  drawFinder(cells - 7, 0);

  for (let i = 8; i < cells - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  let seed = value.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) | 0, 1234567);
  const rand = () => {
    seed ^= seed << 13;
    seed ^= seed >> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (!(r < 9 && c < 9) && !(r < 9 && c >= cells - 8) && !(r >= cells - 8 && c < 9) && r !== 6 && c !== 6) {
        grid[r][c] = rand() > 0.42;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" />
      {grid.flatMap((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect key={`${r}-${c}`} x={c * cs + 0.5} y={r * cs + 0.5} width={cs - 1} height={cs - 1} fill="#1A080E" rx={1} />
          ) : null
        )
      )}
    </svg>
  );
}
