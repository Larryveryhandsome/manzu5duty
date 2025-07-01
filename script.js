// Firebase 設定
const firebaseConfig = {
    apiKey: "AIzaSyDz8QA9Nzgw2V4bt4Oalbv-gbyTKlhezqA",
    authDomain: "manzu5duty.firebaseapp.com",
    projectId: "manzu5duty",
    storageBucket: "manzu5duty.firebasestorage.app",
    messagingSenderId: "876876859201",
    appId: "1:876876859201:web:9396565935719a8d7083c0",
    measurementId: "G-MXZW6XLB5Q"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

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
const nextWeekBtn = document.getElementById('nextWeekBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

// 事件監聽器
document.addEventListener('DOMContentLoaded', initializeApp);
monthViewBtn.addEventListener('click', () => switchView('month'));
weekViewBtn.addEventListener('click', () => switchView('week'));
monthSelector.addEventListener('change', handleMonthChange);
weekSelector.addEventListener('change', handleWeekChange);
nextWeekBtn.addEventListener('click', handleNextWeek);
nextMonthBtn.addEventListener('click', handleNextMonth);

// 初始化應用程式
async function initializeApp() {
    try {
        await loadData();
        console.log('載入的 scheduleData:', scheduleData);
        // 只有在 Firestore 沒有任何資料時才產生預設排班
        if (Object.keys(scheduleData).length === 0) {
            generateInitialSchedule();
            await saveData(); // 產生後直接存回 Firestore
        }
        renderMonthView();
        renderWeekView();
        setupWeekSelector();
        showNotification('排班表載入完成', 'success');
    } catch (error) {
        console.error('初始化失敗:', error);
        showNotification('載入失敗，請重新整理頁面', 'error');
    }
}

// 將 Firestore scheduleData 的 key 轉為數字
function normalizeScheduleData(data) {
    const result = {};
    for (const month in data) {
        result[parseInt(month)] = {};
        for (const week in data[month]) {
            result[parseInt(month)][parseInt(week)] = {};
            for (const day in data[month][week]) {
                result[parseInt(month)][parseInt(week)][parseInt(day)] = data[month][week][day];
            }
        }
    }
    return result;
}

// 載入資料
async function loadData() {
    try {
        const scheduleDoc = await db.collection('schedules').doc('2025').get();
        const leaveDoc = await db.collection('leaves').doc('2025').get();
        
        scheduleData = scheduleDoc.exists ? scheduleDoc.data() : {};
        leaveData = leaveDoc.exists ? leaveDoc.data() : {};
        // 新增：將 key 轉為數字
        scheduleData = normalizeScheduleData(scheduleData);
        leaveData = normalizeScheduleData(leaveData);
    } catch (error) {
        console.error('載入資料失敗:', error);
        scheduleData = {};
        leaveData = {};
    }
}

// 儲存資料
async function saveData() {
    try {
        await db.collection('schedules').doc('2025').set(scheduleData);
        await db.collection('leaves').doc('2025').set(leaveData);
    } catch (error) {
        console.error('儲存資料失敗:', error);
        showNotification('儲存失敗，請檢查網路連線', 'error');
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
    let wednesdayCounter = 0;
    let weekendStart = (month % 2 === 0) ? 1 : 0;
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const weekOfMonth = Math.ceil((day + firstDay - 1) / 7);
        if (!schedule[weekOfMonth]) schedule[weekOfMonth] = {};
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
        // 週六/週日：一週內不重複，且週與週公平交錯
        else if (dayOfWeek === 6) {
            schedule[weekOfMonth][day] = (weekOfMonth + weekendStart) % 2 === 1 ? 'huang' : 'deputy';
        } else if (dayOfWeek === 0) {
            schedule[weekOfMonth][day] = (weekOfMonth + weekendStart) % 2 === 0 ? 'huang' : 'deputy';
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
        nextWeekBtn.style.display = 'none';
        nextMonthBtn.style.display = 'inline-block';
        updateNextMonthBtnState();
    } else {
        weekViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        weekViewContainer.classList.add('active');
        monthViewContainer.classList.remove('active');
        weekSelector.style.display = 'block';
        monthSelector.style.display = 'block';
        nextWeekBtn.style.display = 'inline-block';
        nextMonthBtn.style.display = 'none';
        updateNextWeekBtnState();
    }
}

// 處理月份變更
function handleMonthChange() {
    currentMonth = parseInt(monthSelector.value);
    renderMonthView();
    renderWeekView();
    setupWeekSelector();
    updateNextMonthBtnState();
}

// 處理週次變更
function handleWeekChange() {
    currentWeek = parseInt(weekSelector.value);
    renderWeekView();
    updateNextWeekBtnState();
}

// 設定週次選擇器
function setupWeekSelector() {
    weekSelector.innerHTML = '';
    // 以週一為起點，計算本月所有週（含跨月）
    const year = 2025;
    const firstDayOfMonth = new Date(year, currentMonth - 1, 1);
    // 找到本月第一天所屬週的週一
    let firstMonday = new Date(firstDayOfMonth);
    firstMonday.setDate(firstMonday.getDate() - ((firstMonday.getDay() + 6) % 7));
    // 找到本月最後一天所屬週的週日
    const lastDayOfMonth = new Date(year, currentMonth, 0);
    let lastSunday = new Date(lastDayOfMonth);
    lastSunday.setDate(lastSunday.getDate() + (7 - lastSunday.getDay()) % 7);
    // 產生所有週的起始日期（週一）
    let weekStart = new Date(firstMonday);
    let weekList = [];
    while (weekStart <= lastSunday) {
        weekList.push(new Date(weekStart));
        weekStart.setDate(weekStart.getDate() + 7);
    }
    weekList.forEach((monday, idx) => {
        const option = document.createElement('option');
        // 顯示範例：第1週 (7/28~8/3)
        let weekDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(d.getDate() + i);
            weekDates.push(`${d.getMonth() + 1}/${d.getDate()}`);
        }
        option.value = idx;
        option.textContent = `第${idx + 1}週 (${weekDates[0]}~${weekDates[6]})`;
        weekSelector.appendChild(option);
    });
    if (weekList.length > 0) {
        currentWeek = 0;
        weekSelector.value = currentWeek;
    }
    // 存下週一清單供 renderWeekView 用
    window._weekList = weekList;
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
                
                // 新增排班按鈕（僅空白且可排班且未請假且非週四）
                if (!staff && !isLeaveDay(currentMonth, week, dayNumber) && !isThursday) {
                    const canChoose = getAvailableStaffForDay(currentMonth, week, dayNumber);
                    if (canChoose.length > 0) {
                        const addBtn = document.createElement('button');
                        addBtn.className = 'add-shift-btn';
                        addBtn.textContent = '＋';
                        addBtn.onclick = (e) => {
                            e.stopPropagation();
                            showStaffSelectMenu(addBtn, canChoose, (selected) => {
                                addShift(currentMonth, week, dayNumber, selected);
                            });
                        };
                        dayContent.appendChild(addBtn);
                    }
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
    // 取得本月所有週的週一清單
    const weekList = window._weekList || [];
    const monday = weekList[currentWeek];
    if (!monday) return;
    // 產生本週週一~週日的日期物件
    let weekDates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        weekDates.push(d);
    }
    // 第一行：日期
    const dateRow = [
        '<div class="person-header">人員</div>',
        ...weekDates.map(d => `<div class="day-header${d.getMonth() + 1 !== currentMonth ? ' out-month' : ''}">${d.getMonth() + 1}/${d.getDate()}</div>`)
    ];
    weekCalendar.innerHTML += dateRow.join('');
    // 第二行：星期
    const weekRow = [
        '<div class="person-header"></div>',
        ...weekDates.map(d => `<div class="day-header">${['週一','週二','週三','週四','週五','週六','週日'][d.getDay() === 0 ? 6 : d.getDay() - 1]}</div>`)
    ];
    weekCalendar.innerHTML += weekRow.join('');
    // 產生每一行人員資料
    Object.values(STAFF).forEach(staff => {
        weekCalendar.innerHTML += `<div class="week-person">${staff.name}</div>`;
        for (let i = 0; i < 7; i++) {
            const d = weekDates[i];
            let cellHtml = '';
            let cellClass = 'week-day';
            const thisMonth = d.getMonth() + 1;
            if (thisMonth !== currentMonth) cellClass += ' out-month';
            if (d.getDay() === 4) cellClass += ' thursday';
            // 取得正確月份的資料
            const monthData = scheduleData[thisMonth] || {};
            const weekOfMonth = Object.keys(monthData).find(w => monthData[w][d.getDate()] !== undefined);
            const assignedStaff = weekOfMonth ? monthData[weekOfMonth][d.getDate()] : undefined;
            const isLeave = isLeaveDay(thisMonth, weekOfMonth, d.getDate());
            cellHtml = `<div class="${cellClass}">`;
            if (assignedStaff === staff.color && !isLeave) {
                cellHtml += createWeekShiftTagHtml(staff.color);
            } else if (isLeave) {
                cellHtml += '<div class="week-shift-tag leave">請假</div>';
            }
            // 新增排班按鈕（只在本月可互動，跨月僅顯示資料）
            if (!assignedStaff && !isLeave && d.getDay() !== 4 && thisMonth === currentMonth) {
                const canChoose = getAvailableStaffForDay(thisMonth, weekOfMonth, d.getDate());
                if (canChoose.includes(staff.color)) {
                    cellHtml += `<button class="add-shift-btn" onclick="window._addShiftBtn && window._addShiftBtn('${thisMonth}', '${weekOfMonth}', '${d.getDate()}', '${staff.color}', this)">＋</button>`;
                }
            }
            // 請假按鈕（只在本月可互動）
            if (d.getDay() !== 4 && thisMonth === currentMonth) {
                cellHtml += `<button class="week-leave-btn" onclick="window._leaveBtn && window._leaveBtn('${thisMonth}', '${weekOfMonth}', '${d.getDate()}')">請假</button>`;
            }
            cellHtml += '</div>';
            weekCalendar.innerHTML += cellHtml;
        }
    });
}

// 輔助函式：產生週檢視 shift tag 的 HTML
function createWeekShiftTagHtml(staffColor) {
    return `<div class="week-shift-tag ${staffColor}">駐點</div>`;
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

// 新增輔助函式
function getAvailableStaffForDay(month, week, day) {
    const date = new Date(2025, month - 1, day);
    const dayOfWeek = date.getDay();
    // 週四不可排班
    if (dayOfWeek === 4) return [];
    // 請假不可排班
    if (isLeaveDay(month, week, day)) return [];
    // 週一、週二、週五：僅限楊茗傑
    if ([1, 2, 5].includes(dayOfWeek)) return ['yang'];
    // 週三：僅限黃詩晴、副店
    if (dayOfWeek === 3) return ['huang', 'deputy'];
    // 週末：僅限黃詩晴、副店
    if ([0, 6].includes(dayOfWeek)) return ['huang', 'deputy'];
    return [];
}

function showStaffSelectMenu(anchor, staffList, onSelect) {
    // 移除舊選單
    document.querySelectorAll('.staff-select-menu').forEach(e => e.remove());
    const menu = document.createElement('div');
    menu.className = 'staff-select-menu';
    staffList.forEach(staffKey => {
        const btn = document.createElement('button');
        btn.className = `staff-option ${staffKey}`;
        btn.textContent = STAFF[staffKey.toUpperCase()].name;
        btn.onclick = (e) => {
            e.stopPropagation();
            menu.remove();
            onSelect(staffKey);
        };
        menu.appendChild(btn);
    });
    document.body.appendChild(menu);
    // 定位到按鈕下方
    const rect = anchor.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.left = rect.left + 'px';
    menu.style.top = (rect.bottom + 4) + 'px';
    setTimeout(() => {
        document.addEventListener('click', function handler() {
            menu.remove();
            document.removeEventListener('click', handler);
        });
    }, 10);
}

function addShift(month, week, day, staffKey) {
    if (!scheduleData[month]) scheduleData[month] = {};
    if (!scheduleData[month][week]) scheduleData[month][week] = {};
    scheduleData[month][week][day] = staffKey;
    renderMonthView();
    renderWeekView();
    saveData();
    showNotification('已新增排班', 'success');
}

// 在 window 掛載 addShiftBtn 與 leaveBtn 以支援 inline onclick
window._addShiftBtn = function(month, week, day, staff, btn) {
    showStaffSelectMenu(btn, [staff], (selected) => {
        addShift(Number(month), Number(week), Number(day), selected);
    });
};
window._leaveBtn = function(month, week, day) {
    toggleLeave(Number(month), Number(week), Number(day));
};

// 自動補齊所有月份的排班（不覆蓋已排班或請假）
async function fillAllSchedules() {
    const months = [7, 8, 9, 10, 11, 12];
    for (const month of months) {
        const year = 2025;
        const daysInMonth = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month - 1, 1).getDay();
        if (!scheduleData[month]) scheduleData[month] = {};
        let wednesdayCounter = 0;
        let weekendStart = (month % 2 === 0) ? 1 : 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            const weekOfMonth = Math.ceil((day + firstDay - 1) / 7);
            if (!scheduleData[month][weekOfMonth]) scheduleData[month][weekOfMonth] = {};
            // 已有排班或請假不覆蓋
            if (typeof scheduleData[month][weekOfMonth][day] !== 'undefined' || isLeaveDay(month, weekOfMonth, day)) continue;
            // 週四固定休假
            if (dayOfWeek === 4) {
                scheduleData[month][weekOfMonth][day] = null;
                continue;
            }
            // 週一、週二、週五：僅安排楊茗傑
            if ([1, 2, 5].includes(dayOfWeek)) {
                scheduleData[month][weekOfMonth][day] = 'yang';
            }
            // 週三：黃詩晴與副店輪流
            else if (dayOfWeek === 3) {
                wednesdayCounter++;
                scheduleData[month][weekOfMonth][day] = wednesdayCounter % 2 === 1 ? 'huang' : 'deputy';
            }
            // 週六/週日：一週內不重複，且週與週公平交錯
            else if (dayOfWeek === 6) {
                scheduleData[month][weekOfMonth][day] = (weekOfMonth + weekendStart) % 2 === 1 ? 'huang' : 'deputy';
            } else if (dayOfWeek === 0) {
                scheduleData[month][weekOfMonth][day] = (weekOfMonth + weekendStart) % 2 === 0 ? 'huang' : 'deputy';
            }
        }
    }
    renderMonthView();
    renderWeekView();
    await saveData();
    showNotification('所有班表已自動排滿', 'success');
}

function handleNextWeek() {
    const year = 2025;
    const weekList = window._weekList || [];
    const currentIdx = currentWeek;
    // 取得本週的最後一天（週日）
    const thisWeekEnd = new Date(weekList[currentIdx]);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
    // 如果本週週日已經是本月最後一天或之後，則切到下個月
    const lastDayOfMonth = new Date(year, currentMonth, 0);
    if (thisWeekEnd >= lastDayOfMonth && currentMonth < 12) {
        currentMonth += 1;
        monthSelector.value = currentMonth;
        setupWeekSelector();
        currentWeek = 0;
        weekSelector.value = currentWeek;
        renderWeekView();
        updateNextWeekBtnState();
    } else if (currentIdx < weekList.length - 1) {
        // 本月還有下一週
        currentWeek = currentIdx + 1;
        weekSelector.value = currentWeek;
        renderWeekView();
        updateNextWeekBtnState();
    } else {
        // 已是12月最後一週，不再往下切
        updateNextWeekBtnState();
    }
}

function updateNextWeekBtnState() {
    const year = 2025;
    const weekList = window._weekList || [];
    const currentIdx = currentWeek;
    if (!weekList.length) {
        nextWeekBtn.disabled = true;
        return;
    }
    // 取得本週的最後一天（週日）
    const thisWeekEnd = new Date(weekList[currentIdx]);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);
    const lastDayOfMonth = new Date(year, currentMonth, 0);
    // 如果已是12月最後一週，且週日>=12/31，才 disable
    if (currentMonth === 12 && thisWeekEnd >= lastDayOfMonth) {
        nextWeekBtn.disabled = true;
    } else {
        nextWeekBtn.disabled = false;
    }
}

function handleNextMonth() {
    if (currentMonth < 12) {
        currentMonth += 1;
        monthSelector.value = currentMonth;
        renderMonthView();
        renderWeekView();
        setupWeekSelector();
        updateNextMonthBtnState();
    }
}

function updateNextMonthBtnState() {
    nextMonthBtn.disabled = (currentMonth === 12);
}