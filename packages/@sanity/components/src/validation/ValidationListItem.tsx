import classNames from 'classnames'
import React from 'react'
import {Path} from '@sanity/types'
import ErrorOutlineIcon from 'part:@sanity/base/error-outline-icon'
import {Marker} from '../types'

import styles from './ValidationListItem.css'

interface ValidationListItemProps {
  kind: string
  onClick?: (path?: Path) => void
  showLink?: boolean
  path: string
  hasFocus?: boolean
  truncate?: boolean
  marker: Marker
}

// @todo: refactor to functional component
export default class ValidationListItem extends React.PureComponent<ValidationListItemProps> {
  static defaultProps = {
    kind: '',
    path: '',
    onClick: undefined,
    showLink: false,
    truncate: false
  }

  _element: HTMLAnchorElement | null = null

  componentDidMount() {
    if (this.props.hasFocus) {
      this.focus()
    }
  }

  handleKeyPress = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Enter') {
      // this.handleClick(event)
      const {marker, onClick} = this.props
      if (onClick) {
        onClick(marker.path)
      }
    }
  }

  focus() {
    setTimeout(() => {
      if (this._element) this._element.focus()
    }, 200)
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps: ValidationListItemProps) {
    if (nextProps.hasFocus) {
      this.focus()
    }
  }

  handleClick = () => {
    const {marker, onClick} = this.props
    if (onClick) {
      onClick(marker.path)
    }
  }

  setElement = (element: HTMLAnchorElement | null) => {
    this._element = element
  }

  render() {
    const {kind, marker, onClick, path, truncate} = this.props

    return (
      <a
        data-item-type={kind}
        ref={this.setElement}
        tabIndex={0}
        onClick={this.handleClick}
        onKeyPress={this.handleKeyPress}
        className={classNames(
          onClick ? styles.interactiveItem : styles.item,
          marker.level && styles[marker.level],
          truncate && styles.truncate
        )}
      >
        <span className={styles.icon}>
          <ErrorOutlineIcon />
        </span>

        <div className={styles.content}>
          {path && <div className={styles.path}>{path}</div>}
          {marker.item.message && <div className={styles.message}>{marker.item.message}</div>}
        </div>
      </a>
    )
  }
}
