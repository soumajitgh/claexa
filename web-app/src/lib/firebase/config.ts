type FirebaseConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

function parseFirebaseConfig(raw: string | undefined): FirebaseConfig {

  if (!raw) {
    throw new Error("Missing VITE_FIREBASE_CONFIG_JSON env. Provide a JSON string with apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId.")
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error("VITE_FIREBASE_CONFIG_JSON must be valid JSON. Example: {\"apiKey\":\"...\",\"authDomain\":\"...\",\"projectId\":\"...\",\"storageBucket\":\"...\",\"messagingSenderId\":\"...\",\"appId\":\"...\"}")
  }

  const obj = parsed as Partial<FirebaseConfig>
  const required: (keyof FirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ]

  const missing = required.filter((k) => typeof obj[k] !== 'string' || !obj[k])
  if (missing.length) {
    throw new Error(`VITE_FIREBASE_CONFIG_JSON is missing required keys: ${missing.join(', ')}`)
  }

  return obj as FirebaseConfig
}

export const firebaseConfig: FirebaseConfig = parseFirebaseConfig(import.meta.env.VITE_FIREBASE_CONFIG_JSON)

// reCAPTCHA verification settings for phone authentication
export const recaptchaConfig = {
  size: 'invisible',
  callback: () => { },
  'expired-callback': () => { },
}
