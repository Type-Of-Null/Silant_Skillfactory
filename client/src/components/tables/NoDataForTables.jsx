const NoData = ({ loading }) => {
  return (
    <div className="pointer-events-none absolute inset-0 mt-[5%] flex items-center justify-center">
      <div className=" bg-white/80 px-4 py-2 text-[#3d3d3d] shadow">
        {loading ? "Загрузка..." : "Нет данных"}
      </div>
    </div>
  );
};
export default NoData;
