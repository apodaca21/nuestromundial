const STORAGE_KEY = 'nuestromundial-admin-unlocked'
export const ADMIN_PASSWORD = 'admin123'

type Listener = () => void
const listeners = new Set<Listener>()

function readUnlocked(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === '1'
}

let unlocked = readUnlocked()

function notify() {
  listeners.forEach((fn) => fn())
}

export function subscribeAdminAccess(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function isAdminUnlocked(): boolean {
  return unlocked
}

export function unlockAdmin(): void {
  unlocked = true
  sessionStorage.setItem(STORAGE_KEY, '1')
  notify()
}

export function lockAdmin(): void {
  unlocked = false
  sessionStorage.removeItem(STORAGE_KEY)
  notify()
}

export function verifyAdminPassword(password: string): boolean {
  return password.trim() === ADMIN_PASSWORD
}
