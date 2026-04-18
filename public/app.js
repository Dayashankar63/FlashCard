const state = {
  decks: [],
  selectedDeckId: null,
  editingDeck: false,
  editingCard: false,
  editedCardId: null,
  studyMode: false,
  useDueCards: false,
  studyIndex: 0,
  showAnswer: false,
  searchQuery: '',
  difficultyFilter: '',
  tagFilter: '',
  revealedCards: new Set(),
  currentUserId: localStorage.getItem('flashcardUserId') || 'guest',
  currentUserEmail: localStorage.getItem('flashcardUserEmail') || 'Guest',
  authMode: 'login',
  quiz: {
    active: false,
    cards: [],
    index: 0,
    selectedAnswer: null,
    score: 0,
    timer: 0,
    intervalId: null
  }
};

const elements = {
  decksList: document.getElementById('decksList'),
  deckTitle: document.getElementById('deckTitle'),
  deckDescription: document.getElementById('deckDescription'),
  deckStats: document.getElementById('deckStats'),
  cardsList: document.getElementById('cardsList'),
  cardsSection: document.getElementById('cardsList').parentElement,
  addDeckButton: document.getElementById('addDeckButton'),
  editDeckButton: document.getElementById('editDeckButton'),
  deleteDeckButton: document.getElementById('deleteDeckButton'),
  toggleStudyModeButton: document.getElementById('toggleStudyModeButton'),
  searchInput: document.getElementById('searchInput'),
  difficultyFilter: document.getElementById('difficultyFilter'),
  tagFilter: document.getElementById('tagFilter'),
  topicInput: document.getElementById('topicInput'),
  generateTopicButton: document.getElementById('generateTopicButton'),
  showAnalyticsButton: document.getElementById('showAnalyticsButton'),
  startQuizButton: document.getElementById('startQuizButton'),
  dailyChallengeButton: document.getElementById('dailyChallengeButton'),
  userGreeting: document.getElementById('userGreeting'),
  loginButton: document.getElementById('loginButton'),
  authModal: document.getElementById('authModal'),
  authModalTitle: document.getElementById('authModalTitle'),
  authEmailInput: document.getElementById('authEmailInput'),
  authPasswordInput: document.getElementById('authPasswordInput'),
  authToggleButton: document.getElementById('authToggleButton'),
  cancelAuthModal: document.getElementById('cancelAuthModal'),
  saveAuthModal: document.getElementById('saveAuthModal'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  deckNameInput: document.getElementById('deckNameInput'),
  deckDescriptionInput: document.getElementById('deckDescriptionInput'),
  saveModal: document.getElementById('saveModal'),
  cancelModal: document.getElementById('cancelModal'),
  cardEditModal: document.getElementById('cardEditModal'),
  cardModalTitle: document.getElementById('cardModalTitle'),
  cardQuestionInputEdit: document.getElementById('cardQuestionInputEdit'),
  cardAnswerInputEdit: document.getElementById('cardAnswerInputEdit'),
  cardDifficultyInputEdit: document.getElementById('cardDifficultyInputEdit'),
  cardTagsInputEdit: document.getElementById('cardTagsInputEdit'),
  saveCardModal: document.getElementById('saveCardModal'),
  cancelCardModal: document.getElementById('cancelCardModal'),
  studyPanel: document.getElementById('studyPanel'),
  studyCard: document.getElementById('studyCard'),
  studyQuestion: document.getElementById('studyQuestion'),
  studyAnswer: document.getElementById('studyAnswer'),
  studyCardMeta: document.getElementById('studyCardMeta'),
  studyCardDifficulty: document.getElementById('studyCardDifficulty'),
  flipStudyButton: document.getElementById('flipStudyButton'),
  voiceAnswerButton: document.getElementById('voiceAnswerButton'),
  markEasyButton: document.getElementById('markEasyButton'),
  markMediumButton: document.getElementById('markMediumButton'),
  markHardButton: document.getElementById('markHardButton'),
  explainAnswerButton: document.getElementById('explainAnswerButton'),
  voiceResultText: document.getElementById('voiceResultText'),
  explanationText: document.getElementById('explanationText'),
  prevStudyButton: document.getElementById('prevStudyButton'),
  nextStudyButton: document.getElementById('nextStudyButton'),
  analyticsPanel: document.getElementById('analyticsPanel'),
  closeAnalyticsButton: document.getElementById('closeAnalyticsButton'),
  analyticsChart: document.getElementById('analyticsChart'),
  accuracyValue: document.getElementById('accuracyValue'),
  attemptsValue: document.getElementById('attemptsValue'),
  dueValue: document.getElementById('dueValue'),
  weakTopicsValue: document.getElementById('weakTopicsValue'),
  quizPanel: document.getElementById('quizPanel'),
  quizProgress: document.getElementById('quizProgress'),
  quizTimer: document.getElementById('quizTimer'),
  quizQuestionText: document.getElementById('quizQuestionText'),
  quizOptions: document.getElementById('quizOptions'),
  submitQuizButton: document.getElementById('submitQuizButton'),
  exitQuizButton: document.getElementById('exitQuizButton'),
  quizResult: document.getElementById('quizResult'),
  cardForm: document.getElementById('cardForm'),
  cardQuestion: document.getElementById('cardQuestion'),
  cardAnswer: document.getElementById('cardAnswer'),
  cardDifficulty: document.getElementById('cardDifficulty'),
  cardTags: document.getElementById('cardTags')
};

const api = {
  getDecks: () => fetch(`/api/decks?userId=${encodeURIComponent(getCurrentUserId())}`).then((r) => r.json()),
  createDeck: (deck) => fetch('/api/decks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...deck, userId: getCurrentUserId() })
  }).then((r) => r.json()),
  updateDeck: (deckId, body) => fetch(`/api/decks/${deckId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then((r) => r.json()),
  deleteDeck: (deckId) => fetch(`/api/decks/${deckId}`, { method: 'DELETE' }).then((r) => r.json()),
  createCard: (deckId, card) => fetch(`/api/decks/${deckId}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...card, userId: getCurrentUserId() })
  }).then((r) => r.json()),
  updateCard: (deckId, cardId, body) => fetch(`/api/decks/${deckId}/cards/${cardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then((r) => r.json()),
  deleteCard: (deckId, cardId) => fetch(`/api/decks/${deckId}/cards/${cardId}`, { method: 'DELETE' }).then((r) => r.json()),
  login: (email, password) => fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then((r) => {
    if (!r.ok) throw new Error('Login failed');
    return r.json();
  }),
  signup: (email, password) => fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then((r) => {
    if (!r.ok) throw new Error('Signup failed');
    return r.json();
  }),
  generateQuestions: (topic) => fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, userId: getCurrentUserId() })
  }).then((r) => {
    if (!r.ok) throw new Error('Generation failed');
    return r.json();
  }),
  explainAnswer: (question, answer) => fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, userId: getCurrentUserId() })
  }).then((r) => {
    if (!r.ok) throw new Error('Explanation failed');
    return r.text();
  })
};

function getCurrentUserId() {
  return state.currentUserId || 'guest';
}

function showModal(title) {
  state.editingDeck = title === 'Edit Deck';
  elements.modalTitle.textContent = title;
  const deck = getSelectedDeck();
  elements.deckNameInput.value = state.editingDeck && deck ? deck.name : '';
  elements.deckDescriptionInput.value = state.editingDeck && deck ? deck.description : '';
  elements.modal.classList.remove('hidden');
}

function hideModal() {
  elements.modal.classList.add('hidden');
}

function showCardModal(card = null) {
  state.editingCard = Boolean(card);
  state.editedCardId = card ? card.id : null;
  elements.cardModalTitle.textContent = card ? 'Edit card' : 'Create card';
  elements.cardQuestionInputEdit.value = card ? card.question : '';
  elements.cardAnswerInputEdit.value = card ? card.answer : '';
  elements.cardDifficultyInputEdit.value = card ? card.difficulty || 'medium' : 'medium';
  elements.cardTagsInputEdit.value = card ? (card.tags || []).join(', ') : '';
  elements.cardEditModal.classList.remove('hidden');
}

function hideCardModal() {
  elements.cardEditModal.classList.add('hidden');
  state.editingCard = false;
  state.editedCardId = null;
}

function getSelectedDeck() {
  return state.decks.find((deck) => deck.id === state.selectedDeckId) || null;
}

function setSelectedDeck(deckId) {
  state.selectedDeckId = deckId;
  state.studyMode = false;
  state.useDueCards = false;
  state.studyIndex = 0;
  state.showAnswer = false;
  elements.searchInput.value = '';
  state.searchQuery = '';
  state.difficultyFilter = '';
  state.tagFilter = '';
  render();
}

function getActiveStudyCards() {
  const deck = getSelectedDeck();
  if (!deck) return [];
  const cards = state.useDueCards ? getDueCards() : deck.cards;
  return cards || [];
}

function getFilteredCards() {
  const deck = getSelectedDeck();
  if (!deck) return [];
  const query = state.searchQuery.trim().toLowerCase();
  return deck.cards.filter((card) => {
    const haystack = `${card.question} ${card.answer} ${(card.tags || []).join(' ')} ${card.difficulty || 'medium'}`.toLowerCase();
    const matchesQuery = !query || query.split(/\s+/).every((term) => haystack.includes(term));
    const matchesDifficulty = !state.difficultyFilter || card.difficulty === state.difficultyFilter;
    const matchesTag = !state.tagFilter || (card.tags || []).includes(state.tagFilter);
    return matchesQuery && matchesDifficulty && matchesTag;
  });
}

function render() {
  renderDecks();
  renderFilters();
  renderDeckStats();
  renderCards();
  updateAnalyticsPanel();
}

function formatDifficulty(value) {
  if (!value) return 'Medium';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderDecks() {
  elements.decksList.innerHTML = '';
  state.decks.forEach((deck) => {
    const item = document.createElement('div');
    item.className = `deck-item ${deck.id === state.selectedDeckId ? 'active' : ''}`;
    item.innerHTML = `<strong>${deck.name}</strong><p>${deck.description || 'No description'}</p>`;
    item.addEventListener('click', () => setSelectedDeck(deck.id));
    elements.decksList.appendChild(item);
  });
}

function getDueCards() {
  const deck = getSelectedDeck();
  if (!deck) return [];
  const now = new Date();
  return deck.cards.filter((card) => {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= now;
  });
}

function renderDeckStats() {
  const deck = getSelectedDeck();
  if (!deck) {
    elements.deckStats.textContent = 'Select a deck to view progress, tags and cards.';
    return;
  }
  const cards = deck.cards;
  const filtered = getFilteredCards();
  const due = getDueCards();
  const tags = [...new Set(cards.flatMap((card) => card.tags || []).map((tag) => tag.trim()).filter(Boolean))];
  const difficultyCount = cards.reduce((acc, card) => {
    const key = card.difficulty || 'medium';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  elements.deckStats.innerHTML = `
    <div><strong>${cards.length}</strong> total cards</div>
    <div><strong>${filtered.length}</strong> shown</div>
    <div><strong>${due.length}</strong> due today</div>
    <div>Tags: ${tags.length ? tags.join(', ') : 'None'}</div>
    <div>Difficulty: Easy ${difficultyCount.easy || 0}, Medium ${difficultyCount.medium || 0}, Hard ${difficultyCount.hard || 0}</div>
  `;
}

function renderFilters() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const tags = [...new Set(deck.cards.flatMap((card) => card.tags || []).map((tag) => tag.trim()).filter(Boolean))];
  const previous = elements.tagFilter.value;
  elements.tagFilter.innerHTML = '<option value="">All tags</option>' + tags.map((tag) => `<option value="${tag}">${tag}</option>`).join('');
  if (tags.includes(previous)) {
    elements.tagFilter.value = previous;
  }
}

function updateAnalyticsPanel() {
  if (elements.analyticsPanel.classList.contains('hidden')) return;
  const deck = getSelectedDeck();
  if (!deck) return;
  const cards = deck.cards;
  const attempts = cards.reduce((sum, card) => sum + (card.attempts || 0), 0);
  const success = cards.reduce((sum, card) => sum + (card.correctCount || 0), 0);
  const accuracy = attempts ? Math.round((success / attempts) * 100) : 0;
  const due = getDueCards().length;
  const tagStats = cards.reduce((acc, card) => {
    (card.tags || []).forEach((tag) => {
      const key = tag.trim();
      if (!key) return;
      acc[key] = acc[key] || { wrong: 0, attempts: 0 };
      acc[key].wrong += card.wrongCount || 0;
      acc[key].attempts += card.attempts || 0;
    });
    return acc;
  }, {});
  const weakTopics = Object.entries(tagStats)
    .filter(([, values]) => values.attempts > 0)
    .sort((a, b) => (b[1].wrong / b[1].attempts) - (a[1].wrong / a[1].attempts))
    .slice(0, 3)
    .map(([tag]) => tag);
  elements.accuracyValue.textContent = `${accuracy}%`;
  elements.attemptsValue.textContent = attempts;
  elements.dueValue.textContent = due;
  elements.weakTopicsValue.textContent = weakTopics.length ? weakTopics.join(', ') : 'None';
  drawAnalyticsChart({ easy: deck.cards.filter((card) => card.difficulty === 'easy').length, medium: deck.cards.filter((card) => card.difficulty === 'medium').length, hard: deck.cards.filter((card) => card.difficulty === 'hard').length, due });
}

function drawAnalyticsChart(data) {
  const canvas = elements.analyticsChart;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const labels = ['Easy', 'Medium', 'Hard', 'Due'];
  const values = [data.easy, data.medium, data.hard, data.due];
  const colors = ['#30d67a', '#4f82ff', '#f7bb5c', '#ff6470'];
  const padding = 40;
  const width = canvas.width - padding * 2;
  const height = canvas.height - padding * 2;
  const maxValue = Math.max(...values, 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b172d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  values.forEach((value, index) => {
    const barWidth = width / values.length - 24;
    const barHeight = (value / maxValue) * (height - 20);
    const x = padding + index * (barWidth + 24);
    const y = padding + (height - barHeight);
    ctx.fillStyle = colors[index];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText(labels[index], x, padding + height + 22);
    ctx.fillText(value, x, y - 10);
  });
}

function updateStudyControls() {
  const cards = getActiveStudyCards();
  const card = cards[state.studyIndex];
  const hasCard = Boolean(card);
  elements.studyCardMeta.textContent = hasCard ? `Card ${state.studyIndex + 1} of ${cards.length}` : 'No cards available';
  elements.studyCardDifficulty.textContent = hasCard ? formatDifficulty(card.difficulty) : '';
  elements.studyCardDifficulty.className = `tag ${hasCard && card.difficulty === 'hard' ? 'gold' : hasCard && card.difficulty === 'easy' ? 'success' : ''}`;
  elements.studyQuestion.textContent = hasCard ? card.question : 'Add cards to begin studying.';
  elements.studyAnswer.textContent = hasCard ? card.answer : '';
  elements.studyCard.classList.toggle('flipped', state.showAnswer && hasCard);
  elements.flipStudyButton.textContent = state.showAnswer ? 'Hide answer' : 'Flip card';
  elements.prevStudyButton.disabled = !hasCard || state.studyIndex === 0;
  elements.nextStudyButton.disabled = !hasCard || state.studyIndex >= cards.length - 1;
}

function renderCards() {
  const deck = getSelectedDeck();
  elements.toggleStudyModeButton.disabled = !Boolean(deck);
  elements.showAnalyticsButton.disabled = !Boolean(deck);
  elements.startQuizButton.disabled = !Boolean(deck);
  elements.dailyChallengeButton.disabled = !Boolean(deck);
  elements.searchInput.disabled = !Boolean(deck);
  elements.difficultyFilter.disabled = !Boolean(deck);
  elements.tagFilter.disabled = !Boolean(deck);
  if (!deck) {
    elements.deckTitle.textContent = 'Select a deck';
    elements.deckDescription.textContent = 'Choose or create a deck to manage cards.';
    elements.cardsList.innerHTML = '<p class="muted">No deck selected.</p>';
    elements.editDeckButton.disabled = true;
    elements.deleteDeckButton.disabled = true;
    elements.studyPanel.classList.add('hidden');
    elements.cardsSection.classList.remove('hidden');
    elements.analyticsPanel.classList.add('hidden');
    elements.quizPanel.classList.add('hidden');
    return;
  }
  elements.deckTitle.textContent = deck.name;
  elements.deckDescription.textContent = deck.description || 'No description available.';
  elements.editDeckButton.disabled = false;
  elements.deleteDeckButton.disabled = false;
  elements.toggleStudyModeButton.textContent = state.studyMode ? 'Exit study' : 'Start study';
  elements.studyPanel.classList.toggle('hidden', !state.studyMode);
  elements.cardsSection.classList.toggle('hidden', state.studyMode);
  if (state.studyMode) {
    const cards = getActiveStudyCards();
    if (state.studyIndex >= cards.length) {
      state.studyIndex = Math.max(cards.length - 1, 0);
    }
    updateStudyControls();
    return;
  }
  const filtered = getFilteredCards();
  if (!filtered.length) {
    elements.cardsList.innerHTML = '<p class="muted">No cards match that search.</p>';
    return;
  }
  elements.cardsList.innerHTML = '';
  filtered.forEach((card) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-card';
    const revealed = state.revealedCards.has(card.id);
    const nextReview = card.nextReview ? new Date(card.nextReview).toLocaleDateString() : 'Today';
    cardEl.innerHTML = `
      <div class="card-row">
        <strong>Q:</strong>
        <span>${card.question}</span>
      </div>
      <div class="card-row card-answer-row ${revealed ? '' : 'hidden'}">
        <strong>A:</strong>
        <span>${card.answer}</span>
      </div>
      <div class="card-row">
        <span class="tag ${card.difficulty === 'hard' ? 'gold' : card.difficulty === 'easy' ? 'success' : ''}">${formatDifficulty(card.difficulty)}</span>
        <span class="tag">${(card.tags || []).join(', ') || 'No tags'}</span>
      </div>
      <div class="card-row">
        <small>Next review: ${nextReview}</small>
      </div>
      <div class="card-actions">
        <button class="secondary reveal-button">${revealed ? 'Hide' : 'Reveal'}</button>
        <button class="secondary explain-button">Explain</button>
        <button class="secondary edit-button">Edit</button>
        <button class="danger delete-button">Delete</button>
      </div>
    `;
    cardEl.querySelector('.reveal-button').addEventListener('click', () => {
      if (state.revealedCards.has(card.id)) {
        state.revealedCards.delete(card.id);
      } else {
        state.revealedCards.add(card.id);
      }
      render();
    });
    cardEl.querySelector('.explain-button').addEventListener('click', () => explainCard(card));
    cardEl.querySelector('.edit-button').addEventListener('click', () => showCardModal(card));
    cardEl.querySelector('.delete-button').addEventListener('click', async () => {
      if (!confirm('Delete this card?')) return;
      await api.deleteCard(deck.id, card.id);
      await loadDecks();
    });
    elements.cardsList.appendChild(cardEl);
  });
}

function toggleStudyMode() {
  const deck = getSelectedDeck();
  if (!deck) return;
  state.studyMode = !state.studyMode;
  state.useDueCards = false;
  state.studyIndex = 0;
  state.showAnswer = false;
  elements.explanationText.classList.add('hidden');
  render();
}

function startDailyChallenge() {
  const deck = getSelectedDeck();
  if (!deck) return;
  state.studyMode = true;
  state.useDueCards = true;
  state.studyIndex = 0;
  state.showAnswer = false;
  elements.explanationText.classList.add('hidden');
  render();
}

function startQuizMode() {
  const deck = getSelectedDeck();
  if (!deck) return;
  const cards = shuffle(getFilteredCards()).slice(0, 10);
  if (!cards.length) {
    alert('No cards available for quiz.');
    return;
  }
  state.quiz = {
    active: true,
    cards: cards.map((card) => ({ ...card, options: buildQuizOptions(card, deck.cards) })),
    index: 0,
    selectedAnswer: null,
    score: 0,
    timer: 25,
    intervalId: null
  };
  elements.quizPanel.classList.remove('hidden');
  renderQuizQuestion();
  startQuizTimer();
}

function buildQuizOptions(card, cards) {
  const wrongAnswers = [...new Set(
    cards
      .filter((item) => item.id !== card.id && item.answer && item.answer !== card.answer)
      .map((item) => item.answer.trim())
  )];

  const options = [card.answer.trim()];
  while (options.length < 4 && wrongAnswers.length) {
    const next = wrongAnswers.splice(Math.floor(Math.random() * wrongAnswers.length), 1)[0];
    if (!options.includes(next)) {
      options.push(next);
    }
  }

  if (options.length < 4) {
    options.push(...createFallbackDistractors(card, options));
  }

  return shuffle(options.slice(0, 4));
}

function createFallbackDistractors(card, currentOptions) {
  const choices = [];
  const normalizedQuestion = card.question.toLowerCase();

  const add = (value) => {
    if (!value || currentOptions.includes(value) || choices.includes(value)) return;
    choices.push(value);
  };

  if (/capital|country|city|state/i.test(normalizedQuestion)) {
    add('London');
    add('Berlin');
    add('Madrid');
    add('Rome');
  } else if (/java/i.test(normalizedQuestion)) {
    add('A type of coffee.');
    add('A programming language for mobile apps.');
    add('An island in Indonesia.');
    add('A desktop operating system.');
  } else if (/python/i.test(normalizedQuestion)) {
    add('A species of snake.');
    add('A web browser.');
    add('A programming language used for scripting.');
    add('A branding logo.');
  } else {
    add('None of the above.');
    add('A different answer.');
    add('An alternative response.');
    add('A surprising fact.');
  }

  return choices;
}

function renderQuizQuestion() {
  if (!state.quiz.active) return;
  const current = state.quiz.cards[state.quiz.index];
  elements.quizProgress.textContent = `${state.quiz.index + 1} / ${state.quiz.cards.length}`;
  elements.quizTimer.textContent = `${state.quiz.timer}s`;
  elements.quizQuestionText.textContent = current.question;
  elements.quizOptions.innerHTML = current.options.map((option) => `<button type="button" class="quiz-option">${option}</button>`).join('');
  elements.quizResult.classList.add('hidden');
  elements.quizOptions.querySelectorAll('.quiz-option').forEach((button) => {
    button.addEventListener('click', () => {
      state.quiz.selectedAnswer = button.textContent;
      elements.quizOptions.querySelectorAll('.quiz-option').forEach((btn) => btn.classList.toggle('selected', btn === button));
    });
  });
}

function startQuizTimer() {
  clearInterval(state.quiz.intervalId);
  state.quiz.intervalId = setInterval(() => {
    state.quiz.timer -= 1;
    elements.quizTimer.textContent = `${state.quiz.timer}s`;
    if (state.quiz.timer <= 0) {
      submitQuizAnswer();
    }
  }, 1000);
}

function submitQuizAnswer() {
  if (!state.quiz.active) return;
  const current = state.quiz.cards[state.quiz.index];
  if (state.quiz.selectedAnswer === current.answer) {
    state.quiz.score += 1;
  }
  if (state.quiz.index + 1 < state.quiz.cards.length) {
    state.quiz.index += 1;
    state.quiz.selectedAnswer = null;
    state.quiz.timer = 25;
    renderQuizQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  clearInterval(state.quiz.intervalId);
  elements.quizResult.classList.remove('hidden');
  elements.quizResult.textContent = `Quiz complete! Score: ${state.quiz.score} / ${state.quiz.cards.length}`;
  state.quiz.active = false;
}

function exitQuizMode() {
  clearInterval(state.quiz.intervalId);
  state.quiz.active = false;
  elements.quizPanel.classList.add('hidden');
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildCardPayload(question, answer, difficulty, tagsText) {
  return {
    question,
    answer,
    difficulty,
    tags: tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
    reviewCount: 0,
    correctCount: 0,
    wrongCount: 0,
    attempts: 0,
    easeFactor: 2.5,
    intervalDays: 1,
    nextReview: new Date().toISOString(),
    lastReviewed: null
  };
}

async function loadDecks() {
  state.decks = await api.getDecks();
  if (!state.selectedDeckId && state.decks.length) {
    state.selectedDeckId = state.decks[0].id;
  }
  if (state.selectedDeckId && !state.decks.some((deck) => deck.id === state.selectedDeckId)) {
    state.selectedDeckId = state.decks.length ? state.decks[0].id : null;
  }
  render();
}

function updateUserGreeting() {
  elements.userGreeting.textContent = state.currentUserId === 'guest' ? 'Guest' : `Hi ${state.currentUserEmail}`;
  elements.loginButton.textContent = state.currentUserId === 'guest' ? 'Login / Signup' : 'Logout';
}

function showAuthModal(mode = 'login') {
  state.authMode = mode;
  elements.authModalTitle.textContent = mode === 'login' ? 'Login' : 'Signup';
  elements.authToggleButton.textContent = mode === 'login' ? 'Switch to signup' : 'Switch to login';
  elements.authModal.classList.remove('hidden');
}

function hideAuthModal() {
  elements.authModal.classList.add('hidden');
}

async function submitAuth() {
  const email = elements.authEmailInput.value.trim();
  const password = elements.authPasswordInput.value.trim();
  if (!email || !password) {
    alert('Email and password are required.');
    return;
  }
  try {
    const user = state.authMode === 'login'
      ? await api.login(email, password)
      : await api.signup(email, password);
    state.currentUserId = user.id;
    state.currentUserEmail = user.email;
    localStorage.setItem('flashcardUserId', user.id);
    localStorage.setItem('flashcardUserEmail', user.email);
    hideAuthModal();
    updateUserGreeting();
    await loadDecks();
  } catch (error) {
    alert(error.message || 'Authentication failed');
  }
}

function clearUserSession() {
  state.currentUserId = 'guest';
  state.currentUserEmail = 'Guest';
  localStorage.removeItem('flashcardUserId');
  localStorage.removeItem('flashcardUserEmail');
  updateUserGreeting();
  loadDecks();
}

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9 ]+/g, '').trim();
}

function compareVoiceText(answer, transcript) {
  const normalizedAnswer = normalizeText(answer);
  const normalizedTranscript = normalizeText(transcript);
  return normalizedAnswer.includes(normalizedTranscript) || normalizedTranscript.includes(normalizedAnswer) || normalizedAnswer === normalizedTranscript;
}

function startVoiceAnswer() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }
  const cards = getActiveStudyCards();
  const card = cards[state.studyIndex];
  if (!card) return;
  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const isMatch = compareVoiceText(card.answer, transcript);
    elements.voiceResultText.textContent = `Heard: “${transcript}” — ${isMatch ? 'Good match!' : 'Try again.'}`;
  };
  recognition.onerror = () => {
    elements.voiceResultText.textContent = 'Voice input error.';
  };
}

function explainCard(card) {
  api.explainAnswer(card.question, card.answer)
    .then((explanation) => {
      elements.explanationText.textContent = explanation;
      elements.explanationText.classList.remove('hidden');
      state.showAnswer = true;
      updateStudyControls();
    })
    .catch(() => {
      alert('Unable to generate an explanation at this time.');
    });
}

async function reviewCard(card, difficulty) {
  const deck = getSelectedDeck();
  if (!deck) return;
  const now = new Date();
  const interval = card.intervalDays || 1;
  let nextInterval = interval;
  let ease = card.easeFactor || 2.5;
  if (difficulty === 'easy') {
    nextInterval = Math.max(1, Math.round(interval * ease));
    ease = Math.min(2.8, ease + 0.15);
  } else if (difficulty === 'medium') {
    nextInterval = Math.max(1, Math.round(interval * 1.3));
    ease = Math.max(1.5, ease - 0.05);
  } else {
    nextInterval = 1;
    ease = Math.max(1.3, ease - 0.2);
  }
  const nextReview = new Date(now);
  nextReview.setDate(now.getDate() + nextInterval);
  const payload = {
    lastReviewed: now.toISOString(),
    nextReview: nextReview.toISOString(),
    intervalDays: nextInterval,
    easeFactor: ease,
    reviewCount: (card.reviewCount || 0) + 1,
    attempts: (card.attempts || 0) + 1,
    correctCount: (card.correctCount || 0) + (difficulty !== 'hard' ? 1 : 0),
    wrongCount: (card.wrongCount || 0) + (difficulty === 'hard' ? 1 : 0)
  };
  await api.updateCard(deck.id, card.id, payload);
  state.showAnswer = false;
  if (state.studyIndex < getActiveStudyCards().length - 1) {
    state.studyIndex += 1;
  }
  await loadDecks();
}

async function generateTopicCards() {
  const topic = elements.topicInput.value.trim();
  if (!topic) {
    alert('Enter a topic to generate questions.');
    return;
  }
  const deck = getSelectedDeck();
  if (!deck) {
    alert('Create or select a deck first.');
    return;
  }
  elements.generateTopicButton.disabled = true;
  elements.generateTopicButton.textContent = 'Generating...';
  try {
    const result = await api.generateQuestions(topic);
    if (!Array.isArray(result.cards) || !result.cards.length) {
      throw new Error('No cards generated');
    }
    await Promise.all(result.cards.map((card) => api.createCard(deck.id, buildCardPayload(card.question, card.answer, card.difficulty || 'medium', (card.tags || []).join(', ')))));
    elements.topicInput.value = '';
    await loadDecks();
  } catch (error) {
    alert(error.message || 'AI generation failed.');
  } finally {
    elements.generateTopicButton.disabled = false;
    elements.generateTopicButton.textContent = 'Generate';
  }
}

window.addEventListener('click', (event) => {
  if (event.target === elements.modal) {
    hideModal();
  }
  if (event.target === elements.cardEditModal) {
    hideCardModal();
  }
  if (event.target === elements.authModal) {
    hideAuthModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hideModal();
    hideCardModal();
    hideAuthModal();
  }
});

elements.addDeckButton.addEventListener('click', () => showModal('Create Deck'));
elements.editDeckButton.addEventListener('click', () => showModal('Edit Deck'));
elements.deleteDeckButton.addEventListener('click', async () => {
  const deck = getSelectedDeck();
  if (!deck) return;
  if (!confirm(`Delete deck "${deck.name}"?`)) return;
  await api.deleteDeck(deck.id);
  state.selectedDeckId = null;
  state.studyMode = false;
  state.studyIndex = 0;
  state.showAnswer = false;
  await loadDecks();
});
elements.toggleStudyModeButton.addEventListener('click', toggleStudyMode);
elements.dailyChallengeButton.addEventListener('click', startDailyChallenge);
elements.startQuizButton.addEventListener('click', startQuizMode);
elements.showAnalyticsButton.addEventListener('click', () => {
  elements.analyticsPanel.classList.toggle('hidden');
  updateAnalyticsPanel();
});
elements.closeAnalyticsButton.addEventListener('click', () => elements.analyticsPanel.classList.add('hidden'));
elements.searchInput.addEventListener('input', (event) => { state.searchQuery = event.target.value; render(); });
elements.difficultyFilter.addEventListener('change', (event) => { state.difficultyFilter = event.target.value; render(); });
elements.tagFilter.addEventListener('change', (event) => { state.tagFilter = event.target.value; render(); });
elements.generateTopicButton.addEventListener('click', generateTopicCards);
elements.flipStudyButton.addEventListener('click', () => { state.showAnswer = !state.showAnswer; updateStudyControls(); });
elements.voiceAnswerButton.addEventListener('click', startVoiceAnswer);
elements.markEasyButton.addEventListener('click', async () => {
  const card = getActiveStudyCards()[state.studyIndex];
  if (card) await reviewCard(card, 'easy');
});
elements.markMediumButton.addEventListener('click', async () => {
  const card = getActiveStudyCards()[state.studyIndex];
  if (card) await reviewCard(card, 'medium');
});
elements.markHardButton.addEventListener('click', async () => {
  const card = getActiveStudyCards()[state.studyIndex];
  if (card) await reviewCard(card, 'hard');
});
elements.explainAnswerButton.addEventListener('click', () => {
  const card = getActiveStudyCards()[state.studyIndex];
  if (card) explainCard(card);
});
elements.prevStudyButton.addEventListener('click', () => {
  if (state.studyIndex > 0) {
    state.studyIndex -= 1;
    state.showAnswer = false;
    updateStudyControls();
  }
});
elements.nextStudyButton.addEventListener('click', () => {
  if (state.studyIndex < getActiveStudyCards().length - 1) {
    state.studyIndex += 1;
    state.showAnswer = false;
    updateStudyControls();
  }
});
elements.loginButton.addEventListener('click', () => {
  if (state.currentUserId === 'guest') {
    showAuthModal('login');
  } else {
    clearUserSession();
  }
});
elements.authToggleButton.addEventListener('click', () => showAuthModal(state.authMode === 'login' ? 'signup' : 'login'));
elements.cancelAuthModal.addEventListener('click', hideAuthModal);
elements.saveAuthModal.addEventListener('click', submitAuth);
elements.saveModal.addEventListener('click', async () => {
  const name = elements.deckNameInput.value.trim();
  const description = elements.deckDescriptionInput.value.trim();
  if (!name) {
    alert('Deck name is required');
    return;
  }
  if (state.editingDeck) {
    const deck = getSelectedDeck();
    if (!deck) return;
    await api.updateDeck(deck.id, { name, description });
  } else {
    await api.createDeck({ name, description });
  }
  hideModal();
  await loadDecks();
});
elements.cancelModal.addEventListener('click', hideModal);
elements.saveCardModal.addEventListener('click', async () => {
  const deck = getSelectedDeck();
  if (!deck) return;
  const question = elements.cardQuestionInputEdit.value.trim();
  const answer = elements.cardAnswerInputEdit.value.trim();
  const difficulty = elements.cardDifficultyInputEdit.value;
  const tags = elements.cardTagsInputEdit.value;
  if (!question || !answer) {
    alert('Both question and answer are required.');
    return;
  }
  const payload = buildCardPayload(question, answer, difficulty, tags);
  if (state.editingCard && state.editedCardId) {
    await api.updateCard(deck.id, state.editedCardId, payload);
  }
  hideCardModal();
  await loadDecks();
});
elements.cancelCardModal.addEventListener('click', hideCardModal);
elements.cardForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const deck = getSelectedDeck();
  if (!deck) {
    alert('Select a deck first.');
    return;
  }
  const question = elements.cardQuestion.value.trim();
  const answer = elements.cardAnswer.value.trim();
  const difficulty = elements.cardDifficulty.value;
  const tags = elements.cardTags.value;
  if (!question || !answer) {
    alert('Both question and answer are required.');
    return;
  }
  await api.createCard(deck.id, buildCardPayload(question, answer, difficulty, tags));
  elements.cardForm.reset();
  await loadDecks();
});
elements.submitQuizButton.addEventListener('click', submitQuizAnswer);
elements.exitQuizButton.addEventListener('click', exitQuizMode);

function init() {
  updateUserGreeting();
  loadDecks().catch((error) => {
    console.error('Unable to load decks:', error);
  });
}

init();
