// Your book data (replace with your actual data or fetch from an API)
const books = [
    {
        "title": "The Hitchhiker's Guide to the Galaxy",
        "author": "Douglas Adams",
        "cover_image": "hitchhiker.jpg", // Use a local image
        "ISBN": "dunno",
        "description": "",
    },
    // Add more book objects here...
    {
        "title": "The Importance of Being Earnest by Oscar Wilde",
        "ISBN": "0435233033",
        "author": "Oscar Wilde",
        "cover_image": "https://books.google.com/books/content?id=qbWQpH9j41IC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api", // Use a local image
        "description": "",
    },
    {
        "title": "Odi et Amo" ,
        "author": "Catullo",
        "ISBN": "9788858859674",
        // Publication Date: 2023-11-07T00:00:00+01:00
        "cover_image": "http://books.google.com/books/content?id=v4rgEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
         "description": "Odi et amo: il codice del cuore ci insegna che l’amore è civiltà. Catullo è il poeta latino che più di ogni altro è simile a noi: conosce l’amore, in tutte le sue accezioni, e ne racconta i dubbi, la passione e i tormenti che oggi come allora sfidano l’essere umano. Una selezione delle sue più belle poesie, tradotte e curate da un latinista d’eccellenza, qui proposta in un’edizione per far appassionare i giovani lettori ai versi che ancora oggi risvegliano le nostre emozioni. Con testo in latino.",
    },
];

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
