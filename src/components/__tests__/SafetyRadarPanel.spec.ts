import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SafetyRadarPanel from '../SafetyRadarPanel.vue'

describe('SafetyRadarPanel', () => {
  it('无 diagnostics 时展示等待会话提示', () => {
    const wrapper = mount(SafetyRadarPanel, {
      props: {
        diagnostics: null,
      },
    })

    expect(wrapper.text()).toContain('Awaiting Session')
    expect(wrapper.text()).toContain('Open Agent Topology Trace')
  })

  it('有 diagnostics 时展示风险等级', () => {
    const wrapper = mount(SafetyRadarPanel, {
      props: {
        diagnostics: {
          guardrail_enabled: true,
          risk_level: 'high',
          scores: {
            logic_consistency: 70,
            info_entropy: 40,
            diversity_ttr: 35,
            lpp_feature: 30,
            safety_score: 45,
          },
          warnings: [
            {
              level: 'critical',
              message: 'Composite safety score is below the recommended threshold.',
            },
          ],
        },
      },
    })

    expect(wrapper.text()).toContain('Risk HIGH')
    expect(wrapper.text()).toContain('Composite safety score')
  })
})
