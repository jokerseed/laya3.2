import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../../common/CameraMoveScript";
import { GrassRenderManager } from "./GrassRenderManager";
import { Scene } from "laya/display/Scene";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

/**
 * 此类用来渲染草地
 */
export class GrassDemo {
	camera: Camera;
	grassManager: GrassRenderManager;

	constructor() {
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			Shader3D.debugMode = true;
			this.PreloadingRes();
		});

	}

	//批量预加载方式
	PreloadingRes() {
		//预加载所有资源
		var resource: any[] = ["res/InstancedIndirectGrassVertexColor.jpg",
			"res/LayaScene_GrassScene/Conventional/GrassScene.ls"];
		Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
	}

	onPreLoadFinish() {
		Scene.open("res/LayaScene_GrassScene/Conventional/GrassScene.ls", true, null, Handler.create(this, (sce: Scene) => {
			//初始化3D场景
			var scene: Scene3D = sce.scene3D;
			this.camera = (<Camera>scene.addChild(new Camera(0, 0.1, 1000)));
			this.camera.addComponent(CameraMoveScript);
			//设置相机的清除标识为天空盒(这个参数必须设置为CLEARFLAG_SKY，否则无法使用天空盒)
			this.camera.clearFlag = CameraClearFlags.Sky;
			this.camera.transform.position = new Vector3(-45.56605299366802, 7.79715240971953, 9.329663960933718);

			//初始化平行光
			var directionLight: Sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()));
			var directionLightCom: DirectionLightCom = directionLight.addComponent(DirectionLightCom);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directionLight.transform.worldMatrix = mat;
			//渲染草
			this.grassManager = new GrassRenderManager(this.camera);
			var grasssize = this.grassManager.grassCellsize;
	
			for (let x = -100; x < 100; x += grasssize) {
				for (let z = -100; z < 100; z += grasssize) {
					this.grassManager.addGrassCell(new Vector3(x, 0, z));
				}
			}
	
			this.grassManager.enable = true;
	
			Laya.timer.loop(1, this, this.update, [this.camera]);
		}));
	}

	update(camera: Camera) {
		this.grassManager.update(camera);
	}







}