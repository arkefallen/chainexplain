import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Clean up DOM after each test to avoid memory leaks or state bleeding
afterEach(() => {
  cleanup()
})
