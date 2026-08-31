export default function TriggerIcon({ color, pushed }: { color: string; pushed?: boolean }) {
  return (
    <g style={{ pointerEvents: "none" }}>
      <rect
        fill={color}
        stroke="black"
        strokeWidth="0.319"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={4}
        x={3}
        y={pushed ? 12 : 3}
      />
      <rect
        fill={color}
        stroke="black"
        strokeWidth="0.319"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={10}
        height={pushed ? 4 : 9}
        x={7}
        y={pushed ? 16 : 7}
      />
      <rect
        fill="#888"
        stroke="black"
        strokeWidth="0.319"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={18}
        height={4}
        x={3}
        y={16}
      />
    </g>
  );
}
