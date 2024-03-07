//////////////////////////////////////////////////////////
// Script after v1.0  - this is appended to dynamic script.
//////////////////////////////////////////////////////////

// Get the container for the cards
const bookCardsContainer = document.getElementById('book-cards');

// Function to create a single card
function createBookCard(book) {
    return `
    <div class="col-md-4">
        <div class="card book-card">
            <img src="${book.cover_image}" class="card-img-top book-cover" alt="${book.title} Cover">
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text">By: ${book.author}</p>
                <p class="card-text">ISBN: <a href="https://www.google.com/search?q=${book.ISBN}" target="_blank">${book.ISBN}</a></p>
                <p class="card-text text-muted description">${book.description.substring(0, 240)}...</p>
            </div>
        </div>
    </div>`;
}

// Populate the cards
books.forEach(book => {
    bookCardsContainer.innerHTML += createBookCard(book);
});
