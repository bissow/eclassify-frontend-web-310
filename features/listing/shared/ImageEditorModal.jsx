"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "@/lang/useTranslation";
import { cn } from "@/lib/utils";
import {
  CropIcon,
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  FadersIcon,
  SparkleIcon,
  TextTIcon,
  StickerIcon,
  ArrowsHorizontalIcon,
  ArrowsVerticalIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsInIcon,
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
} from "@phosphor-icons/react";

const FILTER_PRESETS = [
  { id: "none", label: "Original" },
  { id: "grayscale", label: "Grayscale" },
  { id: "sepia", label: "Sepia" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
  { id: "vintage", label: "Vintage" },
  { id: "invert", label: "Invert" },
  { id: "contrast", label: "Vibrant" },
];

const ASPECT_RATIOS = [
  { id: "free", label: "Free", value: null },
  { id: "1:1", label: "1 : 1 (Square)", value: 1 },
  { id: "4:3", label: "4 : 3 (Standard)", value: 4 / 3 },
  { id: "16:9", label: "16 : 9 (Wide)", value: 16 / 9 },
  { id: "9:16", label: "9 : 16 (Story)", value: 9 / 16 },
  { id: "3:2", label: "3 : 2 (Classic)", value: 3 / 2 },
];

const QUICK_COLORS = [
  "#FFFFFF",
  "#000000",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
];

const QUICK_BADGES = [
  { text: "SALE", bg: "#E11D48" },
  { text: "HOT DEAL", bg: "#EA580C" },
  { text: "NEW", bg: "#16A34A" },
  { text: "VERIFIED", bg: "#2563EB" },
  { text: "FEATURED", bg: "#7C3AED" },
  { text: "BEST OFFER", bg: "#D97706" },
  { text: "TOP RATED", bg: "#059669" },
  { text: "URGENT", bg: "#DC2626" },
];

export default function ImageEditorModal({ open, onClose, fileObj, onSave }) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("crop");
  const [zoomLevel, setZoomLevel] = useState(1.0);

  // Editor State
  const [rotation, setRotation] = useState(0);
  const [fineRotation, setFineRotation] = useState(0);
  const [flipH, setFlipH] = useState(1);
  const [flipV, setFlipV] = useState(1);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [filter, setFilter] = useState("none");
  const [overlays, setOverlays] = useState([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState(null);
  const [imageVersion, setImageVersion] = useState(0);

  // Crop Box state in pixels
  const [cropAspect, setCropAspect] = useState(null);
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [cropActive, setCropActive] = useState(false);

  // Text tool form inputs
  const [textInput, setTextInput] = useState("");
  const [fontFamily, setFontFamily] = useState("sans-serif");
  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [bgColor, setBgColor] = useState("transparent");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isUppercase, setIsUppercase] = useState(false);
  const [hasShadow, setHasShadow] = useState(false);
  const [textAlign, setTextAlign] = useState("center");

  // Custom Badge input
  const [customBadgeText, setCustomBadgeText] = useState("");
  const [customBadgeColor, setCustomBadgeColor] = useState("#E11D48");

  // Refs
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const wrapperRef = useRef(null);
  const originalImageRef = useRef(null);
  const currentImageRef = useRef(null);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  // Load and initialize source image when modal opens or fileObj changes
  useEffect(() => {
    if (!open || !fileObj) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    const src = fileObj.preview || (fileObj.file ? URL.createObjectURL(fileObj.file) : null);
    if (!src) return;

    img.onload = () => {
      originalImageRef.current = img;
      currentImageRef.current = img;
      setRotation(0);
      setFineRotation(0);
      setFlipH(1);
      setFlipV(1);
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setFilter("none");
      setOverlays([]);
      setSelectedOverlayId(null);
      setZoomLevel(1.0);
      setCropAspect(null);
      historyRef.current = [];
      historyIndexRef.current = -1;
      setActiveTab("crop");
    };
    img.src = src;
  }, [open, fileObj]);

  // Push history snapshot
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const snapshot = {
      dataUrl: canvas.toDataURL("image/jpeg", 0.92),
      state: {
        rotation,
        fineRotation,
        flipH,
        flipV,
        brightness,
        contrast,
        saturation,
        filter,
        overlays: JSON.parse(JSON.stringify(overlays)),
      },
    };

    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshot);
    if (newHistory.length > 20) newHistory.shift();
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, [rotation, fineRotation, flipH, flipV, brightness, contrast, saturation, filter, overlays]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const snapshot = historyRef.current[historyIndexRef.current];
      if (!snapshot) return;
      const img = new Image();
      img.onload = () => {
        currentImageRef.current = img;
        const st = snapshot.state;
        setRotation(st.rotation);
        setFineRotation(st.fineRotation);
        setFlipH(st.flipH);
        setFlipV(st.flipV);
        setBrightness(st.brightness);
        setContrast(st.contrast);
        setSaturation(st.saturation);
        setFilter(st.filter);
        setOverlays(st.overlays);
      };
      img.src = snapshot.dataUrl;
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const snapshot = historyRef.current[historyIndexRef.current];
      if (!snapshot) return;
      const img = new Image();
      img.onload = () => {
        currentImageRef.current = img;
        const st = snapshot.state;
        setRotation(st.rotation);
        setFineRotation(st.fineRotation);
        setFlipH(st.flipH);
        setFlipV(st.flipV);
        setBrightness(st.brightness);
        setContrast(st.contrast);
        setSaturation(st.saturation);
        setFilter(st.filter);
        setOverlays(st.overlays);
      };
      img.src = snapshot.dataUrl;
    }
  }, []);

  // Reset all adjustments
  const handleReset = useCallback(() => {
    if (!originalImageRef.current) return;
    currentImageRef.current = originalImageRef.current;
    setRotation(0);
    setFineRotation(0);
    setFlipH(1);
    setFlipV(1);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setFilter("none");
    setOverlays([]);
    setSelectedOverlayId(null);
    setZoomLevel(1.0);
    setCropAspect(null);
  }, []);

  // Fit canvas into viewport
  const fitCanvas = useCallback(() => {
    const viewport = viewportRef.current;
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !wrapper || !canvas || !currentImageRef.current) return;

    const pad = 36;
    const availW = Math.max(100, viewport.clientWidth - pad);
    const availH = Math.max(100, viewport.clientHeight - pad);

    const nativeW = canvas.width;
    const nativeH = canvas.height;
    if (!nativeW || !nativeH) return;

    const aspect = nativeW / nativeH;
    let displayW, displayH;

    if (availW / availH > aspect) {
      displayH = availH;
      displayW = displayH * aspect;
    } else {
      displayW = availW;
      displayH = displayW / aspect;
    }

    displayW = Math.round(displayW * zoomLevel);
    displayH = Math.round(displayH * zoomLevel);

    wrapper.style.width = `${displayW}px`;
    wrapper.style.height = `${displayH}px`;
  }, [zoomLevel]);

  // Main Canvas Render
  const renderCanvas = useCallback(() => {
    const img = currentImageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const ctx = canvas.getContext("2d");
    const rot = rotation % 360;
    const totalDeg = rot + fineRotation;
    const is90 = Math.abs(rot) === 90 || Math.abs(rot) === 270;
    const w = is90 ? img.height : img.width;
    const h = is90 ? img.width : img.height;

    canvas.width = w;
    canvas.height = h;

    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate((totalDeg * Math.PI) / 180);
    ctx.scale(flipH, flipV);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    // Apply pixel adjustments & filters
    if (brightness !== 0 || contrast !== 0 || saturation !== 0 || filter !== "none") {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        if (brightness !== 0) {
          r += brightness * 1.5;
          g += brightness * 1.5;
          b += brightness * 1.5;
        }

        // Contrast
        if (contrast !== 0) {
          r = contrastFactor * (r - 128) + 128;
          g = contrastFactor * (g - 128) + 128;
          b = contrastFactor * (b - 128) + 128;
        }

        // Preset Filters
        if (filter === "grayscale") {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = g = b = gray;
        } else if (filter === "sepia") {
          const sr = r * 0.393 + g * 0.769 + b * 0.189;
          const sg = r * 0.349 + g * 0.686 + b * 0.168;
          const sb = r * 0.272 + g * 0.534 + b * 0.131;
          r = sr; g = sg; b = sb;
        } else if (filter === "warm") {
          r += 25; b -= 15;
        } else if (filter === "cool") {
          r -= 15; b += 25;
        } else if (filter === "vintage") {
          const vgray = 0.299 * r + 0.587 * g + 0.114 * b;
          r = vgray + 40; g = vgray + 20; b = vgray - 10;
        } else if (filter === "invert") {
          r = 255 - r; g = 255 - g; b = 255 - b;
        } else if (filter === "contrast") {
          r = 1.3 * (r - 128) + 128;
          g = 1.3 * (g - 128) + 128;
          b = 1.3 * (b - 128) + 128;
        }

        // Saturation
        if (saturation !== 0) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          const satRatio = 1 + saturation / 100;
          r = lum + (r - lum) * satRatio;
          g = lum + (g - lum) * satRatio;
          b = lum + (b - lum) * satRatio;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }
      ctx.putImageData(imgData, 0, 0);
    }

    fitCanvas();
  }, [rotation, fineRotation, flipH, flipV, brightness, contrast, saturation, filter, imageVersion, fitCanvas]);

  // Re-render canvas on state change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => fitCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitCanvas]);

  // Sync selected overlay properties into the sidebar inputs
  useEffect(() => {
    if (!selectedOverlayId) return;
    const ov = overlays.find((o) => o.id === selectedOverlayId);
    if (!ov) return;

    if (ov.type === "text") {
      setTextInput(ov.text || "");
      setFontSize(ov.size || 28);
      setFontFamily(ov.fontFamily || "sans-serif");
      setTextColor(ov.color || "#FFFFFF");
      setBgColor(ov.bgColor || "transparent");
      setIsBold(!!ov.bold);
      setIsItalic(!!ov.italic);
      setIsUnderline(!!ov.underline);
      setIsUppercase(!!ov.uppercase);
      setHasShadow(!!ov.shadow);
      setTextAlign(ov.align || "center");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOverlayId]);

  // Update selected overlay when text tool inputs change
  const updateSelectedOverlay = useCallback((updates) => {
    if (!selectedOverlayId) return;
    setOverlays((prev) =>
      prev.map((o) => (o.id === selectedOverlayId ? { ...o, ...updates } : o))
    );
  }, [selectedOverlayId]);

  // Add new Text Overlay
  const handleAddText = useCallback(() => {
    const text = textInput.trim() || "Type text here";
    const newOverlay = {
      id: `text_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: "text",
      text,
      xRatio: 0.5,
      yRatio: 0.5,
      size: fontSize || 28,
      fontFamily,
      color: textColor,
      bgColor,
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
      uppercase: isUppercase,
      shadow: hasShadow,
      align: textAlign,
    };

    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
    pushHistory();
  }, [textInput, fontSize, fontFamily, textColor, bgColor, isBold, isItalic, isUnderline, isUppercase, hasShadow, textAlign, pushHistory]);

  // Add Badge
  const handleAddBadge = useCallback((badgeText, badgeBg) => {
    const newOverlay = {
      id: `badge_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: "badge",
      text: badgeText,
      xRatio: 0.5,
      yRatio: 0.35,
      size: 20,
      color: "#FFFFFF",
      bgColor: badgeBg || "#E11D48",
      bold: true,
      italic: false,
    };

    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
    pushHistory();
  }, [pushHistory]);

  // Delete Overlay
  const handleDeleteOverlay = useCallback((id) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
    pushHistory();
  }, [selectedOverlayId, pushHistory]);

  // Duplicate Overlay
  const handleDuplicateOverlay = useCallback(() => {
    if (!selectedOverlayId) return;
    const orig = overlays.find((o) => o.id === selectedOverlayId);
    if (!orig) return;
    const copy = {
      ...JSON.parse(JSON.stringify(orig)),
      id: `${orig.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      xRatio: Math.min(0.92, orig.xRatio + 0.05),
      yRatio: Math.min(0.92, orig.yRatio + 0.05),
    };
    setOverlays((prev) => [...prev, copy]);
    setSelectedOverlayId(copy.id);
    pushHistory();
  }, [selectedOverlayId, overlays, pushHistory]);

  // Center Overlay
  const handleCenterOverlay = useCallback(() => {
    if (!selectedOverlayId) return;
    setOverlays((prev) =>
      prev.map((o) => (o.id === selectedOverlayId ? { ...o, xRatio: 0.5, yRatio: 0.5 } : o))
    );
    pushHistory();
  }, [selectedOverlayId, pushHistory]);

  // Clear All Overlays
  const handleClearAllOverlays = useCallback(() => {
    setOverlays([]);
    setSelectedOverlayId(null);
    pushHistory();
  }, [pushHistory]);

  // Rotate helper (90 degrees)
  const handleRotate = useCallback((deg) => {
    setCropBox(null);
    setOverlays((prev) =>
      prev.map((o) => {
        let nx = o.xRatio;
        let ny = o.yRatio;
        if (deg === 90 || deg === -270) {
          nx = Math.max(0.02, Math.min(0.98, 1 - o.yRatio));
          ny = Math.max(0.02, Math.min(0.98, o.xRatio));
        } else if (deg === -90 || deg === 270) {
          nx = Math.max(0.02, Math.min(0.98, o.yRatio));
          ny = Math.max(0.02, Math.min(0.98, 1 - o.xRatio));
        }
        return { ...o, xRatio: nx, yRatio: ny };
      })
    );
    setRotation((prev) => (prev + deg) % 360);
    pushHistory();
  }, [pushHistory]);

  // Flip helper
  const handleFlip = useCallback((axis) => {
    setCropBox(null);
    if (axis === "h") {
      setFlipH((prev) => prev * -1);
      setOverlays((prev) =>
        prev.map((o) => ({ ...o, xRatio: Math.max(0.02, Math.min(0.98, 1 - o.xRatio)) }))
      );
    } else {
      setFlipV((prev) => prev * -1);
      setOverlays((prev) =>
        prev.map((o) => ({ ...o, yRatio: Math.max(0.02, Math.min(0.98, 1 - o.yRatio)) }))
      );
    }
    pushHistory();
  }, [pushHistory]);

  // Apply Crop
  const handleApplyCrop = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper || cropRect.width <= 10 || cropRect.height <= 10) return;

    const scaleX = canvas.width / wrapper.clientWidth;
    const scaleY = canvas.height / wrapper.clientHeight;

    const cx = cropRect.x * scaleX;
    const cy = cropRect.y * scaleY;
    const cw = cropRect.width * scaleX;
    const ch = cropRect.height * scaleY;

    // First bake any active overlays within bounds
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = cw;
    tempCanvas.height = ch;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);

    const croppedImg = new Image();
    croppedImg.onload = () => {
      currentImageRef.current = croppedImg;
      setRotation(0);
      setFineRotation(0);
      setFlipH(1);
      setFlipV(1);
      setOverlays([]);
      setSelectedOverlayId(null);
      setImageVersion((v) => v + 1);
      setTimeout(() => {
        if (wrapperRef.current) {
          const nw = wrapperRef.current.clientWidth;
          const nh = wrapperRef.current.clientHeight;
          setCropRect({
            x: Math.round(nw * 0.05),
            y: Math.round(nh * 0.05),
            width: Math.round(nw * 0.9),
            height: Math.round(nh * 0.9),
          });
        }
      }, 60);
      pushHistory();
    };
    croppedImg.src = tempCanvas.toDataURL("image/jpeg", 0.95);
  }, [cropRect, pushHistory]);

  // High-Resolution Bake & Export Save
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    const scale = canvas.width / wrapper.clientWidth;

    // Bake all overlays onto canvas
    overlays.forEach((o) => {
      const x = o.xRatio * canvas.width;
      const y = o.yRatio * canvas.height;

      ctx.save();
      if (o.type === "text") {
        const scaledSize = Math.max(12, Math.round((o.size || 28) * scale));
        const fontStr = `${o.italic ? "italic " : ""}${o.bold ? "bold " : ""}${scaledSize}px ${o.fontFamily || "sans-serif"}`;
        ctx.font = fontStr;
        ctx.textBaseline = "middle";
        ctx.textAlign = o.align || "center";

        const textToDraw = o.uppercase ? (o.text || "").toUpperCase() : o.text || "";
        const metrics = ctx.measureText(textToDraw);
        const textWidth = metrics.width;
        const textHeight = scaledSize * 1.25;

        // Background box
        if (o.bgColor && o.bgColor !== "transparent") {
          ctx.fillStyle = o.bgColor;
          const padX = Math.round(14 * scale);
          const padY = Math.round(8 * scale);
          let rx = x - textWidth / 2 - padX;
          if (o.align === "left") rx = x - padX;
          else if (o.align === "right") rx = x - textWidth - padX;

          const ry = y - textHeight / 2 - padY;
          const rw = textWidth + padX * 2;
          const rh = textHeight + padY * 2;
          const rad = Math.round(8 * scale);

          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(rx, ry, rw, rh, rad) : ctx.rect(rx, ry, rw, rh);
          ctx.fill();
        }

        // Outline Shadow
        if (o.shadow) {
          ctx.shadowColor = "#000000";
          ctx.shadowBlur = Math.round(6 * scale);
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = Math.round(2 * scale);
        }

        ctx.fillStyle = o.color || "#FFFFFF";
        ctx.fillText(textToDraw, x, y);

        // Underline
        if (o.underline) {
          ctx.strokeStyle = o.color || "#FFFFFF";
          ctx.lineWidth = Math.max(1, Math.round(2 * scale));
          const ulStartX = o.align === "left" ? x : o.align === "right" ? x - textWidth : x - textWidth / 2;
          const ulEndX = ulStartX + textWidth;
          const ulY = y + textHeight / 2 - Math.round(2 * scale);
          ctx.beginPath();
          ctx.moveTo(ulStartX, ulY);
          ctx.lineTo(ulEndX, ulY);
          ctx.stroke();
        }
      } else if (o.type === "badge") {
        const badgeFontSize = Math.max(14, Math.round((o.size || 20) * scale));
        ctx.font = `bold ${badgeFontSize}px sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";

        const bMetrics = ctx.measureText(o.text);
        const bWidth = bMetrics.width;
        const bPadX = Math.round(16 * scale);
        const bPadY = Math.round(10 * scale);
        const brw = bWidth + bPadX * 2;
        const brh = badgeFontSize + bPadY * 2;

        ctx.fillStyle = o.bgColor || "#E11D48";
        const bx = x - brw / 2;
        const by = y - brh / 2;
        const rad = Math.round(6 * scale);

        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(bx, by, brw, brh, rad) : ctx.rect(bx, by, brw, brh);
        ctx.fill();

        ctx.fillStyle = o.color || "#FFFFFF";
        ctx.fillText(o.text, x, y);
      }
      ctx.restore();
    });

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const origName = fileObj?.file?.name || "edited_image.jpg";
        const filename = `edited_${origName.replace(/\.[^/.]+$/, "")}.jpg`;
        const newFile = new File([blob], filename, { type: "image/jpeg" });
        const newPreviewUrl = URL.createObjectURL(blob);

        if (onSave) {
          onSave(newFile, newPreviewUrl);
        }
        onClose();
      },
      "image/jpeg",
      0.92
    );
  }, [fileObj, overlays, onSave, onClose]);

  // Initial Crop Box sizing when active
  useEffect(() => {
    if (activeTab === "crop" && wrapperRef.current) {
      const w = wrapperRef.current.clientWidth;
      const h = wrapperRef.current.clientHeight;
      let bw = w * 0.8;
      let bh = h * 0.8;
      if (cropAspect) {
        bh = bw / cropAspect;
        if (bh > h * 0.9) {
          bh = h * 0.8;
          bw = bh * cropAspect;
        }
      }
      setCropRect({
        x: Math.max(0, (w - bw) / 2),
        y: Math.max(0, (h - bh) / 2),
        width: bw,
        height: bh,
      });
      setCropActive(true);
    } else {
      setCropActive(false);
    }
  }, [activeTab, cropAspect]);

  // Overlay Dragging & 8-Handle Resizing handlers
  const handleOverlayPointerDown = (e, overlay) => {
    if (e.target.closest(".pe-overlay-del-btn") || e.target.closest(".pe-resize-handle")) return;
    setSelectedOverlayId(overlay.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const startXRatio = overlay.xRatio;
    const startYRatio = overlay.yRatio;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const nx = Math.max(0.01, Math.min(0.99, startXRatio + dx / rect.width));
      const ny = Math.max(0.01, Math.min(0.99, startYRatio + dy / rect.height));
      setOverlays((prev) =>
        prev.map((o) => (o.id === overlay.id ? { ...o, xRatio: nx, yRatio: ny } : o))
      );
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      pushHistory();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Canva-Style 8-Handle Resizing with Opposite-Corner Anchoring
  const handleResizePointerDown = (e, overlay, handleType) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedOverlayId(overlay.id);

    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch (_) {}

    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const layerRect = wrapper.getBoundingClientRect();

    const startFontSize = overlay.size || (overlay.type === "badge" ? 20 : 28);
    const itemEl = document.getElementById(`pe-ov-${overlay.id}`);
    if (!itemEl) return;
    const itemRect = itemEl.getBoundingClientRect();
    const W_0 = itemRect.width || 40;
    const H_0 = itemRect.height || 20;

    const currentCenterX = overlay.xRatio * layerRect.width;
    const currentCenterY = overlay.yRatio * layerRect.height;

    // Opposite corner anchor points in layer space
    let anchorX = currentCenterX;
    let anchorY = currentCenterY;

    const isBR = handleType === "br" || handleType === "se";
    const isTL = handleType === "tl" || handleType === "nw";
    const isTR = handleType === "tr" || handleType === "ne";
    const isBL = handleType === "bl" || handleType === "sw";
    const isMR = handleType === "mr" || handleType === "e";
    const isML = handleType === "ml" || handleType === "w";
    const isBC = handleType === "bc" || handleType === "s";
    const isTC = handleType === "tc" || handleType === "n";

    if (isBR) {
      anchorX = currentCenterX - W_0 / 2;
      anchorY = currentCenterY - H_0 / 2;
    } else if (isTL) {
      anchorX = currentCenterX + W_0 / 2;
      anchorY = currentCenterY + H_0 / 2;
    } else if (isTR) {
      anchorX = currentCenterX - W_0 / 2;
      anchorY = currentCenterY + H_0 / 2;
    } else if (isBL) {
      anchorX = currentCenterX + W_0 / 2;
      anchorY = currentCenterY - H_0 / 2;
    } else if (isMR) {
      anchorX = currentCenterX - W_0 / 2;
      anchorY = currentCenterY;
    } else if (isML) {
      anchorX = currentCenterX + W_0 / 2;
      anchorY = currentCenterY;
    } else if (isBC) {
      anchorX = currentCenterX;
      anchorY = currentCenterY - H_0 / 2;
    } else if (isTC) {
      anchorX = currentCenterX;
      anchorY = currentCenterY + H_0 / 2;
    }

    const onMove = (ev) => {
      const mouseLayerX = ev.clientX - layerRect.left;
      const mouseLayerY = ev.clientY - layerRect.top;

      let scaleRatio = 1.0;
      if (isBR) {
        const dx = mouseLayerX - anchorX;
        const dy = mouseLayerY - anchorY;
        scaleRatio = (dx * W_0 + dy * H_0) / (W_0 * W_0 + H_0 * H_0);
      } else if (isTL) {
        const dx = anchorX - mouseLayerX;
        const dy = anchorY - mouseLayerY;
        scaleRatio = (dx * W_0 + dy * H_0) / (W_0 * W_0 + H_0 * H_0);
      } else if (isTR) {
        const dx = mouseLayerX - anchorX;
        const dy = anchorY - mouseLayerY;
        scaleRatio = (dx * W_0 + dy * H_0) / (W_0 * W_0 + H_0 * H_0);
      } else if (isBL) {
        const dx = anchorX - mouseLayerX;
        const dy = mouseLayerY - anchorY;
        scaleRatio = (dx * W_0 + dy * H_0) / (W_0 * W_0 + H_0 * H_0);
      } else if (isMR) {
        const dx = mouseLayerX - anchorX;
        scaleRatio = dx / W_0;
      } else if (isML) {
        const dx = anchorX - mouseLayerX;
        scaleRatio = dx / W_0;
      } else if (isBC) {
        const dy = mouseLayerY - anchorY;
        scaleRatio = dy / H_0;
      } else if (isTC) {
        const dy = anchorY - mouseLayerY;
        scaleRatio = dy / H_0;
      }

      if (isNaN(scaleRatio) || !isFinite(scaleRatio)) scaleRatio = 1.0;

      const minSize = 12;
      const maxSize = 140;
      const newSize = Math.max(minSize, Math.min(maxSize, Math.round(startFontSize * scaleRatio)));

      // Estimate new dimensions with updated font size
      const sizeScale = newSize / startFontSize;
      const newW = W_0 * sizeScale;
      const newH = H_0 * sizeScale;

      let newCenterX = currentCenterX;
      let newCenterY = currentCenterY;

      if (isBR) {
        newCenterX = anchorX + newW / 2;
        newCenterY = anchorY + newH / 2;
      } else if (isTL) {
        newCenterX = anchorX - newW / 2;
        newCenterY = anchorY - newH / 2;
      } else if (isTR) {
        newCenterX = anchorX + newW / 2;
        newCenterY = anchorY - newH / 2;
      } else if (isBL) {
        newCenterX = anchorX - newW / 2;
        newCenterY = anchorY + newH / 2;
      } else if (isMR) {
        newCenterX = anchorX + newW / 2;
        newCenterY = anchorY;
      } else if (isML) {
        newCenterX = anchorX - newW / 2;
        newCenterY = anchorY;
      } else if (isBC) {
        newCenterX = anchorX;
        newCenterY = anchorY + newH / 2;
      } else if (isTC) {
        newCenterX = anchorX;
        newCenterY = anchorY - newH / 2;
      }

      const nx = Math.max(0.01, Math.min(0.99, newCenterX / layerRect.width));
      const ny = Math.max(0.01, Math.min(0.99, newCenterY / layerRect.height));

      setOverlays((prev) =>
        prev.map((o) => (o.id === overlay.id ? { ...o, size: newSize, xRatio: nx, yRatio: ny } : o))
      );
      setFontSize(newSize);
    };

    const onUp = (ev) => {
      try {
        ev.target.releasePointerCapture?.(ev.pointerId);
      } catch (_) {}
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      pushHistory();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Interactive Crop Box - Drag to reposition
  const handleCropMovePointerDown = (e) => {
    if (e.target.closest(".pe-crop-handle") || e.target.closest(".pe-crop-hud")) return;
    e.stopPropagation();
    e.preventDefault();

    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch (_) {}

    const startX = e.clientX;
    const startY = e.clientY;
    const initialCrop = { ...cropRect };
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = Math.max(0, Math.min(w - initialCrop.width, initialCrop.x + dx));
      const newY = Math.max(0, Math.min(h - initialCrop.height, initialCrop.y + dy));
      setCropRect((prev) => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
    };

    const onUp = (ev) => {
      try {
        ev.target.releasePointerCapture?.(ev.pointerId);
      } catch (_) {}
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Interactive Crop Box - Drag Corner or Edge Handles to resize
  const handleCropResizePointerDown = (e, handleType) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      e.target.setPointerCapture?.(e.pointerId);
    } catch (_) {}

    const startX = e.clientX;
    const startY = e.clientY;
    const initialCrop = { ...cropRect };
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    const minDim = 32;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;

      let newX = initialCrop.x;
      let newY = initialCrop.y;
      let newW = initialCrop.width;
      let newH = initialCrop.height;

      if (cropAspect) {
        // Aspect-ratio locked resizing
        if (handleType === "se" || handleType === "br") {
          let targetW = Math.max(minDim, initialCrop.width + dx);
          let targetH = targetW / cropAspect;
          if (targetH < minDim) { targetH = minDim; targetW = targetH * cropAspect; }
          if (newX + targetW > w) { targetW = w - newX; targetH = targetW / cropAspect; }
          if (newY + targetH > h) { targetH = h - newY; targetW = targetH * cropAspect; }
          newW = targetW;
          newH = targetH;
        } else if (handleType === "nw" || handleType === "tl") {
          let targetW = Math.max(minDim, initialCrop.width - dx);
          let targetH = targetW / cropAspect;
          if (targetH < minDim) { targetH = minDim; targetW = targetH * cropAspect; }
          if (initialCrop.x + initialCrop.width - targetW < 0) {
            targetW = initialCrop.x + initialCrop.width;
            targetH = targetW / cropAspect;
          }
          if (initialCrop.y + initialCrop.height - targetH < 0) {
            targetH = initialCrop.y + initialCrop.height;
            targetW = targetH * cropAspect;
          }
          newW = targetW;
          newH = targetH;
          newX = initialCrop.x + initialCrop.width - newW;
          newY = initialCrop.y + initialCrop.height - newH;
        } else if (handleType === "ne" || handleType === "tr") {
          let targetW = Math.max(minDim, initialCrop.width + dx);
          let targetH = targetW / cropAspect;
          if (targetH < minDim) { targetH = minDim; targetW = targetH * cropAspect; }
          if (newX + targetW > w) { targetW = w - newX; targetH = targetW / cropAspect; }
          if (initialCrop.y + initialCrop.height - targetH < 0) {
            targetH = initialCrop.y + initialCrop.height;
            targetW = targetH * cropAspect;
          }
          newW = targetW;
          newH = targetH;
          newY = initialCrop.y + initialCrop.height - newH;
        } else if (handleType === "sw" || handleType === "bl") {
          let targetW = Math.max(minDim, initialCrop.width - dx);
          let targetH = targetW / cropAspect;
          if (targetH < minDim) { targetH = minDim; targetW = targetH * cropAspect; }
          if (initialCrop.x + initialCrop.width - targetW < 0) {
            targetW = initialCrop.x + initialCrop.width;
            targetH = targetW / cropAspect;
          }
          if (newY + targetH > h) { targetH = h - newY; targetW = targetH * cropAspect; }
          newW = targetW;
          newH = targetH;
          newX = initialCrop.x + initialCrop.width - newW;
        }
      } else {
        // Free Crop: adjust edges independently
        if (handleType.includes("e")) {
          newW = Math.max(minDim, Math.min(w - initialCrop.x, initialCrop.width + dx));
        }
        if (handleType.includes("w")) {
          const maxDx = initialCrop.width - minDim;
          const clampedDx = Math.max(-initialCrop.x, Math.min(maxDx, dx));
          newX = initialCrop.x + clampedDx;
          newW = initialCrop.width - clampedDx;
        }
        if (handleType.includes("s")) {
          newH = Math.max(minDim, Math.min(h - initialCrop.y, initialCrop.height + dy));
        }
        if (handleType.includes("n")) {
          const maxDy = initialCrop.height - minDim;
          const clampedDy = Math.max(-initialCrop.y, Math.min(maxDy, dy));
          newY = initialCrop.y + clampedDy;
          newH = initialCrop.height - clampedDy;
        }
      }

      setCropRect({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    };

    const onUp = (ev) => {
      try {
        ev.target.releasePointerCapture?.(ev.pointerId);
      } catch (_) {}
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[96vw] sm:max-w-6xl h-[92vh] max-h-[92vh] p-0 flex flex-col overflow-hidden bg-background text-foreground border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <CropIcon size={22} className="text-primary" />
            <span>{t("imageEditor")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} className="gap-1.5">
              <CheckIcon size={16} weight="bold" />
              <span>{t("applyAndSave")}</span>
            </Button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative">
          {/* Canvas Studio Viewport */}
          <div
            ref={viewportRef}
            className="flex-1 min-h-0 min-w-0 bg-radial from-slate-800 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none"
            onPointerDown={(e) => {
              if (
                !e.target.closest(".pe-overlay-item") &&
                !e.target.closest(".pe-crop-box") &&
                !e.target.closest(".pe-zoom-hud")
              ) {
                setSelectedOverlayId(null);
              }
            }}
          >
            {/* Dynamic Sized Canvas Wrapper */}
            <div
              ref={wrapperRef}
              className="relative inline-flex items-center justify-center shadow-2xl rounded-lg leading-none transition-all duration-150 max-w-full max-h-full"
            >
              <canvas ref={canvasRef} className="block w-full h-full rounded-lg object-contain" />

              {/* Draggable Overlays Layer */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
                {overlays.map((ov) => {
                  const isSelected = selectedOverlayId === ov.id;
                  return (
                    <div
                      key={ov.id}
                      id={`pe-ov-${ov.id}`}
                      className={cn(
                        "pe-overlay-item absolute pointer-events-auto cursor-grab select-none touch-none -translate-x-1/2 -translate-y-1/2 inline-flex items-center justify-center whitespace-pre box-border",
                        isSelected && "selected ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent rounded-md"
                      )}
                      style={{
                        left: `${ov.xRatio * 100}%`,
                        top: `${ov.yRatio * 100}%`,
                      }}
                      onPointerDown={(e) => handleOverlayPointerDown(e, ov)}
                      onDoubleClick={() => {
                        setSelectedOverlayId(ov.id);
                        if (ov.type === "text") setActiveTab("text");
                      }}
                    >
                      {/* Delete button */}
                      {isSelected && (
                        <button
                          type="button"
                          className="pe-overlay-del-btn absolute -top-4 -right-4 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-md z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOverlay(ov.id);
                          }}
                        >
                          <XIcon size={12} weight="bold" />
                        </button>
                      )}

                      {/* 8 Resize Handles (Corner & Edge) */}
                      {isSelected && (
                        <>
                          {["tl", "tr", "br", "bl", "tc", "bc", "ml", "mr"].map((hType) => (
                            <div
                              key={hType}
                              className={cn("pe-resize-handle", `pe-handle-${hType}`)}
                              onPointerDown={(e) => handleResizePointerDown(e, ov, hType)}
                            />
                          ))}
                        </>
                      )}

                      {/* Content */}
                      {ov.type === "text" ? (
                        <div
                          className={cn(
                            "px-3 py-1.5 rounded-md leading-tight",
                            ov.shadow && "pe-shadow"
                          )}
                          style={{
                            fontSize: `${ov.size || 28}px`,
                            color: ov.color || "#FFFFFF",
                            backgroundColor: ov.bgColor || "transparent",
                            fontFamily: ov.fontFamily || "sans-serif",
                            fontWeight: ov.bold ? "bold" : "normal",
                            fontStyle: ov.italic ? "italic" : "normal",
                            textDecoration: ov.underline ? "underline" : "none",
                            textTransform: ov.uppercase ? "uppercase" : "none",
                            textAlign: ov.align || "center",
                          }}
                        >
                          {ov.text}
                        </div>
                      ) : (
                        <div
                          className="px-3.5 py-2 rounded-md font-bold text-lg tracking-wider text-white shadow-md"
                          style={{
                            backgroundColor: ov.bgColor || "#E11D48",
                            fontSize: `${ov.size || 20}px`,
                          }}
                        >
                          {ov.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Interactive Crop Box Overlay */}
              {cropActive && activeTab === "crop" && (
                <div
                  className="pe-crop-box absolute border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move z-30 box-border select-none touch-none"
                  style={{
                    left: `${cropRect.x}px`,
                    top: `${cropRect.y}px`,
                    width: `${cropRect.width}px`,
                    height: `${cropRect.height}px`,
                  }}
                  onPointerDown={handleCropMovePointerDown}
                >
                  {/* Rule of thirds grid lines */}
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div />
                  </div>

                  {/* 4 Corner Crop Handles */}
                  {["nw", "ne", "se", "sw"].map((h) => (
                    <div
                      key={h}
                      className={cn("pe-crop-handle", `pe-crop-handle-${h}`)}
                      onPointerDown={(e) => handleCropResizePointerDown(e, h)}
                    />
                  ))}

                  {/* 4 Edge Handles (When in Free Crop mode) */}
                  {!cropAspect &&
                    ["n", "s", "w", "e"].map((h) => (
                      <div
                        key={h}
                        className={cn("pe-crop-handle", `pe-crop-handle-${h}`)}
                        onPointerDown={(e) => handleCropResizePointerDown(e, h)}
                      />
                    ))}

                  {/* Floating Action HUD on Crop Box */}
                  <div className="pe-crop-hud absolute -bottom-11 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl pointer-events-auto">
                    <button
                      type="button"
                      className="px-2.5 py-0.5 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary/90 flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyCrop();
                      }}
                    >
                      <CheckIcon size={13} weight="bold" />
                      <span>{t("applyCrop")}</span>
                    </button>
                    <button
                      type="button"
                      className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (wrapperRef.current) {
                          const w = wrapperRef.current.clientWidth;
                          const h = wrapperRef.current.clientHeight;
                          setCropRect({ x: 0, y: 0, width: w, height: h });
                        }
                      }}
                    >
                      {t("reset")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Viewport Zoom HUD */}
            <div className="pe-zoom-hud absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-1 z-25 shadow-lg">
              <button
                type="button"
                className="w-6 h-6 text-white hover:bg-white/20 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
                onClick={() => setZoomLevel((z) => Math.max(0.3, z - 0.15))}
                title="Zoom Out"
              >
                &minus;
              </button>
              <button
                type="button"
                className="text-white hover:bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors"
                onClick={() => setZoomLevel(1.0)}
                title="Fit Screen"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                className="w-6 h-6 text-white hover:bg-white/20 rounded-full flex items-center justify-center font-bold text-sm transition-colors"
                onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.15))}
                title="Zoom In"
              >
                &plus;
              </button>
            </div>
          </div>

          {/* Tools Sidebar */}
          <div className="w-full md:w-85 bg-card border-t md:border-t-0 md:border-l border-border flex flex-col min-h-0 overflow-hidden shrink-0">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto border-b border-border bg-muted/40 shrink-0 scrollbar-none">
              {[
                { id: "crop", icon: CropIcon, label: t("crop") },
                { id: "rotate", icon: ArrowClockwiseIcon, label: t("rotate") },
                { id: "adjust", icon: FadersIcon, label: t("adjust") },
                { id: "filter", icon: SparkleIcon, label: t("filter") },
                { id: "text", icon: TextTIcon, label: t("text") },
                { id: "stickers", icon: StickerIcon, label: t("badges") },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 min-w-14 py-2.5 px-2 flex flex-col items-center gap-1 text-xs font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap",
                      isActive
                        ? "border-primary text-primary font-semibold bg-background"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Panels Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
              {/* Crop Panel */}
              {activeTab === "crop" && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("aspectRatio")}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ASPECT_RATIOS.map((asp) => (
                      <Button
                        key={asp.id}
                        type="button"
                        variant={cropAspect === asp.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCropAspect(asp.value)}
                        className="text-xs justify-start"
                      >
                        {asp.label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    onClick={handleApplyCrop}
                    className="w-full mt-2"
                  >
                    {t("applyCrop")}
                  </Button>
                </div>
              )}

              {/* Rotate & Orientation Panel */}
              {activeTab === "rotate" && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("orientation")}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleRotate(-90)} className="gap-1.5">
                      <ArrowCounterClockwiseIcon size={16} /> -90&deg;
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRotate(90)} className="gap-1.5">
                      <ArrowClockwiseIcon size={16} /> +90&deg;
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFlip("h")} className="gap-1.5">
                      <ArrowsHorizontalIcon size={16} /> {t("flipH") || "Flip H"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleFlip("v")} className="gap-1.5">
                      <ArrowsVerticalIcon size={16} /> {t("flipV") || "Flip V"}
                    </Button>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{t("straighten")}</span>
                      <span>{fineRotation}&deg;</span>
                    </div>
                    <Slider
                      value={[fineRotation]}
                      min={-45}
                      max={45}
                      step={1}
                      onValueChange={([val]) => setFineRotation(val)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFineRotation(0)}
                      className="text-xs text-muted-foreground h-7 px-2"
                    >
                      {t("resetStraighten")}
                    </Button>
                  </div>
                </div>
              )}

              {/* Adjust Panel */}
              {activeTab === "adjust" && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("enhancements")}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{t("brightness")}</span>
                      <span>{brightness}</span>
                    </div>
                    <Slider
                      value={[brightness]}
                      min={-100}
                      max={100}
                      step={1}
                      onValueChange={([val]) => setBrightness(val)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{t("contrast")}</span>
                      <span>{contrast}</span>
                    </div>
                    <Slider
                      value={[contrast]}
                      min={-100}
                      max={100}
                      step={1}
                      onValueChange={([val]) => setContrast(val)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{t("saturation")}</span>
                      <span>{saturation}</span>
                    </div>
                    <Slider
                      value={[saturation]}
                      min={-100}
                      max={100}
                      step={1}
                      onValueChange={([val]) => setSaturation(val)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBrightness(0);
                      setContrast(0);
                      setSaturation(0);
                    }}
                    className="w-full text-xs mt-2"
                  >
                    {t("resetAdjustments")}
                  </Button>
                </div>
              )}

              {/* Filter Panel */}
              {activeTab === "filter" && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("presets")}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_PRESETS.map((p) => (
                      <Button
                        key={p.id}
                        type="button"
                        variant={filter === p.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setFilter(p.id);
                          pushHistory();
                        }}
                        className="text-xs h-9 font-medium"
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Tool Panel */}
              {activeTab === "text" && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("addTextToImage")}
                  </div>

                  <Input
                    type="text"
                    placeholder="Type text overlay..."
                    value={textInput}
                    onChange={(e) => {
                      setTextInput(e.target.value);
                      updateSelectedOverlay({ text: e.target.value });
                    }}
                  />

                  {/* Font Family */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("fontFamily")}</Label>
                    <select
                      value={fontFamily}
                      onChange={(e) => {
                        setFontFamily(e.target.value);
                        updateSelectedOverlay({ fontFamily: e.target.value });
                      }}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-hidden cursor-pointer"
                    >
                      <option value="sans-serif">Modern Sans-Serif</option>
                      <option value="serif">Classic Serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="Impact, sans-serif">Impact / Bold</option>
                      <option value="'Comic Sans MS', cursive, sans-serif">Handwriting</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>{t("fontSize")}</span>
                      <span>{fontSize}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const sz = Math.max(12, fontSize - 2);
                          setFontSize(sz);
                          updateSelectedOverlay({ size: sz });
                        }}
                      >
                        &minus;
                      </Button>
                      <Slider
                        value={[fontSize]}
                        min={12}
                        max={96}
                        step={1}
                        onValueChange={([sz]) => {
                          setFontSize(sz);
                          updateSelectedOverlay({ size: sz });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const sz = Math.min(96, fontSize + 2);
                          setFontSize(sz);
                          updateSelectedOverlay({ size: sz });
                        }}
                      >
                        &plus;
                      </Button>
                    </div>

                    {/* Quick Size Pills */}
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {[16, 24, 28, 36, 48].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setFontSize(sz);
                            updateSelectedOverlay({ size: sz });
                          }}
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-pointer",
                            fontSize === sz
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/50 hover:bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment & Styles */}
                  <div className="space-y-2">
                    <Label className="text-xs">{t("alignment")} & {t("formatting")}</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["left", "center", "right"].map((al) => (
                        <Button
                          key={al}
                          type="button"
                          variant={textAlign === al ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setTextAlign(al);
                            updateSelectedOverlay({ align: al });
                          }}
                          className="capitalize text-xs h-8"
                        >
                          {al}
                        </Button>
                      ))}
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      <Button
                        type="button"
                        variant={isBold ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsBold((b) => !b);
                          updateSelectedOverlay({ bold: !isBold });
                        }}
                        className="font-bold text-xs h-8"
                      >
                        B
                      </Button>
                      <Button
                        type="button"
                        variant={isItalic ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsItalic((i) => !i);
                          updateSelectedOverlay({ italic: !isItalic });
                        }}
                        className="italic text-xs h-8 font-serif"
                      >
                        I
                      </Button>
                      <Button
                        type="button"
                        variant={isUnderline ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsUnderline((u) => !u);
                          updateSelectedOverlay({ underline: !isUnderline });
                        }}
                        className="underline text-xs h-8"
                      >
                        U
                      </Button>
                      <Button
                        type="button"
                        variant={isUppercase ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsUppercase((c) => !c);
                          updateSelectedOverlay({ uppercase: !isUppercase });
                        }}
                        className="text-xs h-8 font-semibold"
                      >
                        aA
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant={hasShadow ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setHasShadow((s) => !s);
                        updateSelectedOverlay({ shadow: !hasShadow });
                      }}
                      className="w-full text-xs h-8"
                    >
                      {t("outlineShadow")}
                    </Button>
                  </div>

                  {/* Colors */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("textColor")}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => {
                            setTextColor(e.target.value);
                            updateSelectedOverlay({ color: e.target.value });
                          }}
                          className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {QUICK_COLORS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setTextColor(c);
                                updateSelectedOverlay({ color: c });
                              }}
                              className="w-6 h-6 rounded-full border border-border shadow-xs hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">{t("backgroundColor")}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor === "transparent" ? "#000000" : bgColor}
                          onChange={(e) => {
                            setBgColor(e.target.value);
                            updateSelectedOverlay({ bgColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setBgColor("transparent");
                              updateSelectedOverlay({ bgColor: "transparent" });
                            }}
                            className="w-6 h-6 rounded-full border border-border shadow-xs hover:scale-110 transition-transform text-[9px] flex items-center justify-center font-bold"
                            title="Transparent"
                          >
                            &times;
                          </button>
                          {["#000000", "#FFFFFF", "#1E293B", "#EF4444", "#2563EB"].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setBgColor(c);
                                updateSelectedOverlay({ bgColor: c });
                              }}
                              className="w-6 h-6 rounded-full border border-border shadow-xs hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button type="button" onClick={handleAddText} className="w-full">
                    + {t("addText")}
                  </Button>

                  {/* Overlay Controls */}
                  {selectedOverlayId && (
                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("overlayControls")}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={handleDuplicateOverlay} className="text-xs">
                          {t("duplicate")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCenterOverlay} className="text-xs">
                          {t("center")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOverlay(selectedOverlayId)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          <TrashIcon size={14} className="mr-1" /> {t("delete")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleClearAllOverlays} className="text-xs">
                          {t("clearAll")}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Badges / Stickers Panel */}
              {activeTab === "stickers" && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("popularBadges")}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_BADGES.map((b) => (
                      <button
                        key={b.text}
                        type="button"
                        onClick={() => handleAddBadge(b.text, b.bg)}
                        className="py-2.5 px-3 rounded-md text-white font-bold text-xs tracking-wider shadow-sm hover:scale-105 transition-transform cursor-pointer text-center"
                        style={{ backgroundColor: b.bg }}
                      >
                        {b.text}
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t("createCustomBadge")}
                    </div>
                    <Input
                      type="text"
                      placeholder="e.g. 50% OFF"
                      value={customBadgeText}
                      onChange={(e) => setCustomBadgeText(e.target.value)}
                    />
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="color"
                        value={customBadgeColor}
                        onChange={(e) => setCustomBadgeColor(e.target.value)}
                        className="w-9 h-9 rounded border border-border cursor-pointer bg-transparent"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (!customBadgeText.trim()) return;
                          handleAddBadge(customBadgeText.trim(), customBadgeColor);
                          setCustomBadgeText("");
                        }}
                        className="flex-1 text-xs"
                      >
                        + {t("addBadge")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Footer (History Actions) */}
            <div className="p-3 border-t border-border flex items-center justify-between bg-card text-xs text-muted-foreground shrink-0">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUndo} title="Undo">
                  <ArrowUUpLeftIcon size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRedo} title="Redo">
                  <ArrowUUpRightIcon size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={handleReset} title="Reset">
                  {t("reset")}
                </Button>
              </div>
              <div>Ready</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
