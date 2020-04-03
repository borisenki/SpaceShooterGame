import { GameEvents } from "./GameEvents";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameOverController extends cc.Component {

    set allEnemyes(value: number) {
        this.node.getChildByName('AllEnemyes').getComponent<cc.Label>(cc.Label).string = 'Всего противников: ' + value;
    }

    set killedEnemyes(value: number) {
        this.node.getChildByName('KilledEnemyes').getComponent<cc.Label>(cc.Label).string = 'Убито противников: ' + value;
    }

    turnGameScreen() {
        this.node.emit(GameEvents.RESTART_GAME);
    }
}
