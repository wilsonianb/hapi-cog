'use strict';

const Hapi=require('hapi');
const { HapiCog } = require('@sharafian/cog')
const BigNumber = require('bignumber.js')
const Boom = require('boom')

// Create a server with a host and port
const server=Hapi.server({
  host:'localhost',
  port:8000
});

// Add the route
server.route({
  method:'GET',
  path:'/hello',
  handler:async function(request,h) {
    const stream = request.ilpStream()
    try {
      await stream.receiveTotal(new BigNumber.default(2))
      return { msg: 'hello world'};
    } catch (e) {
      console.error('error receiving payment. error=' + e.message)
    }
  }
})

server.route({
  method:'POST',
  path:'/pods',
  handler: async function(request, h) {
    if (!request.headers['pay-token']) {
      const error = Boom.paymentRequired()
      error.output.headers['Interledger-Stream-Price'] = 10
      error.output.headers['Interledger-Stream-Asset-Code'] = 'XRP'
      error.output.headers['Interledger-Stream-Asset-Scale'] = 9
      throw error
    }
    try {
      const stream = request.ilpStream()
    } catch (e) {
      const payHeader = e.output.headers['Pay'].split(' ')
      e.output.headers['Interledger-Stream-Destination-Account'] = payHeader[1]
      e.output.headers['Interledger-Stream-Shared-Secret'] = payHeader[2]
      e.output.headers['Interledger-Stream-Price'] = 10
      e.output.headers['Interledger-Stream-Asset-Code'] = 'XRP'
      e.output.headers['Interledger-Stream-Asset-Scale'] = 9
      throw e
    }
  }
});

// Start the server
async function start() {

  try {
    console.log('register')
    await server.register(HapiCog)
    console.log('start')
    await server.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();
