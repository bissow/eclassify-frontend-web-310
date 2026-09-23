import { MAX_VIDEO_DIMENSION } from '@/lib/constants'
import { toast } from 'sonner'

const createVideo = (src) => {
  const video = document.createElement('video')
  video.muted = true
  video.playsInline = true
  video.preload = 'metadata'
  video.src = src
  return video
}

/**
 * Reads a video file's pixel dimensions from its metadata only (no frame decode).
 * @param {File} file - video File object
 * @returns {Promise<{ width: number, height: number }>}
 */
export const getVideoDimensions = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = createVideo(url)
    video.onloadedmetadata = () => {
      const { videoWidth: width, videoHeight: height } = video
      URL.revokeObjectURL(url)
      resolve({ width, height })
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video metadata'))
    }
    video.load()
  })

export const seekTo = (video, time) =>
  new Promise((resolve, reject) => {
    video.onerror = reject
    video.onseeked = () => requestAnimationFrame(resolve)
    video.currentTime = time
  })

export const captureFrame = (video, width, height) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // Cover crop: scale to fill canvas, center-crop excess (like object-cover)
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight)
    const sw = width / scale
    const sh = height / scale
    const sx = (video.videoWidth - sw) / 2
    const sy = (video.videoHeight - sh) / 2
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height)

    canvas.toBlob(
      (blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('Frame capture failed'))),
      'image/jpeg',
      0.8
    )
  })

/**
 * Processes a video file and returns metadata + frames for preview and thumbnail strip.
 * All frame extraction happens once at upload time — no re-extraction needed later.
 *
 * @param {File}   file        - video File object
 * @param {number} frameCount  - number of thumbnail strip frames (default 6)
 * @returns {Promise<{ duration: number, firstFrame: string, frames: string[] } | null>} null if dimensions exceed MAX_VIDEO_DIMENSION (toast shown internally)
 */
export const processVideo = async (file, frameCount = 6, t) => {
  const url = URL.createObjectURL(file)
  const video = createVideo(url)

  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve
      video.onerror = reject
      video.load()
    })

    const { duration, videoWidth: width, videoHeight: height } = video

    if (width > MAX_VIDEO_DIMENSION || height > MAX_VIDEO_DIMENSION) {
      toast.error(t('videoExceedsMaxDimension'))
      return null
    }

    // Seek slightly in to avoid black opening frames common in phone recordings
    await seekTo(video, Math.min(0.5, duration * 0.05))
    const firstFrame = await captureFrame(video, 270, 480)

    // Evenly spaced frames, skipping very start and end
    const frames = []
    for (let i = 0; i < frameCount; i++) {
      await seekTo(video, (duration / (frameCount + 1)) * (i + 1))
      frames.push(await captureFrame(video, 160, 90))
    }

    return { duration, firstFrame, frames, width, height }
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Formats seconds into mm:ss string.
 * @param {number} seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
