import H1Title from '@/components/h1-title';
import SelectNetworks from '@/components/select-networks';
export default ({ title }: { title: string }) => {
  return (
    <div className="w-full  gap-1 flex flex-col  sm:flex-row sm:justify-between items-center mb-4 sm:mb-8">
      <H1Title>{title}</H1Title>
      <SelectNetworks defaultSelectedKeys={[1]} />
    </div>
  );
};
