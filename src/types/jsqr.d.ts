declare module 'jsqr' {
  interface JsQrResult {
    binaryData: Uint8ClampedArray;
    data: string;
    chunks: Array<{ type: string; text: string }>;
    location: {
      topLeftCorner: { x: number; y: number };
      topRightCorner: { x: number; y: number };
      bottomLeftCorner: { x: number; y: number };
      bottomRightCorner: { x: number; y: number };
    };
  }

  interface JsQrOptions {
    inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst';
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: JsQrOptions
  ): JsQrResult | null;
}
