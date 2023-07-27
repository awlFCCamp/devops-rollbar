const express = require("express");
const app = express();
const path = require("path");

app.use(express.json());
// include and initialize the rollbar library with your access token
var Rollbar = require("rollbar");
var rollbar = new Rollbar({
  accessToken: "6fc3641c23f34a5f8f018ab47f39a82d",
  captureUncaught: true,
  captureUnhandledRejections: true,
});

// record a generic message and send it to Rollbar
rollbar.log("Hello world! Rollbar connect to aws app!");

const students = ["Jimmy", "Timothy", "Jimothy"];

app.get("/", (req, res) => {
  rollbar.info("User has entered main page!!!");
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/api/students", (req, res) => {
  rollbar.warning("list of students was requested!!!");
  res.status(200).send(students);
});

app.post("/api/students", (req, res) => {
  let { name } = req.body;

  const index = students.findIndex((student) => {
    return student === name;
  });

  try {
    if (index === -1 && name !== "") {
      students.push(name);
      rollbar.info(`new student ${name} has been added!!!`);
      res.status(200).send(students);
    } else if (name === "") {
      // rollbar.error("Empty string was entered for new student!!!");
      // Custom Error: Empty name is not allowed
      throw new Error("This is custom error. Empty name is not allowed");
      //res.status(400).send("You must enter a name.");
    } else {
      //rollbar.error("Duplicate student name was entered!!!");
      //res.status(400).send("That student already exists.");
      // Custom Error: Duplicate student name is not allowed
      throw new Error(
        "This is custom error. Duplicate student name is not allowed"
      );
    }
  } catch (err) {
    //rollbar.critical("Failed to add student!!!");
    //console.log(err);
    rollbar.error(err); // Log the custom error with Rollbar
    res.status(400).send(err.message); // Send the error message to the client
  }
});

app.delete("/api/students/:index", (req, res) => {
  const targetIndex = +req.params.index;
  const name = students[targetIndex];
  students.splice(targetIndex, 1);
  rollbar.info(`${name} has been deleted!!!`);
  res.status(200).send(students);
});

const port = process.env.PORT || 5050;

app.listen(port, () => console.log(`Server listening on ${port}`));
