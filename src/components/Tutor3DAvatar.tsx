import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AGENTS, Agent } from "../config/tutorAgents";

export interface Tutor3DAvatarProps {
  agentId: string;
  isArabic: boolean;
  isSpeaking: boolean;
  isListening?: boolean;
  isThinking?: boolean;
  compact?: boolean;
  mode?: "showcase" | "docked" | "floating";
  onToggleFloating?: () => void;
  onTriggerVoicePreview?: () => void;
}

interface CharacterAppearance {
  skinColor: number;
  hairColor: number;
  hairStyle: "swept" | "long_waves" | "executive" | "bun" | "textured" | "curly";
  outfitPrimary: number;
  outfitSecondary: number;
  accentColor: number;
  hasGlasses?: boolean;
  glassesColor?: number;
  hasTie?: boolean;
  hasHeadphones?: boolean;
  hasPointerWand?: boolean;
  hasScarf?: boolean;
  eyeColor: number;
}

const APPEARANCE_MAP: Record<string, CharacterAppearance> = {
  foundation: {
    skinColor: 0xf4c7a5,
    hairColor: 0x4a2e1b,
    hairStyle: "swept",
    outfitPrimary: 0x1e3a8a,
    outfitSecondary: 0xffffff,
    accentColor: 0xdc2626,
    hasGlasses: true,
    glassesColor: 0x1e293b,
    hasTie: true,
    hasPointerWand: true,
    eyeColor: 0x2563eb,
  },
  free_talk: {
    skinColor: 0xf7d4bc,
    hairColor: 0x8c3b2b,
    hairStyle: "long_waves",
    outfitPrimary: 0x0d9488,
    outfitSecondary: 0xfef3c7,
    accentColor: 0xf59e0b,
    eyeColor: 0x059669,
  },
  business_pro: {
    skinColor: 0xe2ae8c,
    hairColor: 0x1f1916,
    hairStyle: "executive",
    outfitPrimary: 0x1e293b,
    outfitSecondary: 0xf8fafc,
    accentColor: 0x2563eb,
    hasTie: true,
    eyeColor: 0x334155,
  },
  ielts_examiner: {
    skinColor: 0xfaddc5,
    hairColor: 0xd4a359,
    hairStyle: "bun",
    outfitPrimary: 0x9d174d,
    outfitSecondary: 0xfdf2f8,
    accentColor: 0xd97706,
    hasGlasses: true,
    glassesColor: 0xd97706,
    eyeColor: 0x4f46e5,
  },
  phonetics: {
    skinColor: 0xebb898,
    hairColor: 0x292524,
    hairStyle: "textured",
    outfitPrimary: 0x4338ca,
    outfitSecondary: 0xe0e7ff,
    accentColor: 0x06b6d4,
    hasHeadphones: true,
    eyeColor: 0x0284c7,
  },
  roleplay: {
    skinColor: 0xd89a76,
    hairColor: 0x271c19,
    hairStyle: "curly",
    outfitPrimary: 0xb45309,
    outfitSecondary: 0xfef3c7,
    accentColor: 0x10b981,
    hasScarf: true,
    eyeColor: 0x78350f,
  },
};

export const Tutor3DAvatar: React.FC<Tutor3DAvatarProps> = ({
  agentId,
  isArabic,
  isSpeaking,
  isListening = false,
  isThinking = false,
  compact = false,
  mode = "docked",
  onToggleFloating,
  onTriggerVoicePreview,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [gesture, setGesture] = useState<"idle" | "wave" | "explain" | "celebrate">("idle");
  const [cameraAngle, setCameraAngle] = useState<"front" | "side" | "closeup">("front");

  // Mutable refs for animation loop access without rebuilding scene
  const stateRef = useRef({
    isSpeaking,
    isListening,
    isThinking,
    gesture,
    cameraAngle,
    mouseX: 0,
    mouseY: 0,
  });

  useEffect(() => {
    stateRef.current.isSpeaking = isSpeaking;
    stateRef.current.isListening = isListening;
    stateRef.current.isThinking = isThinking;
    stateRef.current.gesture = gesture;
    stateRef.current.cameraAngle = cameraAngle;
  }, [isSpeaking, isListening, isThinking, gesture, cameraAngle]);

  const agent: Agent = AGENTS.find((a) => a.id === agentId) || AGENTS[0];
  const appearance = APPEARANCE_MAP[agentId] || APPEARANCE_MAP.foundation;

  const triggerTemporaryGesture = (newGesture: "wave" | "explain" | "celebrate") => {
    setGesture(newGesture);
    setTimeout(() => {
      setGesture("idle");
    }, 2600);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || (compact ? 210 : 280);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.55, 3.6);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    keyLight.position.set(2.5, 3.5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0e7ff, 0.85);
    fillLight.position.set(-3, 2, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(appearance.accentColor, 1.6, 8);
    rimLight.position.set(0, 2.2, -2.2);
    scene.add(rimLight);

    // Root Character Group
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, -0.55, 0);
    scene.add(characterGroup);

    // Holographic Pedestal Ring
    const ringGeo = new THREE.TorusGeometry(0.95, 0.025, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: appearance.accentColor,
      emissive: appearance.accentColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
    const pedestalRing = new THREE.Mesh(ringGeo, ringMat);
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.y = 0.02;
    characterGroup.add(pedestalRing);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: appearance.skinColor,
      roughness: 0.55,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: appearance.hairColor,
      roughness: 0.65,
      metalness: 0.1,
    });

    const outfitMat = new THREE.MeshStandardMaterial({
      color: appearance.outfitPrimary,
      roughness: 0.45,
      metalness: 0.15,
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: appearance.outfitSecondary,
      roughness: 0.5,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: appearance.accentColor,
      roughness: 0.35,
      metalness: 0.25,
    });

    // Torso / Shoulders
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.55, 0);
    characterGroup.add(torsoGroup);

    const chestGeo = new THREE.CapsuleGeometry(0.42, 0.52, 16, 24);
    const chestMesh = new THREE.Mesh(chestGeo, outfitMat);
    chestMesh.scale.set(1.18, 1, 0.72);
    torsoGroup.add(chestMesh);

    // Inner Shirt V-Neck
    const shirtGeo = new THREE.ConeGeometry(0.24, 0.42, 16);
    const shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
    shirtMesh.rotation.x = Math.PI;
    shirtMesh.position.set(0, 0.22, 0.22);
    shirtMesh.scale.set(1, 1, 0.5);
    torsoGroup.add(shirtMesh);

    // Tie or Scarf
    if (appearance.hasTie) {
      const tieGeo = new THREE.BoxGeometry(0.09, 0.38, 0.04);
      const tieMesh = new THREE.Mesh(tieGeo, accentMat);
      tieMesh.position.set(0, 0.12, 0.31);
      torsoGroup.add(tieMesh);
    }

    if (appearance.hasScarf) {
      const scarfGeo = new THREE.TorusGeometry(0.24, 0.065, 12, 32);
      const scarfMesh = new THREE.Mesh(scarfGeo, accentMat);
      scarfMesh.rotation.x = Math.PI / 2;
      scarfMesh.position.set(0, 0.4, 0.03);
      torsoGroup.add(scarfMesh);
    }

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.26, 20);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, 0.52, 0);
    torsoGroup.add(neckMesh);

    // Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.88, 0);
    torsoGroup.add(headGroup);

    // Sculpted Human Head
    const headGeo = new THREE.SphereGeometry(0.36, 32, 32);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.scale.set(0.92, 1.08, 0.95);
    headGroup.add(headMesh);

    // Ears
    const earGeo = new THREE.SphereGeometry(0.075, 16, 16);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.scale.set(0.5, 1.1, 0.7);
    leftEar.position.set(-0.33, 0, 0);
    const rightEar = leftEar.clone();
    rightEar.position.set(0.33, 0, 0);
    headGroup.add(leftEar, rightEar);

    // Nose
    const noseGeo = new THREE.ConeGeometry(0.052, 0.14, 16);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.position.set(0, -0.01, 0.35);
    noseMesh.rotation.x = 0.2;
    headGroup.add(noseMesh);

    // Cheeks (subtle blush)
    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.18,
      roughness: 0.8,
    });
    const cheekGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const leftCheek = new THREE.Mesh(cheekGeo, blushMat);
    leftCheek.position.set(-0.18, -0.06, 0.29);
    const rightCheek = leftCheek.clone();
    rightCheek.position.set(0.18, -0.06, 0.29);
    headGroup.add(leftCheek, rightCheek);

    // Eyes & Pupils & Eyelids
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const irisMat = new THREE.MeshStandardMaterial({ color: appearance.eyeColor, roughness: 0.25 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

    const createEye = (xOffset: number) => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(xOffset, 0.06, 0.29);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.062, 20, 20), eyeWhiteMat);
      sclera.scale.set(1.1, 0.95, 0.6);
      eyeGroup.add(sclera);

      const pupilGroup = new THREE.Group();
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 16), irisMat);
      iris.position.z = 0.032;
      iris.scale.set(1, 1, 0.35);
      pupilGroup.add(iris);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), pupilMat);
      pupil.position.z = 0.042;
      pupil.scale.set(1, 1, 0.3);
      pupilGroup.add(pupil);

      // Eye specular highlight
      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      glint.position.set(0.012, 0.012, 0.046);
      pupilGroup.add(glint);

      eyeGroup.add(pupilGroup);

      // Upper Eyelid for blinking
      const lidGeo = new THREE.SphereGeometry(0.066, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
      const eyelid = new THREE.Mesh(lidGeo, skinMat);
      eyelid.scale.set(1.12, 0.98, 0.65);
      eyelid.rotation.x = -Math.PI * 0.42;
      eyeGroup.add(eyelid);

      return { eyeGroup, pupilGroup, eyelid };
    };

    const leftEyeObj = createEye(-0.125);
    const rightEyeObj = createEye(0.125);
    headGroup.add(leftEyeObj.eyeGroup, rightEyeObj.eyeGroup);

    // Eyebrows
    const browGeo = new THREE.CapsuleGeometry(0.016, 0.085, 8, 8);
    const leftBrow = new THREE.Mesh(browGeo, hairMat);
    leftBrow.rotation.z = Math.PI / 2 - 0.08;
    leftBrow.position.set(-0.125, 0.155, 0.31);

    const rightBrow = new THREE.Mesh(browGeo, hairMat);
    rightBrow.rotation.z = Math.PI / 2 + 0.08;
    rightBrow.position.set(0.125, 0.155, 0.31);
    headGroup.add(leftBrow, rightBrow);

    // Articulated Mouth / Lip-Sync Group
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, -0.145, 0.315);
    headGroup.add(mouthGroup);

    const lipMat = new THREE.MeshStandardMaterial({
      color: agent.gender === "female" ? 0xe11d48 : 0xb91c1c,
      roughness: 0.4,
    });
    const innerMouthMat = new THREE.MeshBasicMaterial({ color: 0x450a0a });
    const teethMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });

    // Mouth Cavity
    const mouthCavity = new THREE.Mesh(new THREE.SphereGeometry(0.068, 16, 16), innerMouthMat);
    mouthCavity.scale.set(1.15, 0.25, 0.45);
    mouthGroup.add(mouthCavity);

    // Upper Teeth
    const teethMesh = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.022, 0.02), teethMat);
    teethMesh.position.set(0, 0.015, 0.018);
    mouthGroup.add(teethMesh);

    // Upper & Lower Lip framing
    const upperLip = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.095, 8, 12), lipMat);
    upperLip.rotation.z = Math.PI / 2;
    upperLip.position.set(0, 0.018, 0.022);
    mouthGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(new THREE.CapsuleGeometry(0.016, 0.09, 8, 12), lipMat);
    lowerLip.rotation.z = Math.PI / 2;
    lowerLip.position.set(0, -0.018, 0.022);
    mouthGroup.add(lowerLip);

    // Hair Sculpting per Character
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.375, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairCap.scale.set(0.95, 1.08, 0.98);
    hairCap.rotation.x = -0.18;
    hairGroup.add(hairCap);

    if (appearance.hairStyle === "swept" || appearance.hairStyle === "executive") {
      const quiff = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.34, 12, 16), hairMat);
      quiff.rotation.z = Math.PI / 2 - 0.15;
      quiff.position.set(0.03, 0.33, 0.18);
      hairGroup.add(quiff);
    } else if (appearance.hairStyle === "long_waves" || appearance.hairStyle === "curly") {
      const leftLock = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.48, 12, 16), hairMat);
      leftLock.position.set(-0.31, -0.08, -0.02);
      leftLock.rotation.z = 0.12;
      const rightLock = leftLock.clone();
      rightLock.position.set(0.31, -0.08, -0.02);
      rightLock.rotation.z = -0.12;
      const bangs = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.32, 12, 16), hairMat);
      bangs.rotation.z = Math.PI / 2 + 0.12;
      bangs.position.set(0, 0.29, 0.24);
      hairGroup.add(leftLock, rightLock, bangs);
    } else if (appearance.hairStyle === "bun") {
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), hairMat);
      bun.position.set(0, 0.38, -0.24);
      const frontWave = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 12, 16), hairMat);
      frontWave.rotation.z = Math.PI / 2;
      frontWave.position.set(0, 0.3, 0.22);
      hairGroup.add(bun, frontWave);
    } else if (appearance.hairStyle === "textured") {
      for (let i = -2; i <= 2; i++) {
        const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), hairMat);
        tuft.position.set(i * 0.09, 0.34 + (2 - Math.abs(i)) * 0.02, 0.16);
        hairGroup.add(tuft);
      }
    }

    // Character Accessories: Glasses
    if (appearance.hasGlasses) {
      const glassesGroup = new THREE.Group();
      glassesGroup.position.set(0, 0.06, 0.335);
      const frameMat = new THREE.MeshStandardMaterial({
        color: appearance.glassesColor || 0x1e293b,
        metalness: 0.6,
        roughness: 0.2,
      });

      const leftRim = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.01, 12, 32), frameMat);
      leftRim.position.x = -0.125;
      const rightRim = leftRim.clone();
      rightRim.position.x = 0.125;
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 8), frameMat);
      bridge.rotation.z = Math.PI / 2;
      glassesGroup.add(leftRim, rightRim, bridge);
      headGroup.add(glassesGroup);
    }

    // Character Accessories: Studio Headphones & Boom Mic (Alex - Phonetics)
    if (appearance.hasHeadphones) {
      const hpGroup = new THREE.Group();
      const hpMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.5,
        roughness: 0.25,
      });
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.39, 0.028, 12, 36, Math.PI),
        hpMat
      );
      band.position.y = 0.04;
      hpGroup.add(band);

      const cupGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.07, 20);
      const leftCup = new THREE.Mesh(cupGeo, hpMat);
      leftCup.rotation.z = Math.PI / 2;
      leftCup.position.set(-0.38, 0, 0);
      const rightCup = leftCup.clone();
      rightCup.position.set(0.38, 0, 0);
      hpGroup.add(leftCup, rightCup);

      // Boom Mic
      const boomArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8),
        hpMat
      );
      boomArm.rotation.x = Math.PI / 3;
      boomArm.rotation.z = -0.35;
      boomArm.position.set(-0.27, -0.1, 0.2);
      const micCapsule = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
      );
      micCapsule.position.set(-0.16, -0.16, 0.34);
      hpGroup.add(boomArm, micCapsule);

      headGroup.add(hpGroup);
    }

    // Articulated Arms & Hands for Gestures
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.54, 0.24, 0);
    torsoGroup.add(leftArmGroup);

    const armGeo = new THREE.CapsuleGeometry(0.095, 0.42, 12, 16);
    const leftSleeve = new THREE.Mesh(armGeo, outfitMat);
    leftSleeve.position.y = -0.18;
    leftArmGroup.add(leftSleeve);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), skinMat);
    leftHand.position.set(0, -0.44, 0.06);
    leftArmGroup.add(leftHand);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.54, 0.24, 0);
    torsoGroup.add(rightArmGroup);

    const rightSleeve = new THREE.Mesh(armGeo, outfitMat);
    rightSleeve.position.y = -0.18;
    rightArmGroup.add(rightSleeve);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), skinMat);
    rightHand.position.set(0, -0.44, 0.06);
    rightArmGroup.add(rightHand);

    // Teacher Pointer Wand for Foundation / Explaining
    const wandGroup = new THREE.Group();
    const wandStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.016, 0.55, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.2 })
    );
    wandStick.position.y = 0.26;
    const wandTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.032, 12, 12),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.9,
      })
    );
    wandTip.position.y = 0.54;
    wandGroup.add(wandStick, wandTip);
    wandGroup.position.set(0, -0.44, 0.12);
    wandGroup.rotation.x = Math.PI / 4;
    wandGroup.rotation.z = -0.3;
    rightArmGroup.add(wandGroup);

    // Floating Holographic Orbs (visible when speaking, listening, or thinking)
    const orbsGroup = new THREE.Group();
    characterGroup.add(orbsGroup);
    const orbMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 12, 12),
        new THREE.MeshStandardMaterial({
          color: appearance.accentColor,
          emissive: appearance.accentColor,
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.75,
        })
      );
      orbsGroup.add(orb);
      orbMeshes.push(orb);
    }

    // Mouse / Pointer tracking within the container
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      stateRef.current.mouseX = Math.max(-1, Math.min(1, nx));
      stateRef.current.mouseY = Math.max(-1, Math.min(1, ny));
    };

    window.addEventListener("mousemove", handlePointerMove);

    // Animation Loop with Clock
    const clock = new THREE.Clock();
    let frameId = 0;
    let nextBlinkTime = 2.0;
    let blinkProgress = 0;
    let isBlinking = false;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const {
        isSpeaking: speaking,
        isListening: listening,
        isThinking: thinking,
        gesture: activeGesture,
        cameraAngle: camMode,
        mouseX,
        mouseY,
      } = stateRef.current;

      // 1. Camera Smooth Positioning
      let targetCamX = 0;
      let targetCamY = 0.55;
      let targetCamZ = 3.55;
      if (camMode === "side") {
        targetCamX = 1.25;
        targetCamZ = 3.35;
      } else if (camMode === "closeup") {
        targetCamY = 0.72;
        targetCamZ = 2.55;
      }
      camera.position.x += (targetCamX - camera.position.x) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;
      camera.position.z += (targetCamZ - camera.position.z) * 0.08;
      camera.lookAt(0, 0.45, 0);

      // 2. Natural Breathing & Posture
      const breath = Math.sin(elapsed * 2.1) * 0.018;
      torsoGroup.position.y = 0.55 + breath;
      torsoGroup.rotation.z = Math.sin(elapsed * 1.1) * 0.015;

      // 3. Head & Eye Tracking + Speaking/Listening Dynamics
      let targetHeadRotY = mouseX * 0.25;
      let targetHeadRotX = -mouseY * 0.15;
      let targetHeadRotZ = 0;

      if (speaking) {
        targetHeadRotY += Math.sin(elapsed * 4.5) * 0.09;
        targetHeadRotX += Math.sin(elapsed * 6.2) * 0.06;
        targetHeadRotZ = Math.cos(elapsed * 3.4) * 0.045;
      } else if (listening) {
        // Attentive head tilt and gentle nod
        targetHeadRotZ = 0.09;
        targetHeadRotX = Math.sin(elapsed * 3.8) * 0.05 + 0.04;
      } else if (thinking) {
        targetHeadRotY = 0.22;
        targetHeadRotX = -0.12;
      }

      headGroup.rotation.y += (targetHeadRotY - headGroup.rotation.y) * 0.1;
      headGroup.rotation.x += (targetHeadRotX - headGroup.rotation.x) * 0.1;
      headGroup.rotation.z += (targetHeadRotZ - headGroup.rotation.z) * 0.1;

      // Eye Pupil Micro-Tracking
      const pupilX = mouseX * 0.016;
      const pupilY = mouseY * 0.012;
      leftEyeObj.pupilGroup.position.x = pupilX;
      leftEyeObj.pupilGroup.position.y = pupilY;
      rightEyeObj.pupilGroup.position.x = pupilX;
      rightEyeObj.pupilGroup.position.y = pupilY;

      // 4. Natural Eye Blinking
      if (elapsed > nextBlinkTime && !isBlinking) {
        isBlinking = true;
        blinkProgress = 0;
        nextBlinkTime = elapsed + 2.2 + Math.random() * 2.8;
      }
      if (isBlinking) {
        blinkProgress += 0.22;
        const closeFactor = Math.sin(Math.min(blinkProgress, Math.PI));
        const lidRot = -Math.PI * 0.42 + closeFactor * 0.45;
        leftEyeObj.eyelid.rotation.x = lidRot;
        rightEyeObj.eyelid.rotation.x = lidRot;
        if (blinkProgress >= Math.PI) {
          isBlinking = false;
          leftEyeObj.eyelid.rotation.x = -Math.PI * 0.42;
          rightEyeObj.eyelid.rotation.x = -Math.PI * 0.42;
        }
      }

      // 5. Real-Time Lip-Sync & Viseme Articulation
      if (speaking) {
        const syllableWave =
          Math.abs(Math.sin(elapsed * 13.5)) * 0.65 +
          Math.abs(Math.cos(elapsed * 21.0)) * 0.35;
        const mouthOpen = 0.25 + syllableWave * 1.15;
        const widthMod = 0.92 + Math.sin(elapsed * 9.5) * 0.18;

        mouthCavity.scale.set(1.15 * widthMod, mouthOpen, 0.45);
        upperLip.position.y = 0.015 + mouthOpen * 0.018;
        lowerLip.position.y = -0.015 - mouthOpen * 0.028;

        // Expressive eyebrows while speaking
        const browLift = Math.sin(elapsed * 5.5) * 0.018;
        leftBrow.position.y = 0.155 + browLift;
        rightBrow.position.y = 0.155 + browLift;
      } else {
        // Gentle warm smile at rest
        mouthCavity.scale.set(1.1, 0.18, 0.4);
        upperLip.position.y = 0.016;
        lowerLip.position.y = -0.016;
        leftBrow.position.y = 0.155;
        rightBrow.position.y = 0.155;
      }

      // 6. Arm & Hand Gestures
      const showWand = appearance.hasPointerWand || activeGesture === "explain" || speaking;
      wandGroup.visible = Boolean(showWand);

      if (activeGesture === "wave") {
        rightArmGroup.rotation.z = 2.35 + Math.sin(elapsed * 12) * 0.32;
        rightArmGroup.rotation.x = -0.45;
        leftArmGroup.rotation.z = -0.15;
        leftArmGroup.rotation.x = 0;
      } else if (activeGesture === "celebrate") {
        rightArmGroup.rotation.z = 2.2 + Math.sin(elapsed * 10) * 0.25;
        leftArmGroup.rotation.z = -2.2 - Math.sin(elapsed * 10) * 0.25;
        characterGroup.position.y = -0.55 + Math.abs(Math.sin(elapsed * 7)) * 0.08;
      } else if (activeGesture === "explain" || speaking) {
        rightArmGroup.rotation.x = -0.65 + Math.sin(elapsed * 4.5) * 0.22;
        rightArmGroup.rotation.z = 0.35 + Math.cos(elapsed * 3.5) * 0.15;
        leftArmGroup.rotation.x = -0.35 + Math.cos(elapsed * 4.0) * 0.15;
        leftArmGroup.rotation.z = -0.25;
        characterGroup.position.y = -0.55;
      } else {
        // Smooth return to idle posture
        rightArmGroup.rotation.x += (0 - rightArmGroup.rotation.x) * 0.1;
        rightArmGroup.rotation.z += (0.12 - rightArmGroup.rotation.z) * 0.1;
        leftArmGroup.rotation.x += (0 - leftArmGroup.rotation.x) * 0.1;
        leftArmGroup.rotation.z += (-0.12 - leftArmGroup.rotation.z) * 0.1;
        characterGroup.position.y += (-0.55 - characterGroup.position.y) * 0.1;
      }

      // 7. Holographic Pedestal & Orbs Animation
      pedestalRing.rotation.z = elapsed * 0.8;
      const ringScale = speaking
        ? 1 + Math.sin(elapsed * 10) * 0.06
        : listening
        ? 1 + Math.sin(elapsed * 5) * 0.04
        : 1;
      pedestalRing.scale.set(ringScale, ringScale, 1);

      orbMeshes.forEach((orb, idx) => {
        const angle = elapsed * (speaking ? 2.2 : 1.1) + (idx * Math.PI * 2) / orbMeshes.length;
        const radius = speaking ? 0.82 : thinking ? 0.65 : 0.75;
        orb.position.set(
          Math.cos(angle) * radius,
          0.35 + Math.sin(elapsed * 2.5 + idx) * 0.35,
          Math.sin(angle) * radius * 0.5
        );
        orb.visible = speaking || listening || thinking || activeGesture !== "idle";
      });

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || (compact ? 210 : 280);
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handlePointerMove);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [agentId, appearance, agent.gender, compact]);

  return (
    <div className={`tutor-3d-stage-card ${mode} ${isSpeaking ? "is-speaking" : ""} ${isListening ? "is-listening" : ""}`}>
      {/* Top Status & Camera Controls */}
      <div className="tutor-3d-stage-header">
        <div className="tutor-3d-badge">
          <span className="pulse-dot-3d" />
          <span>
            {isSpeaking
              ? isArabic
                ? `🔊 ${agent.nameAr} يتحدث الآن (3D Live)`
                : `🔊 ${agent.nameEn} Speaking (3D Live)`
              : isListening
              ? isArabic
                ? "🎙️ يستمع إليك بانتباه..."
                : "🎙️ Listening attentively..."
              : isThinking
              ? isArabic
                ? "⚡ يحلل السبورة بـ Gemini 4..."
                : "⚡ Analyzing via Gemini 4..."
              : isArabic
              ? `🧊 مجسّم ثلاثي الأبعاد • ${agent.nameAr}`
              : `🧊 3D Human Avatar • ${agent.nameEn}`}
          </span>
        </div>

        <div className="tutor-3d-header-actions">
          <button
            type="button"
            onClick={() =>
              setCameraAngle((prev) =>
                prev === "front" ? "closeup" : prev === "closeup" ? "side" : "front"
              )
            }
            className="tutor-3d-mini-btn"
            title={isArabic ? "تغيير زاوية الكاميرا ثلاثية الأبعاد" : "Switch 3D Camera Angle"}
          >
            🎥 {cameraAngle === "front" ? "1x" : cameraAngle === "closeup" ? "Zoom" : "Side"}
          </button>

          {onToggleFloating && (
            <button
              type="button"
              onClick={onToggleFloating}
              className="tutor-3d-mini-btn highlight"
              title={
                mode === "floating"
                  ? isArabic
                    ? "تثبيت المجسم في القائمة الجانبية"
                    : "Dock 3D Avatar"
                  : isArabic
                  ? "انبثاق المجسم ثلاثي الأبعاد فوق السبورة"
                  : "Pop-out 3D Avatar"
              }
            >
              {mode === "floating"
                ? isArabic
                  ? "📌 تثبيت"
                  : "📌 Dock"
                : isArabic
                ? "✨ انبثاق 3D"
                : "✨ Pop-out 3D"}
            </button>
          )}
        </div>
      </div>

      {/* WebGL 3D Canvas Container */}
      <div
        ref={mountRef}
        className={`tutor-3d-canvas-mount ${compact ? "compact" : ""}`}
      />

      {/* Interactive 3D Expression & Voice Bar */}
      <div className="tutor-3d-controls-bar">
        <button
          type="button"
          onClick={() => triggerTemporaryGesture("wave")}
          className={`tutor-3d-gesture-btn ${gesture === "wave" ? "active" : ""}`}
        >
          👋 {isArabic ? "تحية" : "Wave"}
        </button>
        <button
          type="button"
          onClick={() => triggerTemporaryGesture("explain")}
          className={`tutor-3d-gesture-btn ${gesture === "explain" ? "active" : ""}`}
        >
          👉 {isArabic ? "حركة شرح" : "Explain"}
        </button>
        <button
          type="button"
          onClick={() => triggerTemporaryGesture("celebrate")}
          className={`tutor-3d-gesture-btn ${gesture === "celebrate" ? "active" : ""}`}
        >
          🎉 {isArabic ? "تشجيع" : "Cheer"}
        </button>
        {onTriggerVoicePreview && (
          <button
            type="button"
            onClick={onTriggerVoicePreview}
            className={`tutor-3d-gesture-btn voice-btn ${isSpeaking ? "speaking" : ""}`}
          >
            🎙️ {isArabic ? "نطق مباشر" : "Speak"}
          </button>
        )}
      </div>
    </div>
  );
};
