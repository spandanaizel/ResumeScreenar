import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { getScoreColor } from '../../utils/helpers';

interface ScoreCircleProps {
  score: number;
  label?: string;
  size?: number;
}

export default function ScoreCircle({ score, label, size = 180 }: ScoreCircleProps) {
  const color = getScoreColor(score);
  const data = [{ name: 'score', value: score, fill: color }];

  return (
    <div className="flex flex-col items-center justify-center">
      <div style={{ width: size, height: size }} className="relative">
        <RadialBarChart
          width={size}
          height={size}
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={size * 0.11}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={999} />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-800">{Math.round(score)}</span>
          <span className="text-xs font-medium text-slate-400">/ 100</span>
        </div>
      </div>
      {label && <p className="mt-2 text-sm font-semibold text-slate-600">{label}</p>}
    </div>
  );
}
