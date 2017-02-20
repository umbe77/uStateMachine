const WorkflowInstance = require("./models/WorkflowInstance")

let inst = WorkflowInstance.createInstance({
    name: "Pippo",
    version: "1.0.0"
}, {
    firstName: "Roberto"
})
