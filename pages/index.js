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
  Link
} from 'ooni-components'

import Layout from '../components/layout'

export default class Home extends React.Component {

  static async getInitialProps () {
    return {}
  }

  constructor(props) {
    super(props)
  }

  render () {
    return (
      <Layout>
        <Head>
          <title>OONI Analyst</title>
        </Head>
        <Container>
        </Container>
      </Layout>
    )
  }
}
