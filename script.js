// 全局变量
let mailImages = {};
let giftImages = {};

// 初始化函数
window.addEventListener('DOMContentLoaded', () => {

    // 加载默认资源 - 使用您提供的目录结构
    loadDefaultImages();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 初始渲染
    updatePreview();

    // 监听署名左对齐勾选框，切换预览区署名对齐方式
    const alignCheckbox = document.getElementById('signature-align-left');
    if (alignCheckbox) {
        alignCheckbox.addEventListener('change', function() {
            updatePreview();
        });
    }
});

// 加载默认信纸和礼物 - 使用您提供的目录结构
function loadDefaultImages() {
    // 信纸图片
    const mailFiles = [
        'joja_horizontal.png', 'joja_vertical.png', 'krobus_vertical.png',
        'regular_horizontal.png', 'regular_vertical.png', 'sandy_horizontal.png',
        'sandy_vertical.png', 'wizard_vertical.png'
    ];
    
    // 礼物图标
    const giftFiles = [
        'cake.png', 'gift.png', 'gold.png', 'reel.png', 'star_fruit.png', 'ticket.png'
    ];
    
    // 添加信纸
    mailFiles.forEach(file => {
        const key = file.replace('.png', '');
        mailImages[key] = {
            name: file.replace('_', ' ').replace('.png', ''),
            path: `assets/mail_img/${file}`
        };
    });
    
    // 添加礼物
    giftFiles.forEach(file => {
        const key = file.replace('.png', '');
        giftImages[key] = {
            name: file.replace('.png', ''),
            path: `assets/gift_img/${file}`
        };
    });
    
    // 添加"无"选项
    giftImages['none'] = {
        name: '无',
        path: null
    };
    
    // 填充下拉菜单
    populateImageSelectors();
}

// 填充下拉菜单
function populateImageSelectors() {
    const mailSelect = document.getElementById('mail-img');
    const giftImgList = document.getElementById('gift-img-list');
    // 清空选项
    mailSelect.innerHTML = '';
    if (giftImgList) giftImgList.innerHTML = '';

    // 添加信纸选项
    for (const [key, img] of Object.entries(mailImages)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = img.name;
        mailSelect.appendChild(option);
        // 设置默认选择为regular_horizontal
        if (key === 'regular_horizontal') {
            option.selected = true;
        }
    }

    // 添加礼物图标列表
    if (giftImgList) {
        // “无”选项
        const noneDiv = document.createElement('div');
        noneDiv.className = 'gift-img-item';
        noneDiv.setAttribute('data-key', 'none');
        noneDiv.title = '无';
        noneDiv.innerHTML = '<span style="font-size:22px;color:#bbb;">无</span>';
        giftImgList.appendChild(noneDiv);

        for (const [key, img] of Object.entries(giftImages)) {
            if (key === 'none') continue;
            const div = document.createElement('div');
            div.className = 'gift-img-item';
            div.setAttribute('data-key', key);
            div.title = img.name;
            div.innerHTML = `<img src="${img.path}" alt="${img.name}" style="width:40px;height:40px;object-fit:contain;">`;
            giftImgList.appendChild(div);
        }

        // 默认选中
        let currentGiftKey = document.getElementById('gift-img')?.value || 'none';
        Array.from(giftImgList.children).forEach(item => {
            if (item.getAttribute('data-key') === currentGiftKey) {
                item.classList.add('selected');
            }
        });

        // 点击切换
        giftImgList.addEventListener('click', function(e) {
            let target = e.target;
            while (target && !target.classList.contains('gift-img-item')) {
                target = target.parentElement;
            }
            if (target) {
                Array.from(giftImgList.children).forEach(item => item.classList.remove('selected'));
                target.classList.add('selected');
                // 更新隐藏select的值，兼容原有逻辑
                let giftSelect = document.getElementById('gift-img');
                if (giftSelect) giftSelect.value = target.getAttribute('data-key');
                updatePreview();
            }
        });
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 表单输入监听
    const inputs = [
        'title', 'body', 'signature', 'gift-text', 
        'font-size', 'margin-top', 'margin-bottom', 'margin-h',
        'gift-font-size', 'gift-icon-size', 'gift-text-position',
        'mail-img', 'gift-img'
    ];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        // 跳过已被图标选择替代的gift-img和gift-text-position
        if (id === 'gift-img' || id === 'gift-text-position') return;
        if (el) el.addEventListener('input', updatePreview);
    });
    // 说明位置勾选框联动
    const giftTextBefore = document.getElementById('gift-text-before');
    if (giftTextBefore) {
        giftTextBefore.addEventListener('change', updatePreview);
    }
    
    // 上传按钮
    document.getElementById('upload-mail').addEventListener('click', () => {
        uploadImage('mail');
    });
    
    document.getElementById('upload-gift').addEventListener('click', () => {
        uploadImage('gift');
    });
    
    // 保存按钮
    document.getElementById('save-btn').addEventListener('click', saveImage);
}

// 上传图片处理
function uploadImage(type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg';

    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            const imageKey = `custom_${Date.now()}`;
            const imageName = file.name.split('.')[0];

            // 保存当前信纸选择
            const mailSelectElem = document.getElementById('mail-img');
            const currentMailKey = mailSelectElem ? mailSelectElem.value : null;

            let currentGiftKey = null;
            const selectedGiftItem = document.querySelector('.gift-img-item.selected');
            if (selectedGiftItem) {
                currentGiftKey = selectedGiftItem.dataset.key;
            }

            // 添加图像数据
            if (type === 'mail') {
                mailImages[imageKey] = {
                    name: imageName,
                    path: event.target.result
                };
            } else {
                giftImages[imageKey] = {
                    name: imageName,
                    path: event.target.result
                };
            }

            // 重新填充信纸和礼物图标选择器
            populateImageSelectors();

            // 恢复信纸选择
            const mailSelect = document.getElementById('mail-img');
            if (mailSelect && currentMailKey) mailSelect.value = currentMailKey;
            // 恢复礼物图标选中
            if (currentGiftKey) {
                const giftImgList = document.getElementById('gift-img-list');
                if (giftImgList) {
                    const items = giftImgList.querySelectorAll('.gift-img-item');
                    items.forEach(item => {
                        if (item.dataset.key === currentGiftKey) {
                            item.classList.add('selected');
                        } else {
                            item.classList.remove('selected');
                        }
                    });
                }
            }

            // 立即设置新上传的图像为当前选择
            if (type === 'mail' && mailSelect) {
                mailSelect.value = imageKey;
            } else if (type === 'gift') {
                const giftImgList = document.getElementById('gift-img-list');
                if (giftImgList) {
                    const items = giftImgList.querySelectorAll('.gift-img-item');
                    items.forEach(item => {
                        if (item.dataset.key === imageKey) {
                            item.classList.add('selected');
                        } else {
                            item.classList.remove('selected');
                        }
                    });
                }
            }

            // 更新预览
            updatePreview();
        };

        reader.readAsDataURL(file);
    };

    input.click();
}

// 文本换行功能（支持中文）
function wrapText(context, text, maxWidth) {
    const lines = [];
    const paragraphs = text.split('\n');
    
    paragraphs.forEach(paragraph => {
        let currentLine = '';
        
        for (let i = 0; i < paragraph.length; i++) {
            const char = paragraph[i];
            const testLine = currentLine + char;
            const testWidth = context.measureText(testLine).width;
            
            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        
        lines.push(currentLine);
    });
    
    return lines;
}

let mailImageCache = {}; // 新增：信纸图像缓存
let giftImageCache = {}; // 新增：礼物图像缓存

// 更新预览
function updatePreview() {
    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');

    // 获取信纸
    const mailKey = document.getElementById('mail-img').value;
    const mailImg = mailImages[mailKey];
    if (!mailImg || !mailImg.path) return;

    // 获取礼物
    let giftKey = 'none';
    // 优先从图标选中项获取
    const giftImgList = document.getElementById('gift-img-list');
    if (giftImgList) {
        const selected = giftImgList.querySelector('.selected');
        if (selected) giftKey = selected.getAttribute('data-key');
    } else {
        // 兼容旧逻辑
        const giftSelect = document.getElementById('gift-img');
        if (giftSelect) giftKey = giftSelect.value;
    }
    const giftImg = giftImages[giftKey];

    // 获取说明位置（勾选为before，不勾选为after）
    let textPosition = 'after';
    const giftTextBefore = document.getElementById('gift-text-before');
    if (giftTextBefore && giftTextBefore.checked) textPosition = 'before';

    // 从缓存获取或加载信纸图片
    let mailImage = mailImageCache[mailKey];
    if (!mailImage) {
        mailImage = new Image();
        mailImage.crossOrigin = "Anonymous";
        mailImage.src = mailImg.path;
        mailImageCache[mailKey] = mailImage;
    }

    // 信纸加载处理
    if (mailImage.complete) {
        drawPreview(canvas, ctx, mailImage, giftKey, giftImg);
    } else {
        mailImage.onload = () => {
            drawPreview(canvas, ctx, mailImage, giftKey, giftImg);
        };
        mailImage.onerror = () => {
            console.error("信纸加载失败，路径:", mailImg.path);
        };
    }
}

// 绘制预览内容
function drawPreview(canvas, ctx, mailImage, giftKey, giftImg) {
    // 设置画布尺寸
    canvas.width = mailImage.width;
    canvas.height = mailImage.height;

    // 绘制背景信纸
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mailImage, 0, 0);

    // 设置文本样式
    const fontSize = parseInt(document.getElementById('font-size').value);
    const marginTop = parseInt(document.getElementById('margin-top').value);
    const marginBottom = parseInt(document.getElementById('margin-bottom').value);
    const marginH = parseInt(document.getElementById('margin-h').value);
    let fontFamily = document.getElementById('font-family')?.value || 'Kingnammm Maiyuan 2';
    // 只设置目标字体和通用后备，避免混合主字体
    if (fontFamily === 'Fusion Pixel 12px Monospaced zh_hans') {
        ctx.font = `normal ${fontSize}px "Fusion Pixel 12px Monospaced zh_hans", monospace`;
    } else {
        ctx.font = `normal ${fontSize}px "Kingnammm Maiyuan 2", sans-serif`;
    }
    ctx.fillStyle = '#3c281e';

    // 绘制标题
    const title = document.getElementById('title').value;
    const titleColor = document.getElementById('title').getAttribute('data-color') || '#3c281e';
    ctx.fillStyle = titleColor;
    if (fontFamily === 'Fusion Pixel 12px Monospaced zh_hans') {
        ctx.font = `normal ${fontSize}px "Fusion Pixel 12px Monospaced zh_hans", monospace`;
    } else {
        ctx.font = `normal ${fontSize}px "Kingnammm Maiyuan 2", sans-serif`;
    }
    const titleLines = wrapText(ctx, title, canvas.width - 2 * marginH);
    let y = marginTop;

    titleLines.forEach(line => {
        ctx.fillText(line, marginH, y);
        y += fontSize + 4;
    });

    // 绘制正文
    const body = document.getElementById('body').value;
    const bodyColor = document.getElementById('body').getAttribute('data-color') || '#3c281e';
    ctx.fillStyle = bodyColor;
    if (fontFamily === 'Fusion Pixel 12px Monospaced zh_hans') {
        ctx.font = `normal ${fontSize}px "Fusion Pixel 12px Monospaced zh_hans", monospace`;
    } else {
        ctx.font = `normal ${fontSize}px "Kingnammm Maiyuan 2", sans-serif`;
    }
    const bodyLines = wrapText(ctx, body, canvas.width - 2 * marginH);

    y += 10;
    bodyLines.forEach(line => {
        ctx.fillText(line, marginH, y);
        y += fontSize + 4;
    });

    // 绘制署名
    const signature = document.getElementById('signature').value;
    const signatureColor = document.getElementById('signature').getAttribute('data-color') || '#3c281e';
    ctx.fillStyle = signatureColor;
    if (signature) {
        if (fontFamily === 'Fusion Pixel 12px Monospaced zh_hans') {
            ctx.font = `normal ${fontSize}px "Fusion Pixel 12px Monospaced zh_hans", monospace`;
        } else {
            ctx.font = `normal ${fontSize}px "Kingnammm Maiyuan 2", sans-serif`;
        }
        const signatureLines = wrapText(ctx, signature, canvas.width - 2 * marginH);
        // 判断左对齐勾选框
        const alignLeft = document.getElementById('signature-align-left')?.checked;
        ctx.textAlign = alignLeft ? 'left' : 'right';
        const signatureX = alignLeft ? marginH : canvas.width - marginH;
        const signY = canvas.height - marginBottom - 80;
        for (let i = 0; i < signatureLines.length; i++) {
            const line = signatureLines[i];
            ctx.fillText(line, signatureX, signY + i * (fontSize + 4));
        }
        ctx.textAlign = 'left'; // 恢复后续绘制为默认左对齐（如礼物说明）
    }

    // 绘制礼物（如果存在）
    if (giftKey !== 'none' && giftImg && giftImg.path) {
        // 从缓存获取或加载礼物图片
        let giftImage = giftImageCache[giftKey];
        if (!giftImage) {
            giftImage = new Image();
            giftImage.crossOrigin = "Anonymous";
            giftImage.src = giftImg.path;
            giftImageCache[giftKey] = giftImage;
        }

        // 获取说明位置参数
        let textPosition = 'after';
        const giftTextBefore = document.getElementById('gift-text-before');
        if (giftTextBefore && giftTextBefore.checked) textPosition = 'before';

        // 礼物加载处理
        if (giftImage.complete) {
            drawGift(ctx, giftImage, canvas, marginBottom, textPosition);
        } else {
            giftImage.onload = () => {
                drawGift(ctx, giftImage, canvas, marginBottom, textPosition);
            };
            giftImage.onerror = () => {
                console.error("礼物图加载失败:", giftImg.path);
            };
        }
    }
}

// 绘制礼物
function drawGift(ctx, giftImage, canvas, marginBottom) {
    const giftText = document.getElementById('gift-text').value;
    const giftTextColor = document.getElementById('gift-text').getAttribute('data-color') || '#3c281e';
    ctx.fillStyle = giftTextColor;
    const giftFontSize = parseInt(document.getElementById('gift-font-size').value);
    const giftIconSize = parseInt(document.getElementById('gift-icon-size').value);
    // textPosition参数由drawPreview传入
    const textPosition = arguments[4] || 'after';

    // 调整礼物图标大小
    const scaledWidth = giftIconSize;
    const scaledHeight = (giftImage.height / giftImage.width) * giftIconSize;

    // 设置礼物文字样式
    const fontFamily = document.getElementById('font-family')?.value || 'Kingnammm Maiyuan 2';
    if (fontFamily === 'Fusion Pixel 12px Monospaced zh_hans') {
        ctx.font = `normal ${giftFontSize}px "Fusion Pixel 12px Monospaced zh_hans", monospace`;
    } else {
        ctx.font = `normal ${giftFontSize}px "Kingnammm Maiyuan 2", sans-serif`;
    }
    const textWidth = giftText ? ctx.measureText(giftText).width : 0;
    const gap = 10;

    // 计算总宽度
    const totalWidth = scaledWidth + (textWidth > 0 ? textWidth + gap : 0);

    // 居中位置
    const x = (canvas.width - totalWidth) / 2;
    const yGift = canvas.height - marginBottom - 30;

    // 根据位置绘制
    if (textPosition === 'before' && giftText) {
        ctx.fillText(giftText, x, yGift + scaledHeight/2 + giftFontSize/3);
        ctx.drawImage(giftImage, x + textWidth + gap, yGift, scaledWidth, scaledHeight);
    } else {
        ctx.drawImage(giftImage, x, yGift, scaledWidth, scaledHeight);
        if (giftText) {
            ctx.fillText(giftText, x + scaledWidth + gap, yGift + scaledHeight/2 + giftFontSize/3);
        }
    }
}

// 保存图片
function saveImage() {
    const canvas = document.getElementById('preview-canvas');
    const link = document.createElement('a');
    
    link.download = '星露谷信件.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function adjustCanvasSize() {
    const canvas = document.getElementById('preview-canvas');
    const width = window.innerWidth * 0.8; // 画布宽度为屏幕宽度的80%
    const height = window.innerHeight * 0.6; // 画布高度为屏幕高度的60%
    canvas.width = width;
    canvas.height = height;

    // 调整画布大小后更新预览
    updatePreview();
}

function positionPreviewPanel() {
    const previewPanel = document.querySelector('.preview-panel');
    const editorContainer = document.querySelector('.editor-container');

    const containerRect = editorContainer.getBoundingClientRect();
    const previewPanelWidth = previewPanel.offsetWidth;
    const windowWidth = window.innerWidth;

    // 判断是否为平板设备（宽度在 768px 到 1024px）
    if (windowWidth >= 768 && windowWidth <= 1024) {
        // 平板设备：切换为 static 定位，避免遮挡
        previewPanel.style.position = 'static';
        previewPanel.style.transform = 'none';
        previewPanel.style.marginTop = '20px';
    } else if (windowWidth - containerRect.left < previewPanelWidth + 320) {
        // 空间不足：切换为 static 定位
        previewPanel.style.position = 'static';
        previewPanel.style.transform = 'none';
        previewPanel.style.marginTop = '20px';
    } else {
        // 空间足够：使用 fixed 定位
        previewPanel.style.position = 'fixed';
        previewPanel.style.top = '50%';
        previewPanel.style.transform = 'translateY(-50%)';
        previewPanel.style.marginTop = '0';
    }
}

// 更新预览区域文字颜色的函数
function updatePreviewColor(targetId, color) {
    // 更新颜色到全局变量或 DOM 元素
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.setAttribute('data-color', color); // 保存颜色到元素属性
    }

    // 重新渲染预览区域
    updatePreview();
}

// 获取音乐元素
const audio = document.getElementById('background-music');
const toggleButton = document.getElementById('toggle-music');
const musicIcon = document.getElementById('music-icon');
const musicControl = document.getElementById('music-controller');

// 获取加载界面元素
const loadingScreen = document.getElementById('loading-screen');

// 监听按钮点击事件，切换音乐播放状态
toggleButton.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();  // 播放音乐
        musicIcon.src = 'assets/music_on.png';  // 更新图标
    } else {
        audio.pause();  // 暂停音乐
        musicIcon.src = 'assets/music_off.png';  // 更新图标
    }
});

// 音乐加载计时器
let musicLoaded = false;
let musicTimeout = setTimeout(() => {
    // 超过8秒如果音频没加载完成，则停止播放
    audio.pause();
    audio.src = '';
    musicIcon.src = 'assets/music_off.png';  // 设置音乐关闭图标
    loadingScreen.style.display = 'none';
    musicControl.style.display = 'none';
}, 8000);  // 8秒

// 监听音频加载是否完成
audio.addEventListener('canplaythrough', () => {
    musicLoaded = true;
    clearTimeout(musicTimeout);  // 音乐成功加载，清除计时器
    audio.play();  // 播放音乐
    musicIcon.src = 'assets/music_on.png';  // 设置音乐播放图标
    loadingScreen.style.display = 'none';  // 隐藏加载界面
    musicControl.style.display = 'block';  // 显示控制按钮
});

// 监听音频加载错误（例如网络问题）
audio.addEventListener('error', () => {
    clearTimeout(musicTimeout);  // 清除超时计时器
    musicIcon.src = 'assets/music_off.png';  // 设置图标为关闭状态
    loadingScreen.style.display = 'none';  // 隐藏加载界面
    musicControl.style.display = 'none';  // 隐藏控制面板
});


// 监听音乐加载完成事件
audio.addEventListener('canplaythrough', () => {
    // 当音乐加载完成时，隐藏加载界面
    loadingScreen.style.display = 'none';
});

// 获取所有设置按钮和颜色选择器
const colorSettingsButtons = document.querySelectorAll('.color-settings');
const colorPickers = {};

colorSettingsButtons.forEach(button => {
    const target = button.getAttribute('data-target');
    
    // 监听按钮点击事件
    button.addEventListener('click', (e) => {
        // 防止事件冒泡，确保点击按钮时不会触发隐藏颜色选择器
        e.stopPropagation();

        // 创建并显示颜色选择器
        if (!colorPickers[target]) {
            const colorPicker = document.createElement('div');
            colorPicker.classList.add('color-picker');
            colorPicker.innerHTML = `
                <input type="color" value="#000000" />
            `;
            colorPickers[target] = colorPicker;
            document.body.appendChild(colorPicker);

            const rect = button.getBoundingClientRect();
            // 设置颜色选择器在按钮下方显示
            colorPicker.style.top = `${rect.bottom + window.scrollY + 5}px`;
            colorPicker.style.left = `${rect.left + window.scrollX}px`;

            // 监听颜色变化事件
            colorPicker.querySelector('input').addEventListener('input', (e) => {
                const color = e.target.value;
                // 更新预览区中相应区域的颜色
                updatePreviewColor(target, color);
            });
        } else {
            // 显示已存在的颜色选择器
            colorPickers[target].style.display = 'block';
        }
    });
});

function adjustPreviewPanelPosition() {
    const previewPanel = document.querySelector('.preview-panel');
    
    // Check if previewPanel exists
    if (!previewPanel) {
        console.error("Preview panel not found");
        return;  // Exit if the element doesn't exist
    }

    const headerHeight = document.querySelector('h1').offsetHeight; // Assuming h1 exists
    const containerRect = document.querySelector('.editor-container').getBoundingClientRect();
    const previewPanelWidth = previewPanel.offsetWidth;
    const windowWidth = window.innerWidth;

    // Determine the panel's position based on window width and scroll position
    if (windowWidth >= 768 && windowWidth <= 1024) {
        previewPanel.style.position = 'static';
        previewPanel.style.transform = 'none';
        previewPanel.style.marginTop = '20px';
    } else if (windowWidth - containerRect.left < previewPanelWidth + 320) {
        previewPanel.style.position = 'static';
        previewPanel.style.transform = 'none';
        previewPanel.style.marginTop = '20px';
    } else {
        previewPanel.style.position = 'fixed';
        previewPanel.style.top = '50%';
        previewPanel.style.transform = 'translateY(-50%)';
        previewPanel.style.marginTop = '0';
    }
}

// 点击页面的任何地方关闭颜色选择器
document.addEventListener('click', (e) => {
    if (!e.target.closest('.color-settings') && !e.target.closest('.color-picker')) {
        Object.values(colorPickers).forEach(picker => {
            picker.style.display = 'none';
        });
    }
});

// 获取“与我联系”按钮和弹出窗口
const contactBtn = document.getElementById('contact-link');
const contactModal = document.getElementById('contact-modal');
const closeModal = document.getElementById('close-modal');

// 点击“与我联系”按钮时显示弹出窗口
contactBtn.addEventListener('click', (event) => {
    event.preventDefault(); // 阻止跳转
    // 显示弹出窗口
    contactModal.style.display = 'block';
});

// 点击关闭按钮时隐藏弹出窗口
closeModal.addEventListener('click', () => {
    contactModal.style.display = 'none';
});

// 点击弹出窗口外部时也关闭窗口
window.addEventListener('click', (event) => {
    if (event.target === contactModal) {
        contactModal.style.display = 'none';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const previewPanel = document.querySelector('.preview-panel');
    const headerHeight = document.querySelector('h1').offsetHeight;  // 获取 h1 的高度

    // 调用一次，设置初始状态
    // adjustPreviewPanelPosition(previewPanel, headerHeight);

    // 监听滚动事件
    window.addEventListener('scroll', adjustPreviewPanelPosition);
});

window.addEventListener('load', positionPreviewPanel);
window.addEventListener('resize', positionPreviewPanel);
window.addEventListener('scroll', positionPreviewPanel);
window.addEventListener('DOMContentLoaded', positionPreviewPanel);


window.addEventListener('resize', adjustCanvasSize);
adjustCanvasSize(); // 初始化时调整画布大小

// 修复canvas首次切换字体后中文不显示的问题
// 通过DOM强制触发字体渲染后再刷新预览
// 适用于所有字体切换场景

// 替换 handleFontChange 实现
window.handleFontChange = async function() {
    const val = document.getElementById('font-family').value;
    const previewPanel = document.querySelector('.preview-panel');
    if (previewPanel) {
        if (val === 'Fusion Pixel 12px Monospaced zh_hans') {
            previewPanel.style.fontFamily = '"Fusion Pixel 12px Monospaced zh_hans"';
            previewPanel.style.fontWeight = 'normal';
        } else {
            previewPanel.style.fontFamily = '"Kingnammm Maiyuan 2", sans-serif';
            previewPanel.style.fontWeight = '';
        }
    }
    const fontSize = parseInt(document.getElementById('font-size').value) || 42;
    let fontStr;
    if (val === 'Fusion Pixel 12px Monospaced zh_hans') {
        fontStr = `${fontSize}px "Fusion Pixel 12px Monospaced zh_hans"`;
    } else {
        fontStr = `${fontSize}px "Kingnammm Maiyuan 2"`;
    }
    try {
        await document.fonts.load(fontStr);
        await document.fonts.ready;
        // 用DOM强制触发字体渲染，解决canvas首次切换不生效问题
        const testDiv = document.createElement('div');
        testDiv.style.font = fontStr;
        testDiv.textContent = '通过该隐藏文本达到激活切换字体作用123abc，玛丽有架录音机';
        testDiv.style.position = 'absolute';
        testDiv.style.opacity = '0';
        document.body.appendChild(testDiv);
        setTimeout(() => {
            document.body.removeChild(testDiv);
            updatePreview();
        }, 800);
        return;
    } catch (e) {
        updatePreview();
    }
}

document.getElementById('font-family').addEventListener('change', handleFontChange);



