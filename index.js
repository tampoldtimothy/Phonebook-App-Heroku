// require('dotenv').config();
const express = require('express');

const app = express();
const cors = require('cors');
const morgan = require('morgan');
const Person = require('./models/person');

app.use(express.static('build'));
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

morgan.token('postRequestBody', (request, response) =>
  JSON.stringify(request.body)
);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted ID' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).send({ error: 'No person found with given ID' });
      }
    })
    .catch((error) => next(error));
});

app.post(
  '/api/persons',
  morgan(':postRequestBody'),
  (request, response, next) => {
    const { body } = request;

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person
      .save()
      .then((savedPerson) => savedPerson.toJSON())
      .then((savedAndFormattedPerson) => {
        response.json(savedAndFormattedPerson);
      })
      .catch((error) => next(error));
  }
);

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;

  Person.findByIdAndUpdate(request.params.id, body)
    .then(() => {
      response.json(body);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((personCount) => {
      response.send(
        `<p>Phonebook has info for ${personCount} people <br/>${new Date()}</p>`
      );
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' });
};

app.use(unknownEndpoint);
app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
