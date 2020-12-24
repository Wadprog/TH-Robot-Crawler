/**
 * Configuration files
 */
const environment = {}

environment.production = {
  browserConfig: {
    headless: true,
    sloMo: 0,
    devtools: false,
  },
}
environment.development = {
  browserConfig: {
    headless: false,
    devtools: true,
  },
}

const DESIRED_ENVIRONMENT =
  typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV.toLocaleLowerCase()
    : null

const ENVIRONMENT_TO_RETURN =
  typeof environment[DESIRED_ENVIRONMENT] == 'object'
    ? environment[DESIRED_ENVIRONMENT]
    : environment.development

module.exports = ENVIRONMENT_TO_RETURN
