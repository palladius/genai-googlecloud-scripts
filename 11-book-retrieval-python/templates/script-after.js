//////////////////////////////////////////////////////////
// Script after v1.1  - this is appended to dynamic script.
//
// NBote to self: maybe you can import in HTML TWO scripts and it will work.
// import var_books.js
// import createBookCard.js
//////////////////////////////////////////////////////////

// Get the container for the cards
const bookCardsContainer = document.getElementById('book-cards');

// Function to create a single card
function createBookCard(book) {
    cover_image_part = book.cover_image_small == 'N/A' ?
        '' :
        `<img src="${book.cover_image_small}" class="card-img-top book-cover" alt="${book.title} Cover">`
    book_description = book.description  == 'N/A' ?
        '' :
        `<p class="card-text text-muted description">${book.description.substring(0, 240)}...</p>`

    return `<div class="col-md-4">
        <div class="card book-card">
            ${cover_image_part}
            <div class="card-body">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text"><i>(👩‍💻 ${book.author}, 🗓️ ${book.publication_date})</i></p>
                <p class="card-text">ISBN: <a href="https://www.google.com/search?q=${book.ISBN}" target="_blank">${book.ISBN}</a></p>
                ${book_description}
            </div>
        </div>
    </div>`;
}

// Populate the cards
books.forEach(book => {
    bookCardsContainer.innerHTML += createBookCard(book);
});
