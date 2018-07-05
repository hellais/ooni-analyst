import React from 'react'

import styled from 'styled-components'
import MdDelete from 'react-icons/lib/md/delete'

import {
  Heading,
  Text,
  Container,
  Label,
  Input,
  Button,
  Row,
  Column,
  Link,
  Pre,
  RadioGroup,
  RadioButton,
  Flex,
  Box,
  InputWithIconButton,
} from 'ooni-components'

const AddURLButton = styled(Button)`
  color: ${props => props.theme.colors.gray5};
  border-radius: 0;
  padding: 0;
  background-color: transparent;
  border-bottom: 1px solid ${props => props.theme.colors.gray1};
  text-align: left;
  text-transform: none;
  &:hover {
    background-color: transparent;
  color: ${props => props.theme.colors.gray6};
    border-bottom: 1px solid ${props => props.theme.colors.gray3};
  }
  &:active {
    background-color: transparent;
  color: ${props => props.theme.colors.gray7};
    border-bottom: 2px solid ${props => props.theme.colors.gray4};
  }
`

class AddURLsSection extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      urls: props.urls
    }
    this.handleDeleteURL = this.handleDeleteURL.bind(this)
    this.handleEditURL = this.handleEditURL.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.addURL = this.addURL.bind(this)
    this.urlRefs = new Map()
  }

  addURL() {
    let state = Object.assign({}, this.state)
    const idx = this.state.urls.length
    state.urls.push({value: 'http://', error: null, ref: null})
    this.props.onUpdatedURLs(state.urls)
    this.setState(state, () => {
      // This is a ghetto hax, that is a workaround for:
      // https://github.com/jxnblk/rebass/issues/329
      const urlInputs = document.getElementsByClassName('url-input')
      const target = urlInputs[urlInputs.length - 1]
      target.focus()
      target.setSelectionRange(7,7)
    })
  }

  handleKeyPress (e) {
    if (e.key === 'Enter') {
      this.addURL()
    }
  }

  handleDeleteURL(idx) {
    return ((event) => {
      let state = Object.assign({}, this.state)
      state.urls = state.urls
                        .filter((url, jdx) => jdx !== idx)
                        .map(url => Object.assign({}, url))
      this.setState(state)
      this.props.onUpdatedURLs(state.urls)
    }).bind(this)
  }

  handleEditURL(idx) {
    return ((event) => {
      const value = event.target.value
      let state = Object.assign({}, this.state)
      state.urls = state.urls.map(url => Object.assign({}, url))
      state.error = false
      let update = value.split(' ').map((line) => {
        let itm = {'value': line, 'error': null}
        if (!line.startsWith('https://') && !line.startsWith('http://')) {
          itm['error'] = 'URL must start with http:// or https://'
          state.error = true
        }
        return itm
      })
      state.urls.splice.apply(state.urls, [idx, 1].concat(update))
      this.setState(state)
    })
  }

  render() {
    const { onUpdatedURLs } = this.props
    const { urls } = this.state

    return (
      <Box>
        {urls.length == 0
        && <div>
          Click "Add URL" below to add a URL
          </div>
        }
        {urls.map((url, idx) => <div key={`url-${idx}`}>
          <InputWithIconButton
                className='url-input'
                value={url.value}
                icon={<MdDelete />}
                error={url.error}
                onKeyPress={this.handleKeyPress}
                onBlur={() => onUpdatedURLs(urls)}
                onChange={this.handleEditURL(idx)}
                onAction={this.handleDeleteURL(idx)} />
          </div>)}
        <div>
          <AddURLButton onClick={this.addURL}>
          + Add URL
          </AddURLButton>
        </div>
        </Box>
      )
    }
}

export default AddURLsSection
