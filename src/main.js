
const Second = 1000
const Minute = 60 * Second
const Hour = 60 * Minute
const Day = 24 * Hour

const format_date = (date) => {
  if (date instanceof Date) {
    const duration = Date.now() - date.valueOf()
    if (duration < Minute) {
      const value = Math.round(duration / Second)
      return `${value} seconds ago`
    } else if (duration < Hour) {
      const value = Math.round(duration / Minute)
      return `${value} minutes ago`
    } else if (duration < Day) {
      const value = Math.round(duration / Hour)
      return `${value} hours ago`
    } else {
      const value = Math.round(duration / Day)
      return `${value} days ago`
    }
  }

  return ''
}

const KEY = 'urls'

const a2url = (a) => [a.hostname, a.pathname].join('/')

const get = async (url) => {
  const result = await chrome.storage.local.get(KEY)
  const urls = result[KEY] || []
  return urls.findLast(d => d.url === url)
}

const set = async (url) => {
  const result = await chrome.storage.local.get(KEY)
  let urls = result[KEY] || []
  urls = urls.slice(-1000)
  const index = urls.findLastIndex(d => d.url === url)
  if (index === -1) {
    urls.push({
      url,
      date: Date.now(),
    })
  } else {
    url[index].date = Date.now()
  }
  return chrome.storage.local.set({[KEY]: urls})
}

document.addEventListener('mouseover', async function(e){
    if(e.target.tagName=='A' && e.target.href.startsWith('http')){
      const url = a2url(e.target)
      const found = await get(url)
      if (found && found.date) {
        const value = found.date
        if (value) {
          const date = new Date(value)
          const ago = format_date(date)
          e.target.title = `last visit at: ${date.toLocaleString()}\n${ago}`
        }
      }
    }
},true)

document.addEventListener('click',async function(e){
    if(e.target.tagName=='A' && e.target.href.startsWith('http')){
      const url = a2url(e.target)
      await set(url)
    }
},true)
