/**
 * Main application JavaScript
 */

// Function to format dates from UTC to local timezone
function formatDateTime(utcDateString) {
  if (!utcDateString) return '';

  const date = new Date(utcDateString);
  return date.toLocaleString();
}

// Initialize all datetime elements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Find all elements with data-utc-date attribute and format them
  const dateElements = document.querySelectorAll('[data-utc-date]');
  dateElements.forEach(element => {
    const utcDate = element.getAttribute('data-utc-date');
    if (utcDate) {
      element.textContent = formatDateTime(utcDate);
    }
  });
});
