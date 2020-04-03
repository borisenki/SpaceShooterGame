import { GameEvents } from "../GameEvents";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends cc.Component {

    @property
    speed: number = 300;

    _direction: cc.Vec2 = null;

    set direction(value: cc.Vec2) {
        this._direction = value;
        this.node.angle = Math.atan2(this._direction.y, this._direction.x) * (180 / Math.PI) - 90
    }

    get direction() {
        return this._direction;
    }

    onCollisionEnter(other) {
        let node: cc.Node = other.node;
        if (node.name === 'Bullet') {
            this.node.emit(GameEvents.ENEMY_DESTROYED, { enemy: this, needAnimation: true });
        } else if (node.name === 'Borders') {
            this.node.emit(GameEvents.ENEMY_DESTROYED, { enemy: this });
        }
    }

    update(dt) {
        this.node.y += this.speed * dt * this.direction.y;
        this.node.x += this.speed * dt * this.direction.x;
    }
}
