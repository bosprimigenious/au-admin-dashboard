import { describe, expect, it } from 'vitest'

import { router } from '../index'

describe('router', () => {
  it('registers the services route', () => {
    const matched = router.resolve('/services').matched
    expect(matched.length).toBeGreaterThan(0)
  })
})
