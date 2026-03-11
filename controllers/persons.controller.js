import {Router} from "express";
import Person from "../models/person.js";

export const personRouter = Router();

export const getInfo = (req, res) => {
	Person.countDocuments({}).then((count) => {
		res.send(`
        <div style="margin: 24px">
          <h3>Phonebook has info for ${count} people</h3>
          <p>${new Date()}</p>
        </div>
    `);
	});
};

personRouter.get("/", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

personRouter.get("/:id", (req, res, next) => {
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

personRouter.delete("/:id", (req, res, next) => {
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

personRouter.put("/:id", (req, res, next) => {
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

personRouter.post("/", (req, res, next) => {
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
