const { ccclass, property } = cc._decorator;

@ccclass
export default class StartMenuController extends cc.Component {

    onToggleGameScreen(): void {
        cc.director.loadScene('GameScene');
    }
}
