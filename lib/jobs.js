const path = require('path')

const kue = require('kue')
const PythonShell = require('python-shell')

const CSV_OUTPUT_DIR = process.env.CSV_OUTPUT_DIR || path.join(__dirname, '..', 'csv_output')

const queue = kue.createQueue({
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIT_HOST || 'localhost'
  }
})

const queueSize = 3

queue.process('make-csv', queueSize, (job, done) => {
  const { urls, country, start_date, end_date, filename }  = job.data
  console.log("job process %d", job.id, urls, country, start_date, end_date)

  const outputPath = path.join(CSV_OUTPUT_DIR, filename)
  const options = {
    mode: 'text',
    scriptPath: path.join(__dirname, 'python'),
    args: [
      '--urls', urls, 
      '--output', outputPath,
      '--country', country,
      '--start-date', start_date,
      '--end-date', end_date
    ],
    pythonPath: process.env.PYTHON_BINARY_PATH,
    // pythonOptions: ['-u'], // get print results in real-time
  }
  PythonShell.run('make-csv.py', options, (err, results) => {
    if (err) {
      done(err)
    }
    done()
  })
  job.progress(50, 100)
})

const makeid = (len) => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}


const makeCSVFilename = (country, basename) => {
  const ts = new Date()
  const id = makeid(10)
  const filename = `${ts.toISOString().split('T')[0]}-${country}-${basename}-${id}.csv`
  return filename
}

const handleMakeCSV = (req, res) => {
  const {
    urls,
    country,
    start_date,
    end_date
  } = req.body
  if (!/[A-Z]{2}/.test(country)) {
    res.json({
      error: 'invalid country code'
    })
    return
  }

  const filename = makeCSVFilename(country, 'measurements')

  let job = queue.create('make-csv', {
    urls,
    country,
    start_date,
    end_date,
    filename
  }).save((err) => {
    if (err) {
      res.json({
        error: err.toString()
      })
      return
    }
    res.json({
      filename: filename,
      job_id: job.id
    })
  })
}

module.exports = {
  CSV_OUTPUT_DIR,
  handleMakeCSV,
  kueApp: kue.app,
}
