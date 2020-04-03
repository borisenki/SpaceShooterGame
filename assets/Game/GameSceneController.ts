import { GameEvents } from "./GameEvents";
import Bullet from "./Player/Bullet";
import Player from "./Player/Player";
import Enemy from "./Enemy/Enemy";
import GameOverController from "./GameOverController";

const { ccclass, property } = cc._decorator;

export const enum Directions {
    Top,
    Bottom,
    Left,
    Right
}

@ccclass
export default class GameSceneController extends cc.Component {

    @property(cc.Canvas)
    canvas: cc.Canvas = null;

    @property(cc.Prefab)
    explousion: cc.Prefab = null;

    @property(cc.Prefab)
    gameOverPrefub: cc.Prefab = null;

    @property(cc.Prefab)
    bulletPrefub: cc.Prefab = null;

    @property(cc.Prefab)
    enemyesPrefubs: cc.Prefab[] = [];

    @property(cc.Node)
    player: cc.Node = null;

    @property
    roundDuration: number = 30;

    @property
    maxEnemyes: number = 3;

    enemyes: Enemy[] = [];
    timeLeft: number = 0;
    timeLeftLabel: cc.Label = null;
    enemyKilled: number = 0;
    enemyCount: number = 0;

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
    }

    start() {
        this.enemyes = [];

        this.player.on(GameEvents.PLAYER_FIRE, this.onPlayerFire.bind(this));
        this.timeLeftLabel = this.node.getChildByName("TimeLeft").getComponent<cc.Label>(cc.Label);

        this.setupTimer();
    }

    setupTimer() {
        this.schedule(this.updateGameTimer.bind(this), 1, this.roundDuration);
        this.timeLeft = this.roundDuration;
        this.timeLeftLabel.string = "Осталось: " + this.timeLeft;
    }

    updateGameTimer(dt) {
        if (this.timeLeft === 0) {
            this.unschedule(this.updateGameTimer.bind(this));
            this.turnGameOverScene();
            cc.director.pause();
            return;
        }
        this.timeLeft -= 1;
        this.timeLeftLabel.string = "Осталось: " + this.timeLeft;
    }

    onPlayerFire(): void {
        var bulletDirection = new cc.Vec2(0, 1);
        bulletDirection = bulletDirection.rotate(this.player.angle * Math.PI / 180);
        var bullet = cc.instantiate(this.bulletPrefub);

        let bulletSpawnPoint = this.player.getComponent<Player>(Player).bulletSpawnPoint;
        let bulletPosition = this.node.convertToNodeSpaceAR(this.player.convertToWorldSpaceAR(bulletSpawnPoint.position));
        bullet.position = new cc.Vec2(bulletPosition.x, bulletPosition.y);

        let bulletComp = bullet.getComponent<Bullet>(Bullet);
        bulletComp.direction = bulletDirection;
        this.node.addChild(bullet);
    }

    update(dt) {
        this.spawnEnemy();
    }

    spawnEnemy() {
        if (this.maxEnemyes > this.enemyes.length) {
            let newEnemy = cc.instantiate(this.enemyesPrefubs[Math.floor(Math.random() * this.enemyesPrefubs.length)])
            let { from, to } = this.getRandomOutSidePoint();
            let direction = new cc.Vec2(to.x - from.x, to.y - from.y);
            direction = direction.normalizeSelf();
            let enemyComponent = newEnemy.getComponent<Enemy>(Enemy);
            enemyComponent.direction = direction;
            this.node.addChild(newEnemy);
            let localFrom = this.node.convertToNodeSpaceAR(from);
            newEnemy.x = localFrom.x;
            newEnemy.y = localFrom.y;
            this.enemyes.push(enemyComponent);
            enemyComponent.node.on(GameEvents.ENEMY_DESTROYED, this.onEnemyDestroyed.bind(this));
            this.enemyCount += 1;
        }
    }

    onEnemyDestroyed({ enemy, needAnimation }) {
        this.enemyes.splice(this.enemyes.indexOf(enemy), 1);
        this.node.removeChild(enemy.node);
        enemy.node.off(GameEvents.ENEMY_DESTROYED, this.onEnemyDestroyed.bind(this));
        if (needAnimation) {
            this.enemyKilled += 1;
            let explousionAnim = cc.instantiate(this.explousion);
            this.node.addChild(explousionAnim);
            explousionAnim.x = enemy.node.x;
            explousionAnim.y = enemy.node.y;
        }
        this.spawnEnemy();
    }

    getRandomOutSidePoint(): { from: cc.Vec2, to: cc.Vec2 } {
        let directions = [Directions.Top, Directions.Bottom, Directions.Left, Directions.Right];
        let fromIdx = Math.floor(directions.length * Math.random());
        let from = this.getDirectionPoint(directions[fromIdx]);
        let toIdx = Math.floor(directions.length * Math.random());
        let to = this.getDirectionPoint(directions[toIdx]);
        return { from, to };
    }

    getDirectionPoint(direction: Directions): cc.Vec2 {
        switch (direction) {
            case Directions.Bottom: {
                return new cc.Vec2((this.canvas.node.width - 200) * Math.random() + 100, this.canvas.node.height + 20);
            }
            case Directions.Top: {
                return new cc.Vec2((this.canvas.node.width - 200) * Math.random() + 100, -20);
            }
            case Directions.Left: {
                return new cc.Vec2(-20, (this.canvas.node.height - 200) * Math.random() + 100);
            }
            case Directions.Right: {
                return new cc.Vec2(this.canvas.node.width + 20, (this.canvas.node.height - 200) * Math.random() + 100);
            }
        }
    }

    turnGameOverScene() {
        let gameOver = cc.instantiate(this.gameOverPrefub);
        this.node.addChild(gameOver);
        let gameOverComponent = gameOver.getComponent<GameOverController>(GameOverController);
        gameOverComponent.allEnemyes = this.enemyCount;
        gameOverComponent.killedEnemyes = this.enemyKilled;
        gameOver.on(GameEvents.RESTART_GAME, this.restart.bind(this));
    }

    restart() {
        this.node.off(GameEvents.RESTART_GAME, this.restart.bind(this));
        for (let i: number = this.node.children.length - 1; i >= 0; i--) {
            if (this.node.children[i].name === 'Bullet') {
                this.node.removeChild(this.node.children[i]);
            }
        }

        for (let i: number = 0; i < this.enemyes.length; i++) {
            this.node.removeChild(this.enemyes[i].node);
        }

        this.enemyes = [];
        this.enemyKilled = 0;
        this.enemyCount = 0;
        cc.director.resume();
        this.setupTimer();

        this.node.removeChild(this.node.getChildByName('GameOver'));
    }
}
