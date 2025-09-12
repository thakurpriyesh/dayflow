document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const monthNameEl = document.getElementById('month-name');
    const yearNumEl = document.getElementById('year-num');
    const calendarGridEl = document.getElementById('calendar-grid');
    const dayModal = document.getElementById('day-modal');
    const modalDateDisplay = document.getElementById('modal-date-display');
    const taskListEl = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskModal = document.getElementById('add-task-modal');
    const mainTaskText = document.getElementById('main-task-text');
    const mainTaskDate = document.getElementById('main-task-date');
    const repeatOptions = document.getElementById('repeat-options');
    const weeklyOptionsContainer = document.getElementById('weekly-options-container');
    const quoteDisplayEl = document.getElementById('quote-display');
    const notesModal = document.getElementById('notes-modal');
    const notesModalDateDisplay = document.getElementById('notes-modal-date-display');
    const noteListEl = document.getElementById('note-list');
    const newNoteInput = document.getElementById('new-note-input');
    const quickLinksList = document.getElementById('quick-links-list');
    const addLinkModal = document.getElementById('add-link-modal');
    const linkTitleInput = document.getElementById('link-title-input');
    const linkContentInput = document.getElementById('link-content-input');
    const genericInfoModal = document.getElementById('info-modal-generic');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalContent = document.getElementById('info-modal-content');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmModalText = document.getElementById('confirm-modal-text');

    // State
    let currentDate = new Date();
    let tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    let notes = JSON.parse(localStorage.getItem('notes')) || {};
    let quickLinks = JSON.parse(localStorage.getItem('quickLinks')) || [];
    let selectedDate = null;
    let linkIndexToDelete = null;

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const quotes = [
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "Well done is better than well said.", author: "Benjamin Franklin" },
        { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
        { text: "A goal without a plan is just a wish.", author: "Antoine de Saint-Exupéry" },
    ];

    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const saveNotes = () => localStorage.setItem('notes', JSON.stringify(notes));
    const saveQuickLinks = () => localStorage.setItem('quickLinks', JSON.stringify(quickLinks));

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthNameEl.textContent = monthNames[month];
        yearNumEl.textContent = year;
        calendarGridEl.innerHTML = '';
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(name => calendarGridEl.innerHTML += `<div class="day-name">${name}</div>`);
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        for (let i = 0; i < firstDayOfMonth; i++) calendarGridEl.innerHTML += `<div class="day-cell empty"></div>`;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day-cell');
            dayCell.textContent = day;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayCell.dataset.date = dateStr;
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
                dayCell.classList.add('today');
            }
            updateDayCellStatus(dayCell, dateStr);
            calendarGridEl.appendChild(dayCell);
        }
    };

    const updateDayCellStatus = (dayCell, dateStr) => {
        dayCell.classList.remove('task-complete', 'task-incomplete', 'has-note');
        const dayTasks = tasks[dateStr] || [];
        if (dayTasks.length > 0) {
            const allComplete = dayTasks.every(task => task.completed);
            if (allComplete) dayCell.classList.add('task-complete');
            else if (new Date(dateStr) < new Date().setHours(0, 0, 0, 0)) dayCell.classList.add('task-incomplete');
        }
        const dayNotes = notes[dateStr] || [];
        if (dayNotes.length > 0) dayCell.classList.add('has-note');
    };

    const openDayModal = (dateStr) => {
        selectedDate = dateStr;
        const date = new Date(dateStr.replace(/-/g, '/'));
        const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        modalDateDisplay.textContent = `Tasks for ${formattedDate}`;
        renderTasksForDay(dateStr);
        dayModal.style.display = 'flex';
    };

    const renderTasksForDay = (dateStr) => {
        taskListEl.innerHTML = '';
        const dayTasks = tasks[dateStr] || [];
        if (dayTasks.length === 0) {
            taskListEl.innerHTML = '<li>No tasks for this day.</li>'; return;
        }
        dayTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `<input type="checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}><label>${task.text}</label><button class="delete-task-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>`;
            taskListEl.appendChild(li);
        });
    };
    
    const renderNotesForDay = (dateStr) => {
        noteListEl.innerHTML = '';
        const dayNotes = notes[dateStr] || [];
        if (dayNotes.length === 0) {
            noteListEl.innerHTML = '<li>No notes for this day.</li>'; return;
        }
        dayNotes.forEach((note, index) => {
            const li = document.createElement('li');
            li.textContent = note;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-note-btn';
            deleteBtn.dataset.index = index;
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            li.appendChild(deleteBtn);
            noteListEl.appendChild(li);
        });
    };

    const renderQuickLinks = () => {
        quickLinksList.innerHTML = '';
        quickLinks.forEach((link, index) => {
            const linkBtn = document.createElement('button');
            linkBtn.className = 'info-btn';
            linkBtn.dataset.index = index;
            const titleSpan = document.createElement('span');
            titleSpan.textContent = link.title;
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-link-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.dataset.index = index;
            linkBtn.appendChild(titleSpan);
            // Delete button is now in the modal, not here.
            quickLinksList.appendChild(linkBtn);
        });
    };

    const updateCalendarDayStatus = (dateStr) => {
        const dayCell = document.querySelector(`.day-cell[data-date='${dateStr}']`);
        if(dayCell) updateDayCellStatus(dayCell, dateStr);
    };
    
    const displayRandomQuote = () => {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteDisplayEl.innerHTML = `"${randomQuote.text}" <span class="author">- ${randomQuote.author}</span>`;
    };

    document.addEventListener('click', e => {
        if (e.target.closest('#prev-month-btn')) { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); }
        if (e.target.closest('#next-month-btn')) { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); }
        
        const dayCell = e.target.closest('.day-cell:not(.empty)');
        if (dayCell) { openDayModal(dayCell.dataset.date); }

        if (e.target.closest('#add-task-in-modal-btn')) {
            const taskText = newTaskInput.value.trim();
            if (taskText && selectedDate) {
                if (!tasks[selectedDate]) tasks[selectedDate] = [];
                tasks[selectedDate].push({ text: taskText, completed: false });
                saveTasks();
                newTaskInput.value = '';
                renderTasksForDay(selectedDate);
                updateCalendarDayStatus(selectedDate);
            }
        }
        if (e.target.closest('.delete-task-btn')) {
            const taskIndex = e.target.closest('.delete-task-btn').dataset.index;
            tasks[selectedDate].splice(taskIndex, 1);
            if (tasks[selectedDate].length === 0) delete tasks[selectedDate];
            saveTasks();
            renderTasksForDay(selectedDate);
            updateCalendarDayStatus(selectedDate);
        }
        if (e.target.matches('#task-list input[type="checkbox"]')) {
            const taskIndex = e.target.dataset.index;
            tasks[selectedDate][taskIndex].completed = !tasks[selectedDate][taskIndex].completed;
            saveTasks();
            renderTasksForDay(selectedDate);
            updateCalendarDayStatus(selectedDate);
        }
        if (e.target.closest('#open-notes-btn')) {
            const date = new Date(selectedDate.replace(/-/g, '/'));
            notesModalDateDisplay.textContent = `Notes for ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
            renderNotesForDay(selectedDate);
            notesModal.style.display = 'flex';
        }
        if (e.target.closest('#add-note-btn')) {
            const noteText = newNoteInput.value.trim();
            if (noteText && selectedDate) {
                if (!notes[selectedDate]) notes[selectedDate] = [];
                notes[selectedDate].push(noteText);
                saveNotes();
                newNoteInput.value = '';
                renderNotesForDay(selectedDate);
                updateCalendarDayStatus(selectedDate);
            }
        }
        if (e.target.closest('.delete-note-btn')) {
            const noteIndex = e.target.closest('.delete-note-btn').dataset.index;
            notes[selectedDate].splice(noteIndex, 1);
            if (notes[selectedDate].length === 0) delete notes[selectedDate];
            saveNotes();
            renderNotesForDay(selectedDate);
            updateCalendarDayStatus(selectedDate);
        }
        if (e.target.closest('#add-task-main-btn')) { mainTaskDate.valueAsDate = new Date(); addTaskModal.style.display = 'flex'; }
        if (e.target.closest('#add-task-submit-btn')) {
            const taskText = mainTaskText.value.trim();
            const startDateStr = mainTaskDate.value;
            const repeatType = repeatOptions.value;
            if (!taskText || !startDateStr) return alert('Please fill in both the task description and the start date.');
            const startDate = new Date(startDateStr.replace(/-/g, '/'));
            if (repeatType === 'none') {
                if (!tasks[startDateStr]) tasks[startDateStr] = [];
                tasks[startDateStr].push({ text: taskText, completed: false });
            } else if (repeatType === 'daily' || repeatType === 'weekly') {
                const selectedDays = repeatType === 'weekly' ? [...weeklyOptionsContainer.querySelectorAll('input:checked')].map(cb => parseInt(cb.value)) : null;
                if (repeatType === 'weekly' && selectedDays.length === 0) return alert('Please select at least one day of the week to repeat on.');
                for (let i = 0; i < 365; i++) {
                    const loopDate = new Date(startDate); loopDate.setDate(startDate.getDate() + i);
                    if (repeatType === 'daily' || selectedDays.includes(loopDate.getDay())) {
                        const dateStr = `${loopDate.getFullYear()}-${String(loopDate.getMonth() + 1).padStart(2, '0')}-${String(loopDate.getDate()).padStart(2, '0')}`;
                        if (!tasks[dateStr]) tasks[dateStr] = [];
                        tasks[dateStr].push({ text: taskText, completed: false });
                    }
                }
            }
            saveTasks();
            mainTaskText.value = ''; repeatOptions.value = 'none';
            weeklyOptionsContainer.classList.add('hidden');
            addTaskModal.style.display = 'none';
            renderCalendar();
        }
        if(e.target.id === 'repeat-options') { weeklyOptionsContainer.classList.toggle('hidden', repeatOptions.value !== 'weekly'); }
        if (e.target.closest('#add-quick-link-btn')) { addLinkModal.style.display = 'flex'; }
        if (e.target.closest('#save-link-btn')) {
            const title = linkTitleInput.value.trim();
            const content = linkContentInput.value.trim();
            if (title && content) {
                quickLinks.push({ title, content });
                saveQuickLinks();
                renderQuickLinks();
                linkTitleInput.value = '';
                linkContentInput.value = '';
                addLinkModal.style.display = 'none';
            } else {
                alert('Please fill in both title and content.');
            }
        }
        const infoBtn = e.target.closest('.info-btn');
        if (infoBtn) {
            const linkIndex = infoBtn.dataset.index;
            linkIndexToDelete = linkIndex;
            const linkData = quickLinks[linkIndex];
            if (linkData) {
                infoModalTitle.textContent = linkData.title;
                infoModalContent.textContent = linkData.content;
                genericInfoModal.style.display = 'flex';
            }
        }
        if (e.target.closest('#delete-open-link-btn')) {
            confirmModalText.textContent = `Do you really want to delete the "${quickLinks[linkIndexToDelete].title}" link? This action cannot be undone.`;
            confirmModal.style.display = 'flex';
        }
        if (e.target.closest('#confirm-btn-delete')) {
            quickLinks.splice(linkIndexToDelete, 1);
            saveQuickLinks();
            renderQuickLinks();
            confirmModal.style.display = 'none';
            genericInfoModal.style.display = 'none';
            linkIndexToDelete = null;
        }
        if (e.target.closest('#confirm-btn-cancel')) {
            confirmModal.style.display = 'none';
        }
        const modal = e.target.closest('.modal-backdrop');
        if (modal) {
            if (e.target.classList.contains('modal-backdrop') || e.target.closest('.close-btn')) {
                modal.style.display = 'none';
                if (modal.id === 'day-modal') selectedDate = null;
                if (modal.id === 'info-modal-generic') linkIndexToDelete = null;
            }
        }
    });

    // **FIXED**: The condition was incorrect, now it only fires on the 'Enter' key.
    document.addEventListener('keypress', e => {
        if (e.key === 'Enter' && document.activeElement === newTaskInput) {
            document.getElementById('add-task-in-modal-btn').click();
        }
    });

    displayRandomQuote();
    setInterval(displayRandomQuote, 30000);
    renderCalendar();
    renderQuickLinks();
});