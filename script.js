// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load habits from local storage
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
  
    // DOM Elements
    const habitInput = document.getElementById('habit-input');
    const addHabitButton = document.getElementById('add-habit');
    const habitList = document.getElementById('habit-list');
  
    // Check if elements exist
    if (!habitInput || !addHabitButton || !habitList) {
      console.error('Required DOM elements not found. Check your HTML IDs.');
      return;
    }
  
    // Calculate streak for a habit
    function calculateStreak(completedDays) {
      if (!completedDays.length) return 0;
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if completed today
      const completedToday = completedDays.includes(today.toDateString());
      const completedYesterday = completedDays.includes(yesterday.toDateString());
      
      // If not completed today or yesterday, no current streak
      if (!completedToday && !completedYesterday) return 0;
      
      // Count backwards from today/yesterday to find streak length
      let streak = 0;
      let currentDate = completedToday ? today : yesterday;
      
      while (true) {
        const dateString = currentDate.toDateString();
        if (completedDays.includes(dateString)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return streak;
    }
  
    // Render habits
    function renderHabits() {
      habitList.innerHTML = '';
      
      if (habits.length === 0) {
        habitList.innerHTML = '<div class="habit empty-state">No habits added yet. Add a new habit to get started!</div>';
        return;
      }
      
      habits.forEach((habit, index) => {
        const habitElement = document.createElement('div');
        habitElement.className = 'habit';
        
        // Calculate streak
        const streak = calculateStreak(habit.completedDays);
        let streakClass = '';
        if (streak >= 7) streakClass = 'streak-7';
        else if (streak >= 5) streakClass = 'streak-5';
        else if (streak >= 3) streakClass = 'streak-3';
        else if (streak >= 1) streakClass = 'streak-1';
  
        const habitName = document.createElement('span');
        habitName.className = 'habit-name';
        habitName.textContent = habit.name;
  
        const habitProgress = document.createElement('span');
        habitProgress.className = `habit-progress ${streakClass}`;
        
        if (streak > 0) {
          habitProgress.textContent = `${streak} day streak!`;
        } else {
          habitProgress.textContent = `Start today!`;
        }
  
        const habitCheckbox = document.createElement('input');
        habitCheckbox.type = 'checkbox';
        habitCheckbox.className = 'habit-checkbox';
        habitCheckbox.checked = habit.completedDays.includes(new Date().toDateString());
        habitCheckbox.addEventListener('change', () => toggleHabitCompletion(index));
  
        // Option to delete habit
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-habit';
        deleteButton.innerHTML = '&times;';
        deleteButton.addEventListener('click', () => deleteHabit(index));
        deleteButton.style.display = 'none'; // Hidden by default
  
        // Show delete button on hover
        habitElement.addEventListener('mouseenter', () => {
          deleteButton.style.display = 'block';
        });
        
        habitElement.addEventListener('mouseleave', () => {
          deleteButton.style.display = 'none';
        });
  
        habitElement.appendChild(habitName);
        habitElement.appendChild(habitProgress);
        habitElement.appendChild(habitCheckbox);
        habitElement.appendChild(deleteButton);
        habitList.appendChild(habitElement);
      });
    }
  
    // Add a new habit
    addHabitButton.addEventListener('click', addNewHabit);
    
    // Allow adding habit with Enter key
    habitInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        addNewHabit();
      }
    });
    
    function addNewHabit() {
      const habitName = habitInput.value.trim();
      if (habitName) {
        // Check for duplicates
        if (habits.some(habit => habit.name.toLowerCase() === habitName.toLowerCase())) {
          showNotification('This habit already exists!');
          return;
        }
        
        habits.push({
          name: habitName,
          completedDays: []
        });
        habitInput.value = '';
        saveHabits();
        renderHabits();
        
        // Focus back on input
        habitInput.focus();
      }
    }
  
    // Delete a habit
    function deleteHabit(index) {
      if (confirm(`Are you sure you want to delete "${habits[index].name}"?`)) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
      }
    }
  
    // Toggle habit completion
    function toggleHabitCompletion(index) {
      const today = new Date().toDateString();
      const habit = habits[index];
      if (habit.completedDays.includes(today)) {
        habit.completedDays = habit.completedDays.filter(day => day !== today);
      } else {
        habit.completedDays.push(today);
      }
      saveHabits();
      renderHabits();
    }
  
    // Save habits to local storage
    function saveHabits() {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  
    // Show temporary notification
    function showNotification(message) {
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.textContent = message;
      document.body.appendChild(notification);
      
      // Fade in
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      }, 10);
      
      // Fade out and remove
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }
  
    // Simulate fetching habits from an API
    function fetchHabits() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { name: 'Drink Water', completedDays: [] },
            { name: 'Exercise', completedDays: [] },
            { name: 'Read for 30 minutes', completedDays: [] }
          ]);
        }, 1500);
      });
    }
  
    // Load habits from API (simulated)
    async function loadHabits() {
      // Show loading animation
      habitList.innerHTML = '<div class="loading">Loading your habits...</div>';
  
      try {
        // Get habits from localStorage first
        const storedHabits = JSON.parse(localStorage.getItem('habits'));
        
        // If no stored habits, fetch from API
        if (!storedHabits || storedHabits.length === 0) {
          const fetchedHabits = await fetchHabits();
          habits = fetchedHabits;
          saveHabits();
        }
        
        renderHabits();
      } catch (error) {
        console.error('Error loading habits:', error);
        habitList.innerHTML = '<div class="error">Error loading habits. Please refresh and try again.</div>';
      }
    }
  
    // Initial load
    loadHabits();
  });