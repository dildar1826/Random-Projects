// ===== Habit Tracker App =====

// State Management
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.charts = {};
        this.init();
    }

    init() {
        this.renderHabits();
        this.updateStats();
        this.initCharts();
        this.attachEventListeners();
    }

    // Local Storage Operations
    loadHabits() {
        const stored = localStorage.getItem('habits');
        return stored ? JSON.parse(stored) : [];
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    // Habit CRUD Operations
    addHabit(name, category) {
        const habit = {
            id: Date.now().toString(),
            name,
            category,
            createdAt: new Date().toISOString(),
            completions: [], // Array of date strings
            streak: 0
        };
        this.habits.push(habit);
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
        this.updateCharts();
    }

    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
        this.updateCharts();
    }

    completeHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];

        // Check if already completed today
        if (habit.completions.includes(today)) {
            return;
        }

        habit.completions.push(today);
        habit.streak = this.calculateStreak(habit.completions);
        this.saveHabits();
        this.renderHabits();
        this.updateStats();
        this.updateCharts();
    }

    calculateStreak(completions) {
        if (completions.length === 0) return 0;

        const sorted = completions.sort().reverse();
        let streak = 0;
        let currentDate = new Date();

        for (let i = 0; i < sorted.length; i++) {
            const completionDate = new Date(sorted[i]);
            const daysDiff = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                streak++;
                currentDate = completionDate;
            } else {
                break;
            }
        }

        return streak;
    }

    isCompletedToday(habit) {
        const today = new Date().toISOString().split('T')[0];
        return habit.completions.includes(today);
    }

    getCompletionRate(habit, days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days + 1);

        let completed = 0;
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            if (habit.completions.includes(dateStr)) {
                completed++;
            }
        }

        return Math.round((completed / days) * 100);
    }

    // UI Rendering
    renderHabits() {
        const grid = document.getElementById('habits-grid');
        const emptyState = document.getElementById('empty-state');

        if (this.habits.length === 0) {
            grid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        grid.classList.remove('hidden');
        emptyState.classList.add('hidden');

        grid.innerHTML = this.habits.map(habit => {
            const completionRate = this.getCompletionRate(habit);
            const isCompleted = this.isCompletedToday(habit);
            const categoryLabels = {
                health: '🏃 Health & Fitness',
                productivity: '💼 Productivity',
                mindfulness: '🧘 Mindfulness',
                learning: '📚 Learning',
                creative: '🎨 Creative',
                social: '👥 Social'
            };

            return `
                <div class="habit-card">
                    <div class="habit-header">
                        <div class="habit-info">
                            <h3>${this.escapeHtml(habit.name)}</h3>
                            <div class="habit-category">${categoryLabels[habit.category]}</div>
                        </div>
                        <div class="habit-actions">
                            <button class="btn-icon-only" onclick="tracker.deleteHabit('${habit.id}')" title="Delete habit">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="habit-progress">
                        <div class="progress-label">
                            <span>7-Day Rate</span>
                            <span>${completionRate}%</span>
                        </div>
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" style="width: ${completionRate}%"></div>
                        </div>
                    </div>
                    <div class="habit-footer">
                        <button 
                            class="btn-complete ${isCompleted ? 'completed' : ''}" 
                            onclick="tracker.completeHabit('${habit.id}')"
                            ${isCompleted ? 'disabled' : ''}
                        >
                            ${isCompleted ? '✓ Completed Today' : 'Mark Complete'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const totalHabits = this.habits.length;
        const maxStreak = this.habits.reduce((max, h) => Math.max(max, h.streak), 0);

        document.getElementById('total-habits').textContent = totalHabits;
        document.getElementById('current-streak').textContent = maxStreak;
    }

    // Charts
    initCharts() {
        this.createCompletionChart();
        this.createCategoryChart();
        this.createStreakChart();
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => chart.destroy());
        this.initCharts();
    }

    createCompletionChart() {
        const ctx = document.getElementById('completion-chart');
        const labels = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            labels.push(dayName);

            const completed = this.habits.filter(h => h.completions.includes(dateStr)).length;
            const total = this.habits.length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            data.push(percentage);
        }

        this.charts.completion = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Completion Rate (%)',
                    data,
                    borderColor: 'rgb(124, 58, 237)',
                    backgroundColor: 'rgba(124, 58, 237, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointBackgroundColor: 'rgb(124, 58, 237)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function (value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const ctx = document.getElementById('category-chart');
        const categories = {};

        this.habits.forEach(h => {
            categories[h.category] = (categories[h.category] || 0) + 1;
        });

        const labels = Object.keys(categories).map(cat => {
            const categoryLabels = {
                health: 'Health',
                productivity: 'Productivity',
                mindfulness: 'Mindfulness',
                learning: 'Learning',
                creative: 'Creative',
                social: 'Social'
            };
            return categoryLabels[cat] || cat;
        });

        const data = Object.values(categories);
        const colors = [
            'rgba(124, 58, 237, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(192, 132, 252, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)'
        ];

        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: '#1a1a1a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    createStreakChart() {
        const ctx = document.getElementById('streak-chart');
        const days = 30;
        const data = [];
        const labels = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayNum = date.getDate();

            labels.push(dayNum);

            const completed = this.habits.filter(h => h.completions.includes(dateStr)).length;
            const total = this.habits.length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            data.push(percentage);
        }

        this.charts.streak = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Daily Completion',
                    data,
                    backgroundColor: data.map(val => {
                        if (val === 100) return 'rgba(34, 197, 94, 0.8)';
                        if (val >= 75) return 'rgba(124, 58, 237, 0.8)';
                        if (val >= 50) return 'rgba(168, 85, 247, 0.6)';
                        if (val > 0) return 'rgba(192, 132, 252, 0.4)';
                        return 'rgba(255, 255, 255, 0.1)';
                    }),
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.parsed.y + '% completed';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function (value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 15
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Event Listeners
    attachEventListeners() {
        const form = document.getElementById('add-habit-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('habit-name');
            const categorySelect = document.getElementById('habit-category');

            const name = nameInput.value.trim();
            const category = categorySelect.value;

            if (name) {
                this.addHabit(name, category);
                nameInput.value = '';

                // Add success animation
                const btn = form.querySelector('.btn-primary');
                btn.textContent = '✓ Added!';
                setTimeout(() => {
                    btn.innerHTML = '<span class="btn-icon">+</span>Add Habit';
                }, 1500);
            }
        });
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const tracker = new HabitTracker();
