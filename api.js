/**
 * All functions that are too small to be there own modules
 */

//Dependencies
var HelpScout = require('helpscout-2.0')

//Custom dependencies
let config = require('./constants')
let data = require('./data')
//Main object
const helper = {}
helper.p = function (string) {
  try {
    let r = JSON.parse(string)
    return r
  } catch (err) {
    return {}
  }
}
helper.ApiCallLimit = 2

var HelpScoutClient = new HelpScout({
  clientId: config.LEIGH_APP_ID,
  clientSecret: config.LEIGH_APP_SECRET,
})

helper.UrlFetchApp = {}

helper.UrlFetchApp.fetch = async (url, options) => {
  let method =
    options.method && typeof options.method == 'string'
      ? options.method.toUpperCase()
      : false
  var uri = url && typeof url == 'string' ? url : false
  let payload =
    options.payload && typeof options.payload == 'object'
      ? options.payload
      : undefined
  if (method && uri && payload === options.payload) {
    //It should sleep 200 ms between Api calls
    helper.sleep(200)
    //if we exceeded the ApiLimit wait another min
    if (helper.ApiCallLimit < 2)
      helper.pauseIfLimitReach({ retry_after: 60000 })
    try {
      //Now we are making the call.
      let res = await HelpScoutClient.rawApi(
        options.method,
        url,
        options.payload
      )
      //Processing the response once it is back
      const body = res.body
      let data = {}
      if (options.method.toLowerCase() == 'get') {
        let parsedBody = JSON.parse(body)
        data.result = parsedBody._embedded
        data.page = parsedBody.page
      }

      helper.ApiCallLimit = parseInt(
        res.headers['x-ratelimit-remaining-minute']
      )

      return {
        body,
        data,
        getResponseCode: () => res.statusCode,
        getContentText: () => body,
      }
    } catch (error) {
      //We log the error for debugging purposes.
      helper.error('They called me and I failled with ')
      console.log({ url, options })
      console.error(error)
      return {
        data: error,
        getResponseCode: () => res.statusCode,
        getContentText: () => '',
      }
    }
  } else {
    helper.warning(` API REQ NOT MADE Review request args. `)
    console.log({
      url,
      options,
    })
    return false
  }
}

helper.fetchConversations = async (page = false) => {
  let baseUrl =
    'https://api.helpscout.net/v2/conversations?_embeded=threads&mailbox=178750&status=active&tag=buying&sortOrder=asc'

  let url = page ? baseUrl + '&page=' + page : baseUrl
  try {
    let res = await helper.UrlFetchApp.fetch(url, { method: 'GET' })
    let statusCode = res.getResponseCode()
    if (statusCode == 200) {
      helper.success('Successfully loaded emails in page ' + page)
      return res.data
    } else {
      helper.error('Failled to load email in page ' + page)
      return false
    }
  } catch (error) {
    helper.error('Failled to load email in page ' + page)
    console.error(error)
    return false
  }
}

async function fetchALLConversations(amountOfConversations = null) {
  let dataToReturn = []
  let currentPage = helper.readLastPage()
  let page = currentPage || 1
  let haveRequestedConversations = true
  let response = { page: { totalPages: 1 } }
  //Get all the conversation from  customer's email
  amountOfConversations = amountOfConversations ? amountOfConversations / 25 : 1

  for (var i = 0; i < amountOfConversations; i++) {
    response = await helper.fetchConversations(page)
    console.log({ response })
    if (response) {
      let conversationList = response.result.conversations.filter(
        (conversation) =>
          conversation &&
          conversation != undefined &&
          conversation != null &&
          typeof conversation == 'object'
      )

      let temp = [...dataToReturn, ...conversationList]
      dataToReturn = temp
      helper.info(`Gathering emails`)
    } else {
      helper.error('Error getting conversation list')
      return false
    }
    page++
    helper.savePage(page)
    if (haveRequestedConversations) haveRequestedConversations = false
  }
  if (dataToReturn.length > 0) return dataToReturn
  else return false
}

helper.customFieldsGetter = (customFields) => {
  let valueToreturn = {}

  customFields.forEach((field) => {
    valueToreturn[field.name.replace(/ /g, '_')] = field.value
  })
  return valueToreturn
}

helper.savePage = (page) => {
  data.write('infos', 'lastPage', { page: page }, (err) => {
    if (err) helper.error(err)
  })
}
helper.readLastPage = () => {
  let pageInfo = data.readAsync('infos', 'lastPage')
  if (pageInfo) {
    return pageInfo.page
  } else return 1
}

helper.parseJsonToObject = (string) => {
  try {
    let obj = JSON.parse(string)
    return obj
  } catch (error) {
    return {}
  }
}
helper.sleep = (milliSeconds, message = null) => {
  let startTime = new Date().getTime()
  let lastLog = 0
  function updateDisplay(currentTime) {
    console.clear()
    let msg = ''
    if (message) msg = message + '\n'
    msg += '💤 🕑 Relaunching in: ' + currentTime + ' seconds'
    process.stdout.write(msg)
  }
  let currentTime = new Date().getTime()
  let lastTimeIChecked = currentTime
  let remaining = milliSeconds / 1000
  while (startTime + milliSeconds >= currentTime) {
    currentTime = new Date().getTime()

    if (currentTime - lastTimeIChecked >= 1000) {
      remaining--
      updateDisplay(remaining)
      lastTimeIChecked = currentTime
    }
  }
  //Restoring \n
  console.log('')
}

helper.validateEmail = function (mail) {
  if (
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      mail
    )
  ) {
    return true
  }

  return false
}

helper.pauseIfLimitReach = (error) => {
  let msg = '\n\n🕕🕦🕑-script have been halted-🕕🕦🕑\n\n'
  let timeToWait =
    error.retry_after != undefined ? error.retry_after : constants.ONE_MINUTE
  helper.sleep(timeToWait, msg)
}
helper.log = (msg, type, symbol = null) => {
  const black = '\x1b[30m'
  const red = '\x1b[31m'
  const green = '\x1b[32m'
  const yellow = '\x1b[33m'
  const blue = '\x1b[34m'
  let colorCode = '\x1b[31m%s\x1b[0m'
  switch (type.toUpperCase()) {
    case 'ERROR':
      colorCode = red
      break
    case 'INFO':
      colorCode = blue
      break
    case 'SUCCESS':
      colorCode = green
      break
    case 'WARNING':
      colorCode = yellow
      break
    default:
      colorCode = black
      break
  }
  if (symbol) console.log(symbol, colorCode, msg)
  else console.log(colorCode, msg)
}
helper.error = (msg) => helper.log(msg, 'ERROR', '❌')
helper.info = (msg) => helper.log(msg, 'INFO', 'ℹ️ ')
helper.success = (msg) => helper.log(msg, 'SUCCESS', '✅')
helper.warning = (msg) => helper.log(msg, 'WARNING', '🚧')

module.exports = fetchALLConversations
