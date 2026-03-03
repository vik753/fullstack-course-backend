import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Person from "./models/person.js";
import { setError } from "./helpers/errorHandler.js";
const app = express();

const url = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose
  .connect(url, { family: 4 })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        return setError({ res, error: "Person not found", code: 404 });
      }
    })
    .catch((error) => {
      console.log(error);
      return setError({
        res,
        error: "The provided ID for FETCHING a person is invalid.",
        code: 400,
      });
    });
});

app.get("/info", (req, res) => {
  Person.countDocuments({}).then((count) => {
    res.send(`
        <div style="margin: 24px">
          <h3>Phonebook has info for ${count} people</h3>
          <p>${new Date()}</p>
        </div>
    `);
  });
});

app.delete("/api/persons/:id", (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) {
        res.status(204).end();
      } else {
        return setError({ res, error: "Person not found", code: 404 });
      }
    })
    .catch((error) => {
      console.log(error);
      return setError({
        res,
        error: "The provided ID for DELETING a person is invalid.",
        code: 400,
      });
    });
});

app.put("/api/persons/:id", (req, res) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, {
    returnDocument: "after",
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson);
      } else {
        return setError({ res, error: "Person not found", code: 404 });
      }
    })
    .catch((error) => {
      console.log(error);
      return setError({
        res,
        error: "The provided ID for UPDATING a person is invalid.",
        code: 400,
      });
    });
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || body.name.trim().length < 2 || !body.number) {
    let errorMessage = "";
    if (!body.name || body.name.trim().length < 2) {
      errorMessage += "Name is required and must be at least 2 characters. ";
    }
    if (!body.number) {
      errorMessage += "Number is required.";
    }
    return setError({ res, error: errorMessage, code: 400 });
  }

  Person.findOneAndDelete({ name: body.name })
    .then(() => {
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      return person.save();
    })
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => {
      console.log(error);
      return setError({ res, error: "Failed to save person", code: 500 });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
