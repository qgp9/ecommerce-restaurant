const querystring = require("querystring")
const _ = require('lodash')
const fetch = require('node-fetch')

if (!process.env.NETLIFY) {
  require('dotenv').config()
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" }
  }
  // parse data
  const params = querystring.parse(event.body);
  const fields = ['name', 'phone', 'email', 'party', 'date', 'time']
  const data = _.pick(params, fields)
  const body = {
    method: 'booking',
    data
  }

  const response = await fetch(process.env.BOOKING_ENDPOINT, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
  })

  let error = undefined
  try {
    const res = await response.json()
    error = res.err
  } catch (err) {
    error = err
  }

  if (error) {
    console.log(error)
    return {
      statusCode: 500,
      err: res.err,
      body: '500 Internal Server Error'
    }
  }

  return {
    statusCode: 200,
    body: 'OK'
  }
};