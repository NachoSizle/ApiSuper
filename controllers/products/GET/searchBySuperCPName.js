const request = require('request')
const fs = require('fs')
var cheerio = require('cheerio')

const getByCPAndName = param => {
  return new Promise((resolve, reject) => {
    if (
      param.super &&
      param.super !== '' &&
      param.zipCode &&
      param.zipCode !== '' &&
      param.productName &&
      param.productName !== ''
    ) {
      var urlBase = 'https://www.carritus.com/tienda/super/'
      var route =
        urlBase +
        '/' +
        param.super +
        +'/cp/' +
        param.zipCode +
        '/product/' +
        param.productName
      console.log('*******ROUTE*******', route)

      request(route, (error, response, body) => {
        if (error) {
          reject(error)
          return null
        }
        var arrMedia = {
          results: []
        }
        var $ = cheerio.load(body)
        $('.lister-list').filter(function() {
          var data = $(this)
          var childrensData = data.children()
          childrensData.map(child => {
            var row = childrensData[child]
            if (row['name'] === 'tr') {
              var properties = row['children']
              properties.map(prop => {
                if (prop['name'] === 'td') {
                  var attrs = prop['attribs']
                  if (attrs) {
                    if (attrs['class'] === 'titleColumn') {
                      prop['children'].map(ch => {
                        if (ch['name'] === 'a') {
                          var attrsCh = ch['attribs']
                          var titleRef = attrsCh['href']
                          var imdbID = titleRef.split('/')[2]
                          arrMedia.results.push(imdbID)
                        }
                      })
                    }
                  }
                }
              })
            }
          })
        })

        resolve(arrMedia)
      })
    }
  })
}

module.exports = (req, res) => {
  getByCPAndName().then(media => {
    res.status(200).send(media)
  })
}
