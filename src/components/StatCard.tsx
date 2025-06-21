type StatCardProps = {
    title: string;
    value: string;
    color: string;
  };
  
  export default function StatCard({ title, value, color }: StatCardProps) {
    return (
      <div className={`rounded-lg p-4 shadow-sm ${color}`}>
        <p className="text-sm font-medium">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    );
  }
  