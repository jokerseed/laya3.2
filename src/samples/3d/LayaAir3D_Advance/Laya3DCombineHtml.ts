import { Camera } from "laya/d3/core/Camera"
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { Scene3D } from "laya/d3/core/scene/Scene3D"
import { Stage } from "laya/display/Stage"
import { Handler } from "laya/utils/Handler"
import { Laya } from "Laya";
import { Config } from "Config";
import { Color } from "laya/maths/Color"
import { Vector3 } from "laya/maths/Vector3"
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom"
import { Event } from "laya/events/Event"

export class Laya3DCombineHtml {
	private div: HTMLDivElement;
	constructor() {		
		//1.开启第四个参数
		Config.isAlpha = true;
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//2.设置舞台背景色为空
			Laya.stage.bgColor = '#000000';
			this.div = document.createElement('div');
			this.div.innerHTML = '<h1 style=\'color: red;\'>此内容来源于HTML网页, 可直接在html代码中书写 - h1标签</h1>';
			//@ts-ignore
			this.div.style = "position:absolute;z-order:99";
			document.body.appendChild(this.div);
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.clearColor = new Color(0.006, 0.193, 0.36, 0.392);
			camera.transform.translate(new Vector3(0, 0.5, 1));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);

			let lightsprit = new Sprite3D();
			let dirCom = lightsprit.addComponent(DirectionLightCom);
			scene.addChild(lightsprit);
			dirCom.color = new Color(1, 1, 1, 1);

			Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey: Sprite3D): void {
				scene.addChild(layaMonkey);
				layaMonkey.on(Event.REMOVED, this, this.destroy);
			}));
		});
	}

	destroy() {
		document.body.removeChild(this.div);
	}
}

