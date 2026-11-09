"use client";

import {
  type ChangeEvent,
  type MouseEvent,
  type TouchEvent,
  useEffect,
  useRef,
  useState,
} from "react";

interface VirtualTryOnModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  brand: string;
  frameShape: string;
  frameImage: string;
  price?: number | null;
}

type TryOnSource = "camera" | "upload" | "studio";
type CoatingTint = "original" | "bluecut" | "transitions" | "polarized";

export function VirtualTryOnModal({
  open,
  onClose,
  productName,
  brand,
  frameShape,
  frameImage,
  price,
}: VirtualTryOnModalProps) {
  const [source, setSource] = useState<TryOnSource>("studio");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedSelfie, setUploadedSelfie] = useState<string | null>(null);
  const [processedFrameUrl, setProcessedFrameUrl] = useState<string | null>(
    null,
  );

  // Interactive calibration controls
  const [posX, setPosX] = useState<number>(50); // %
  const [posY, setPosY] = useState<number>(43); // %
  const [scale, setScale] = useState<number>(100); // %
  const [rotation, setRotation] = useState<number>(0); // deg
  const [coating, setCoating] = useState<CoatingTint>("original");
  const [dragging, setDragging] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. Automatically key out the light studio background from the product frame photo
  useEffect(() => {
    if (!open || !frameImage) return;
    let cancelled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const w = 600;
      const h = Math.round((img.height / img.width) * w) || 450;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Sample top-left & top-right corners to detect studio background color
      const bgR = (data[0] + data[(w - 1) * 4]) / 2;
      const bgG = (data[1] + data[(w - 1) * 4 + 1]) / 2;
      const bgB = (data[2] + data[(w - 1) * 4 + 2]) / 2;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Crop out bottom pedestal region (below 74% height) or background pixels
          const verticalRatio = y / h;
          const horizEdge = Math.min(x / w, (w - x) / w);

          const colorDist = Math.hypot(r - bgR, g - bgG, b - bgB);
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const saturation = Math.max(r, g, b) - Math.min(r, g, b);

          // Remove studio background, bright pedestal cylinder, and soft edge vignette
          const isStudioBg =
            colorDist < 46 ||
            (luma > 168 && saturation < 28) ||
            verticalRatio > 0.72 ||
            verticalRatio < 0.16 ||
            horizEdge < 0.05;

          if (isStudioBg) {
            data[idx + 3] = 0;
          } else if (colorDist < 68 && saturation < 32) {
            // Smooth feathering on rim edges
            data[idx + 3] = Math.round(((colorDist - 46) / 22) * 255);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      setProcessedFrameUrl(canvas.toDataURL("image/png"));
    };
    img.src = frameImage;

    return () => {
      cancelled = true;
    };
  }, [open, frameImage]);

  // 2. Manage live webcam stream when source === "camera"
  useEffect(() => {
    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    if (!open || source !== "camera") {
      stopStream();
      return;
    }

    let active = true;
    navigator.mediaDevices
      ?.getUserMedia({
        video: { facingMode: "user", width: 720, height: 720 },
        audio: false,
      })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!active) return;
        setCameraError(
          "Camera permission was blocked or no webcam was found. Try uploading a selfie or using our Studio Model below.",
        );
      });

    return () => {
      active = false;
      stopStream();
    };
  }, [open, source]);

  if (!open) return null;

  const handleSelfieUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedSelfie(reader.result);
        setSource("upload");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 100;
    const ny = ((e.clientY - rect.top) / rect.height) * 100;
    setPosX(Math.max(15, Math.min(85, nx)));
    setPosY(Math.max(15, Math.min(85, ny)));
  };

  const handleStageTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!dragging || !stageRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = stageRef.current.getBoundingClientRect();
    const nx = ((touch.clientX - rect.left) / rect.width) * 100;
    const ny = ((touch.clientY - rect.top) / rect.height) * 100;
    setPosX(Math.max(15, Math.min(85, nx)));
    setPosY(Math.max(15, Math.min(85, ny)));
  };

  const resetAlignment = () => {
    setPosX(50);
    setPosY(43);
    setScale(100);
    setRotation(0);
    setCoating("original");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Virtual Face Try-On for ${productName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#15181E]/85 p-2 sm:p-4 backdrop-blur-xl"
    >
      <div className="relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-y-auto rounded-3xl border border-[#5AA2E6]/45 bg-[#F4F2EC] text-[#15181E] shadow-[0_32px_90px_rgba(0,0,0,0.55)] lg:flex-row lg:overflow-hidden">
        {/* LEFT: INTERACTIVE FACE MIRROR STAGE */}
        <div className="relative flex flex-1 flex-col bg-[#15181E] p-3.5 sm:p-6">
          {/* Top Stage Bar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#5AA2E6] shadow-[0_0_8px_#5AA2E6]" />
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-[0.16em] text-[#99CEFF] uppercase">
                OPTICAL MIRROR // DRAG TO FIT
              </span>
            </div>

            {/* Source Switcher Pills */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSource("camera")}
                className={`rounded-full px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase transition ${
                  source === "camera"
                    ? "bg-[#5AA2E6] text-[#15181E]"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                📷 Live Camera
              </button>
              <label
                className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase transition ${
                  source === "upload"
                    ? "bg-[#5AA2E6] text-[#15181E]"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                📁 Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelfieUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setSource("studio")}
                className={`rounded-full px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase transition ${
                  source === "studio"
                    ? "bg-[#5AA2E6] text-[#15181E]"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                👤 Studio Model
              </button>
            </div>
          </div>

          {/* Mirror Viewport */}
          <div
            ref={stageRef}
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
            onMouseMove={handleStageMouseMove}
            onTouchStart={() => setDragging(true)}
            onTouchEnd={() => setDragging(false)}
            onTouchMove={handleStageTouchMove}
            className="relative flex min-h-[300px] sm:min-h-[420px] flex-1 cursor-grab select-none items-center justify-center overflow-hidden rounded-2xl border border-[#5AA2E6]/35 bg-[#0E1015] active:cursor-grabbing"
          >
            {/* 1. Live Webcam Feed */}
            {source === "camera" ? (
              cameraError ? (
                <div className="max-w-sm p-4 sm:p-6 text-center text-xs leading-relaxed text-[#CBD2DC]">
                  <p className="font-mono text-xs sm:text-sm font-bold text-[#82C3FF]">
                    CAMERA UNAVAILABLE
                  </p>
                  <p className="mt-2">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setSource("studio")}
                    className="mt-3 rounded-full bg-[#5AA2E6] px-3.5 py-1.5 font-mono text-[10px] font-bold text-[#15181E] uppercase"
                  >
                    Switch to Studio Model
                  </button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full scale-x-[-1] object-cover"
                />
              )
            ) : null}

            {/* 2. Uploaded Selfie */}
            {source === "upload" ? (
              uploadedSelfie ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadedSelfie}
                  alt="Uploaded user selfie"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="p-6 text-center text-xs text-[#CBD2DC]">
                  Select a selfie photo from your device to test the frame.
                </div>
              )
            ) : null}

            {/* 3. Studio Portrait Face */}
            {source === "studio" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/editorial/hero-campaign.jpg"
                alt="Studio Try-On Model"
                className="h-full w-full object-cover object-center"
              />
            ) : null}

            {/* Subtle Facial Pupillary Alignment Reticle */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-56 w-40 sm:h-64 sm:w-48 rounded-full border border-dashed border-[#7EC0FF]/30" />
            </div>

            {/* DRAGGABLE TRANSPARENT FRAME OVERLAY */}
            <div
              style={{
                left: `${posX}%`,
                top: `${posY}%`,
                width: `${(scale / 100) * 68}%`,
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
              }}
              className="pointer-events-none absolute z-20 transition-transform duration-75"
            >
              {/* Optional Coating Reflection Tint */}
              {coating !== "original" ? (
                <div
                  className="absolute inset-x-[12%] inset-y-[26%] rounded-full opacity-55 mix-blend-screen"
                  style={{
                    background:
                      coating === "bluecut"
                        ? "linear-gradient(135deg, rgba(90,162,230,0.65), rgba(126,192,255,0.2))"
                        : coating === "transitions"
                          ? "linear-gradient(135deg, rgba(25,22,18,0.85), rgba(65,50,35,0.75))"
                          : "linear-gradient(135deg, rgba(16,85,60,0.75), rgba(21,24,30,0.8))",
                  }}
                />
              ) : null}

              {/* Keyed-out Transparent Frame Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={processedFrameUrl || frameImage}
                alt={productName}
                className="w-full drop-shadow-[0_14px_20px_rgba(0,0,0,0.55)]"
              />
            </div>

            {/* Bottom Instruction Pill */}
            <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-[#15181E]/85 px-3 py-1 font-mono text-[8.5px] sm:text-[9.5px] tracking-wider text-[#99CEFF] uppercase backdrop-blur-md text-center max-w-[90%]">
              Drag on Mirror to Position Frame Over Eyes
            </div>
          </div>
        </div>

        {/* RIGHT: CALIBRATION CONTROLS & LENS COATING SIMULATOR */}
        <div className="flex w-full flex-col justify-between bg-[#DCE2EC] p-4 sm:p-6 lg:w-88">
          <div>
            <div className="flex items-start justify-between gap-2 border-b border-[#15181E]/15 pb-3">
              <div>
                <p className="font-mono text-[9.5px] font-bold tracking-[0.2em] text-[#2B6CB0] uppercase">
                  {brand} · {frameShape}
                </p>
                <h2 className="mt-0.5 font-display text-xl sm:text-2xl font-bold text-[#15181E]">
                  {productName}
                </h2>
                {price ? (
                  <p className="mt-0.5 font-mono text-xs font-bold text-[#2B6CB0]">
                    PKR {price.toLocaleString()}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#15181E]/20 bg-[#F4F2EC] px-3 py-1 font-mono text-xs font-bold text-[#15181E] hover:bg-[#15181E] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* Calibration Sliders */}
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#15181E]/12 bg-[#F4F2EC] p-3">
                <div className="flex justify-between font-mono text-[9.5px] font-bold uppercase">
                  <span>Frame Size (PD Scale)</span>
                  <span className="text-[#2B6CB0]">{scale}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="145"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="mt-1.5 w-full cursor-pointer accent-[#2B6CB0]"
                />
              </div>

              <div className="rounded-xl border border-[#15181E]/12 bg-[#F4F2EC] p-3">
                <div className="flex justify-between font-mono text-[9.5px] font-bold uppercase">
                  <span>Bridge Height (Y-Axis)</span>
                  <span className="text-[#2B6CB0]">{Math.round(posY)}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="75"
                  value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="mt-1.5 w-full cursor-pointer accent-[#2B6CB0]"
                />
              </div>

              <div className="rounded-xl border border-[#15181E]/12 bg-[#F4F2EC] p-3">
                <div className="flex justify-between font-mono text-[9.5px] font-bold uppercase">
                  <span>Head Tilt Angle</span>
                  <span className="text-[#2B6CB0]">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="mt-1.5 w-full cursor-pointer accent-[#2B6CB0]"
                />
              </div>

              {/* Lens Coating Preview Selector */}
              <div className="rounded-xl border border-[#15181E]/12 bg-[#F4F2EC] p-3">
                <p className="font-mono text-[9.5px] font-bold tracking-wider text-[#15181E] uppercase">
                  Preview Lens Coating on Face
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: "original", label: "Standard Lens" },
                      { id: "bluecut", label: "Sapphire AR" },
                      { id: "transitions", label: "Transitions®" },
                      { id: "polarized", label: "G15 Sun Tint" },
                    ] as { id: CoatingTint; label: string }[]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCoating(item.id)}
                      className={`rounded-lg px-2 py-1 font-mono text-[9.5px] font-semibold transition ${
                        coating === item.id
                          ? "bg-[#15181E] text-[#99CEFF]"
                          : "bg-[#DCE2EC] text-[#15181E] hover:bg-[#5AA2E6]/25"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-5 flex flex-col gap-2 border-t border-[#15181E]/15 pt-3">
            <button
              type="button"
              onClick={resetAlignment}
              className="w-full rounded-full border border-[#15181E]/20 bg-[#F4F2EC] py-2 font-mono text-[10px] font-semibold tracking-wider text-[#15181E] uppercase transition hover:border-[#2B6CB0]"
            >
              Reset Position
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-[#15181E] py-2.5 font-mono text-[11px] font-bold tracking-widest text-[#F4F2EC] uppercase shadow-lg transition hover:bg-[#2B6CB0]"
            >
              Done — Return to Frame
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
