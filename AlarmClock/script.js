let batteryLevel = 100;
let alarms = [];
let isCharging = false;
let batteryInterval = null;
let currentAudio = null;

const moodSounds = {
    energetic: [
        'sounds/energetic/WakeMeUp.mp3',
        'sounds/energetic/CantStopTheFeeling.mp3',
        'sounds/energetic/Stronger.mp3'
    ],
    calm: [
        'sounds/calm/MendelssohnViolinConcerto.mp3',
        'sounds/calm/BrahmsHungarianDance.mp3',
        'sounds/calm/SchubertAveMaria.mp3'
    ],
    focused: [
        'sounds/focused/TheXXIntro.mp3',
        'sounds/focused/DayDreaming.mp3',
        'sounds/focused/ComptineDunAutreEte.mp3'
    ],
    happy: [
        'sounds/happy/IJustHadSex.mp3',
        'sounds/happy/NeverGonnaGiveYouUp.mp3',
        'sounds/happy/GiornoTheme.mp3'
    ]
};

function updateBattery() {
    batteryLevel = Math.max(0, batteryLevel - 1);
    document.getElementById('battery-level').textContent = batteryLevel;
    
    const clockElement = document.getElementById('clock');
    
    if (batteryLevel === 0) {
        clockElement.classList.add('hidden-time');
    } else {
        clockElement.classList.remove('hidden-time');
    }
}

function updateClock() {
    const now = new Date();
    
    // 날짜 및 시간 포맷팅
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    document.getElementById('clock').textContent = timeString;
    checkAlarms(now);
}

function addAlarm() {
    if (alarms.length >= 3) {
        alert('최대 3개의 알람만 설정할 수 있습니다.');
        return;
    }

    const hour = document.getElementById('hour').value;
    const minute = document.getElementById('minute').value;
    const second = document.getElementById('second').value;
    const mood = document.getElementById('mood').value;
    const soundIndex = document.getElementById('sound-select').value;

    if (!hour || !minute || !second || !mood) {
        alert('시간과 기분을 모두 선택해주세요.');
        return;
    }

    const alarmTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;
    alarms.push({
        time: alarmTime,
        mood: mood,
        soundIndex: soundIndex,
        active: true
    });
    
    updateAlarmList();
}

function updateSoundOptions() {
    const mood = document.getElementById('mood').value;
    const soundSelect = document.getElementById('sound-select');
    soundSelect.innerHTML = '';
    
    if (mood) {
        moodSounds[mood].forEach((sound, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `알람 ${index + 1}`;
            soundSelect.appendChild(option);
        });
        soundSelect.disabled = false;
    } else {
        soundSelect.disabled = true;
    }
}

function updateAlarmList() {
    const alarmList = document.getElementById('alarm-list');
    alarmList.innerHTML = '';
    
    alarms.forEach((alarm, index) => {
        const alarmDiv = document.createElement('div');
        alarmDiv.className = `alarm-item theme-${alarm.mood}`;
        alarmDiv.innerHTML = `
            <div class="alarm-info">
                <span>알람 ${index + 1}: ${alarm.time}</span>
                <span>(${getMoodText(alarm.mood)} - 소리 ${Number(alarm.soundIndex) + 1})</span>
            </div>
            <div class="alarm-controls">
                <button onclick="previewSound(${index})">미리듣기</button>
                <button onclick="deleteAlarm(${index})">삭제</button>
            </div>
        `;
        alarmList.appendChild(alarmDiv);
    });
}

function previewSound(alarmIndex) {
    const alarm = alarms[alarmIndex];
    const previewButton = event.target;
    
    if (currentAudio && currentAudio.paused === false) {
        // 재생 중이면 중지
        currentAudio.pause();
        currentAudio.currentTime = 0;
        previewButton.textContent = "미리듣기";
    } else {
        // 재생 시작
        playAlarm(alarm.mood, alarm.soundIndex, true);
        previewButton.textContent = "중지";
    }
}

function deleteAlarm(index) {
    // 삭제 시 재생 중인 알람 중지
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    alarms.splice(index, 1);
    updateAlarmList();
}

function getMoodText(mood) {
    const moodTexts = {
        energetic: '활기차게 시작',
        calm: '부드럽게 일어나기',
        focused: '집중하며 시작',
        happy: '즐겁게 시작'
    };
    return moodTexts[mood] || mood;
}

function checkAlarms(now) {
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    alarms.forEach(alarm => {
        if (alarm.active && alarm.time === currentTime) {
            playAlarm(alarm.mood, alarm.soundIndex);
            applyMoodTheme(alarm.mood);
        }
    });
}

function playAlarm(mood, soundIndex, isPreview = false) {
    // 이전 재생 중인 알람이 있다면 중지
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const audio = document.getElementById('alarm-sound');
    audio.src = moodSounds[mood][soundIndex];
    audio.play();
    currentAudio = audio;

    // 미리듣기가 아닌 실제 알람일 경우 알람 팝업 표시
    if (!isPreview) {
        showAlarmPopup(mood);
    }
}

function applyMoodTheme(mood) {
    document.body.className = `theme-${mood}`;
}

function startBatteryDecrease() {
    if (batteryInterval) {
        clearInterval(batteryInterval);
    }
    
    batteryInterval = setInterval(updateBattery, 1000);
}

function stopBatteryDecrease() {
    if (batteryInterval) {
        clearInterval(batteryInterval);
        batteryInterval = null;
    }
}

function startCharging() {
    if (isCharging || batteryLevel >= 100) return;
    
    isCharging = true;
    stopBatteryDecrease();
    
    const charger = document.getElementById('charger');
    const batteryDiv = document.querySelector('.battery');
    const clockElement = document.getElementById('clock');
    
    charger.classList.add('charging');
    batteryDiv.classList.add('charging');
    
    const chargeInterval = setInterval(() => {
        if (batteryLevel < 100) {
            batteryLevel = Math.min(100, batteryLevel + 1);
            document.getElementById('battery-level').textContent = batteryLevel;
            
            if (batteryLevel > 0) {
                clockElement.classList.remove('hidden-time');
            }
        } else {
            clearInterval(chargeInterval);
            finishCharging();
        }
    }, 200);
}

function finishCharging() {
    const charger = document.getElementById('charger');
    const batteryDiv = document.querySelector('.battery');
    
    setTimeout(() => {
        const message = document.createElement('div');
        message.className = 'charge-message';
        message.textContent = '충전 완료!';
        document.body.appendChild(message);
        
        setTimeout(() => {
            charger.classList.remove('charging');
            charger.classList.add('leaving');
            batteryDiv.classList.remove('charging');
            
            setTimeout(() => {
                message.remove();
                charger.classList.remove('leaving');
                isCharging = false;
                
                setTimeout(() => {
                    startBatteryDecrease();
                }, 500);
            }, 2000);
        }, 3000);
    }, 3000);
}

function showAlarmPopup(mood) {
    const popup = document.createElement('div');
    popup.className = `alarm-popup theme-${mood}`;
    popup.innerHTML = `
        <div class="alarm-popup-content">
            <h2>알람</h2>
            <p>${getMoodText(mood)} 시간입니다!</p>
            <button onclick="stopAlarm(this)">알람 끄기</button>
        </div>
    `;
    document.body.appendChild(popup);
}

function stopAlarm(button) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    // 팝업 제거
    const popup = button.closest('.alarm-popup');
    popup.remove();
}

document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    startBatteryDecrease();
});

setInterval(updateClock, 1000); 