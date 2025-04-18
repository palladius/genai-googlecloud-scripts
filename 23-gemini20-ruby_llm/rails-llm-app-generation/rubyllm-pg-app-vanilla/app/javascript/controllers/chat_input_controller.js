import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="chat-input"
export default class extends Controller {
  static targets = [ "input", "submitButton" ] // Optional targets if needed

  connect() {
    // console.log("Chat input controller connected");
  }

  submitOnEnter(event) {
    // Check if Enter key was pressed WITHOUT the Shift key
    if (event.key === "Enter" && !event.shiftKey) {
      // Prevent default behavior (newline in textarea)
      event.preventDefault();

      // Optionally check if input is empty before submitting
      // if (this.inputTarget.value.trim() === "") {
      //   return;
      // }

      // Find the form this controller is attached to and submit it
      // this.element refers to the form element (<form data-controller="chat-input">)
      this.element.requestSubmit();

      // Optional: Clear the input after submission (might happen automatically with Turbo Stream response)
      // this.inputTarget.value = "";
    }
  }
}
