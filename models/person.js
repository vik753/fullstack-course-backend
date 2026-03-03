import mongoose from "mongoose";

const phoneBookSchema = new mongoose.Schema({
  name: String,
  number: String,
});

phoneBookSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model("Person", phoneBookSchema);

export default Person;
