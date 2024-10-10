import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { CharacterController } from "laya/d3/physics/CharacterController";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { InputManager } from "laya/events/InputManager";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

export class PhysicsWorld_Character {

	private scene: Scene3D;
	private camera: Camera;
	private kinematicSphere: Sprite3D;
	private translateW: Vector3 = new Vector3(0, 0, -0.2);
	private translateS: Vector3 = new Vector3(0, 0, 0.2);
	private translateA: Vector3 = new Vector3(-0.2, 0, 0);
	private translateD: Vector3 = new Vector3(0.2, 0, 0);
	private mat1: BlinnPhongMaterial;
	private mat2: BlinnPhongMaterial;

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			//创建场景
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//创建相机
			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			this.camera.transform.translate(new Vector3(0, 8, 20));
			this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);

			let directionLight = new Sprite3D();
			let dircom = directionLight.addComponent(DirectionLightCom);
			this.scene.addChild(directionLight);
			//创建平行光

			this.scene.addChild(directionLight);
			dircom.color = new Color(1, 1, 1, 1);
			//设置平行光的方向
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;

			//创建地面
			var plane: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10))));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			//加载纹理
			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			//设置材质
			var tilingOffset = planeMat.tilingOffset;
			tilingOffset.setValue(2, 2, 0, 0);
			planeMat.tilingOffset = tilingOffset;
			plane.meshRenderer.material = planeMat;

			this.mat1 = new BlinnPhongMaterial();
			this.mat2 = new BlinnPhongMaterial();

			//加载纹理资源
			Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat1.albedoTexture = tex;
			}));

			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat2.albedoTexture = tex;
			}));

			//创建物理碰撞器
			var physicsCollider: PhysicsCollider = (<PhysicsCollider>plane.addComponent(PhysicsCollider));
			//创建盒型碰撞器
			var boxShape: BoxColliderShape = new BoxColliderShape(20, 0.5, 20);
			var boxoffset = boxShape.localOffset;
			boxoffset.setValue(0, -0.25, 0);
			boxShape.localOffset = boxoffset;
			//为物理碰撞器设置盒型碰撞器
			physicsCollider.colliderShape = boxShape;

			for (var i: number = 0; i < 60; i++) {
				this.addBox();
				this.addCapsule();
			}

			//添加角色
			this.addCharacter();
		});

	}

	addCharacter(): void {
		var _this: PhysicsWorld_Character = this;
		//加载精灵
		Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (monkey: Sprite3D): void {
			this.scene.addChild(monkey);
			monkey.transform.position = new Vector3(0.0, 0.0, 0.0);
			//设置精灵的缩放
			(monkey.getChildAt(0) as Sprite3D).transform.localScale = new Vector3(1, 1, 1);
			//为精灵添加角色控制器
			var character: CharacterController = monkey.addComponent(CharacterController);
			//创建胶囊碰撞器
			var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(1.0, 4.0);
			//设置Shape的本地偏移
			var localOffset: Vector3 = sphereShape.localOffset;
			localOffset.setValue(0, 2.0, 0);
			sphereShape.localOffset = localOffset;
			//设置角色控制器的碰撞形状
			character.colliderShape = sphereShape;
			_this.kinematicSphere = monkey as Sprite3D;
			Laya.timer.frameLoop(1, _this, this.onKeyDown);

		}))

	}

	private onKeyDown(): void {
		var character: CharacterController = (<CharacterController>this.kinematicSphere.getComponent(CharacterController));
		InputManager.hasKeyDown(87) && character.move(this.translateW);//W
		InputManager.hasKeyDown(83) && character.move(this.translateS);//S
		InputManager.hasKeyDown(65) && character.move(this.translateA);//A
		InputManager.hasKeyDown(68) && character.move(this.translateD);//D
		InputManager.hasKeyDown(69) && character.jump();//E
	}

	addBox(): void {
		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		box.meshRenderer.material = this.mat1;
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		transform.position = pos;
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		rigidBody.colliderShape = boxShape;
		rigidBody.mass = 10;
	}

	addCapsule(): void {
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		var capsule: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height))));
		capsule.meshRenderer.material = this.mat2;
		var transform: Transform3D = capsule.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		transform.position = pos;
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		var rigidBody: Rigidbody3D = capsule.addComponent(Rigidbody3D);
		var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(raidius, height);
		rigidBody.colliderShape = sphereShape;
		rigidBody.mass = 10;
	}
}

