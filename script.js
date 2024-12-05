// 定义真心话和大冒险的问题列表
const questions = {
    truth: [
        "你的初恋是谁？",
        "你最后一次说谎是什么时候？",
        "你最尴尬的经历是什么？",
        "你暗恋过谁？",
        "你做过最疯狂的事是什么？",
        "你的手机里最不想被别人看到的是什么？",
        "你有什么特别的癖好？"
    ],
    dare: [
        "模仿一个在场的人的说话方式",
        "给一个陌生人打电话说我爱你",
        "做一个大家指定的鬼脸",
        "唱一首歌",
        "跳一段舞",
        "学狗叫三声",
        "向在场的异性说一句土味情话"
    ]
};

// 获取DOM元素
const slotRoll = document.getElementById('slotRoll');
const result = document.getElementById('result');
const truthBtn = document.getElementById('truthBtn');
const dareBtn = document.getElementById('dareBtn');
let selectedType = null;

// 添加编辑功能
function makeEditable(div) {
    const content = div.querySelector('.content');
    const type = div.getAttribute('data-type');
    
    div.addEventListener('click', () => {
        // 如果正在抽奖中，不允许编辑
        if (truthBtn.disabled || dareBtn.disabled) return;
        
        const oldText = content.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = oldText;
        input.className = 'edit-input';
        input.style.width = '90%';
        input.style.height = '80%';
        input.style.padding = '5px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '5px';
        input.style.fontSize = '13px';
        input.style.textAlign = 'center';
        
        // 替换内容为输入框
        content.textContent = '';
        content.appendChild(input);
        input.focus();
        
        // 处理输入完成
        function handleComplete() {
            const newText = input.value.trim();
            if (newText && newText !== oldText) {
                content.textContent = newText;
                // 更新questions数组中的内容
                const index = Array.from(document.querySelectorAll(`.slot-item[data-type="${type}"]`))
                    .indexOf(div);
                if (type === 'truth') {
                    questions.truth[index] = newText;
                } else {
                    questions.dare[index] = newText;
                }
            } else {
                content.textContent = oldText;
            }
        }
        
        // 添加事件监听
        input.addEventListener('blur', handleComplete);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleComplete();
                input.blur();
            }
        });
    });
}

// 初始化槽机
function initSlotMachine() {
    // 创建交替排列的问题数组
    const allQuestions = [];
    const maxLength = Math.max(questions.truth.length, questions.dare.length);
    
    for (let i = 0; i < maxLength; i++) {
        if (questions.truth[i]) {
            allQuestions.push({text: questions.truth[i], type: 'truth'});
        }
        if (questions.dare[i]) {
            allQuestions.push({text: questions.dare[i], type: 'dare'});
        }
    }
    
    // 创建卡片
    allQuestions.forEach(question => {
        const div = document.createElement('div');
        div.className = 'slot-item';
        div.setAttribute('data-type', question.type);
        
        const content = document.createElement('div');
        content.className = 'content';
        content.textContent = question.text;
            
        div.appendChild(content);
        slotRoll.appendChild(div);
        
        // 添加编辑功能
        makeEditable(div);
    });
}

// 开始游戏
function startGame() {
    if (!selectedType) return;
    
    // 禁用按钮
    truthBtn.disabled = true;
    dareBtn.disabled = true;
    
    const items = document.querySelectorAll(`.slot-item[data-type="${selectedType}"]`);
    const itemsArray = Array.from(items);
    let currentIndex = 0;
    const finalIndex = Math.floor(Math.random() * itemsArray.length);
    
    // 移除所有高亮，并添加暗淡效果
    document.querySelectorAll('.slot-item').forEach(item => {
        item.classList.remove('highlight-yellow');
        if (item.getAttribute('data-type') !== selectedType) {
            item.style.opacity = '0.3';
        }
    });
    
    let speed = 300;
    let duration = 0;
    const totalDuration = 6000;
    let acceleration = 1.08;
    let isLastRound = false;
    
    // 闪烁动画
    const flickerInterval = setInterval(() => {
        itemsArray.forEach(item => {
            item.classList.remove('highlight-yellow');
        });
        itemsArray[currentIndex].classList.add('highlight-yellow');
        
        // 检查是否接近最终位置
        if (isLastRound && currentIndex === finalIndex) {
            clearInterval(flickerInterval);
            
            // 确保最终位置的高亮
            itemsArray.forEach(item => {
                item.classList.remove('highlight-yellow');
            });
            itemsArray[finalIndex].classList.add('highlight-yellow');
            
            // 重置状态
            truthBtn.disabled = false;
            dareBtn.disabled = false;
            document.querySelectorAll('.slot-item').forEach(item => {
                item.style.opacity = '1';
            });
            return;
        }
        
        currentIndex = (currentIndex + 1) % itemsArray.length;
        duration += speed;

        // 分阶段减速
        if (duration < totalDuration * 0.4) {
            speed = 300;
        } else if (duration < totalDuration * 0.7) {
            speed *= acceleration;
        } else {
            speed *= acceleration * 1.1;
            // 标记最后一轮
            if (speed >= 1500) {
                isLastRound = true;
            }
        }

        // 限制速度范围
        speed = Math.min(Math.max(speed, 300), 2000);
        
    }, speed);
}

// 添加选择按钮事件处理
function handleChoice(type) {
    if (truthBtn.disabled || dareBtn.disabled) return; // 如果正在抽奖中，不响应点击
    
    selectedType = type;
    startGame(); // 直接开始游戏
    
    // 更新按钮状态
    truthBtn.classList.toggle('active', type === 'truth');
    dareBtn.classList.toggle('active', type === 'dare');
}

// 添加按钮事件监听
truthBtn.addEventListener('click', () => handleChoice('truth'));
dareBtn.addEventListener('click', () => handleChoice('dare'));

// 初始化
initSlotMachine();