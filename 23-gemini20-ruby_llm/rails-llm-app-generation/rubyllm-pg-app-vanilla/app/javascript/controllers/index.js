// Import and register all your controllers from the importmap via controllers/**/*_controller
import { application } from "controllers/application"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
eagerLoadControllersFrom("controllers", application)


// app/javascript/controllers/index.js
//import { application } from "./application"

// Eager load all controllers defined in the import map under controllers/**/*_controller
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"
eagerLoadControllersFrom("controllers", application)

// Make sure chat_input_controller.js is found by the above line,
// or explicitly import it if using a different setup:
// import ChatInputController from "./chat_input_controller.js"
// application.register("chat-input", ChatInputController)
