// 15分Pythonウェブサイトの JavaScript

// ページロード時の処理
document.addEventListener('DOMContentLoaded', function() {
    // カウントダウンタイマー機能
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        initializeTimer();
    }
    
    // 学習カレンダーの初期化
    const calendarElement = document.getElementById('learning-calendar');
    if (calendarElement) {
        initializeCalendar();
        updateStreakCount();
    }

    // レッスン進捗の保存機能
    const lessonLinks = document.querySelectorAll('.lesson-card a');
    lessonLinks.forEach(link => {
        link.addEventListener('click', function() {
            const lessonId = this.getAttribute('href').replace('.html', '');
            markLessonAsVisited(lessonId);
        });
    });

    // 過去に訪問したレッスンをマーク
    highlightVisitedLessons();

    // モチベーションメッセージ
    displayRandomMotivation();
});

// タイマー初期化関数
function initializeTimer() {
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('start-timer');
    const resetButton = document.getElementById('reset-timer');
    let timerInterval;
    let isRunning = false;
    let seconds = 15 * 60; // 15分
    
    // タイマー表示更新
    function updateTimerDisplay() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        // ゼロ埋め
        const displayMinutes = String(minutes).padStart(2, '0');
        const displaySeconds = String(remainingSeconds).padStart(2, '0');
        
        timerElement.textContent = `${displayMinutes}:${displaySeconds}`;
    }
    
    // タイマー開始関数
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startButton.textContent = '一時停止';
        
        timerInterval = setInterval(function() {
            seconds--;
            updateTimerDisplay();
            
            if (seconds <= 0) {
                clearInterval(timerInterval);
                timerElement.textContent = "00:00";
                showCompletionMessage();
                recordLearningDay(); // 学習完了を記録
                updateCalendar();
                updateStreakCount();
                resetTimer();
            }
        }, 1000);
    }
    
    // タイマー停止関数
    function pauseTimer() {
        if (!isRunning) return;
        
        clearInterval(timerInterval);
        isRunning = false;
        startButton.textContent = '再開';
    }
    
    // タイマーリセット関数
    function resetTimer() {
        clearInterval(timerInterval);
        seconds = 15 * 60;
        updateTimerDisplay();
        isRunning = false;
        startButton.textContent = '開始';
    }
    
    // 初期表示更新
    updateTimerDisplay();
    
    // ボタンイベント設定
    startButton.addEventListener('click', function() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    });
    
    resetButton.addEventListener('click', resetTimer);
}

// 15分カウントダウンタイマー (旧バージョンのサポート用)
function startCountdown(seconds) {
    const timerElement = document.getElementById('timer');
    
    // タイマー更新関数
    function updateTimer() {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        // ゼロ埋め
        const displayMinutes = String(minutes).padStart(2, '0');
        const displaySeconds = String(remainingSeconds).padStart(2, '0');
        
        timerElement.textContent = `${displayMinutes}:${displaySeconds}`;
        
        if (seconds <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "00:00";
            showCompletionMessage();
        } else {
            seconds--;
        }
    }
    
    // 初回表示
    updateTimer();
    
    // 1秒ごとに更新
    const timerInterval = setInterval(updateTimer, 1000);
    
    // リセットボタン
    const resetButton = document.getElementById('reset-timer');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            clearInterval(timerInterval);
            seconds = 15 * 60;
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        });
    }
}

// レッスン完了メッセージ
function showCompletionMessage() {
    const messageContainer = document.getElementById('completion-message');
    if (messageContainer) {
        messageContainer.classList.add('show');
        
        // 5秒後にメッセージを非表示
        setTimeout(() => {
            messageContainer.classList.remove('show');
        }, 5000);
    }
}

// レッスン訪問履歴の保存
function markLessonAsVisited(lessonId) {
    let visitedLessons = JSON.parse(localStorage.getItem('visitedLessons')) || [];
    
    if (!visitedLessons.includes(lessonId)) {
        visitedLessons.push(lessonId);
        localStorage.setItem('visitedLessons', JSON.stringify(visitedLessons));
    }
}

// 訪問済みレッスンのハイライト
function highlightVisitedLessons() {
    const visitedLessons = JSON.parse(localStorage.getItem('visitedLessons')) || [];
    
    const lessonCards = document.querySelectorAll('.lesson-card');
    lessonCards.forEach(card => {
        const link = card.querySelector('a');
        if (link) {
            const lessonId = link.getAttribute('href').replace('.html', '');
            
            if (visitedLessons.includes(lessonId)) {
                card.classList.add('visited');
                
                // 訪問済みマークを追加
                const visitedBadge = document.createElement('span');
                visitedBadge.className = 'visited-badge';
                visitedBadge.textContent = '✓';
                card.appendChild(visitedBadge);
            }
        }
    });
}

// 学習カレンダーの初期化
function initializeCalendar() {
    const calendarElement = document.getElementById('learning-calendar');
    if (!calendarElement) return;
    
    // カレンダーをクリア
    calendarElement.innerHTML = '';
    
    // 曜日ヘッダーを追加
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarElement.appendChild(dayHeader);
    });
    
    // 現在の日付を取得
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // 今月の最初の日を取得
    const firstDay = new Date(currentYear, currentMonth, 1);
    
    // 月の最初の日の曜日を取得 (0 = 日曜日, 6 = 土曜日)
    const startingDay = firstDay.getDay();
    
    // 今月の日数を取得
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // 先月の日数を追加 (空白にするため)
    for (let i = 0; i < startingDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarElement.appendChild(emptyDay);
    }
    
    // 今月の日数を追加
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        
        // 今日の日付をハイライト
        if (i === today.getDate()) {
            day.classList.add('today');
        }
        
        calendarElement.appendChild(day);
    }
    
    // 学習日をマーク
    updateCalendar();
}

// 学習日の記録
function recordLearningDay() {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    let learningDays = JSON.parse(localStorage.getItem('learningDays')) || [];
    
    if (!learningDays.includes(dateString)) {
        learningDays.push(dateString);
        localStorage.setItem('learningDays', JSON.stringify(learningDays));
    }
}

// カレンダー更新
function updateCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day:not(.empty)');
    if (!calendarDays.length) return;
    
    const learningDays = JSON.parse(localStorage.getItem('learningDays')) || [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    calendarDays.forEach(day => {
        const dayNumber = parseInt(day.textContent);
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
        
        if (learningDays.includes(dateString)) {
            day.classList.add('completed');
        }
    });
}

// 連続日数の計算と表示
function updateStreakCount() {
    const streakElement = document.getElementById('streak-count');
    if (!streakElement) return;
    
    const learningDays = JSON.parse(localStorage.getItem('learningDays')) || [];
    if (learningDays.length === 0) {
        streakElement.textContent = '0';
        return;
    }
    
    // 日付を昇順でソート
    learningDays.sort();
    
    // 現在の日付
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 昨日の日付
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    // 今日の日付
    const todayString = today.toISOString().split('T')[0];
    
    // 最新の学習日
    const lastLearningDay = new Date(learningDays[learningDays.length - 1]);
    lastLearningDay.setHours(0, 0, 0, 0);
    
    // 今日または昨日に学習していない場合、連続は途切れている
    if (learningDays.includes(todayString) || learningDays.includes(yesterdayString)) {
        // 連続日数を計算
        let streakCount = 1;
        let currentDate = new Date(lastLearningDay);
        
        while (streakCount < learningDays.length) {
            currentDate.setDate(currentDate.getDate() - 1);
            const dateString = currentDate.toISOString().split('T')[0];
            
            if (learningDays.includes(dateString)) {
                streakCount++;
            } else {
                break;
            }
        }
        
        streakElement.textContent = streakCount.toString();
    } else {
        // 連続が途切れている
        streakElement.textContent = '0';
    }
}

// モチベーションメッセージの表示
function displayRandomMotivation() {
    const messages = [
        "継続は力なり！毎日15分の積み重ねが大きな成果につながります。",
        "小さな一歩の積み重ねが、大きな進歩を生み出します。",
        "今日の15分が、明日のスキルになります。",
        "プログラミングの上達は、日々の積み重ねから。",
        "15分でも毎日続ければ、1週間で105分、1ヶ月で450分の学習になります！",
        "難しい問題も、一歩ずつ着実に解決していきましょう。",
        "エラーは学びのチャンス。デバッグも大切な経験です。",
        "「分からない」から「分かる」への道のりを楽しみましょう。"
    ];
    
    const motivationElement = document.getElementById('motivation-message');
    if (motivationElement) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        motivationElement.textContent = messages[randomIndex];
    }
}

// フォーム送信処理（デモ用）
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 実際のアプリケーションでは、ここでフォームデータを送信
        
        // 送信完了メッセージ表示（デモ用）
        alert('メッセージを送信しました。ありがとうございます！');
        this.reset();
    });
}