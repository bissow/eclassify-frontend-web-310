import { useRef, useState, useCallback } from 'react'

const FFMPEG_CORE_VERSION = '0.12.6'
const FFMPEG_CORE_BASE = `https://unpkg.com/@ffmpeg/core@${FFMPEG_CORE_VERSION}/dist/umd`

const useFFmpeg = () => {
  const ffmpegRef = useRef(null)
  const [ffmpegLoading, setFfmpegLoading] = useState(false)

  // Lazy-load FFmpeg WASM from CDN — runs once, cached in ref
  const getFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current

    const { FFmpeg } = await import('@ffmpeg/ffmpeg')
    const { toBlobURL } = await import('@ffmpeg/util')

    const ffmpeg = new FFmpeg()

    // Single-threaded core — no COOP/COEP headers required
    await ffmpeg.load({
      coreURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    })

    ffmpegRef.current = ffmpeg
    return ffmpeg
  }, [])

  /**
   * Trims a video file between startTime and endTime.
   * Uses stream copy (-c copy) — fast, no re-encode.
   * Returns a new Blob of the trimmed video.
   */
  const trimVideo = useCallback(async (file, startTime, endTime) => {
    setFfmpegLoading(true)
    try {
      const ffmpeg = await getFFmpeg()
      const { fetchFile } = await import('@ffmpeg/util')

      const ext = file.name.split('.').pop() || 'mp4'
      const inputName = `input.${ext}`
      const outputName = `output.${ext}`

      await ffmpeg.writeFile(inputName, await fetchFile(file))
      await ffmpeg.exec([
        '-ss', String(startTime),
        '-to', String(endTime),
        '-i', inputName,
        '-c', 'copy',
        '-avoid_negative_ts', 'make_zero',
        outputName,
      ])

      const data = await ffmpeg.readFile(outputName)
      // Pass Uint8Array directly — data.buffer may include extra bytes outside the view
      const blob = new Blob([data], { type: file.type || 'video/mp4' })

      // Free WASM virtual FS — keeps WASM heap from holding 2× file size
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)

      return blob
    } finally {
      setFfmpegLoading(false)
    }
  }, [getFFmpeg])

  return { trimVideo, ffmpegLoading }
}

export default useFFmpeg
