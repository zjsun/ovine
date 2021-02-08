/**
 * 1. 高亮时，滚动条定位指定位置
 * 2. 1.字段排序--同步状态，2. 表排序自动 折叠字段
 */

import cls from 'classnames'
import { observer } from 'mobx-react'
import React, { useEffect, useRef } from 'react'
import Sortable from 'sortablejs'

import RightOutlined from '@ant-design/icons/RightOutlined'
import { useImmer } from '@core/utils/hooks'

import { useStore } from '../../store'
import { NoField, NoTable } from '../state/null_data'

import * as S from './styled'
import { FieldTool, TableTool } from './tool'

const SearchHightText = observer((props) => {
  const {
    aside: { searchText, searchMode },
  } = useStore()
  const { text = '', className = '' } = props

  const renderHighlight = () => {
    const html = {
      __html: text.replace(searchText, `<span class="text-danger">${searchText}</span>`), // TODO; 此处需要防止 脚本攻击
    }
    // eslint-disable-next-line
    return <span dangerouslySetInnerHTML={html} />
  }

  return (
    <span className={className}>
      {!text ? '-' : searchMode && searchText ? renderHighlight() : text}
    </span>
  )
})

// TODO 添加 排序功能---需要二次确认功能,使用 ID 替换Index, 使用
const NavField = observer((props: any) => {
  const { field, nodeId } = props
  const { name, id } = field

  const { setActiveFieldId, setActiveId, activeFieldId, graph, aside } = useStore()
  const { withSearch, setSearchText, focusActiveNode, sortMode } = aside

  const isActive = activeFieldId === id

  const onFieldClick = () => {
    if (withSearch) {
      setSearchText()
      setActiveId(nodeId)
      setActiveFieldId(id)
      focusActiveNode()
      graph.canvas.focusNodeWithAnimate(nodeId)
    } else {
      setActiveFieldId(isActive ? '' : id)
    }
  }

  return (
    <S.NavField
      data-id={id}
      className={cls('nav-field sort-handle', { active: isActive })}
      onClick={onFieldClick}
    >
      <div className="field-label">
        <SearchHightText text={name} />
      </div>
      {isActive && !withSearch && !sortMode && <FieldTool id={id} />}
    </S.NavField>
  )
})

//
const NavNode = observer((props: any) => {
  const { name, fields = [], id, isExpand, batchAddFields, setExpandId } = props

  const { activeId, model, clearActive, setActiveFieldId, graph, aside } = useStore()
  const { withSearch, sortMode, setSearchText, focusActiveNode } = aside

  const $contentRef = useRef()
  const sortIns = useRef<any>()

  const isActive = activeId === id
  const contentStyle = {
    height: `${!isExpand ? 0 : fields.length ? fields.length * 32 + 16 : 110}px`,
  }

  const remove = () => {
    model.removeTable(id)
    clearActive()
  }

  useEffect(() => {
    if (sortMode) {
      sortIns.current = Sortable.create($contentRef.current, {
        group: `node-${id}`,
        animation: 150,
        fallbackOnBody: true,
        swapThreshold: 0.65,
      })
    } else if (!sortMode && sortIns.current) {
      sortIns.current.save()
      sortIns.current.destroy()
    }
  }, [sortMode])

  const onHeaderClick = (e) => {
    e.stopPropagation()
    if (withSearch) {
      setActiveFieldId()
      setSearchText()
      setExpandId(id)
      focusActiveNode()
      graph.canvas.focusNodeWithAnimate(id)
    } else {
      setExpandId(isExpand ? '' : id)
    }
  }

  return (
    <S.NavNode data-id={id} className={cls('nav-node sort-handle', { expand: isExpand })}>
      <div className="node-header" onClick={onHeaderClick}>
        <div>
          <RightOutlined />
          <SearchHightText className="node-label" text={name} />
        </div>
        {isActive && !withSearch && !sortMode && <TableTool id={id} remove={remove} />}
      </div>
      <div ref={$contentRef} className="node-content" style={contentStyle}>
        {fields.length ? (
          fields.map((field) => {
            return <NavField key={field.id} nodeId={id} field={field} />
          })
        ) : (
          <NoField
            type={withSearch ? 'search' : sortMode ? 'sort' : 'add'}
            batchAddFields={batchAddFields}
          />
        )}
      </div>
    </S.NavNode>
  )
})

//
const NavTree = observer(() => {
  const { activeId, setActiveId, model, clearActive, aside } = useStore()
  const { searchText, withSearch, sortMode } = aside
  const $wrapRef = useRef()
  const sortIns = useRef<any>()

  const [state, setState] = useImmer<any>({
    expandId: '',
  })

  const { expandId } = state

  const setExpandId = (id = '') => {
    setState((d) => {
      if (id !== d.expandId) {
        d.expandId = id
      }
    })
  }

  useEffect(() => {
    if (sortMode) {
      sortIns.current = Sortable.create($wrapRef.current, {
        group: 'navList',
        direction: 'vertical',
        animation: 150,
        onStart: () => {
          setExpandId()
          clearActive()
        },
      })
    } else if (!sortMode && sortIns.current) {
      sortIns.current.save()
      sortIns.current.destroy()
    }
  }, [sortMode])

  // 设置高亮
  useEffect(() => {
    if (sortMode) {
      setExpandId(expandId)
    } else {
      setActiveId(expandId)
    }
  }, [expandId])

  // 设置展开
  useEffect(() => {
    if (!sortMode) {
      setExpandId(activeId)
    }
  }, [activeId])

  const renderNodes = () => {
    return model.tables.map((table) => {
      const { id, name, fields, batchAddFields } = table
      const nodeProps: any = {
        id,
        name,
        fields,
        isShow: true,
        isExpand: table.id === expandId,
        setExpandId,
        batchAddFields,
      }
      if (withSearch) {
        nodeProps.isExpand = true
        nodeProps.fields = fields.filter((field) => {
          return field.name.indexOf(searchText) > -1
        })

        const isRes = table.name.indexOf(searchText) > -1

        nodeProps.isShow = isRes || !!nodeProps.fields.length
      }

      if (!nodeProps.isShow) {
        return null
      }

      return <NavNode key={id} {...nodeProps} />
    })
  }

  const Nodes = renderNodes()

  return (
    <S.NavTreeWrap ref={$wrapRef} className={cls({ 'sort-mode': sortMode })}>
      {!model.tables.length ? (
        <NoTable />
      ) : withSearch && !Nodes.filter((i) => !!i).length ? (
        <NoTable icon="noSearchItem" tip="未找到数据" />
      ) : (
        Nodes
      )}
    </S.NavTreeWrap>
  )
})

export default NavTree
