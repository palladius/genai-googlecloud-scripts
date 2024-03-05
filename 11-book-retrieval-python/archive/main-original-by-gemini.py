import requests
import json

# Sample JSON of books
books = [
    {"title": "The Hitchhiker's Guide to the Galaxy", "author": "Douglas Adams"},
    {"title": "Pride and Prejudice", "author": "Jane Austen"}
]

# Replace with your actual Google Books API key
API_KEY = "YOUR_API_KEY"

def get_book_details(title, author):
    url = f"https://www.googleapis.com/books/v1/volumes?q={title}+inauthor:{author}&key={API_KEY}"
    response = requests.get(url)

    if response.status_code == 200:
        data = json.loads(response.text)
        if data['totalItems'] > 0:
            book_info = data['items'][0]['volumeInfo']
            return {
                "ISBN": book_info.get('industryIdentifiers', [{"type": "ISBN_10", "identifier": "N/A"}])[0]['identifier'],
                "publication_date": book_info.get('publishedDate', "N/A"),
                "cover_image": book_info.get('imageLinks', {}).get('thumbnail', "N/A")
            }
        else:
            return None
    else:
        return None

# Process the books in the list
for book in books:
    details = get_book_details(book['title'], book['author'])
    if details:
        print(f"Book: {book['title']} by {book['author']}")
        print(f"  ISBN: {details['ISBN']}")
        print(f"  Publication Date: {details['publication_date']}")
        print(f"  Cover Image: {details['cover_image']}")
    else:
        print(f"Book details not found for: {book['title']} by {book['author']}")
