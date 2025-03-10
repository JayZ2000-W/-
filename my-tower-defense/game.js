const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gold = 100;
let hp = 20;

// 游戏对象
const game = {
    towers: [],
    enemies: [],
    bullets: [],
    path: [
        {x: 0, y: 250},
        {x: 400, y: 250},
        {x: 400, y: 100},
        {x: 800, y: 100}
    ]
};

// 炮塔类
class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.range = 100;
        this.fireRate = 1000;
        this.lastShot = 0;
        this.color = '#2196F3';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    shoot(target) {
        const now = Date.now();
        if (now - this.lastShot > this.fireRate) {
            game.bullets.push(new Bullet(this.x, this.y, target));
            this.lastShot = now;
        }
    }
}

// 子弹类
class Bullet {
    constructor(x, y, target) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = 5;
        this.damage = 10;
    }

    update() {
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < this.speed) {
            this.target.hp -= this.damage;
            return true; // 命中
        }
        
        this.x += dx/dist * this.speed;
        this.y += dy/dist * this.speed;
        return false;
    }

    draw() {
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 敌人类
class Enemy {
    constructor() {
        this.pathIndex = 0;
        this.x = game.path[0].x;
        this.y = game.path[0].y;
        this.speed = 1;
        this.hp = 20;
        this.color = '#4CAF50';
    }

    update() {
        const target = game.path[this.pathIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        if (dist < this.speed) {
            if (++this.pathIndex >= game.path.length) {
                hp--;
                return true; // 到达终点
            }
        } else {
            this.x += dx/dist * this.speed;
            this.y += dy/dist * this.speed;
        }
        return false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 游戏循环
function gameLoop() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制路径
    ctx.strokeStyle = '#795548';
    ctx.beginPath();
    ctx.moveTo(game.path[0].x, game.path[0].y);
    game.path.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // 更新敌人
    if (Math.random() < 0.02) game.enemies.push(new Enemy());
    game.enemies = game.enemies.filter(enemy => {
        if (enemy.hp <= 0) return false;
        const reached = enemy.update();
        if (reached) return false;
        enemy.draw();
        return true;
    });

    // 更新炮塔
    game.towers.forEach(tower => {
        tower.draw();
        // 寻找目标
        const target = game.enemies.find(e => {
            const dx = e.x - tower.x;
            const dy = e.y - tower.y;
            return Math.sqrt(dx*dx + dy*dy) < tower.range;
        });
        if (target) tower.shoot(target);
    });

    // 更新子弹
    game.bullets = game.bullets.filter(bullet => {
        const hit = bullet.update();
        bullet.draw();
        return !hit;
    });

    // 更新UI
    document.getElementById('gold').textContent = gold;
    document.getElementById('hp').textContent = hp;

    requestAnimationFrame(gameLoop);
}

// 炮塔放置
canvas.addEventListener('click', e => {
    if (gold >= 50) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        game.towers.push(new Tower(x, y));
        gold -= 50;
    }
});

// 启动游戏
gameLoop();