import { css } from 'styled-components'

const dividersBackgroundColor = '#4a4d51'
const activeTabBackgroundColor = '#323639'

export default css`
  .chrome-tabs.chrome-tabs-dark-theme {
    background: #202124;
    .chrome-tab {
      .chrome-tab-dividers {
        &::before,
        &::after {
          background: ${dividersBackgroundColor};
        }
      }

      .chrome-tab-background > svg .chrome-tab-geometry {
        fill: #292b2e;
      }

      &[active] .chrome-tab-background > svg .chrome-tab-geometry {
        fill: ${activeTabBackgroundColor};
      }

      .chrome-tab-title {
        color: #9ca1a7;
      }

      &[active] .chrome-tab-title {
        color: #f1f3f4;
      }

      .chrome-tab-close {
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path stroke='rgba(154, 160, 166, .8)' stroke-linecap='square' stroke-width='1.5' d='M0 0 L8 8 M8 0 L0 8'></path></svg>");

        &:hover {
          background-color: #5f6368;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path stroke='rgba(255, 255, 255, .7)' stroke-linecap='square' stroke-width='1.5' d='M0 0 L8 8 M8 0 L0 8'></path></svg>");
        }

        &:active {
          background-color: #80868b;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'><path stroke='rgba(255, 255, 255, .9)' stroke-linecap='square' stroke-width='1.5' d='M0 0 L8 8 M8 0 L0 8'></path></svg>");
        }
      }
    }

    .chrome-tabs-bottom-bar {
      background: ${activeTabBackgroundColor};
    }
  }
`
