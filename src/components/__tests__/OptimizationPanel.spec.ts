import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OptimizationPanel from '../OptimizationPanel.vue'

vi.mock('../../api/admin', () => ({
  getSessionOptimization: vi.fn(),
}))

import { getSessionOptimization } from '../../api/admin'

describe('OptimizationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an empty prompt when session id is missing', () => {
    const wrapper = mount(OptimizationPanel, {
      props: {
        sessionId: '',
      },
    })

    expect(wrapper.text()).toContain('Select a session')
  })

  it('renders optimization suggestions', async () => {
    vi.mocked(getSessionOptimization).mockResolvedValue({
      session_id: 'session-1',
      suggestions: [
        {
          category: 'performance',
          severity: 'warning',
          message: 'Split a long chain.',
          action: 'Break the workflow into smaller steps.',
        },
      ],
    })

    const wrapper = mount(OptimizationPanel, {
      props: {
        sessionId: 'session-1',
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('performance')
    expect(wrapper.text()).toContain('Split a long chain.')
    expect(wrapper.text()).toContain('Break the workflow into smaller steps.')
  })
})
