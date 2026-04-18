# Flashcard Backend

Simple Node.js + Express backend for a flashcard application.

## Features

- CRUD API for decks
- CRUD API for cards within each deck
- JSON file persistence
- CORS enabled for frontend integration

## Setup

1. Open a terminal in this folder.
2. Install dependencies:

```bash
npm install
```

3. Run the server:

```bash
npm start
```

4. Open the frontend in your browser at:

```bash
http://localhost:5000
```

5. For development with live reload:

```bash
npm run dev
```

## API Endpoints

- `GET /api/decks`
- `GET /api/decks/:deckId`
- `POST /api/decks`
- `PUT /api/decks/:deckId`
- `DELETE /api/decks/:deckId`
- `GET /api/decks/:deckId/cards`
- `GET /api/decks/:deckId/cards/:cardId`
- `POST /api/decks/:deckId/cards`
- `PUT /api/decks/:deckId/cards/:cardId`
- `DELETE /api/decks/:deckId/cards/:cardId`

## Notes

- The backend stores data in `data/flashcards.json`.
- Use a JSON body with `question` and `answer` when creating or updating cards.
- Use a JSON body with `name` and optional `description` when creating or updating decks.
