// 全局变量
let mailImages = {};
let giftImages = {};
let fontLoaded = false;

// 初始化函数
window.addEventListener('DOMContentLoaded', () => {
    // 加载字体
    loadFont();
    
    // 加载默认资源 - 使用您提供的目录结构
    loadDefaultImages();
    
    // 设置事件监听器
    setupEventListeners();
    
    // 初始渲染
    updatePreview();
});

// 加载中文字体
function loadFont() {
    const font = new FontFace('KNMaiyuan', 'url(assets/font/KNMaiyuan-Regular.ttf)');
    font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        fontLoaded = true;
        updatePreview();
    }).catch(error => {
        console.error('字体加载失败:', error);
        fontLoaded = false;
    });
}

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
    const giftSelect = document.getElementById('gift-img');
    
    // 清空选项
    mailSelect.innerHTML = '';
    giftSelect.innerHTML = '<option value="none">无</option>';
    
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
    
    // 添加礼物选项
    for (const [key, img] of Object.entries(giftImages)) {
        if (key === 'none') continue;
        const option = document.createElement('option');
        option.value = key;
        option.textContent = img.name;
        giftSelect.appendChild(option);
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
        document.getElementById(id).addEventListener('input', updatePreview);
    });
    
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

            // 保存当前信纸和礼物的选择
            const currentMailKey = document.getElementById('mail-img').value;
            const currentGiftKey = document.getElementById('gift-img').value;

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

            // 重新填充下拉菜单
            populateImageSelectors();

            // 恢复信纸和礼物的选择
            const mailSelect = document.getElementById('mail-img');
            mailSelect.value = currentMailKey;  // 恢复信纸选择
            const giftSelect = document.getElementById('gift-img');
            giftSelect.value = currentGiftKey;  // 恢复礼物选择

            // 立即设置新上传的图像为当前选择
            if (type === 'mail') {
                mailSelect.value = imageKey;
            } else {
                giftSelect.value = imageKey;
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

// 更新预览
function updatePreview() {
    if (!fontLoaded) return;

    const canvas = document.getElementById('preview-canvas');
    const ctx = canvas.getContext('2d');

    // 获取信纸
    const mailKey = document.getElementById('mail-img').value;
    const mailImg = mailImages[mailKey];
    
    if (!mailImg || !mailImg.path) return;
    
    // 创建临时图像加载
    const mailImage = new Image();
    mailImage.crossOrigin = "Anonymous";

    // 添加随机参数解决缓存污染
    const timestamp = `?v=${Date.now()}`;
    mailImage.src = mailImg.path + timestamp;

    mailImage.onload = () => {
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

        ctx.font = `${fontSize}px KNMaiyuan`;
        ctx.fillStyle = '#3c281e'; // 星露谷信件文字颜色

        // 绘制标题
        const title = document.getElementById('title').value;
        const titleLines = wrapText(ctx, title, canvas.width - 2 * marginH);
        let y = marginTop;

        titleLines.forEach(line => {
            ctx.fillText(line, marginH, y);
            y += fontSize + 4;
        });

        // 绘制正文
        const body = document.getElementById('body').value;
        const bodyLines = wrapText(ctx, body, canvas.width - 2 * marginH);

        y += 10;
        bodyLines.forEach(line => {
            ctx.fillText(line, marginH, y);
            y += fontSize + 4;
        });

        // 绘制署名
        const signature = document.getElementById('signature').value;
        if (signature) {
            ctx.font = `${fontSize}px KNMaiyuan`;
            const signatureLines = wrapText(ctx, signature, canvas.width - 2 * marginH);

            // 从底部向上绘制
            const signY = canvas.height - marginBottom - 80;
            for (let i = 0; i < signatureLines.length; i++) {
                const line = signatureLines[i];
                const lineWidth = ctx.measureText(line).width;
                const signatureX = canvas.width - marginH - lineWidth;
                ctx.fillText(line, signatureX, signY + i * (fontSize + 4));
            }
        }

        // 绘制礼物
        const giftKey = document.getElementById('gift-img').value;
        const giftImg = giftImages[giftKey];

        if (giftKey !== 'none' && giftImg && giftImg.path) {
            const giftImage = new Image();
            giftImage.crossOrigin = "Anonymous";
            giftImage.src = giftImg.path + timestamp; // 添加随机参数解决缓存污染
            giftImage.onload = () => {
                const giftText = document.getElementById('gift-text').value;
                const giftFontSize = parseInt(document.getElementById('gift-font-size').value);
                const giftIconSize = parseInt(document.getElementById('gift-icon-size').value);
                const textPosition = document.getElementById('gift-text-position').value;

                // 调整礼物图标大小
                const scaledWidth = giftIconSize;
                const scaledHeight = (giftImage.height / giftImage.width) * giftIconSize;

                // 设置礼物文字样式
                ctx.font = `${giftFontSize}px KNMaiyuan`;
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
            };

            giftImage.onerror = () => console.error("礼物图加载失败");
            giftImage.src = giftImg.path;
        }
    };
    
    mailImage.onerror = () => {
        console.error("信纸加载失败，路径:", mailImg.path);
        mailImage.src = mailImg.path;
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

window.addEventListener('resize', adjustCanvasSize);
adjustCanvasSize(); // 初始化时调整画布大小

