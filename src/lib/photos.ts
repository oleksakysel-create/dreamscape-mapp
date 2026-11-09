/**
 * Photos of fulfilled dreams live in IndexedDB (not localStorage, which is too
 * small). A chapter stores a reference: "idb:<key>" for user photos, or a
 * relative URL for bundled demo photos.
 */
import { useEffect, useState } from 'react'

const DB = 'dreamscape'
const STORE = 'photos'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Downscale to max 1600px on the long side and re-encode as JPEG. */
export async function compress(file: Blob, max = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', quality))
}

export async function savePhoto(key: string, file: Blob): Promise<string> {
  const blob = await compress(file)
  await tx('readwrite', (s) => s.put(blob, key))
  return `idb:${key}`
}

export async function deletePhoto(ref?: string) {
  if (ref?.startsWith('idb:')) await tx('readwrite', (s) => s.delete(ref.slice(4))).catch(() => undefined)
}

export async function clearPhotos() {
  await tx('readwrite', (s) => s.clear()).catch(() => undefined)
}

export async function photoBlob(ref: string): Promise<Blob | null> {
  if (ref.startsWith('idb:')) return ((await tx('readonly', (s) => s.get(ref.slice(4)))) as Blob | undefined) ?? null
  const res = await fetch(ref)
  return res.ok ? res.blob() : null
}

/** Object URL for a photo reference (revoked automatically). */
export function usePhoto(ref?: string): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!ref) return setUrl(undefined)
    if (!ref.startsWith('idb:')) return setUrl(ref)
    let alive = true
    let made: string | undefined
    photoBlob(ref)
      .then((b) => {
        if (!alive || !b) return
        made = URL.createObjectURL(b)
        setUrl(made)
      })
      .catch(() => setUrl(undefined))
    return () => {
      alive = false
      if (made) URL.revokeObjectURL(made)
    }
  }, [ref])
  return url
}
