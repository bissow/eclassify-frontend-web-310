# Integration Guide & Changelog: Image Editor & Rich Text Module (Web Frontend)

**Project Name:** Eclassify Web Frontend (Next.js 16 + Tailwind CSS)  
**Working Directory:** `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web`  
**Date:** 2026-09-22  
**Version:** 2.1.0  
**Compatibility:** 100% backward-compatible with existing Ad Posting, Media Upload, and Ad Details components.

---

## 1. Overview & Architecture

This guide provides the complete blueprint and reference implementation for integrating:
1. **Interactive Image Editor**: Crop, Rotate, Adjustments, Filters, Canva/WhatsApp-style Text Overlays with 8-handle proportional resizing, and Badges during photo uploads.
2. **Rich Text & Clickable Indian Phone / URL Links**: Rendering rich HTML descriptions, auto-formatting 10-digit Indian phone numbers into interactive `.eclassify-phone-badge` call links, clickable URLs, and theme-aware (Light/Dark) styling.

Use this reference to port or replicate these changes into any subsequent or branched version of the web frontend.

---

## 2. Modified & Created Files Summary

| # | Action | Relative File Path | Absolute File Path |
|---|---|---|---|
| 1 | **MODIFY** | `lang/locale/en.json` | `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\lang\locale\en.json` |
| 2 | **CREATE** | `features/listing/shared/ImageEditorModal.jsx` | `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\listing\shared\ImageEditorModal.jsx` |
| 3 | **MODIFY** | `features/listing/shared/ImageUpload.jsx` | `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\listing\shared\ImageUpload.jsx` |
| 4 | **MODIFY** | `features/listing/shared/ImageGalleryModal.jsx` | `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\listing\shared\ImageGalleryModal.jsx` |
| 5 | **MODIFY** | `features/ad-details/AdDescription.jsx` | `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\ad-details\AdDescription.jsx` |
| 6 | **MODIFY** | `app/globals.css` | `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\app\globals.css` |

---

## 3. Step-by-Step Implementation Reference

### File 1: `lang/locale/en.json`
* **Path:** `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\lang\locale\en.json`
* **Purpose:** Internationalization dictionary for all image editor tools, crop ratios, adjustments, filters, typography tools, and badges.
* **Keys Added:**
  ```json
  "editImage": "Edit Image",
  "crop": "Crop",
  "rotate": "Rotate",
  "filter": "Filter",
  "addText": "Add Text",
  "badges": "Badges",
  "aspectRatioFree": "Free",
  "aspectRatioSquare": "1:1 Square",
  "aspectRatioStandard": "4:3 Standard",
  "aspectRatioLandscape": "16:9 Landscape",
  "aspectRatioStory": "9:16 Story",
  "aspectRatioClassic": "3:2 Classic",
  "brightness": "Brightness",
  "contrast": "Contrast",
  "saturation": "Saturation",
  "badgeUrgent": "URGENT",
  "badgeBestOffer": "BEST OFFER",
  "badgeVerified": "VERIFIED",
  "badgeFeatured": "FEATURED",
  "badgeSale": "SALE",
  "badgeNegotiable": "NEGOTIABLE",
  "badgeNew": "NEW",
  "seeMore": "See More",
  "seeLess": "See Less"
  ```

---

### File 2: `features/listing/shared/ImageEditorModal.jsx` (NEW / UPDATED)
* **Path:** `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\listing\shared\ImageEditorModal.jsx`
* **Purpose:** Production-grade modal component built with Radix Dialog, Tailwind CSS, and HTML5 Canvas.
* **Core Technical Capabilities:**
  1. **Interactive Crop Selection Box**:
     - **Draggable Bounding Box**: Clicking and dragging inside `.pe-crop-box` moves the selection rectangle smoothly within canvas bounds.
     - **8 Resize Handles**: Corner handles (`nw`, `ne`, `se`, `sw`) and edge handles (`n`, `s`, `e`, `w`) with pointer capture (`setPointerCapture`) for continuous drag tracking.
     - **Aspect-Ratio Locked & Free-Form Modes**: Supports standard presets (`1:1`, `4:3`, `16:9`, `9:16`, `3:2`) and free-form crop with aspect preservation and boundary clamping.
     - **Rule-of-Thirds Grid**: 3x3 grid lines rendered dynamically inside the crop selection box.
     - **On-Canvas Floating HUD**: Quick "Apply Crop" and "Reset" buttons pinned directly to the crop box for maximum ergonomics, plus toolbar buttons.
     - **Reactive Image Versioning**: `imageVersion` state trigger guarantees instant canvas refresh upon applying crop.
  2. **Text Overlays with Direct 8-Handle Resizing**:
     - 8 handles placed at `nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w` (also mapped to `tl`, `tc`, `tr`, `mr`, `br`, `bc`, `bl`, `ml`).
     - Real-time proportional resizing by updating font size (`fontSize`) directly.
     - **True Opposite-Corner Anchoring**: The opposite corner remains completely fixed in place during drag operations without jumps or shifts.
     - Pointer capture prevents lost drag events when mouse moves rapidly.
  3. **Canvas Studio Viewport**: Zoom controls (50% to 200%), zoom in/out, fit-to-screen reset, and drag panning.
  4. **Transformations**: 90° clockwise/counter-clockwise rotation, horizontal & vertical flip, straightening slider (-45° to +45°).
  5. **Filters & Adjustments**: Brightness (-50 to +50), Contrast (50 to 150), Saturation (0 to 200), plus 8 preset filters (`Original`, `Vivid`, `Warm`, `Cool`, `Mono`, `Vintage`, `Dramatic`, `Cinematic`, `Muted`).
  6. **Preset & Custom Badges**: Add draggable stickers with custom background and text colors.
  7. **History & Export**: Undo/Redo history stack and high-resolution JPEG Blob export.
* **Component Signature**:
  ```jsx
  <ImageEditorModal
    open={isOpen}
    onClose={() => setIsOpen(false)}
    fileObj={{ file, preview }}
    onSave={(newFile, newPreviewUrl) => { ... }}
  />
  ```

---

### File 3: `features/listing/shared/ImageUpload.jsx`
* **Path:** `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\listing\shared\ImageUpload.jsx`
* **Purpose:** Integrates image editing directly into the listing creation and ad update flow.
* **Changes Made:**
  1. **Import `ImageEditorModal` and `PencilSimpleIcon`**:
     ```jsx
     import { PlayCircleIcon, UploadSimpleIcon, XIcon, PencilSimpleIcon } from "@phosphor-icons/react";
     import ImageEditorModal from "@/features/listing/shared/ImageEditorModal";
     ```
  2. **Add `onEdit` button to `ImageCard`**:
     ```jsx
     const ImageCard = memo(({ fileObj, index, onRemove, onEdit, extraCount, onOpenModal }) => {
       // Added pencil button alongside delete button
       <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
         {onEdit && (
           <button
             type="button"
             className="bg-white/90 dark:bg-zinc-800/90 hover:bg-white text-zinc-800 dark:text-zinc-100 rounded-full p-1.5 shadow"
             onClick={(e) => { e.stopPropagation(); onEdit(index); }}
             title={t("editImage") || "Edit Image"}
           >
             <PencilSimpleIcon size={16} />
           </button>
         )}
         <button onClick={(e) => { e.stopPropagation(); onRemove(index); }}>
           <XIcon size={16} />
         </button>
       </div>
     });
     ```
  3. **State and Save Handler**:
     ```jsx
     const [editingIndex, setEditingIndex] = useState(null);

     const handleSaveEditedImage = useCallback((newFile, newPreviewUrl) => {
       if (editingIndex === null) return;
       setOtherImages((prev) => {
         const updated = [...prev];
         if (updated[editingIndex]) {
           URL.revokeObjectURL(updated[editingIndex].preview); // Avoid memory leaks
           updated[editingIndex] = { file: newFile, preview: newPreviewUrl };
         }
         return updated;
       });
       setEditingIndex(null);
     }, [editingIndex, setOtherImages]);
     ```
  4. **Wiring into Cards & Modal**:
     - Pass `onEdit={setEditingIndex}` to `ImageCard`.
     - Pass `onEdit={(index) => { setGalleryModalOpen(false); setEditingIndex(index); }}` to `ImageGalleryModal`.
     - Render `<ImageEditorModal open={editingIndex !== null} onClose={() => setEditingIndex(null)} fileObj={otherImages[editingIndex]} onSave={handleSaveEditedImage} />`.

---

### File 4: `features/listing/shared/ImageGalleryModal.jsx`
* **Path:** `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\listing\shared\ImageGalleryModal.jsx`
* **Purpose:** Full gallery modal for managing and editing uploaded photos.
* **Changes Made:**
  - Added `onEdit` prop to `ModalImageCard` and `ImageGalleryModal`.
  - Added `PencilSimpleIcon` button on each card calling `onEdit(index)`.

---

### File 5: `features/ad-details/AdDescription.jsx`
* **Path:** `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\features\ad-details\AdDescription.jsx`
* **Purpose:** Renders the advertisement description on the public ad detail page.
* **Changes Made:**
  1. **Dual Fallback Strategy**:
     ```jsx
     const rawContent =
       translation?.formatted_description ||
       productDetails?.formatted_description ||
       translation?.description ||
       productDetails?.description ||
       "";
     const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);
     const fullDescription = isHtml ? rawContent : rawContent.replace(/\n/g, "<br />");
     ```
  2. **Prose & Dark Mode**:
     ```jsx
     className={`${isOverflowing && !showFullDescription ? "max-h-36" : "max-h-full"} max-w-full prose dark:prose-invert lg:prose-lg overflow-hidden break-words`}
     ```
  3. **Adaptive Gradient Fade**:
     ```jsx
     <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-background via-background/80 to-transparent pointer-events-none" />
     ```

---

### File 6: `app/globals.css`
* **Path:** `c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web\app\globals.css`
* **Purpose:** Styles for 8-handle text resizing, cursors, and phone badges.
* **Rules Added:**
  ```css
  .pe-resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ffffff;
    border: 2px solid #2563eb;
    border-radius: 50%;
    z-index: 30;
  }
  .pe-handle-nw { top: -5px; left: -5px; cursor: nwse-resize; }
  .pe-handle-n  { top: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
  .pe-handle-ne { top: -5px; right: -5px; cursor: nesw-resize; }
  .pe-handle-e  { top: 50%; right: -5px; transform: translateY(-50%); cursor: ew-resize; }
  .pe-handle-se { bottom: -5px; right: -5px; cursor: nwse-resize; }
  .pe-handle-s  { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
  .pe-handle-sw { bottom: -5px; left: -5px; cursor: nesw-resize; }
  .pe-handle-w  { top: 50%; left: -5px; transform: translateY(-50%); cursor: ew-resize; }

  .eclassify-phone-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    margin: 0 2px;
    background-color: #dbeafe;
    color: #1d4ed8;
    border-radius: 6px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.2s;
  }
  .dark .eclassify-phone-badge {
    background-color: #1e3a8a;
    color: #93c5fd;
  }
  ```

---

## 4. Interactive Cropping, Rotation & Phosphor Icon Upgrades (Latest Updates)

### A. Free & Aspect-Ratio Constrained Interactive Crop Box
* **Interactive Crop Overlay (`ImageEditorModal.jsx`):** Semi-transparent dark mask (`rgba(0, 0, 0, 0.55)`), 3x3 rule-of-thirds grid lines, and 8 draggable corner/edge handles (`.pe-crop-handle`).
* **Direct Pointer Dragging & Resizing:** Handles touch and mouse interactions smoothly using `pointerCapture` with dimension clamping to ensure the crop box never exceeds image boundaries.
* **On-Canvas Floating HUD:** Displays live crop dimensions (`W x H px`) and quick actions ("Apply Crop" and "Reset Crop") directly above the selection box.

### B. Rotation & Flip Synchronization
* **Orientation Controls:** Clean button group featuring `-90°`, `+90°`, `Flip H`, and `Flip V` with official `@phosphor-icons/react` icons (`ArrowCounterClockwiseIcon`, `ArrowClockwiseIcon`, `ArrowsHorizontalIcon`, `ArrowsVerticalIcon`).
* **Crop Recalculation on Rotate/Flip:** Resets active crop box on rotation or flip to automatically recalculate bounds based on the new canvas orientation.
* **Localization:** Added `flipH`, `flipV`, `applyCrop`, and `resetCrop` keys to `lang/locale/en.json`.

---

## 5. Verification & Testing

To verify the web frontend implementation:
```bash
cd c:\Users\nilan\Downloads\Eclassify\eclassify-frontend-web

# 1. Check syntax with Node espree/babel parser
node -e "const p = require('@babel/parser'), fs = require('fs'); ['features/listing/shared/ImageEditorModal.jsx', 'features/listing/shared/ImageUpload.jsx', 'features/listing/shared/ImageGalleryModal.jsx', 'features/ad-details/AdDescription.jsx'].forEach(f => { p.parse(fs.readFileSync(f, 'utf8'), { sourceType: 'module', plugins: ['jsx'] }); console.log(f, 'OK'); });"

# 2. Run dev server
npm run dev
```
