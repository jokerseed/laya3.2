import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class Sprite3DLoad {
	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			scene.ambientColor = new Color(1, 1, 1);

			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.translate(new Vector3(0, 0.5, 1));
			camera.transform.rotate(new Vector3(-15, 0, 2), true, false);
			camera.addComponent(CameraMoveScript);
			//camera.renderTarget = RenderTexture.createFromPool(256,256,RenderTargetFormat.R8G8B8A8,RenderTargetFormat.DEPTH_16);

			//let spr = Laya.stage.addChild(new Sprite());
			//let tex = new Texture(camera.renderTarget);
			//spr.texture = tex;

			Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(null, function (sprite: Sprite3D): void {
				scene.addChild(sprite);
			}));
		});
	}
}

