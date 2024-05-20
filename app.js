const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

let db = null
const dbPath = path.join(__dirname, 'todoApplication.db')

const initDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

initDBAndServer()

// API - 1
app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query

  if (priority === '' && search_q === '') {
    const getQuery = `select * from todo where status like '${status}';`

    const res = await db.all(getQuery)
    response.send(res)
  } else if (status === '' && search_q === '') {
    const getQuery = `select * from todo where priority like '${priority}';`

    const res = await db.all(getQuery)
    response.send(res)
  } else if (search_q === '') {
    const getQuery = `select * from todo where priority like '${priority}' and status like '${status}';`

    const res = await db.all(getQuery)
    response.send(res)
  } else {
    const getQuery = `select * from todo where todo like '%${search_q}%';`

    const res = await db.all(getQuery)
    response.send(res)
  }
})

// API - 2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `select * from todo where id = ${todoId};`

  const res = await db.get(getQuery)
  response.send(res)
})

// API - 3
app.post('/todos/', async (request, response) => {
  const todoDetails = request.body
  const {id, todo, priority, status} = todoDetails
  const putQuery = `insert into todo values
  (${id}, '${todo}', '${priority}', '${status}');`

  await db.run(putQuery)
  response.send('Todo Successfully Added')
})

// API - 4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const todoDetails = request.body
  const {status = '', priority = '', todo = ''} = todoDetails

  if (priority === '' && todo === '') {
    const getQuery = `update todo set status='${status}' where id=${todoId};`

    await db.run(getQuery)
    response.send('Status Updated')
  } else if (status === '' && todo === '') {
    const getQuery = `update todo set priority='${priority}' where id=${todoId};`

    await db.run(getQuery)
    response.send('Priority Updated')
  } else if (status === '' && priority === '') {
    const getQuery = `update todo set todo='${todo}' where id=${todoId};`

    await db.run(getQuery)
    response.send('Todo Updated')
  }
})

// API - 5
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getQuery = `delete from todo where id=${todoId};`

  await db.run(getQuery)
  response.send('Todo Deleted')
})

module.exports = app
