/**
 * Get conversation and crawl the pages and fix them
 */

//Dependencies
//let scrawler = require('.')
const fetchConversations = require('./api')
const noteClicker = require('./index')

const createConversationLink = (conversation) => {
  const baseUrl = 'https://secure.helpscout.net/conversation/'
  const { id, number, folderId } = conversation
  if ((id, number, folderId))
    return ` ${baseUrl}${id}/${number}?folderId=${folderId}`
  else return false

  //1353459485/2675457?folderId=2834514
}

const allConversationsLinks = (arrayConversation) => {
  let links = []
  for (let conversation of arrayConversation) {
    let link = createConversationLink(conversation)
 
    if (link) links.push(link)
  }
  return links
}

//Amount of conversation need to be divideAble by 25
async function run(amountOfConversations = null) {
  let stop = false

  //Amount of conversation need to be divideAble by 25
  let response = await fetchConversations(amountOfConversations)
  console.log({ Length: response.length })

  const links = allConversationsLinks(response)
  //console.log({ links, f: links[0] })
  if (links) await noteClicker(links)
}

run(50)
