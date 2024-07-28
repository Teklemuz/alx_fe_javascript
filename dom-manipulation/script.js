const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Simulated API

// Array to store quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: “You have to believe in yourself when no one else does.”, category: "Motivation" },
  { text: “By being yourself, you put something wonderful in the world that was not there before.", category: "Inspiration" },
];

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById('quoteDisplay').innerText = `${quote.text} - ${quote.category}`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to add a new quote
function AddQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;
  if (newQuoteText && newQuoteCategory) {
    const newQuote = { text: newQuoteText, category: newQuoteCategory };
    quotes.push(newQuote);
    saveQuotes();
    postQuoteToServer(newQuote);
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added successfully!');
  } else {
    alert('Please enter both quote text and category.');
  }
}

// Function to populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = [...new Set(quotes.map(quote => quote.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  const lastSelectedCategory = localStorage.getItem('lastSelectedCategory');
  if (lastSelectedCategory) {
    categoryFilter.value = lastSelectedCategory;
  }
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('lastSelectedCategory', selectedCategory);
  showRandomQuote();
}

// Function to get filtered quotes
function getFilteredQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  if (selectedCategory === 'all') {
    return quotes;
  }
  return quotes.filter(quote => quote.category === selectedCategory);
}

// Function to export quotes to a JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = 'quotes.json';

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(serverUrl);
    const serverQuotes = await response.json();
    return serverQuotes.map(quote => ({ text: quote.title, category: 'Server' }));
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    return [];
  }
}

// Function to post a new quote to the server
async function postQuoteToServer(quote) {
  try {
    await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: quote.text, body: quote.category })
    });
  } catch (error) {
    console.error('Error posting quote to server:', error);
  }
}

// Function to sync quotes with the server
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];
  const mergedQuotes = [...serverQuotes, ...localQuotes];
  localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
  quotes = mergedQuotes;
  populateCategories();
  showNotification('Data has been updated from the server.');
}

// Function to show notification
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 5000);
}

// Load last viewed quote from session storage
window.onload = function() {
  const lastViewedQuote = JSON.parse(sessionStorage.getItem('lastViewedQuote'));
  if (lastViewedQuote) {
    document.getElementById('quoteDisplay').innerText = `${lastViewedQuote.text} - ${lastViewedQuote.category}`;
  }
  populateCategories();
}

// Periodically sync quotes with the server
setInterval(syncQuotes, 30000); // Syncs every 30 seconds

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
