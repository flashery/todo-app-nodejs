const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const { v4: uuidv4 } = require("uuid");
const cors = require('cors')
const app = express();
// Sample mock JSON data
const tasks: Task[] = require("./TASK.json");

// Task type definition
interface Task {
  id: string;
  task: string;
  completed: boolean;
}

const schema = buildSchema(`
  type Task {
    id: ID!
    task: String!
    completed: Boolean!
  }

  type Query {
    tasks: [Task!]!
  }

  type Mutation {
    addTask(task: String!): Task!
    toggleTask(id: ID!, completed: Boolean!): Task!
    deleteTask(id: ID!): Task!
  }
`);


// Task resolvers
const root = {
  tasks: (): Task[] => tasks,
  addTask: ({ task }: { task: string }): Task => {
    const newTask: Task = { id: uuidv4(), task, completed: false };
    tasks.push(newTask);
    return newTask;
  },
  toggleTask: ({ id, completed }: { id: string; completed: boolean }): Task => {
    const task = tasks.find((t) => t.id === id);
    if (!task) throw new Error("Task not found");
    task.completed = completed;
    return task;
  },
  deleteTask: ({ id }: { id: string }): Task => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Task not found");
    const deletedTask = tasks.splice(index, 1)[0];
    return deletedTask;
  },
};

app.use(cors())

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(4000, () => {
  console.log("Server running at http://localhost:4000/graphql");
});