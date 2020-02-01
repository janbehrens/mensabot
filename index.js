require('dotenv').config()
const DOMParser = require('xmldom').DOMParser
const parser = new DOMParser()
const axios = require('axios')

const webhookUrl = `https://mattermost.csl-intern.local.hcu-hamburg.de/hooks/${process.env.WEBHOOK_SECRET}`
const speiseplanURL = `https://speiseplan.studierendenwerk-hamburg.de/${process.env.LANG_ID}/${process.env.CAFETERIA_ID}/2020/0/`

const symbols = {
  '/uploads/icons/e9a8e409409cf3ff7a40855d08e89097d6168e29.png': 'cow',
  '/uploads/icons/82cc2fece681d1b080ceb0b63d2971f8e33c3d43.png': 'klima-teller',
  '/uploads/icons/37beeeef680a6791f97fe5a5da5f9ef5548a4ee9.png': 'carrot',
  '/uploads/icons/74187548f2da18c6dd641f5e8a50c23d7a66e974.png': 'wine_glass',
  '/uploads/icons/a77e0a40d4ef2cdce578538758710c9c59548207.png': 'laktosefrei',
  '/uploads/icons/0e5bab8a7d0af8f5bdbaa75dc217ed76a6186584.png': 'sunflower',
  '/uploads/icons/60ce31ed2359296a2b73ea01b9994dfd9a012beb.png': 'mensa-vital',
  '/uploads/icons/66175e4b4c7402f3badaabeffdf39316a74e1edb.png': 'fish',
  '/uploads/icons/636506d11657da1d9d85fc04e0230ab111954912.png': 'chicken',
  '/uploads/icons/605801019ea63cf45702f2a2beb9cb9fc64b6b07.png': 'pig',
  '/uploads/icons/73927cb7f802b5b09d72e703bc5dc4481bfd31b7.png': 'lieblingsessen',
  '/uploads/icons/0c0f748ff76ae29d2ca5b36d5fe803709efd4585.jpg': 'neues-gericht'
}

const postParams = {}

async function getSpeiseplan() {
  await axios.get(speiseplanURL).then((response) => {
    let html = response.data
    let dom = parser.parseFromString(html, 'text/html')
    let cells = dom.getElementsByTagName('td')
    let dishes = []

    // First cell in each row: name of dish, second to fourth cell: prices
    for (let i = 0; i < cells.length; i += 4) {
      let description = cells[i].textContent.trim().replace(/<span class=tooltip title=Milch\/-erzeugnisse \(einschl. Laktose\)>/g, '')
      let icons = cells[i].getElementsByTagName('img')
      let labels = []

      for (let j = 0; j < icons.length; j++) {
        if (icons[j].nodeName === 'img') {
          let image = icons[j]

          for (let k = 0; k < image.attributes.length; k++) {
            let attr = image.attributes[k]
            if (attr.name === 'src') {
              labels.push(`:${symbols[attr.value]}:`)
            }
          }
        }
      }
      let prices = [
        cells[i + 1].textContent.trim().replace(/&euro;/, '€'),
        cells[i + 2].textContent.trim().replace(/&euro;/, '€'),
        cells[i + 3].textContent.trim().replace(/&euro;/, '€')
      ]
      let dish = {
        description: description,
        labels: labels,
        price: prices.join(' | ')
      }
      dishes.push(dish)
    }

    postParams.text = '#### Heute in der Mensa:\n\n' +
      dishes.map(dish => `##### ${dish.description} ${dish.labels.join(' ')}\n${dish.price}\n`).join('\n')
  })

  axios.post(webhookUrl, postParams).catch((error) => {
    console.log(error)
  })
}

getSpeiseplan()
