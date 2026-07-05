import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { BoardPath } from './BoardPath'
import { PlayerModel } from './PlayerModel'

export function GameScene() {
  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <PerspectiveCamera makeDefault position={[0, 12, -6]} fov={50} />
      <OrbitControls
        target={[0, 0, 6]}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={8}
        maxDistance={20}
      />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
      <fog attach="fog" args={['#1a1a2e', 15, 40]} />
      <BoardPath />
      <PlayerModel />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a3a1a" />
      </mesh>
    </Canvas>
  )
}
