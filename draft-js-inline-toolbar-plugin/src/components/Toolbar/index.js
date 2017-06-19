/* eslint-disable react/no-array-index-key */
import React from 'react';
import { getVisibleSelectionRect } from 'draft-js';

// TODO make toolbarHeight to be determined or a parameter
const toolbarHeight = 44;

const getRelativeParent = (element) => {
  if (!element) {
    return null;
  }

  const position = window.getComputedStyle(element).getPropertyValue('position');
  if (position !== 'static') {
    return element;
  }

  return getRelativeParent(element.parentElement);
};

export default class Toolbar extends React.Component {

  state = {
    isVisible: false,
  }

  componentWillMount() {
    this.props.store.subscribeToItem('isVisible', this.onVisibilityChanged);
  }

  componentWillUnmount() {
    this.props.store.unsubscribeFromItem('isVisible', this.onVisibilityChanged);
  }

  onVisibilityChanged = (isVisible) => {
    // need to wait a tick for window.getSelection() to be accurate
    // when focusing editor with already present selection
    setTimeout(() => {
      let position;
      let arrowPosition = { left: "50%" };
      if (isVisible) {
        const toolbarWidth = _this.toolbar.clientWidth;
        const relativeParent = getRelativeParent(this.toolbar.parentElement);
        const relativeRect = relativeParent ? relativeParent.getBoundingClientRect() : document.body.getBoundingClientRect();
        const selectionRect = getVisibleSelectionRect(window);
        const middle = selectionRect.left - relativeRect.left + selectionRect.width / 2;
        const middleMin = (toolbarWidth/2) - relativeRect.left;
        const middleMax = relativeRect.right - (toolbarWidth/2);
        const left = middle < leftMin ? leftMin : middle > leftMax ? leftMax : middle;
        arrowPosition.left = 50 + (((middle - left) / toolbarWidth) * 100) + "%";
        position = {
          top: (selectionRect.top - relativeRect.top) - toolbarHeight,
          left: left,
          transform: 'translate(-50%) scale(1, 1)',
          transition: 'transform 0.15s cubic-bezier(.3,1.2,.2,1)',
        };
      } else {
        position = { transform: 'translate(-50%) scale(1, 0)' };
      }
      this.setState({ position, arrowPosition});
    }, 0);
  }

  render() {
    const { theme, store } = this.props;
    return (
      <div
        className={theme.toolbarStyles.toolbar}
        style={this.state.position}
        ref={(toolbar) => { this.toolbar = toolbar; }}
      >
        {this.props.structure.map((Component, index) => (
          <Component
            key={index}
            theme={theme.buttonStyles}
            getEditorState={store.getItem('getEditorState')}
            setEditorState={store.getItem('setEditorState')}
          />
        ))}
        <div className={theme.toolbarStyles.toolbarArrow} style={this.state.arrowPosition}/>
      </div>
    );
  }
}
