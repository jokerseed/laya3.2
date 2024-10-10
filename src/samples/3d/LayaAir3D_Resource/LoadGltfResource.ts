import { Laya } from "Laya";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Handler } from "laya/utils/Handler";
import { Camera } from "laya/d3/core/Camera";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Loader } from "laya/net/Loader";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Material } from "laya/resource/Material";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";


export class LoadGltfResource {

    scene: Scene3D;
    camera: Camera;

    constructor() {
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;

            Stat.show();
            Shader3D.debugMode = true;

            this.scene = <Scene3D>Laya.stage.addChild(new Scene3D);
            this.camera = <Camera>this.scene.addChild(new Camera);
            this.camera.addComponent(CameraMoveScript);
            this.scene.ambientColor = Color.WHITE;
            this.camera.transform.position = new Vector3(0, 1, 7);

            //light
            var directionLight: Sprite3D = (<Sprite3D>this.scene.addChild(new Sprite3D()));
            var directionLightCom: DirectionLightCom = (<DirectionLightCom>directionLight.addComponent(DirectionLightCom));
            directionLightCom.color = new Color(0.6, 0.6, 0.6, 1);
            //设置平行光的方向
            var mat: Matrix4x4 = directionLight.transform.worldMatrix;
            mat.setForward(new Vector3(-1.0, -1.0, -1.0));
            directionLight.transform.worldMatrix = mat;

            // 配置环境反射贴图
            Laya.loader.load("res/threeDimen/skyBox/DawnDusk/Skybox.lmat", Handler.create(this, () => {
                let skyRender: SkyRenderer = this.scene.skyRenderer;
                let mat: Material = Loader.getRes("res/threeDimen/skyBox/DawnDusk/Skybox.lmat");
                skyRender.material = mat;
                skyRender.mesh = SkyBox.instance;
            }));

            var gltfResource: any[] = [
                "res/threeDimen/gltf/RiggedFigure/RiggedFigure.gltf",
                "res/threeDimen/gltf/Duck/Duck.gltf",
                "res/threeDimen/gltf/AnimatedCube/AnimatedCube.gltf"
            ];

            Laya.loader.load(gltfResource, Handler.create(this, this.onGLTFComplate));
        });
    }

    onGLTFComplate(success: boolean): void {
        if (!success) {
            // 加载失败
            console.log("gltf load failed");
            return;
        }
        var RiggedFigure: Sprite3D = Loader.createNodes("res/threeDimen/gltf/RiggedFigure/RiggedFigure.gltf");
        this.scene.addChild(RiggedFigure);
        RiggedFigure.transform.position = new Vector3(-2, 0, 0);
        console.log("RiggedFigure: This model is licensed under a Creative Commons Attribution 4.0 International License.");

        var duck: Sprite3D = Loader.createNodes("res/threeDimen/gltf/Duck/Duck.gltf");
        this.scene.addChild(duck);

        var cube: Sprite3D = Loader.createNodes("res/threeDimen/gltf/AnimatedCube/AnimatedCube.gltf");
        this.scene.addChild(cube);
        cube.transform.position = new Vector3(2.5, 0.6, 0);
        cube.transform.setWorldLossyScale(new Vector3(0.6, 0.6, 0.6));
    }

}