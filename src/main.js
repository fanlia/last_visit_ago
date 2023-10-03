
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
  try {
    const result = await chrome.storage.local.get(KEY)
    const urls = result[KEY] || []
    return urls.findLast(d => d.url === url)
  } catch (e) {}
}

const set = async (url) => {
  try {
    const result = await chrome.storage.local.get(KEY)
    let urls = result[KEY] || []
    urls = urls.slice(-1000).filter(d => d.url !== url)
    urls.push({
      url,
      date: Date.now(),
    })
    return chrome.storage.local.set({[KEY]: urls})
  } catch (e) {}
}

document.addEventListener('mouseover', async function(e){
  const el = e.target
  if(el.tagName=='A' && el.href.startsWith('http')){
    const url = a2url(el)
    const found = await get(url)
    if (found && found.date) {
      const value = found.date
      if (value) {
        const date = new Date(value)
        const ago = format_date(date)
        el.title = `last visit at: ${date.toLocaleString()}\n${ago}`
      }
    }
  }
},true)

document.addEventListener('click',async function(e){
  const el = e.target
  if(el.tagName=='A' && el.href.startsWith('http')){
    const url = a2url(el)
    await set(url)
  }
},true)
