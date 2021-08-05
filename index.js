const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors())
app.use(morgan('tiny'))

morgan.token('postRequestBody', (request, response) => {
  return JSON.stringify(request.body)
})

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', morgan(':postRequestBody'), (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Name or number missing',
    })
  }

  if (
    persons.some(
      person => person.name.toLowerCase() === body.name.toLowerCase()
    )
  ) {
    return response.status(400).json({
      error: 'Name already exists in the phonebook',
    })
  }

  const newPerson = {
    id: Math.floor(Math.random() * 1000000 + 1),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get('/info', (request, response) => {
  const responseBody = `<p>Phonebook has info for ${
    persons.length
  } people <br/>${new Date()}</p>`
  response.send(responseBody)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
