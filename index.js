import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Person from "./models/person.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("dist"));

const MONGO_URI = process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

mongoose
  .connect(MONGO_URI, { family: 4 })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      error.operation = "FETCHING";
      next(error);
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

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) {
        res.status(204).end();
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      error.operation = "DELETING";
      next(error);
    });
});

app.put("/api/persons/:id", (req, res, next) => {
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
        res.status(404).end();
      }
    })
    .catch((error) => {
      error.operation = "UPDATING";
      next(error);
    });
});

app.post("/api/persons", (req, res, next) => {
  const body = req.body;

  Person.findOne({ name: body.name })
    .then((existingPerson) => {
      if (existingPerson) {
        res.status(400).json({ error: "name must be unique" });
        return null;
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      });

      return person.save();
    })
    .then((savedPerson) => {
      if (savedPerson) {
        res.json(savedPerson);
      }
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({
      error: `The provided ID for ${error.operation || "this operation"} a person is invalid.`,
    });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
