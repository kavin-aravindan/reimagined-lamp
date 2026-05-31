const timeDisplay = document.getElementById('time');
const dateDisplay = document.getElementById('date');
const colorButtons = document.querySelectorAll('.color-btn');
const clockDisplay = document.querySelector('.clock-display');

let is24Hour = true;

// Double click to toggle time format
clockDisplay.addEventListener('dblclick', () => {
  is24Hour = !is24Hour;
  updateTime();
});

// Update Clock Function
function updateTime() {
  const now = new Date();
  
  // Format Time
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let ampm = '';

  if (!is24Hour) {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  }

  // Pad single digits
  hours = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');

  timeDisplay.textContent = `${hours}:${minutes}:${seconds}${ampm}`;

  // Format Date
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

// Color Picker Logic
colorButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedColor = button.getAttribute('data-color');
    
    // Set Active Button class
    colorButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Update theme variable and glow highlights
    document.documentElement.style.setProperty('--accent-color', selectedColor);
    
    // Apply temporary animation click effect to display
    clockDisplay.style.boxShadow = `0 0 35px ${selectedColor}, inset 0 0 20px ${selectedColor}`;
    setTimeout(() => {
      clockDisplay.style.boxShadow = `0 0 20px ${selectedColor}26, inset 0 0 15px ${selectedColor}1a`;
    }, 400);
  });
});

// Run clock loop
setInterval(updateTime, 1000);
updateTime();
