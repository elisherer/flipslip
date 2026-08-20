export default function Lights() {
  return (
    <>
      <directionalLight
        castShadow
        shadow-normalBias={0.05}
        shadow-mapSize={[2048, 2048]}
        intensity={1.5}
        shadow-camera-top={20}
        shadow-camera-bottom={-8}
        shadow-camera-left={-18}
        shadow-camera-right={18}
      />
      <hemisphereLight />
    </>
  );
}
