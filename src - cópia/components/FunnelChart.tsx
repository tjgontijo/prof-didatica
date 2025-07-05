import { ResponsiveFunnel } from '@nivo/funnel';

// Definindo um tipo compatível com o esperado pelo Nivo
export interface FunnelData {
  id: string;
  label: string;
  value: number;
  [key: string]: string | number; // Índice de assinatura compatível com FunnelDatum
}

interface FunnelChartProps {
  data: FunnelData[];
  height?: number;
}

export default function FunnelChart({ data, height = 400 }: FunnelChartProps) {
  return (
    <div style={{ height: height }}>
      <ResponsiveFunnel
        data={data}
        direction="horizontal"
        margin={{ top: 20, right: 20, bottom: 20, left: 120 }}
        valueFormat=">-.0f"
        colors={{ scheme: 'blues' }}
        borderWidth={20}
        labelColor={{
          from: 'color',
          modifiers: [['darker', 3]],
        }}
        beforeSeparatorLength={24}
        afterSeparatorLength={24}
        currentPartSizeExtension={10}
        currentBorderWidth={40}
        motionConfig="wobbly"
        shapeBlending={0.7}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.3]],
        }}
        enableBeforeSeparators={true}
        enableAfterSeparators={true}
      />
    </div>
  );
}
