import { v4 as uuidv4 } from "uuid";
import express from "express";
import cors from "cors";
import { setError } from "./helpers/errorHandler.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

const persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const person = persons.find((p) => p.id === req.params.id);

  if (!person) {
    return setError({ res, error: "Person not found", code: 404 });
  }

  res.json(person);
});

app.get("/info", (req, res) => {
  res.send(`
        <div style="margin: 24px">
          <h3>Phonebook has info for ${persons.length} people</h3>
          <p>${new Date()}</p>
        </div>
    `);
});

app.delete("/api/persons/:id", (req, res) => {
  const personIndex = persons.findIndex((p) => p.id === req.params.id);
  if (personIndex === -1) {
    return setError({ res, error: "Person not found", code: 404 });
  }
  persons.splice(personIndex, 1);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;
  const isNameValid = body?.name.trim().length >= 2;
  if (isNameValid) {
    const isNameUnique = !persons.find((p) => p.name === body.name);
    if (!isNameUnique) {
      return setError({ res, error: "Name must be unique", code: 400 });
    }
  }

  let errorMessage = "";
  if (!isNameValid || !body.number) {
    if (!body.name || body.name?.trim().length < 2) {
      errorMessage += "Name is required and must be at least 2 characters. ";
    }
    if (!body.number) {
      errorMessage += "Number is required.";
    }
    return setError({ res, error: errorMessage, code: 400 });
  }

  const person = {
    id: uuidv4(),
    name: body.name,
    number: body.number,
  };

  persons.push(person);
  res.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
