// Movie Search App - OMDb API
// Get your free API key from: https://www.omdbapi.com/apikey.aspx

// ============================================
// 🔑 IMPORTANT: PUT YOUR API KEY HERE
// ============================================
const API_KEY = 'ada9b2ba';  // <-- REPLACE THIS with your actual API key
// ============================================

const API_BASE = 'https://www.omdbapi.com/';
let currentMovies = [];
let currentQuery = '';
let currentType = '';
let currentPage = 1;
let totalResults = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkApiKey();
    setupEventListeners();
    loadPopularMovies();
});

// Check if API key is set
function checkApiKey() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showToast('⚠️ Please add your OMDb API key to js/app.js', 'error');
        console.error('API key not set! Get free key from: https://www.omdbapi.com/apikey.aspx');
    } else {
        console.log('API key is set');
    }
}

// Setup event listeners
function setupEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                currentQuery = query;
                currentPage = 1;
                searchMovies();
            } else {
                showToast('Please enter a movie title', 'warning');
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    currentQuery = query;
                    currentPage = 1;
                    searchMovies();
                }
            }
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
            if (currentQuery) {
                currentPage = 1;
                searchMovies();
            }
        });
    });
    
    // Popular button
    const popularBtn = document.getElementById('popularBtn');
    if (popularBtn) {
        popularBtn.addEventListener('click', () => {
            loadPopularMovies();
        });
    }
    
    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            loadMoreMovies();
        });
    }
}

// Search movies
async function searchMovies() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showToast('Please add your API key to js/app.js first!', 'error');
        return;
    }
    
    showLoading();
    
    let url = `${API_BASE}?apikey=${API_KEY}&s=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
    if (currentType) {
        url += `&type=${currentType}`;
    }
    
    console.log('Fetching:', url.replace(API_KEY, 'HIDDEN'));
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            currentMovies = data.Search;
            totalResults = parseInt(data.totalResults);
            renderMovies(currentMovies);
            
            const titleEl = document.getElementById('resultsTitle');
            const countEl = document.getElementById('resultsCount');
            if (titleEl) titleEl.textContent = `Results for "${currentQuery}"`;
            if (countEl) countEl.textContent = `${totalResults} movies found`;
            
            const loadMore = document.getElementById('loadMoreContainer');
            if (loadMore) {
                if (currentMovies.length < totalResults && currentMovies.length >= 10) {
                    loadMore.style.display = 'block';
                } else {
                    loadMore.style.display = 'none';
                }
            }
        } else {
            renderMovies([]);
            const countEl = document.getElementById('resultsCount');
            if (countEl) countEl.textContent = 'No movies found';
            showToast(data.Error || 'No results found', 'info');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to fetch movies. Check your API key!', 'error');
        renderMovies([]);
    }
    
    hideLoading();
}

// Load more movies
async function loadMoreMovies() {
    if (API_KEY === 'YOUR_API_KEY_HERE') return;
    
    showLoading();
    
    let url = `${API_BASE}?apikey=${API_KEY}&s=${encodeURIComponent(currentQuery)}&page=${currentPage}`;
    if (currentType) {
        url += `&type=${currentType}`;
    }
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.Response === 'True') {
            currentMovies = [...currentMovies, ...data.Search];
            renderMovies(currentMovies);
            
            const loadMore = document.getElementById('loadMoreContainer');
            if (loadMore) {
                if (currentMovies.length < totalResults) {
                    loadMore.style.display = 'block';
                } else {
                    loadMore.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load more', 'error');
    }
    
    hideLoading();
}

// Load popular movies (pre-defined search)
function loadPopularMovies() {
    currentQuery = 'marvel';
    currentType = '';
    currentPage = 1;
    document.getElementById('searchInput').value = 'marvel';
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    searchMovies();
}

// Render movies grid
function renderMovies(movies) {
    const container = document.getElementById('moviesGrid');
    
    if (!container) return;
    
    if (!movies || movies.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-film"></i>
                <h4>No movies found</h4>
                <p>Try searching for something else!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = movies.map((movie, index) => `
        <div class="movie-card" onclick="getMovieDetails('${movie.imdbID}')">
            ${movie.Poster !== 'N/A' 
                ? `<img class="movie-poster" src="${movie.Poster}" alt="${movie.Title}">`
                : `<div class="movie-poster-placeholder"><i class="fas fa-film"></i></div>`
            }
            <div class="movie-info">
                <h3 class="movie-title">${escapeHtml(movie.Title)}</h3>
                <div class="movie-year">${movie.Year}</div>
                <span class="movie-type">${movie.Type}</span>
            </div>
        </div>
    `).join('');
}

// Get movie details for modal
async function getMovieDetails(imdbID) {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showToast('Please add your API key first!', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const url = `${API_BASE}?apikey=${API_KEY}&i=${imdbID}&plot=full`;
        const response = await fetch(url);
        const movie = await response.json();
        
        if (movie.Response === 'True') {
            showMovieModal(movie);
        } else {
            showToast('Failed to load movie details', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to load details', 'error');
    }
    
    hideLoading();
}

// Show movie modal
function showMovieModal(movie) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = movie.Title;
    
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    ${movie.Poster !== 'N/A' 
                        ? `<img class="movie-detail-poster" src="${movie.Poster}" alt="${movie.Title}">`
                        : `<div class="movie-detail-poster" style="height: 400px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;"><i class="fas fa-film fa-4x"></i></div>`
                    }
                </div>
                <div class="col-md-8">
                    <div class="movie-detail-info">
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Year:</div>
                            <div class="movie-detail-value">${movie.Year}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Rated:</div>
                            <div class="movie-detail-value">${movie.Rated || 'N/A'}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Released:</div>
                            <div class="movie-detail-value">${movie.Released || 'N/A'}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Runtime:</div>
                            <div class="movie-detail-value">${movie.Runtime || 'N/A'}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Genre:</div>
                            <div class="movie-detail-value">${movie.Genre || 'N/A'}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Director:</div>
                            <div class="movie-detail-value">${movie.Director || 'N/A'}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Writer:</div>
                            <div class="movie-detail-value">${movie.Writer || 'N/A'}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">Actors:</div>
                            <div class="movie-detail-value">${movie.Actors || 'N/A'}</div>
                        </div>
                        <div class="movie-detail-item">
                            <div class="movie-detail-label">IMDB Rating:</div>
                            <div class="movie-detail-value"><span class="rating-badge">⭐ ${movie.imdbRating || 'N/A'}/10</span></div>
                        </div>
                        <div class="plot-text">
                            <strong>Plot:</strong><br>
                            ${movie.Plot || 'No plot available'}
                        </div>
                        <div class="mt-3">
                            <a href="https://www.imdb.com/title/${movie.imdbID}" target="_blank" class="btn btn-primary">
                                <i class="fab fa-imdb me-2"></i> View on IMDB
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('movieModal'));
    modal.show();
}

// Helper functions
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('moviesGrid');
    const header = document.getElementById('resultsHeader');
    if (spinner) spinner.style.display = 'block';
    if (grid) grid.style.display = 'none';
    if (header) header.style.display = 'none';
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    const grid = document.getElementById('moviesGrid');
    const header = document.getElementById('resultsHeader');
    if (spinner) spinner.style.display = 'none';
    if (grid) grid.style.display = 'grid';
    if (header) header.style.display = 'flex';
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions global
window.getMovieDetails = getMovieDetails;