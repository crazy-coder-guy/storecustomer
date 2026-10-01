// Thin wrapper around localStorage/sessionStorage that keeps the browser's
// storage inspector from reading our flags in plain English — both the key
// name and the value are base64-encoded on the way in/out. This is
// obfuscation, not security (anyone reading the bundled JS can decode it),
// but it stops a casual look at DevTools -> Application -> Storage from
// immediately showing things like `kaira_push_prompt_dismissed: true`.
function encodeKey(key: string): string {
  return 'kx_' + btoa(key).replace(/=+$/, '')
}

function encodeValue(value: string): string {
  return btoa(encodeURIComponent(value))
}

function decodeValue(raw: string | null): string | null {
  if (raw === null) return null
  try {
    return decodeURIComponent(atob(raw))
  } catch {
    return null
  }
}

function wrap(storage: Storage) {
  return {
    getItem(key: string): string | null {
      return decodeValue(storage.getItem(encodeKey(key)))
    },
    setItem(key: string, value: string): void {
      storage.setItem(encodeKey(key), encodeValue(value))
    },
    removeItem(key: string): void {
      storage.removeItem(encodeKey(key))
    },
  }
}

export const obscuredLocalStorage = wrap(localStorage)
export const obscuredSessionStorage = wrap(sessionStorage)
