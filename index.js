let express = require('express')
require('dotenv').config()
const Sentry = require("@sentry/node")
const { use } = require('express/lib/application')
const res = require('express/lib/response')
let app = express()
const { ProfilingIntegration } = require("@sentry/profiling-node");
app.use(express.json())
const PORT = process.env.PORT
const DSN = process.env.DSN
//const fs = require("fs")

Sentry.init({
    dsn: DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  
  // The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
  
  // TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
app.use(Sentry.Handlers.errorHandler());

const routes = require("./routes/index")
app.use('/api', routes)


app.listen(PORT,() => {
    console.log(`example app listenig on ${PORT}`)
})


 