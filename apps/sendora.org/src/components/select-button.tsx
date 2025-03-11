import SelectNetworks from './select-networks';

export default ({ chainId }: { chainId: string }) => {
  return (
    <>
      <div className="w-[150px] sm:w-[180px]">
        <SelectNetworks
          defaultSelectedKeys={[chainId]}
          navigate={(id) => {
            // navigate(`/native-coins/${id}`);
          }}
        />
      </div>
    </>
  );
};
