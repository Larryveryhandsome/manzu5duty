// 全域變數
let currentMonth = 7;
let currentWeek = 1;
let scheduleData = {};
let leaveData = {};
let draggedElement = null;

// 人員設定
const STAFF = {
    HUANG: { name: '黃詩晴', color: 'huang', class: 'shift-tag huang' },
    YANG: { name: '楊茗傑', color: 'yang', class: 'shift-tag yang' },
    DEPUTY: { name: '副店', color: 'deputy', class: 'shift-tag deputy' }
};

// DOM 元素
const monthViewBtn = document.getElementById('monthView');
const weekViewBtn = document.getElementById('weekView');
const monthSelector = document.getElementById('monthSelector');
const weekSelector = document.getElementById('weekSelector');
const monthViewContainer = document.getElementById('monthViewContainer');
const weekViewContainer = document.getElementById('weekViewContainer');
const monthCalendar = document.getElementById('monthCalendar');
const weekCalendar = document.getElementById('weekCalendar');
const notification = document.getElementById('notification');

// 事件監聽器
document.addEventListener('DOMContentLoaded', initializeApp);
monthViewBtn.addEventListener('click', () => switchView('month'));
weekViewBtn.addEventListener('click', () => switchView('week'));
monthSelector.addEventListener('change', handleMonthChange);
weekSelector.addEventListener('change', handleWeekChange);

// 初始化應用程式
function initializeApp() {
    try {
        loadData();
        generateInitialSchedule();
        renderMonthView();
        renderWeekView();
        setupWeekSelector();
        showNotification('排班表載入完成', 'success');
    } catch (error) {
        console.error('初始化失敗:', error);
        showNotification('載入失敗，請重新整理頁面', 'error');
    }
}

// 載入資料
function loadData() {
    try {
        const savedSchedule = localStorage.getItem('scheduleData');
        const savedLeave = localStorage.getItem('leaveData');
        
        scheduleData = savedSchedule ? JSON.parse(savedSchedule) : {};
        leaveData = savedLeave ? JSON.parse(savedLeave) : {};
    } catch (error) {
        console.error('載入資料失敗:', error);
        scheduleData = {};
        leaveData = {};
    }
}

// 儲存資料
function saveData() {
    try {
        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        localStorage.setItem('leaveData', JSON.stringify(leaveData));
    } catch (error) {
        console.error('儲存資料失敗:', error);
        showNotification('儲存失敗', 'error');
    }
}

// 生成初始排班表
function generateInitialSchedule() {
    const months = [7, 8, 9, 10, 11, 12];
    
    months.forEach(month => {
        if (!scheduleData[month]) {
            scheduleData[month] = generateMonthSchedule(month);
        }
    });
}

// 生成月份排班表
function generateMonthSchedule(month) {
    const year = 2025;
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const schedule = {};
    
    let weekCounter = 1;
    let wednesdayCounter = 0; // 週三輪流計數器
    let weekendCounter = 0; // 週末輪流計數器
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const weekOfMonth = Math.ceil((day + firstDay - 1) / 7);
        
        if (!schedule[weekOfMonth]) {
            schedule[weekOfMonth] = {};
        }
        
        // 週四固定休假
        if (dayOfWeek === 4) {
            schedule[weekOfMonth][day] = null;
            continue;
        }
        
        // 週一、週二、週五：僅安排楊茗傑
        if ([1, 2, 5].includes(dayOfWeek)) {
            schedule[weekOfMonth][day] = 'yang';
        }
        // 週三：黃詩晴與副店輪流
        else if (dayOfWeek === 3) {
            wednesdayCounter++;
            schedule[weekOfMonth][day] = wednesdayCounter % 2 === 1 ? 'huang' : 'deputy';
        }
        // 週末：黃詩晴與副店輪流
        else if ([0, 6].includes(dayOfWeek)) {
            weekendCounter++;
            schedule[weekOfMonth][day] = weekendCounter % 2 === 1 ? 'huang' : 'deputy';
        }
    }
    
    return schedule;
}

// 切換檢視模式
function switchView(view) {
    if (view === 'month') {
        monthViewBtn.classList.add('active');
        weekViewBtn.classList.remove('active');
        monthViewContainer.classList.add('active');
        weekViewContainer.classList.remove('active');
        weekSelector.style.display = 'none';
        monthSelector.style.display = 'block';
    } else {
        weekViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        weekViewContainer.classList.add('active');
        monthViewContainer.classList.remove('active');
        weekSelector.style.display = 'block';
        monthSelector.style.display = 'block';
    }
}

// 處理月份變更
function handleMonthChange() {
    currentMonth = parseInt(monthSelector.value);
    renderMonthView();
    renderWeekView();
    setupWeekSelector();
}

// 處理週次變更
function handleWeekChange() {
    currentWeek = parseInt(weekSelector.value);
    renderWeekView();
}

// 設定週次選擇器
function setupWeekSelector() {
    weekSelector.innerHTML = '';
    const monthData = scheduleData[currentMonth] || {};
    const weeks = Object.keys(monthData).map(Number).sort((a, b) => a - b);
    
    weeks.forEach(week => {
        const option = document.createElement('option');
        option.value = week;
        option.textContent = `第${week}週`;
        weekSelector.appendChild(option);
    });
    
    if (weeks.length > 0) {
        currentWeek = weeks[0];
        weekSelector.value = currentWeek;
    }
}

// 渲染月檢視
function renderMonthView() {
    monthCalendar.innerHTML = '';
    
    const year = 2025;
    const daysInMonth = new Date(year, currentMonth, 0).getDate();
    const firstDay = new Date(year, currentMonth - 1, 1).getDay();
    const monthData = scheduleData[currentMonth] || {};
    
    // 計算需要的週數
    const totalDays = firstDay + daysInMonth;
    const weeksNeeded = Math.ceil(totalDays / 7);
    
    for (let week = 1; week <= weeksNeeded; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const dayNumber = (week - 1) * 7 + dayOfWeek - firstDay + 1;
            
            if (dayNumber < 1 || dayNumber > daysInMonth) {
                dayElement.classList.add('empty');
            } else {
                const date = new Date(year, currentMonth - 1, dayNumber);
                const isThursday = date.getDay() === 4;
                
                if (isThursday) {
                    dayElement.classList.add('thursday');
                }
                
                // 日期數字
                const dateNumber = document.createElement('div');
                dateNumber.className = 'date-number';
                dateNumber.textContent = dayNumber;
                dayElement.appendChild(dateNumber);
                
                // 內容區域
                const dayContent = document.createElement('div');
                dayContent.className = 'day-content';
                
                // 排班標籤
                const weekData = monthData[week] || {};
                const staff = weekData[dayNumber];
                
                if (staff && !isLeaveDay(currentMonth, week, dayNumber)) {
                    const shiftTag = createShiftTag(staff, currentMonth, week, dayNumber);
                    dayContent.appendChild(shiftTag);
                }
                
                // 請假標籤
                if (isLeaveDay(currentMonth, week, dayNumber)) {
                    const leaveTag = document.createElement('div');
                    leaveTag.className = 'shift-tag leave';
                    leaveTag.textContent = '請假';
                    dayContent.appendChild(leaveTag);
                }
                
                dayElement.appendChild(dayContent);
                
                // 請假按鈕
                if (!isThursday) {
                    const leaveBtn = document.createElement('button');
                    leaveBtn.className = 'leave-btn';
                    leaveBtn.textContent = '請假';
                    leaveBtn.onclick = () => toggleLeave(currentMonth, week, dayNumber);
                    dayElement.appendChild(leaveBtn);
                }
                
                // 拖曳事件
                setupDragAndDrop(dayElement, currentMonth, week, dayNumber);
            }
            
            monthCalendar.appendChild(dayElement);
        }
    }
}

// 渲染週檢視
function renderWeekView() {
    weekCalendar.innerHTML = '';
    
    const year = 2025;
    const monthData = scheduleData[currentMonth] || {};
    const weekData = monthData[currentWeek] || {};
    
    // 人員列
    Object.values(STAFF).forEach(staff => {
        const personElement = document.createElement('div');
        personElement.className = 'week-person';
        personElement.textContent = staff.name;
        weekCalendar.appendChild(personElement);
        
        // 每天的格子
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'week-day';
            
            const firstDay = new Date(year, currentMonth - 1, 1).getDay();
            const dayNumber = (currentWeek - 1) * 7 + dayOfWeek - firstDay + 1;
            
            if (dayNumber < 1 || dayNumber > new Date(year, currentMonth, 0).getDate()) {
                dayElement.classList.add('empty');
            } else {
                const date = new Date(year, currentMonth - 1, dayNumber);
                const isThursday = date.getDay() === 4;
                
                if (isThursday) {
                    dayElement.classList.add('thursday');
                }
                
                // 檢查是否有排班
                const assignedStaff = weekData[dayNumber];
                const isLeave = isLeaveDay(currentMonth, currentWeek, dayNumber);
                
                if (assignedStaff === staff.color && !isLeave) {
                    const shiftTag = createWeekShiftTag(staff.color, currentMonth, currentWeek, dayNumber);
                    dayElement.appendChild(shiftTag);
                } else if (isLeave) {
                    const leaveTag = document.createElement('div');
                    leaveTag.className = 'week-shift-tag leave';
                    leaveTag.textContent = '請假';
                    dayElement.appendChild(leaveTag);
                }
                
                // 請假按鈕
                if (!isThursday) {
                    const leaveBtn = document.createElement('button');
                    leaveBtn.className = 'week-leave-btn';
                    leaveBtn.textContent = '請假';
                    leaveBtn.onclick = () => toggleLeave(currentMonth, currentWeek, dayNumber);
                    dayElement.appendChild(leaveBtn);
                }
                
                // 拖曳事件
                setupWeekDragAndDrop(dayElement, currentMonth, currentWeek, dayNumber, staff.color);
            }
            
            weekCalendar.appendChild(dayElement);
        }
    });
}

// 建立排班標籤
function createShiftTag(staffColor, month, week, day) {
    const tag = document.createElement('div');
    tag.className = `shift-tag ${staffColor}`;
    tag.textContent = `${STAFF[staffColor.toUpperCase()].name} 駐點`;
    tag.draggable = true;
    
    // 早會標示
    const date = new Date(2025, month - 1, day);
    if ([1, 5].includes(date.getDay()) && staffColor === 'yang') {
        const meetingNote = document.createElement('div');
        meetingNote.className = 'meeting-note';
        meetingNote.textContent = '早會後';
        tag.appendChild(meetingNote);
    }
    
    // 拖曳事件
    tag.addEventListener('dragstart', (e) => {
        draggedElement = { staff: staffColor, month, week, day };
        tag.classList.add('dragging');
    });
    
    tag.addEventListener('dragend', () => {
        tag.classList.remove('dragging');
        draggedElement = null;
    });
    
    return tag;
}

// 建立週檢視排班標籤
function createWeekShiftTag(staffColor, month, week, day) {
    const tag = document.createElement('div');
    tag.className = `week-shift-tag ${staffColor}`;
    tag.textContent = '駐點';
    tag.draggable = true;
    
    // 拖曳事件
    tag.addEventListener('dragstart', (e) => {
        draggedElement = { staff: staffColor, month, week, day };
        tag.classList.add('dragging');
    });
    
    tag.addEventListener('dragend', () => {
        tag.classList.remove('dragging');
        draggedElement = null;
    });
    
    return tag;
}

// 設定拖曳功能
function setupDragAndDrop(element, month, week, day) {
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (draggedElement && canAssignStaff(draggedElement.staff, month, week, day)) {
            element.classList.add('drop-zone');
        } else {
            element.classList.add('drop-zone', 'invalid');
        }
    });
    
    element.addEventListener('dragleave', () => {
        element.classList.remove('drop-zone', 'invalid');
    });
    
    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('drop-zone', 'invalid');
        
        if (draggedElement && canAssignStaff(draggedElement.staff, month, week, day)) {
            moveShift(draggedElement, month, week, day);
        } else if (draggedElement) {
            showNotification('此安排違反排班規則', 'error');
        }
    });
}

// 設定週檢視拖曳功能
function setupWeekDragAndDrop(element, month, week, day, targetStaff) {
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (draggedElement && canAssignStaff(draggedElement.staff, month, week, day)) {
            element.classList.add('drop-zone');
        } else {
            element.classList.add('drop-zone', 'invalid');
        }
    });
    
    element.addEventListener('dragleave', () => {
        element.classList.remove('drop-zone', 'invalid');
    });
    
    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('drop-zone', 'invalid');
        
        if (draggedElement && canAssignStaff(draggedElement.staff, month, week, day)) {
            moveShift(draggedElement, month, week, day);
        } else if (draggedElement) {
            showNotification('此安排違反排班規則', 'error');
        }
    });
}

// 檢查是否可以安排人員
function canAssignStaff(staff, month, week, day) {
    const date = new Date(2025, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // 週四不可排班
    if (dayOfWeek === 4) return false;
    
    // 請假日不可排班
    if (isLeaveDay(month, week, day)) return false;
    
    // 週一、週二、週五：僅限楊茗傑
    if ([1, 2, 5].includes(dayOfWeek)) {
        return staff === 'yang';
    }
    
    // 週三：僅限黃詩晴或副店
    if (dayOfWeek === 3) {
        return staff === 'huang' || staff === 'deputy';
    }
    
    // 週末：僅限黃詩晴或副店
    if ([0, 6].includes(dayOfWeek)) {
        return staff === 'huang' || staff === 'deputy';
    }
    
    return false;
}

// 移動排班
function moveShift(from, toMonth, toWeek, toDay) {
    // 移除原排班
    if (scheduleData[from.month] && scheduleData[from.month][from.week]) {
        delete scheduleData[from.month][from.week][from.day];
    }
    
    // 新增新排班
    if (!scheduleData[toMonth]) scheduleData[toMonth] = {};
    if (!scheduleData[toMonth][toWeek]) scheduleData[toMonth][toWeek] = {};
    scheduleData[toMonth][toWeek][toDay] = from.staff;
    
    // 重新渲染
    renderMonthView();
    renderWeekView();
    saveData();
    
    showNotification('排班已更新', 'success');
}

// 切換請假狀態
function toggleLeave(month, week, day) {
    const leaveKey = `${month}-${week}-${day}`;
    
    if (leaveData[leaveKey]) {
        delete leaveData[leaveKey];
        showNotification('已取消請假', 'success');
    } else {
        leaveData[leaveKey] = true;
        showNotification('已標記請假', 'success');
    }
    
    // 移除該日的排班
    if (scheduleData[month] && scheduleData[month][week]) {
        delete scheduleData[month][week][day];
    }
    
    renderMonthView();
    renderWeekView();
    saveData();
}

// 檢查是否為請假日
function isLeaveDay(month, week, day) {
    const leaveKey = `${month}-${week}-${day}`;
    return leaveData[leaveKey] || false;
}

// 顯示通知
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 自動儲存功能
setInterval(() => {
    if (Object.keys(scheduleData).length > 0 || Object.keys(leaveData).length > 0) {
        saveData();
    }
}, 30000); // 每30秒自動儲存 