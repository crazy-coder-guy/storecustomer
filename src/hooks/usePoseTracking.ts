import { useEffect, useRef, useState, type RefObject } from 'react'
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision'

// Pinned to the installed npm package version so the WASM runtime fetched
// from the CDN always matches the JS binding's wire protocol.
const TASKS_VISION_VERSION = '1.0.1'
const WASM_BASE_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task'

// Landmark indices from MediaPipe's 33-point pose model.
const LEFT_SHOULDER = 11
const RIGHT_SHOULDER = 12
const LEFT_HIP = 23
const RIGHT_HIP = 24

export interface BodyAnchor {
  /** Shoulder midpoint, normalized 0-1 within the raw (unmirrored) video frame. */
  shoulderMidX: number
  shoulderMidY: number
  /** Shoulder-to-shoulder width, normalized 0-1 of frame width. */
  shoulderWidth: number
  /** Hip midpoint Y, normalized 0-1 — used to size the garment's height. */
  hipMidY: number
  /** Shoulder tilt, radians — 0 is level. */
  rotationRad: number
}

let landmarkerPromise: Promise<PoseLandmarker> | null = null

// One shared model instance for the whole app session — it's a ~3MB WASM +
// model download, not something to repeat per modal open/close.
function getLandmarker(): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM_BASE_URL).then((vision) =>
      PoseLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numPoses: 1,
      })
    )
  }
  return landmarkerPromise
}

/**
 * Live shoulder/torso tracking off a <video> element, via on-device pose
 * detection (MediaPipe) — no frames ever leave the browser. Returns null
 * whenever no person is confidently detected in frame (camera just opened,
 * person stepped out of frame, poor lighting, etc.) so callers can fall back
 * to a default position.
 */
export function usePoseTracking(videoRef: RefObject<HTMLVideoElement | null>, enabled: boolean): BodyAnchor | null {
  const [anchor, setAnchor] = useState<BodyAnchor | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setAnchor(null)
      return
    }

    let cancelled = false

    function loop(landmarker: PoseLandmarker) {
      const video = videoRef.current
      if (cancelled) return
      if (video && video.readyState >= 2 && !video.paused) {
        const result = landmarker.detectForVideo(video, performance.now())
        const lm = result.landmarks[0]
        const ls = lm?.[LEFT_SHOULDER]
        const rs = lm?.[RIGHT_SHOULDER]
        const lh = lm?.[LEFT_HIP]
        const rh = lm?.[RIGHT_HIP]
        if (ls && rs && lh && rh) {
          setAnchor({
            shoulderMidX: (ls.x + rs.x) / 2,
            shoulderMidY: (ls.y + rs.y) / 2,
            shoulderWidth: Math.abs(rs.x - ls.x),
            hipMidY: (lh.y + rh.y) / 2,
            rotationRad: Math.atan2(rs.y - ls.y, rs.x - ls.x),
          })
        } else {
          setAnchor(null)
        }
      }
      rafRef.current = requestAnimationFrame(() => loop(landmarker))
    }

    getLandmarker().then((landmarker) => {
      if (!cancelled) loop(landmarker)
    })

    return () => {
      cancelled = true
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      setAnchor(null)
    }
  }, [enabled, videoRef])

  return anchor
}
