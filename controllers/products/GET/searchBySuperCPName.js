const request = require('request')
const fs = require('fs')
var cheerio = require('cheerio')

const getByCPAndName = param => {
  return new Promise((resolve, reject) => {
    console.debug(param.super, param.zipCode, param.productName)
    if (
      param &&
      param.super &&
      param.super !== '' &&
      param.zipCode &&
      param.zipCode !== '' &&
      param.productName &&
      param.productName !== ''
    ) {
      var urlBase = 'https://www.carritus.com/tienda/super'
      var route = `${urlBase}/${param.super}/cp/${param.zipCode}/buscar/${
        param.productName
      }`
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
        $('.products-list').filter(function() {
          var data = $(this)
          var childrensData = data.children()
          childrensData.map(child => {
            var row = childrensData[child]

            if (row['name'] === 'li') {
              var product = {
                id: '',
                price: '',
                brand: '',
                name: ''
              }

              if (row['attribs']['class']['data-pc_id']) {
                product.id = row['attribs']['class']['data-pc_id']
              }
              var properties = row['children']
              properties.map(prop => {
                var attribsArr = prop['attribs']
                if (attribsArr !== undefined) {
                  // PRICE
                  if (attribsArr['class'] === 'price') {
                    var attrs = prop['children']
                    attrs.map(attr => {
                      if (attr['name'] === 'p') {
                        var childAttr = attr['children']
                        childAttr.map(chAttr => {
                          if (chAttr['name'] === 'strong') {
                            var childFinAttr = chAttr['children'][0]
                            var price = childFinAttr.data.split(' ')[0]
                            price = price.replace(',', '.')
                            product.price = price
                          }
                        })
                      }
                    })
                  }

                  if (attribsArr['class'] === 'marca') {
                    var attrs = prop['children']
                    product.brand = attrs[0].data
                  }

                  if (attribsArr['class'] === 'image') {
                    var attrs = prop['children']
                    product.name = attrs[0]['attribs']['alt']
                  }
                }
              })
              arrMedia.results.push(product)
            }
          })
        })

        resolve(arrMedia)
      })
    } else {
      reject()
    }
  })
}

module.exports = (req, res) => {
  if (req.params) {
    getByCPAndName(req.params)
      .then(media => {
        res.status(200).send(media)
      })
      .catch(err => {
        res.status(404).send('Product not found')
      })
  } else {
    res.status(400).send('No params')
  }
}
