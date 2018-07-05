/* global process */
import React from 'react'
import Head from 'next/head'
import NLink from 'next/link'

import styled from 'styled-components'
import axios from 'axios'

import {
  Flex,
  Box,
  Container,
  Text,
  Button,
  Heading,
  Link,
  Input,
  Label
} from 'ooni-components'

import Layout from '../components/layout'
import AddURLsSection from '../components/AddURLsSection.js'

class DataCooking extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ready: false,
      duration: 0,
      error: null,
      createdAt: "0"
    }
  }

  componentDidMount() {
    const { jobID } = this.props

    setTimeout((() => {
      fetch(`/_/kue/job/${jobID}`)
        .then(resp => {
          return resp.json()
        })
        .then((j => {
          let state = {}
          state['createdAt'] = j.created_at
          if (j.state === "completed") {
            state['ready'] = true
          } else if (j.state === "failed") {
            state['error'] = j.error
          }
          this.setState(state)
        }).bind(this))
    }).bind(this), 3000);
  }

  render() {
    const {
      country,
      startDate,
      endDate,
      urls,
      jobID,
      filename
    } = this.props

    const { ready, error, createdAt } = this.state
    console.log(createdAt)
    const creationDate = new Date(parseInt(createdAt))

    return (
      <div>
        <Heading h={2}>Your data is cooking.</Heading>
        <Heading h={3}>Please wait....</Heading>
        <Text>Created At: {creationDate.toString()}</Text>
        <Text>Country: {country}</Text>
        <Text>Start Date: {startDate}</Text>
        <Text>End Date: {endDate}</Text>
        <Text>URLs: {urls.toString()}</Text>
        <Text>JobID: {jobID}</Text>
        {error !== null
          && <div>
          <Heading h={3} color="red">There was an error. Try again</Heading>
          <p>{error}</p>
          </div>
        }
      </div>
    )
  }

}

export default class Home extends React.Component {

  static async getInitialProps () {
    return {}
  }

  constructor(props) {
    super(props)
    this.state = {
      generating: 0,
      urls: [],
      endDate: (new Date()).toISOString().split('T')[0],
      startDate: (new Date()).toISOString().split('T')[0],
      country: "ZZ",
      filename: null,
      jobID: null
    }
    this.handleChangeURLs = this.handleChangeURLs.bind(this)
    this.makeData = this.makeData.bind(this)
  }

  handleChangeURLs(urls) {
    let state = Object.assign({}, this.state)
    urls = urls.filter((url) => url !== '').map(u => u.value)
    state['urls'] = urls
    this.setState(state)
  }

  handleChange(stateName) {
    return ((e) => {
      const value = e.target.value
      let state = Object.assign({}, this.state)
      state[stateName] = value
      this.setState(state)
    }).bind(this)
  }

  makeData() {
    const {
      urls,
      endDate,
      startDate,
      country
    } = this.state
    fetch('/_/make-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urls,
        country,
        start_date: startDate,
        end_date: endDate,
      })
    }).then(resp => {
      return resp.json()
    }).then(j => {
      this.setState({
        jobID: j.job_id,
        filename: j.filename,
        loading: true
      })
    })
  }

  render () {
    const {
      loading,
      country,
      startDate,
      endDate,
      urls,
      filename,
      jobID
    } = this.state

    return (
      <Layout>
        <Head>
          <title>OONI Analyst</title>
        </Head>
        <Container>

          {loading
            && <DataCooking
                  jobID={jobID}
                  filename={filename}
                  country={country}
                  startDate={startDate}
                  endDate={endDate}
                  urls={urls} />
          }
          {!loading && <div>
          <Heading h={2}>Welcome analyst!</Heading>
          <Flex>
            <Box w={1/3}>
            <Label pt={3}>
            Start Date
            </Label>
            <Input type="date"
                   value={this.state.startDate}
                   onChange={this.handleChange('startDate')} />

            <Label pt={3}>
            End Date
            </Label>
            <Input type="date"
                   value={this.state.endDate}
                   onChange={this.handleChange('endDate')} />

            <Label pt={3}>
            Country code
            </Label>
            <Input value={this.state.country} onChange={this.handleChange('country')} />
            </Box>
            <Box w={1/3}>
            <AddURLsSection urls={this.state.urls} onUpdatedURLs={this.handleChangeURLs} />
            </Box>
          </Flex>
          <Button onClick={this.makeData}>Get me some data!</Button>
          </div>}
        </Container>
      </Layout>
    )
  }
}
