import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ChartExportButton from '../ChartExportButton.vue'

describe('ChartExportButton', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exports png and svg data URLs through download links', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const createdLinks: HTMLAnchorElement[] = []
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreateElement(tagName)
      if (tagName === 'a') {
        createdLinks.push(element as HTMLAnchorElement)
      }
      return element
    })
    const getDataUrl = vi.fn((format: 'png' | 'svg') => `data:image/${format};base64,demo`)

    const wrapper = mount(ChartExportButton, {
      props: {
        fileName: 'demo-chart',
        getDataUrl,
      },
    })

    await wrapper.get('button[aria-label="Export PNG"]').trigger('click')
    await wrapper.get('button[aria-label="Export SVG"]').trigger('click')

    expect(getDataUrl).toHaveBeenNthCalledWith(1, 'png')
    expect(getDataUrl).toHaveBeenNthCalledWith(2, 'svg')
    expect(createdLinks.map((link) => link.download)).toEqual(['demo-chart.png', 'demo-chart.svg'])
    expect(clickSpy).toHaveBeenCalledTimes(2)
  })

  it('disables export buttons when disabled', () => {
    const wrapper = mount(ChartExportButton, {
      props: {
        fileName: 'demo-chart',
        getDataUrl: vi.fn(),
        disabled: true,
      },
    })

    expect(wrapper.get('button[aria-label="Export PNG"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Export SVG"]').attributes('disabled')).toBeDefined()
  })
})
