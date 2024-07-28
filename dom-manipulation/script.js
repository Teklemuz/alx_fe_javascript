const API_URL = 'https://jsonplaceholder.typicode.com/posts'; // Simulate API URL
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
let lastSync = localStorage.getItem('lastSync') || new Date().toISOString();

// Function to display a random quote
function showRandomQuote() {
    const categoryFilter = localStorage.getItem('selectedCategory') || 'all';
    const filteredQuotes = categoryFilter === 'all' ? quotes : quotes.filter(q => q.category === categoryFilter);

    if (filteredQuotes.length === 0) {
        document.getElementById('quoteDisplay').textContent = "No quotes available.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    document.getElementById('quoteDisplay').textContent = `"${quote.text}" - ${quote.category}`;
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes(); // Save quotes to local storage
        updateCategoryFilter(); // Update categories in the dropdown
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        showRandomQuote(); // Display the newly added quote
        
        // Send new quote to server
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newQuote)
        }).catch(console.error);
    } else {
        alert('Please enter both a quote and a category.');
    }
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to export quotes to a JSON file
function exportQuotes() {
    const json = JSON.stringify(quotes, null, 2); // Pretty-print JSON
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes = importedQuotes;
                saveQuotes();
                updateCategoryFilter(); // Update categories in the dropdown after import
                showRandomQuote(); // Show a random quote from the newly imported list
                alert('Quotes imported successfully!');
            } else {
                alert('Invalid file format. Please upload a valid JSON file.');
            }
        } catch (e) {
            alert('Error reading file. Please ensure it is a valid JSON file.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Function to update the category filter dropdown
function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(q => q.category))]; // Get unique categories
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset options
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore the last selected filter
    const lastSelectedCategory = localStorage.getItem('selectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory); // Save selected category
    showRandomQuote();
}

// Function to sync with the server
async function syncWithServer() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();
        
        // Handle conflict resolution
        const localQuotes = quotes;
        const newQuotes = serverQuotes.filter(serverQuote => 
            !localQuotes.find(localQuote => localQuote.text === serverQuote.text && localQuote.category === serverQuote.category)
        );
        
        if (newQuotes.length > 0) {
            quotes = [...localQuotes, ...newQuotes];
            saveQuotes();
            updateCategoryFilter(); // Update categories after sync
            showRandomQuote(); // Display a random quote from the updated list
            document.getElementById('notification').textContent = 'Quotes updated from server.';
        } else {
            document.getElementById('notification').textContent = 'No new quotes from server.';
        }
        
        // Update last sync time
        localStorage.setItem('lastSync', new Date().toISOString());
    } catch (error) {
        console.error('Error syncing with server:', error);
        document.getElementById('notification').textContent = 'Error syncing with server.';
    }
}

// Set up periodic syncing every 5 minutes
setInterval(syncWithServer, 5 * 60 * 1000); // 5 minutes

// Attach event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('addQuote').addEventListener('click', addQuote);
document.getElementById('exportQuotes').addEventListener('click', exportQuotes);
