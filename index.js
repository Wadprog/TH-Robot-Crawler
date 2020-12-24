/**
 *
 * Web scrawller clicks on merge links and delete all notes after
 */
let wentThrough = 0
//Dependencies
const puppeteer = require('puppeteer')
//Custom Dependencies
let constants = require('./constants')
let config = require('./config')

//The main object
const bot = {
  browser: null, //
  page: null,
}
//Opening a web browser with a tab in it
bot.init = async () => {
  if (bot.browser == null)
    bot.browser = await puppeteer.launch(config.browserConfig)
  if (bot.page == null) bot.page = await bot.browser.newPage()
}
//Open browser and go to  a page
bot.launch = async (customPage) => {
  await bot.init()
  await bot.page.goto(customPage)
}

//Login using the credentials save in the constant.js
bot.loginHS = async (user, password) => {
  await bot.launch('https://secure.helpscout.net/members/login/?action=logout')
  await bot.page.type('#email', user)
  await bot.page.type('#password', password)
  await bot.page.click('#logInButton')
  await bot.page.waitForNavigation({
    waitUntil: 'networkidle0',
  })
  bot.signedIn = true
}
//Login if not logged in and go to an helpscout conversation
bot.gotoConversation = async (conversationLink) => {
  if (!bot.signedIn) {
    const { USER, PASSWD } = constants
    await bot.loginHS(USER, PASSWD)
  }

  await bot.page.goto(conversationLink)
}

//Click on all Merge button then delete the notes
bot.clickMergeLink = async (link) => {
  wentThrough++
  console.log('Original Click Merge Link')
  await bot.gotoConversation(link)
  await bot.page.evaluate(async () => {
    const deleteArticle = async (article) => {
      return new Promise((resolve, reject) => {
        let delBtn = article.getElementsByClassName('delete')[0]
        if (delBtn && delBtn != null && delBtn != undefined) {
          delBtn.click()

          var observer = new WebKitMutationObserver((mutations, observer) => {
            for (let mutation of mutations) {
              let confirmBtn = document.querySelector('#button-0')

              if (confirmBtn && confirmBtn != null && confirmBtn != undefined) {
                confirmBtn.click()
                observer.disconnect()
                observer = null
                resolve('Done deleting note')
              }
            }
          })
          if (observer && observer != null)
            observer.observe(document.body, {
              childList: true,
            })
        } else {
          reject('no Delete button found in the options')
        }
      })
    }

    const treadsContents = document.getElementById('tkContent')
    let articles = treadsContents.getElementsByClassName('user note')
    //Looping through each user created  Notes
    for (let article of articles) {
      let message = article.getElementsByClassName('messageBody')
      let b = message[0].getElementsByTagName('b')[0]
      if (
        b &&
        b != undefined &&
        b.innerText.includes('Cases with the same order number:')
      ) {
        var divAfterB = b.nextElementSibling
        if (divAfterB && divAfterB != null && divAfterB != undefined)
          var ul = divAfterB.getElementsByTagName('ul')[0]
        if (ul && ul != null && ul != undefined)
          var lis = ul.getElementsByTagName('li')
        if (lis && lis != null && lis != undefined)
          for (let li of lis) {
            let btn = li.getElementsByTagName('button')[0]
            let a = btn.getElementsByTagName('a')[0]
            let href = a.href
            await fetch(href)
          }
        await deleteArticle(article)
      } else {
        console.log('no b box but still user notes')

        let firstChild = message[0].getElementsByTagName('div')[0]

        if (firstChild)
          var messageBox = firstChild.getElementsByTagName('div')[1]
        if (
          messageBox &&
          messageBox.innerText.includes('Auto-closed by script see')
        )
          //
          await deleteArticle(article)
      }
    }
  })
  console.log('done with ' + link + ' time : ' + wentThrough)
  //if not even mean the function did not go twice
  if (wentThrough % 2 != 0) await bot.clickMergeLink(link)
}
//Deprecated function
const fixConversations = async (conversationLinks) => {
  //let us open the browser and sign in
  const { USER, PASSWD } = constants
  await bot.loginHS(USER, PASSWD)

  for (let conversationLink of conversationLinks) {
    await bot.page.evaluate(async () => {})
    //if not even mean the function did not go twice
    if (wentThrough % 2 != 0) bot.clickMergeLink(link)
    else console.log('done with ' + link + ' time : ' + wentThrough)
  }
}
// Helper function to delete a note in a page
const deleteArticle = async (article) => {
  return new Promise((resolve, reject) => {
    let delBtn = article.getElementsByClassName('delete')[0]
    if (delBtn && delBtn != null && delBtn != undefined) {
      delBtn.click()

      var observer = new WebKitMutationObserver((mutations, observer) => {
        for (let mutation of mutations) {
          let confirmBtn = document.querySelector('#button-0')

          if (confirmBtn && confirmBtn != null && confirmBtn != undefined) {
            confirmBtn.click()
            observer.disconnect()
            observer = null
            resolve('Done deleting note')
          }
        }
      })
      if (observer && observer != null)
        observer.observe(document.body, {
          childList: true,
        })
    } else {
      reject('no Delete button found in the options')
    }
  })
}
//helper function to inject in page and click merge links then delete notes
const onPageActions = async () => {
  const deleteArticle = async (article) => {
    return new Promise((resolve, reject) => {
      let delBtn = article.getElementsByClassName('delete')[0]
      if (delBtn && delBtn != null && delBtn != undefined) {
        delBtn.click()

        var observer = new WebKitMutationObserver((mutations, observer) => {
          for (let mutation of mutations) {
            let confirmBtn = document.querySelector('#button-0')

            if (confirmBtn && confirmBtn != null && confirmBtn != undefined) {
              confirmBtn.click()
              observer.disconnect()
              observer = null
              resolve('Done deleting note')
            }
          }
        })
        if (observer && observer != null)
          observer.observe(document.body, {
            childList: true,
          })
      } else {
        reject('no Delete button found in the options')
      }
    })
  }
  console.log(' Hey I am here 1 time')
  const treadsContents = document.getElementById('tkContent')
  console.log({ treadsContents })
  if (treadsContents && treadsContents != null && treadsContents != undefined) {
    let articles = treadsContents.getElementsByClassName('user note')
    //Looping through each user created  Notes
    if (articles && articles != null && articles != undefined) {
      for (let article of articles) {
        let message = article.getElementsByClassName('messageBody')
        let b = message[0].getElementsByTagName('b')[0]
        if (
          b &&
          b != undefined &&
          b.innerText.includes('Cases with the same order number:')
        ) {
          var divAfterB = b.nextElementSibling
          if (divAfterB && divAfterB != null && divAfterB != undefined)
            var ul = divAfterB.getElementsByTagName('ul')[0]
          if (ul && ul != null && ul != undefined)
            var lis = ul.getElementsByTagName('li')
          if (lis && lis != null && lis != undefined)
            for (let li of lis) {
              let btn = li.getElementsByTagName('button')[0]
              let a = btn.getElementsByTagName('a')[0]
              let href = a.href
              await fetch(href)
            }
          await deleteArticle(article)
        } else {
          console.log('no b box but still user notes')

          let firstChild = message[0].getElementsByTagName('div')[0]

          if (firstChild)
            var messageBox = firstChild.getElementsByTagName('div')[1]
          if (
            messageBox &&
            messageBox.innerText.includes('Auto-closed by script see')
          )
            //
            await deleteArticle(article)
        }
      }
    }
  } else return
}
// Modular version of clickMergeLinkh click merge btn and delete notes
bot.clickMergeLinkh = async (conversationLink) => {
  wentThrough++
  console.log('New Click Merge link')
  await bot.gotoConversation(conversationLink)
  await bot.page.evaluate(onPageActions)

  console.log('done with ' + conversationLink + ' time : ' + wentThrough)
  //if not even mean the function did not go twice
  if (wentThrough % 2 != 0) await bot.clickMergeLinkh(conversationLink)
}

//deprecated function
let deleNote = async (article) => {
  const threadOptions = await article.$('.threadOptions')
  if (threadOptions) {
    await threadOptions.click()
    await bot.page.waitForSelector('ul.dropdown-menu > li > a.delete')
    let delBtn = await article.$('ul.dropdown-menu >li > a.delete')
    if (delBtn) {
      console.log('We have an a del btn')
      await delBtn.click()
      await bot.page.waitForSelector('#button-0')
      let notyContainer = await bot.page.$('#notyContainer')
      let confirmDel = await notyContainer.$('#button-0')
      if (confirmDel) {
        console.log('we have a confirm del')
        await confirmDel.click()
        await bot.page.waitFor(500)
      }
    }
  }
}
//Click merge btns and close notes like a mouse on the page
bot.conversationFix = async (link) => {
  await bot.gotoConversation(link)

  let articles = await bot.page.$$('#tkContent > article.user.note ')

  for (let article of articles) {
    let section_msg_body = await article.$('section.messageBody')
    if (section_msg_body) {
      let boldTag = await section_msg_body.$('b')
      if (boldTag) {
        let boldTagText = await boldTag.getProperty('innerHTML')
        boldTagText = await boldTagText.jsonValue()

        if (
          boldTagText &&
          boldTagText.includes('Cases with the same order number')
        ) {
          const divAfterB = await bot.page.evaluateHandle(
            (el) => el.nextElementSibling,
            boldTag
          )
          if (divAfterB) {
            let ul = await divAfterB.$('ul')
            if (ul) {
              const lis = await ul.$$('li')
              if (lis) {
                for (let li of lis) {
                  let buttons = await li.$$('button')

                  if (buttons && buttons.length == 2) {
                    let firstButton = buttons[0]
                    let href = await firstButton.$eval('a', (a) => a.href)
                    if (href) {
                      await bot.page.evaluate(async (href) => {
                        console.log({ href })
                        await fetch(href)
                        return 'hahaha'
                      }, href)
                    } else {
                      console.log('no href found in the anchor tag')
                    }
                  }
                }

                //done now delete the note
                deleNote(article)
              } else {
                console.log('no lis found')
              }
            }
          } else console.log(' Did not work')
        } else console.log('No text')
      } else {
        console.log('no btag i h1')
        let msgFirstChildChildren = await section_msg_body.$$('div > div')
        let msgSecondGrandChild = msgFirstChildChildren[1]
        if (msgSecondGrandChild) {
          msgSecondGrandChild = await msgSecondGrandChild.getProperty(
            'innerText'
          )
          msgSecondGrandChild = await msgSecondGrandChild.jsonValue()
          if (msgSecondGrandChild.includes('Auto-closed by script see')) {
            deleNote(article)
          }
        }
      }

      // if (bTagtext.includes('Cases with the same order number')) {
    }
  }
}
//Test function rewrite for anything
async function test(link) {
  // await bot.clickMergeLinkh(
  //   'https://secure.helpscout.net/conversation/1369454819'
  // )
  await bot.clickMergeLink(link)
  console.log('Finished Stopping the browser ')
  await bot.browser.close()
}
// Receive an array of conversation go through them and fix as much as it can
bot.fixAll = async (linksList) => {
  for (let link of linksList) {
    await bot.clickMergeLinkh(link)
  }
  bot.signedIn = false
  bot.browser.close()
}

let arrayConversations = [
  'https://secure.helpscout.net/conversation/1372587169',
  'https://secure.helpscout.net/conversation/1366342012',
]

//bot.fixAll(arrayConversations)

//bot.conversationFix('https://secure.helpscout.net/conversation/1371396656')
module.exports = bot.fixAll
