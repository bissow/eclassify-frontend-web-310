import { useRef, useState, useCallback, useEffect } from "react";
import { Range } from "react-range";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import { CircleNotchIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { captureFrame, seekTo, formatDuration as formatTime } from "@/features/listing/lib/video";
import { getIsRtl } from "@/store/slices/languageSlice";
import { useSelector } from "react-redux";

const MIN_TRIM_DURATION = 1; // seconds — smallest allowed clip length

// Shared filmstrip row used as the range track background
const Filmstrip = ({ frames }) => (
  <div className="absolute inset-0 flex pointer-events-none">
    {frames.map((frame, i) => (
      <div
        key={i}
        className="flex-1 h-full overflow-hidden border-e border-white/20 last:border-0"
      >
        <CustomImage
          src={frame}
          width={160}
          height={90}
          alt="Film"
          className="w-full h-full object-cover"
        />
      </div>
    ))}
  </div>
);

// ─── Video Timeline Trimmer ───────────────────────────────────────────────────

const VideoTrimmer = ({ frames, duration, trimStart, trimEnd, onChange, isRTL }) => {
  const { t } = useTranslation();
  const values = [trimStart, trimEnd];
  const startPct = (trimStart / duration) * 100;
  const endPct = (trimEnd / duration) * 100;

  const selectedStyle = {
    insetInlineStart: `${startPct}%`,
    insetInlineEnd: `${100 - endPct}%`,
  };

  const startOverlayStyle = {
    insetInlineStart: 0,
    width: `${startPct}%`,
  };

  const endOverlayStyle = {
    insetInlineEnd: 0,
    width: `${100 - endPct}%`,
  };

  return (
    <div>
      <p className="text-sm font-semibold mb-3">{t("videoTimeline")}</p>

      <Range
        rtl={isRTL}
        step={0.1}
        min={0}
        max={duration}
        values={values}
        allowOverlap={false}
        onChange={([s, e]) => onChange({ trimStart: s, trimEnd: e })}
        renderTrack={({ props, children }) => (
          <div
            ref={props.ref}
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={props.style}
            className="relative h-16 cursor-pointer"
          >
            {/* Filmstrip */}
            <div className="absolute inset-0 rounded overflow-hidden">
              <Filmstrip frames={frames} />
            </div>

            {/* Dark overlay — outside trim range */}
            <div
              className="absolute inset-y-0 bg-black/55 pointer-events-none"
              style={startOverlayStyle}
            />
            <div
              className="absolute inset-y-0 bg-black/55 pointer-events-none"
              style={endOverlayStyle}
            />

            {/* White border around selected range */}
            <div
              className="absolute inset-y-0 border-y-2 border-white pointer-events-none"
              style={selectedStyle}
            />

            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            key={props.key}
            ref={props.ref}
            onKeyDown={props.onKeyDown}
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            aria-label={props["aria-label"]}
            aria-valuenow={props["aria-valuenow"]}
            tabIndex={props.tabIndex}
            style={props.style}
            className="w-3 h-16 bg-white rounded cursor-ew-resize flex items-center justify-center outline-none shadow-[0_0_0_1.5px_rgba(0,0,0,0.25),0_2px_6px_rgba(0,0,0,0.3)] z-10"
          >
            <div className="w-px h-6 bg-gray-400 rounded" />
          </div>
        )}
      />

      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
        <span>{formatTime(trimStart)}</span>
        <span>{formatTime(trimEnd)}</span>
      </div>
    </div>
  );
};

// ─── Thumbnail Scrubber ───────────────────────────────────────────────────────

const ThumbnailScrubber = ({ frames, videoUrl, duration, initialTime, onFrameCaptured, isRTL }) => {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const uploadRef = useRef(null);
  const prevCapturedBlobRef = useRef(null);
  const [scrubTime, setScrubTime] = useState([initialTime ?? 0]);
  const [capturing, setCapturing] = useState(false);

  const handleFinalChange = useCallback(
    async ([time]) => {
      const video = videoRef.current;
      if (!video) return;
      setCapturing(true);
      try {
        await seekTo(video, time);
        const blob = await captureFrame(video, 270, 480);
        if (prevCapturedBlobRef.current) URL.revokeObjectURL(prevCapturedBlobRef.current);
        prevCapturedBlobRef.current = blob;
        onFrameCaptured(blob, time);
      } finally {
        setCapturing(false);
      }
    },
    [onFrameCaptured]
  );

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = URL.createObjectURL(file);
    if (prevCapturedBlobRef.current) URL.revokeObjectURL(prevCapturedBlobRef.current);
    prevCapturedBlobRef.current = blob;
    onFrameCaptured(blob, scrubTime[0]);
    e.target.value = "";
  };

  return (
    <div>
      <video ref={videoRef} src={videoUrl} preload="auto" muted playsInline className="hidden" />

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">
          {t("chooseThumbnail")}
          {capturing && (
            <span className="text-xs text-muted-foreground font-normal ml-2">{t("loading")}</span>
          )}
        </p>
        <button
          onClick={() => uploadRef.current?.click()}
          className="flex items-center gap-1 text-primary text-sm font-medium"
        >
          <UploadSimpleIcon size={16} />
          {t("upload")}
        </button>
        <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>

      <Range
        step={0.1}
        min={0}
        max={duration}
        values={scrubTime}
        onChange={setScrubTime}
        onFinalChange={handleFinalChange}
        rtl={isRTL}
        renderTrack={({ props, children }) => (
          <div
            ref={props.ref}
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            style={props.style}
            className="relative h-16 cursor-pointer"
          >
            <div className="absolute inset-0 rounded overflow-hidden">
              <Filmstrip frames={frames} />
            </div>
            {children}
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            key={props.key}
            ref={props.ref}
            onKeyDown={props.onKeyDown}
            onMouseDown={props.onMouseDown}
            onTouchStart={props.onTouchStart}
            aria-label={props["aria-label"]}
            aria-valuenow={props["aria-valuenow"]}
            tabIndex={props.tabIndex}
            style={props.style}
            className="w-0.5 h-16 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_0_6px_rgba(0,0,0,0.3)] cursor-ew-resize outline-none z-10"
          />
        )}
      />

      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
        <span>{formatTime(scrubTime[0])}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

// ─── EditVideoModal ───────────────────────────────────────────────────────────

const EditVideoModal = ({ open, onClose, videoData, onSave, trimVideo }) => {
  const { t } = useTranslation();
  const [selectedThumbnail, setSelectedThumbnail] = useState(
    () => videoData?.thumbnail ?? null
  );
  const [thumbnailTime, setThumbnailTime] = useState(() => videoData?.thumbnailTime ?? 0);
  const [trimStart, setTrimStart] = useState(() => videoData?.trimStart ?? 0);
  const [trimEnd, setTrimEnd] = useState(() => videoData?.trimEnd ?? videoData?.duration ?? 0);
  const [isTrimming, setIsTrimming] = useState(false);
  const isRTL = useSelector(getIsRtl);

  // Sync state when videoData identity changes (new video uploaded, not re-edit)
  useEffect(() => {
    setSelectedThumbnail(videoData?.thumbnail ?? null);
    setThumbnailTime(videoData?.thumbnailTime ?? 0);
    setTrimStart(videoData?.trimStart ?? 0);
    setTrimEnd(videoData?.trimEnd ?? videoData?.duration ?? 0);
  }, [videoData]);


  const handleTrimChange = useCallback(
    ({ trimStart: s, trimEnd: e }) => {
      const duration = videoData?.duration ?? e;
      const clampedStart = Math.max(0, Math.min(s, duration - MIN_TRIM_DURATION));
      const clampedEnd = Math.min(duration, Math.max(e, clampedStart + MIN_TRIM_DURATION));
      setTrimStart(clampedStart);
      setTrimEnd(clampedEnd);
    },
    [videoData?.duration]
  );

  const handleThumbnailCaptured = useCallback((blob, time) => {
    setSelectedThumbnail(blob);
    setThumbnailTime(time);
  }, []);

  if (!videoData) return null;

  const handleDone = async () => {
    const needsTrim = trimStart > 0 || trimEnd < videoData.duration;
    let trimmedFile = null;
    if (needsTrim) {
      setIsTrimming(true);
      try {
        const blob = await trimVideo(videoData.file, trimStart, trimEnd, videoData.duration);
        trimmedFile = new File([blob], videoData.file.name, { type: videoData.file.type || "video/mp4" });
      } catch {
        toast.error(t("videoTrimFailed"));
        return;
      } finally {
        setIsTrimming(false);
      }
    }
    onSave({ thumbnail: selectedThumbnail, thumbnailTime, trimStart, trimEnd, trimmedFile });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ '--tw-enter-scale': '1', '--tw-exit-scale': '1' }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("editVideo")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row">
          {/* Left — thumbnail preview: compact on mobile, sidebar on desktop */}
          <div className="flex items-center justify-center md:w-52 md:shrink-0">
            <div className="w-30 md:w-full aspect-9/16 rounded-xl overflow-hidden bg-black">
              {selectedThumbnail && (
                <CustomImage
                  src={selectedThumbnail}
                  width={270}
                  height={480}
                  alt="thumbnail preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Right — controls, scrollable on mobile */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 sm:px-6 overflow-y-auto overflow-x-hidden max-h-[55vh] md:max-h-none">
            <VideoTrimmer
              frames={videoData.frames}
              duration={videoData.duration}
              trimStart={trimStart}
              trimEnd={trimEnd}
              onChange={handleTrimChange}
              isRTL={isRTL}
            />
            <ThumbnailScrubber
              frames={videoData.frames}
              videoUrl={videoData.url}
              duration={videoData.duration}
              initialTime={thumbnailTime}
              onFrameCaptured={handleThumbnailCaptured}
              isRTL={isRTL}
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            disabled={isTrimming}
            className="px-5 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleDone}
            disabled={isTrimming}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 min-w-20 flex items-center justify-center"
          >
            {isTrimming ? <CircleNotchIcon size={16} className="animate-spin" /> : t("done")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVideoModal;
