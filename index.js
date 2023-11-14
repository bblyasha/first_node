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
const swaggerUi = require("swagger-ui-express");
//const swaggerSpec = require("./swaggerSpec.js");
const swaggerJSDoc = require('swagger-jsdoc');

const routes = require("./routes/index.js")
app.use('/api', routes)


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


const swaggerOptions = {
  swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title:  "Users API",
        description: "User API informartion"
      }
  },
  apis: ["./routes/users.routes.js"]
}

const swaggerDocs = swaggerJSDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve,swaggerUi.setup(swaggerDocs))
 

app.listen(PORT,() => {
    console.log(`example app listenig on ${PORT}`)
})
