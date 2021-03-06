/* global require, process, __dirname */
/* eslint no-console: off */
const path = require('path')
const express = require('express')
const next = require('next')
const axios = require('axios')

process.env.NODE_ENV = process.env.NODE_ENV || 'production'
process.env.PORT = process.env.PORT || 3200

const { kueApp, handleMakeCSV, CSV_OUTPUT_DIR } = require('./lib/jobs')

const dev = process.env.NODE_ENV === 'development'

const app = next({ dir: '.', dev })
const handle = app.getRequestHandler()

const server = express()

app.prepare()
  .then(() => {
    return new Promise((resolve) => {
    // XXX in here I can do setup
      return resolve()
    })
  })
  .then(() => {
    server.use('/_/kue', kueApp)
    server.use(express.json())

    server.post('/_/make-csv', handleMakeCSV)
    server.use('/download',
      express.static(CSV_OUTPUT_DIR))

    // Default catch all
    server.all('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(process.env.PORT, err => {
      if (err) {
        throw err
      }
      console.log('> Ready on http://localhost:' +
    process.env.PORT +
    ' [' + process.env.NODE_ENV + ']')
    })
  })
  .catch(err => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })
