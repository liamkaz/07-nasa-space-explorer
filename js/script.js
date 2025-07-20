// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Sample array of months to be used later for date validation
const months = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
}

// Fetch API data
document.getElementById('getImagesBtn').addEventListener('click', () => {
  // Get the selected date range from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;
  const apiKey = 'LxwqyoR5Ma8IJYdfoSjAyNQiAvjA4LQ2WBAxDrz5'; // Replace with your actual API key

  // Build the API URL with parameters
  const apiUrl = `https://api.nasa.gov/planetary/apod?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

  // Get the gallery element
  const gallery = document.getElementById('gallery');
  // Show a loading message with animated dots
  let loadingDots = 1;
  gallery.innerHTML = '<div id="loadingMsg" style="color: black; font-size: 22px; text-align: center; width: 100%; padding: 40px 0;">Loading.</div>';
  // Use setInterval to animate the dots
  const loadingInterval = setInterval(() => {
    loadingDots = (loadingDots % 3) + 1; // Cycle from 1 to 3
    const dots = '.'.repeat(loadingDots);
    const loadingMsg = document.getElementById('loadingMsg');
    if (loadingMsg) {
      loadingMsg.textContent = `Loading${dots}`;
    }
  }, 500);

  // Create a modal for showing the full description
  let modal = document.getElementById('descModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'descModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    // Modal content box
    const modalContent = document.createElement('div');
    modalContent.id = 'modalContent';
    modalContent.style.background = '#fff';
    modalContent.style.padding = '24px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxWidth = '500px';
    modalContent.style.maxHeight = '70vh';
    modalContent.style.overflowY = 'auto';
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    // Hide modal when clicking outside the content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Fetch data from NASA's API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      clearInterval(loadingInterval); // Stop loading animation
      // Check if we got an array of images
      if (!Array.isArray(data)) {
        gallery.innerHTML = '';
        alert('No images found for this date range.');
        return;
      }
      // Clear the loading message
      gallery.innerHTML = '';

      // Helper function to create an image or video element
      function createMediaElement(item) {
        // If the media type is 'video', embed it using an iframe
        if (item.media_type === 'video') {
          const iframe = document.createElement('iframe');
          iframe.src = item.url;
          iframe.width = '100%';
          iframe.height = '200';
          iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.style.border = 'none';
          iframe.style.borderRadius = '4px';
          return iframe;
        } else {
          // Otherwise, create an image element
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = item.title;
          return img;
        }
      }

      // Loop through each image and add to the gallery
      data.forEach(item => {
        // Create a div for each image or video
        const div = document.createElement('div');
        div.className = 'gallery-item';

        // Use the helper function to create the media element
        const mediaElement = createMediaElement(item);

        // Create the title
        const title = document.createElement('h3');
        title.textContent = item.title;
        title.style.marginTop = '18px'; // Add space between image/video and title

        // Create the date (smaller text)
        const date = document.createElement('p');
        const rawDate = item.date; // Get the raw date string
        // Format the date to a more readable format (e.g., "January 1, 2020")
        const dateParts = rawDate.split('-');
        const formattedDate = `${months[parseInt(dateParts[1])]} ${parseInt(dateParts[2])}, ${dateParts[0]}`;
        date.textContent = formattedDate;
        date.style.fontSize = '12px'; // Make the date smaller
        date.style.color = '#888'; // Make the date a bit lighter
        date.style.margin = '2px 0 6px 0';

        // Create the description (not shown in gallery)
        const fullText = item.explanation;

        // When the image or video is clicked, show the modal with the full info
        mediaElement.style.cursor = 'pointer';
        mediaElement.addEventListener('click', () => {
          const modalContent = document.getElementById('modalContent');
          // Clear previous content
          modalContent.innerHTML = '';
          // Close button
          const closeBtn = document.createElement('button');
          closeBtn.textContent = 'Close';
          closeBtn.style.marginBottom = '12px';
          closeBtn.style.float = 'right';
          closeBtn.style.fontSize = '16px';
          closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
          });
          modalContent.appendChild(closeBtn);
          // Title
          const modalTitle = document.createElement('h2');
          modalTitle.textContent = item.title;
          modalTitle.style.marginTop = '0';
          modalContent.appendChild(modalTitle);
          // Date
          const rawDate = item.date;
          const dateParts = rawDate.split('-');
          const formattedDate = `${months[parseInt(dateParts[1])]} ${parseInt(dateParts[2])}, ${dateParts[0]}`;
          const modalDate = document.createElement('p');
          modalDate.textContent = formattedDate;
          modalDate.style.fontSize = '12px';
          modalDate.style.color = '#888';
          modalDate.style.margin = '2px 0 12px 0';
          modalContent.appendChild(modalDate);
          // Media (image or video)
          const modalMedia = createMediaElement(item);
          modalMedia.style.width = '100%';
          modalMedia.style.borderRadius = '4px';
          modalMedia.style.marginBottom = '16px';
          modalContent.appendChild(modalMedia);
          // Description
          const descText = document.createElement('div');
          descText.textContent = item.explanation;
          descText.style.clear = 'both';
          modalContent.appendChild(descText);
          // Show modal
          modal.style.display = 'flex';
        });

        // Add everything to the div in the order: media, title, date
        div.appendChild(mediaElement);
        div.appendChild(title);
        div.appendChild(date);
        // No description in the gallery

        // Add the div to the gallery
        gallery.appendChild(div);
      });
    })
    .catch(error => {
      clearInterval(loadingInterval); // Stop loading animation
      console.error('Error fetching APOD:', error);
      gallery.innerHTML = '';
      alert('Failed to load images. Please try again.');
    });
});

// Fetch the initial image data based on the default date range

