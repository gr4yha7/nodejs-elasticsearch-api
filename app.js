'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

function checkAndDeleteIndices() {
  client.indices.exists({index: 'products'}, (err, res, status) => {
      if (res) {
          console.log('index already exists');
          client.indices.delete( {index: 'products'}, (err, res, status) => {
            console.log(err, res, status);
          })
      } else {
          console.log('index does not exist');
      }
    }
  )
}

async function createIndex() {
  client.indices.exists({index: 'products'}, (err, res, status) => {
    console.log(res)
    if (res.statusCode === 200) {
        console.log('index already exists');
    } else {
      client.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: { 
              name: { type: 'text' },
              price: { type: 'integer' },
              quantity: { type: 'integer' },
              categoryId: { type: 'keyword' }
            }
          }
        }
      }, (err, resp, status) => {
        if (err) {
          console.error(err, status);
        }
        else {
            console.log('Successfully Created Index', status, resp);
        }
      })
    }
  })
}

// createIndex()

// checkAndDeleteIndices()

async function putMapping () {
  console.log("Creating Mapping index");
  client.indices.putMapping({
    index: 'products',
    type: 'document',
    body: {
      properties: { 
        name: { type: 'text' },
        price: { type: 'integer' },
        quantity: { type: 'integer' },
        categoryId: { type: 'keyword' }
      }
    }
  }, (err, resp, status) => {
      if (err) {
        console.error(err, status);
      }
      else {
          console.log('Successfully Created Index', status, resp);
      }
  });
}

async function getMapping() {
  client.indices.getMapping({index: "products"}, (err, resp, status) => {
      if (err) {
        console.error(err, status);
      }
      else {
          console.log('Successfully got mapping', status, resp.body.products.mappings);
      }
  })
}
// putMapping()
// getMapping()

async function run () {
  // Let's start by indexing some data
  // await client.index({
  //   index: 'products',
  //   body: {
  //     name: 'Ned Stark Sweatshirt',
  //     price: 12000,
  //     quantity: 20,
  //     categoryId: '1'
  //   }
  // })

  // await client.index({
  //   index: 'products',
  //   body: {
  //     name: 'Toy Story Shirt for babies',
  //     price: 7000,
  //     quantity: 5,
  //     categoryId: '1'
  //   }
  // })

  // await client.index({
  //   index: 'products',
  //   body: {
  //     name: 'Yeezy Sneakers',
  //     price: 40000,
  //     quantity: 10,
  //     categoryId: ''
  //   }
  // })

  // await client.index({
  //   index: 'products',
  //   body: {
  //     name: 'Polarised Glasses',
  //     price: 5000,
  //     quantity: 15,
  //   }
  // })

  // We need to force an index refresh at this point, otherwise we will not
  // get any result in the consequent search
  // await client.indices.refresh({ index: 'products' })

  // Let's search!
  const { body } = await client.search({
    index: 'products',
    body: {
      query: {
        constant_score: {
          filter: {
            bool: {
              should: [
                {
                  bool: {
                    should: [
                      { match: { "categoryId.keyword": '' } },
                      { match: { "categoryId.keyword": '1'} },
                    ],
                  },
                },
                {
                  bool: {
                    must_not: {
                      exists: {
                        field: 'categoryId'
                      }
                    }
                  }
                }
              ],
              must: {
                match: { price: 12000 }
              }
            }
          }
        }
      }
    }
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
// checkAndDeleteIndices()
// putMapping()
