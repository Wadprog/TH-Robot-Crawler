/**
 *
 */
let wentThrough = 0
//Dependencies
const puppeteer = require('puppeteer')
//Custom Dependencies
let constants = require('./constants')
let config = require('./config')
const bot = {
  browser: null, //
  page: null,
}

bot.init = async () => {
  bot.browser = await puppeteer.launch(config.browserConfig)
  bot.page = await bot.browser.newPage()
}

bot.launch = async (customPage) => {
  await bot.init()
  await bot.page.goto(customPage)
}

bot.loginHS = async (user, password) => {
  await bot.launch('https://secure.helpscout.net/members/login/?action=logout')
  await bot.page.type('#email', user)
  await bot.page.type('#password', password)
  await bot.page.click('#logInButton')
  await bot.page.waitFor(2000)
}
bot.gotoConversation = async (conversationLink) => {
  const { USER, PASSWD } = constants
  await bot.loginHS(USER, PASSWD)
  await bot.page.goto(conversationLink)
}

bot.clickMergeLink = async (link) => {
  wentThrough++
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
    const deleteArticleh = (article) => {
      let delBtn = article.getElementsByClassName('delete')[0]
      if (delBtn && delBtn != null && delBtn != undefined) {
        delBtn.click()

        var observer = new WebKitMutationObserver(function (
          mutations,
          observer
        ) {
          mutations.forEach(function (mutation) {
            let confirmBtn = document.querySelector('#button-0')

            if (confirmBtn && confirmBtn != null && confirmBtn != undefined) {
              confirmBtn.click()
              observer.disconnect()
              observer = null
            }
          })
        })
        if (observer && observer != null)
          observer.observe(document.body, {
            childList: true,
          })
      }
    }

    const deleteArticlef = (article) => {
      console.log('In here')
      let delBtn = article.getElementsByClassName('delete')[0]
      if (delBtn && delBtn != null && delBtn != undefined) {
        delBtn.click()

        let confirmBtn = document.querySelector('#button-0')
        while (confirmBtn == null || confirmBtn == undefined) {
          confirmBtn = document.querySelector('#button-0')
          console.log({ confirmBtn: confirmBtn })
        }

        if (confirmBtn && confirmBtn != null && confirmBtn != undefined)
          confirmBtn.click()
      }
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
        // let notyContainer = document.getElementById('notyContainer')
        // document.getElementById('button-0').click()
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
  //if not even mean the function did not go twice
  if (wentThrough % 2 != 0) bot.clickMergeLink(link)
  else console.log('done with ' + link + ' time : ' + wentThrough)
}

function clickDelBtn(mutations, observer) {}
//--Conversation I have tested--//
//bot.clickMergeLink('https://secure.helpscout.net/conversation/1365882371')
// bot.clickMergeLink('https://secure.helpscout.net/conversation/1369658758')
//bot.clickMergeLink('https://secure.helpscout.net/conversation/1369682170')



//testing with arrays
//fixConversations(['https://secure.helpscout.net/conversation/1368039720'])
//fixConversations(['https://secure.helpscout.net/conversation/1369680562'])
//fixConversations(['https://secure.helpscout.net/conversation/1369680562'])


const fixConversations = async (conversationLinks) => {
  for (let conversationLink of conversationLinks) {
    bot.clickMergeLink(conversationLink)
    //await bot.page.reload()
    // bot.clickMergeLink(conversationLink)
  }
}