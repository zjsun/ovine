import { throttle } from 'lodash'
import { observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import CheckOutlined from '@ant-design/icons/CheckOutlined'
import CompressOutlined from '@ant-design/icons/CompressOutlined'
import DisconnectOutlined from '@ant-design/icons/DisconnectOutlined'
import EyeOutlined from '@ant-design/icons/EyeOutlined'
import FullscreenExitOutlined from '@ant-design/icons/FullscreenExitOutlined'
import FullscreenOutlined from '@ant-design/icons/FullscreenOutlined'
import HighlightOutlined from '@ant-design/icons/HighlightOutlined'
import LinkOutlined from '@ant-design/icons/LinkOutlined'
import OneToOneOutlined from '@ant-design/icons/OneToOneOutlined'
import RedoOutlined from '@ant-design/icons/RedoOutlined'
import UndoOutlined from '@ant-design/icons/UndoOutlined'
import ZoomInOutlined from '@ant-design/icons/ZoomInOutlined'
import ZoomOutOutlined from '@ant-design/icons/ZoomOutOutlined'

import { useCanvas } from '../../hooks'
import { useStore } from '../../store'

import * as S from './styled'

const Tool = () => {
  const [scale, setScale] = useState(0)
  const $container = document.querySelector('.butterfly-react-container')

  const minScale = 0.2
  const maxScale = 1.5
  const canZoomIn = scale < maxScale
  const canZoomOut = scale > minScale

  const canvas = useCanvas((cvs) => {
    setScale(cvs.getZoom())
  })

  useEffect(() => {
    if (scale) {
      canvas.zoom(scale)
    }
  }, [scale])

  const zoomIn = throttle(() => {
    setScale(scale + 0.1)
  }, 150)

  const zoomOut = throttle(() => {
    setScale(scale - 0.1)
  }, 150)

  const zoomNormal = () => {
    setScale(1)
  }

  const zoomFit = () => {
    canvas.focusCenterWithAnimate(undefined, () => {
      setScale(canvas.getZoom())
    })
  }

  if (!$container) {
    return null
  }

  return createPortal(
    <S.ToolWrap>
      <ul>
        <li onClick={zoomFit}>
          <CompressOutlined />
        </li>
        <li onClick={zoomNormal}>
          <OneToOneOutlined />
        </li>
        <li className={`${canZoomIn ? 'disabled' : ''}`} onClick={canZoomIn && zoomIn}>
          <ZoomInOutlined />
        </li>
        <li className={`${canZoomOut ? 'disabled' : ''}`} onClick={canZoomOut && zoomOut}>
          <ZoomOutOutlined />
        </li>
      </ul>
    </S.ToolWrap>,
    $container
  )
}

const Header = observer(() => {
  const { graph } = useStore()
  const {
    canvas,
    readOnly,
    clickLink,
    fullScreen,
    toggleReadOnly,
    toggleClickLink,
    toggleFullScreen,
  } = graph

  const undo = () => {
    canvas.undo()
  }

  const redo = () => {
    canvas.redo()
  }

  return (
    <S.HeaderWrap>
      <ul className="header-bar">
        <li onClick={undo}>
          <RedoOutlined />
        </li>
        <li onClick={redo}>
          <UndoOutlined />
        </li>
        <li onClick={toggleReadOnly}>{readOnly ? <EyeOutlined /> : <HighlightOutlined />}</li>
        <li onClick={toggleFullScreen}>
          {fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        </li>
        <li onClick={toggleClickLink}>{clickLink ? <DisconnectOutlined /> : <LinkOutlined />}</li>
        <li>
          <CheckOutlined />
        </li>
      </ul>
      <Tool />
    </S.HeaderWrap>
  )
})

export default Header
